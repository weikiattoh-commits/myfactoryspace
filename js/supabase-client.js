// Supabase Client Configuration for Industra Project (Built-in Defaults; auto-overridden by /api/public-config on Vercel when env vars are set)
const HARDCODED_SUPABASE_URL = 'https://vnsinkesbbikeqbywxfd.supabase.co';
let SUPABASE_URL = HARDCODED_SUPABASE_URL;
let SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuc2lua2VzYmJpa2VxYnl3eGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NzE2NTMsImV4cCI6MjEwNjI0NzY1M30.gaZwIgcxixKIZXya0yrIaQ36mSAzZHMwsaQXZj9aEZA';
let DEFAULT_PRIMARY_BUCKET = 'property-images';

let supabaseClient = null;

function createBuiltInSupabaseClient() {
    if (!window.supabase) return null;
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: { persistSession: false, autoRefreshToken: false }
        });
        return supabaseClient;
    } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
        return null;
    }
}

if (window.supabase) {
    if (createBuiltInSupabaseClient()) {
        console.log('✅ Supabase Client connected to Industra project');
    }
} else {
    console.warn('⚠️ Supabase JS SDK not loaded yet. Ensure CDN script is included before supabase-client.js');
}

// Global Supabase Helper Object (with short-lived request deduplication & batching)
window.IndustraSupabase = {
    _memCache: new Map(),
    _inFlight: new Map(),
    _ttlMs: 8000,
    _publicConfigPromise: null,
    _publicConfigSource: 'builtin',

    // Bootstrap public Supabase URL/Anon Key from Vercel serverless /api/public-config (when deployed with env vars)
    ensurePublicConfigLoaded() {
        if (this._publicConfigPromise) return this._publicConfigPromise;
        const canFetchServerConfig = Boolean(
            typeof window !== 'undefined' &&
            window.location &&
            /^https?:$/i.test(window.location.protocol) &&
            typeof fetch === 'function'
        );
        if (!canFetchServerConfig) {
            this._publicConfigPromise = Promise.resolve(null);
            return this._publicConfigPromise;
        }
        this._publicConfigPromise = (async () => {
            let timerId = null;
            try {
                const controller = typeof AbortController === 'function' ? new AbortController() : null;
                if (controller) {
                    timerId = setTimeout(() => controller.abort(), 8000);
                }
                const res = await fetch('/api/public-config', {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    cache: 'no-store',
                    signal: controller ? controller.signal : undefined
                });
                if (!res || !res.ok) return null;
                const ct = String(res.headers && res.headers.get ? (res.headers.get('content-type') || '') : '');
                if (!ct.toLowerCase().includes('application/json')) {
                    console.warn('⚠️ /api/public-config returned non-JSON (' + ct + '). Check Vercel Output Directory (must be blank) so /api functions execute.');
                    return null;
                }
                const data = await res.json();
                if (!data || data.configured !== true || !data.url || !data.anonKey) return null;
                const cleanUrl = String(data.url).trim().replace(/\/+$/, '');
                const cleanKey = String(data.anonKey).trim();
                const cleanBucket = String(data.bucket || DEFAULT_PRIMARY_BUCKET).trim() || DEFAULT_PRIMARY_BUCKET;
                if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cleanUrl) || cleanKey.length < 20) {
                    return null;
                }
                if (data.storageOnly === true) {
                    const existing = this.getPrimarySupabaseConfig();
                    if (!existing.enabled) {
                        this._primaryCloudConfig = {
                            enabled: true,
                            storageOnly: true,
                            url: cleanUrl,
                            anonKey: cleanKey,
                            bucket: cleanBucket
                        };
                        window.__livePrimarySupabaseConfig = this._primaryCloudConfig;
                    }
                    this._publicConfigSource = 'vercel-env-storage';
                    return data;
                }
                const changed = (cleanUrl !== SUPABASE_URL || cleanKey !== SUPABASE_ANON_KEY || cleanBucket !== DEFAULT_PRIMARY_BUCKET);
                SUPABASE_URL = cleanUrl;
                SUPABASE_ANON_KEY = cleanKey;
                DEFAULT_PRIMARY_BUCKET = cleanBucket;
                this._publicConfigSource = 'vercel-env';
                if (changed) {
                    supabaseClient = null;
                    createBuiltInSupabaseClient();
                    this._memCache.clear();
                    this._storageUsageCache = {};
                    console.log('✅ Supabase Client switched to deployment environment project:', SUPABASE_URL);
                }
                return data;
            } catch (_) {
                return null;
            } finally {
                if (timerId) clearTimeout(timerId);
            }
        })();
        return this._publicConfigPromise;
    },

    getConfigSource() {
        return this.isCustomPrimaryDbActive() ? 'custom-primary' : this._publicConfigSource;
    },

    _getCached(key) {
        const hit = this._memCache.get(key);
        if (!hit) return undefined;
        if (Date.now() - hit.ts > this._ttlMs) {
            this._memCache.delete(key);
            return undefined;
        }
        return hit.value;
    },

    _setCached(key, value) {
        this._memCache.set(key, { ts: Date.now(), value });
        return value;
    },

    _invalidate(prefixOrKey) {
        for (const k of Array.from(this._memCache.keys())) {
            if (k === prefixOrKey || k.startsWith(prefixOrKey + ':')) this._memCache.delete(k);
        }
        for (const k of Array.from(this._inFlight.keys())) {
            if (k === prefixOrKey || k.startsWith(prefixOrKey + ':')) this._inFlight.delete(k);
        }
    },

    _dedupFetch(cacheKey, fetcher) {
        const cached = this._getCached(cacheKey);
        if (cached !== undefined) return Promise.resolve(cached);
        if (this._inFlight.has(cacheKey)) return this._inFlight.get(cacheKey);
        const p = Promise.resolve()
            .then(() => this.ensurePublicConfigLoaded())
            .then(fetcher)
            .then(res => {
                this._inFlight.delete(cacheKey);
                if (res !== null && res !== undefined) {
                    this._setCached(cacheKey, res);
                }
                return res;
            }).catch(err => {
                this._inFlight.delete(cacheKey);
                throw err;
            });
        this._inFlight.set(cacheKey, p);
        return p;
    },

    getBuiltInClient() {
        if (!supabaseClient && window.supabase) {
            createBuiltInSupabaseClient();
        }
        return supabaseClient;
    },

    getBuiltInProjectUrl() {
        return SUPABASE_URL;
    },

    // --- CUSTOM / SECONDARY PRIMARY SUPABASE CONNECTION (STORAGE BUCKET OR FULL DB ROUTING) ---
    _primaryCloudConfig: null,
    _primaryConfigSig: '',
    _customPrimaryClient: null,
    _customPrimaryClientSig: '',

    getPrimarySupabaseConfig() {
        const defaults = {
            enabled: false,
            storageOnly: true,
            url: '',
            anonKey: '',
            bucket: DEFAULT_PRIMARY_BUCKET
        };
        let rawCfg = this._primaryCloudConfig || window.__livePrimarySupabaseConfig || null;
        if (!rawCfg) {
            try {
                const stored = localStorage.getItem('industria_primary_supabase');
                if (stored) rawCfg = JSON.parse(stored);
            } catch (_) {}
        }
        if (!rawCfg && window.__liveSiteSettings && window.__liveSiteSettings.primarySupabaseCloud) {
            rawCfg = window.__liveSiteSettings.primarySupabaseCloud;
        }
        if (!rawCfg) {
            try {
                const sRaw = localStorage.getItem('industria_settings');
                if (sRaw) {
                    const s = JSON.parse(sRaw);
                    if (s && s.primarySupabaseCloud) rawCfg = s.primarySupabaseCloud;
                }
            } catch (_) {}
        }
        const merged = Object.assign({}, defaults, (rawCfg && typeof rawCfg === 'object') ? rawCfg : {});
        merged.enabled = merged.enabled === true || String(merged.enabled) === 'true';
        if (rawCfg && typeof rawCfg === 'object' && rawCfg.storageOnly !== undefined) {
            merged.storageOnly = rawCfg.storageOnly === true || String(rawCfg.storageOnly) === 'true';
        } else {
            merged.storageOnly = true;
        }
        merged.url = String(merged.url || '').trim().replace(/\/+$/, '');
        merged.anonKey = String(merged.anonKey || '').trim();
        merged.bucket = String(merged.bucket || DEFAULT_PRIMARY_BUCKET).trim() || DEFAULT_PRIMARY_BUCKET;
        // If deployment env vars switched the active default away from the legacy hardcoded project,
        // ignore stale localStorage routing pointers that still target the legacy project URL.
        if (
            this._publicConfigSource === 'vercel-env' &&
            merged.enabled &&
            merged.url.toLowerCase() === HARDCODED_SUPABASE_URL.toLowerCase() &&
            SUPABASE_URL.toLowerCase() !== HARDCODED_SUPABASE_URL.toLowerCase()
        ) {
            merged.enabled = false;
        }
        return merged;
    },

    setPrimarySupabaseConfig(cfg) {
        const hasStorageOnly = cfg && typeof cfg === 'object' && cfg.storageOnly !== undefined;
        const normalized = {
            enabled: Boolean(cfg && (cfg.enabled === true || String(cfg.enabled) === 'true')),
            storageOnly: hasStorageOnly
                ? Boolean(cfg.storageOnly === true || String(cfg.storageOnly) === 'true')
                : true,
            url: String((cfg && cfg.url) || '').trim().replace(/\/+$/, ''),
            anonKey: String((cfg && cfg.anonKey) || '').trim(),
            bucket: String((cfg && cfg.bucket) || DEFAULT_PRIMARY_BUCKET).trim() || DEFAULT_PRIMARY_BUCKET
        };
        this._primaryCloudConfig = normalized;
        window.__livePrimarySupabaseConfig = normalized;
        try {
            if (typeof window.safeLocalStorageSet === 'function') {
                window.safeLocalStorageSet('industria_primary_supabase', normalized);
            } else {
                localStorage.setItem('industria_primary_supabase', JSON.stringify(normalized));
            }
        } catch (_) {}

        const sig = normalized.enabled ? `${normalized.url}|${normalized.anonKey}|${normalized.storageOnly ? 'storage' : 'full'}|${normalized.bucket}` : '';
        if (sig !== this._primaryConfigSig) {
            this._primaryConfigSig = sig;
            this._customPrimaryClient = null;
            this._customPrimaryClientSig = '';
            this._memCache.clear();
            this._inFlight.clear();
            this._storageUsageCache = {};
            this._uploadedHashCache.clear();
        }
        return normalized;
    },

    resetPrimarySupabaseConfig() {
        const defaults = {
            enabled: false,
            storageOnly: true,
            url: '',
            anonKey: '',
            bucket: DEFAULT_PRIMARY_BUCKET
        };
        this._primaryCloudConfig = defaults;
        window.__livePrimarySupabaseConfig = defaults;
        this._primaryConfigSig = '';
        this._customPrimaryClient = null;
        this._customPrimaryClientSig = '';
        this._memCache.clear();
        this._inFlight.clear();
        this._storageUsageCache = {};
        this._uploadedHashCache.clear();
        try {
            localStorage.removeItem('industria_primary_supabase');
        } catch (_) {}
        return defaults;
    },

    hasCustomPrimarySupabase() {
        const cfg = this.getPrimarySupabaseConfig();
        return Boolean(cfg.enabled && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.url) && cfg.anonKey.length > 20);
    },

    isCustomPrimaryDbActive() {
        const cfg = this.getPrimarySupabaseConfig();
        return Boolean(this.hasCustomPrimarySupabase() && !cfg.storageOnly);
    },

    isCustomPrimaryStorageActive() {
        return this.hasCustomPrimarySupabase();
    },

    getActiveDbUrl() {
        return this.isCustomPrimaryDbActive() ? this.getPrimarySupabaseConfig().url : SUPABASE_URL;
    },

    getActiveStorageUrl() {
        return this.isCustomPrimaryStorageActive() ? this.getPrimarySupabaseConfig().url : SUPABASE_URL;
    },

    getPrimaryBucketName() {
        const cfg = this.getPrimarySupabaseConfig();
        return this.hasCustomPrimarySupabase() ? (cfg.bucket || DEFAULT_PRIMARY_BUCKET) : DEFAULT_PRIMARY_BUCKET;
    },

    _getOrBuildCustomPrimaryClient(cfgOverride) {
        const cfg = cfgOverride ? Object.assign({}, this.getPrimarySupabaseConfig(), cfgOverride) : this.getPrimarySupabaseConfig();
        const valid = Boolean(cfg.url && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.url) && cfg.anonKey && cfg.anonKey.length > 20);
        if (!valid || !window.supabase) return null;
        // Reuse the built-in client when custom config targets the same project URL + key (avoids duplicate GoTrueClient instances)
        if (!cfgOverride && cfg.url.toLowerCase() === SUPABASE_URL.toLowerCase() && cfg.anonKey === SUPABASE_ANON_KEY) {
            return this.getBuiltInClient();
        }
        if (cfgOverride) {
            return window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
        }
        const sig = `${cfg.url}|${cfg.anonKey}`;
        if (!this._customPrimaryClient || this._customPrimaryClientSig !== sig) {
            this._customPrimaryClient = window.supabase.createClient(cfg.url, cfg.anonKey, {
                auth: { persistSession: false, autoRefreshToken: false }
            });
            this._customPrimaryClientSig = sig;
        }
        return this._customPrimaryClient;
    },

    getClient() {
        if (this.isCustomPrimaryDbActive()) {
            return this._getOrBuildCustomPrimaryClient() || this.getBuiltInClient();
        }
        return this.getBuiltInClient();
    },

    getPrimaryStorageClient() {
        if (this.isCustomPrimaryStorageActive()) {
            return this._getOrBuildCustomPrimaryClient() || this.getClient();
        }
        return this.getClient();
    },

    async testPrimarySupabaseConnection(cfgOverride) {
        const cfg = cfgOverride ? Object.assign({}, this.getPrimarySupabaseConfig(), cfgOverride, { enabled: true }) : this.getPrimarySupabaseConfig();
        if (!cfg.url || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.url)) {
            return { ok: false, dbOk: false, storageOk: false, message: 'Enter a valid Supabase Project URL (e.g. https://xxxxx.supabase.co).' };
        }
        if (!cfg.anonKey || cfg.anonKey.length < 25) {
            return { ok: false, dbOk: false, storageOk: false, message: 'Enter the Supabase anon public API key for this project.' };
        }
        const client = this._getOrBuildCustomPrimaryClient(cfg);
        if (!client) {
            return { ok: false, dbOk: false, storageOk: false, message: 'Supabase SDK is not loaded yet.' };
        }
        const bucket = String(cfg.bucket || DEFAULT_PRIMARY_BUCKET).trim() || DEFAULT_PRIMARY_BUCKET;
        let dbOk = Boolean(cfg.storageOnly);
        let dbMsg = '';
        let storageOk = false;
        let storageMsg = '';
        const missingTables = [];

        if (!cfg.storageOnly) {
            const checks = [
                { table: 'properties', col: 'id' },
                { table: 'parks', col: 'id' },
                { table: 'agents', col: 'id' },
                { table: 'leads', col: 'id' },
                { table: 'owner_listings', col: 'id' },
                { table: 'app_users', col: 'id' },
                { table: 'site_settings', col: 'key' },
                { table: 'automation_templates', col: 'id' },
                { table: 'activity_logs', col: 'id' },
                { table: 'page_views', col: 'id' }
            ];
            let firstErr = '';
            const results = await Promise.all(checks.map(async (c) => {
                try {
                    const { error } = await client.from(c.table).select(c.col).limit(1);
                    if (error) {
                        missingTables.push(c.table);
                        if (!firstErr) firstErr = `${c.table}: ${error.message || 'table check failed'}`;
                        return false;
                    }
                    return true;
                } catch (e) {
                    missingTables.push(c.table);
                    if (!firstErr) firstErr = `${c.table}: ${e.message || String(e)}`;
                    return false;
                }
            }));
            dbOk = results.every(Boolean);
            dbMsg = dbOk ? 'All 10 core CRM tables ready' : (firstErr || `Missing tables: ${missingTables.join(', ')}`);
        }

        try {
            const { data, error: stErr } = await client.storage.from(bucket).list('', { limit: 1 });
            if (stErr) {
                storageMsg = stErr.message || `Bucket "${bucket}" check failed`;
            } else if (!Array.isArray(data)) {
                storageMsg = `Bucket "${bucket}" returned an unexpected response`;
            } else {
                storageOk = true;
            }
        } catch (e) {
            storageMsg = e.message || String(e);
        }

        const ok = cfg.storageOnly ? storageOk : (dbOk && storageOk);
        if (ok) {
            return {
                ok: true,
                dbOk,
                storageOk,
                missingTables,
                message: cfg.storageOnly
                    ? `Connected cleanly to ${cfg.url} — Storage bucket "${bucket}" is ready (PostgreSQL DB stays on Built-in Project).`
                    : `Connected cleanly to ${cfg.url} — All 10 PostgreSQL CRM tables + bucket "${bucket}" are ready.`
            };
        }
        return {
            ok: false,
            dbOk,
            storageOk,
            missingTables,
            message: [
                !cfg.storageOnly ? `DB (${missingTables.length ? missingTables.join(', ') : 'tables'}): ${dbOk ? 'OK' : dbMsg}` : null,
                `Storage (${bucket}): ${storageOk ? 'OK' : storageMsg}`
            ].filter(Boolean).join(' | ')
        };
    },

    // --- COMPLETE CRM DATABASE SCHEMA MANIFEST, LIVE SCANNER & 1-CLICK PROVISIONER ---
    CRM_SCHEMA_TABLES: [
        {
            name: 'properties',
            label: 'Property Listings',
            purpose: 'Core factory, warehouse & land inventory (Dashboard > Properties + Public Website)',
            primaryKey: 'id',
            columns: [
                { name: 'id', type: 'text PRIMARY KEY' },
                { name: 'ref_id', type: 'text' },
                { name: 'title', type: 'text' },
                { name: 'location', type: 'text' },
                { name: 'park', type: 'text' },
                { name: 'type', type: 'text' },
                { name: 'tenure', type: 'text' },
                { name: 'price', type: 'text' },
                { name: 'land_area', type: 'text' },
                { name: 'built_up', type: 'text' },
                { name: 'power', type: 'text' },
                { name: 'floor_load', type: 'text' },
                { name: 'ceiling_height', type: 'text' },
                { name: 'ceiling_peak', type: 'text' },
                { name: 'ceiling_eave', type: 'text' },
                { name: 'ceiling_clear', type: 'text' },
                { name: 'height', type: 'text' },
                { name: 'intent', type: 'text' },
                { name: 'road', type: 'text' },
                { name: 'usage', type: 'text' },
                { name: 'lift', type: 'text' },
                { name: 'loading_bay', type: 'text' },
                { name: 'available_units', type: 'text' },
                { name: 'comprise_units', type: 'text' },
                { name: 'description', type: 'text' },
                { name: 'status', type: "text DEFAULT 'Active'" },
                { name: 'featured', type: 'boolean DEFAULT false' },
                { name: 'images', type: "jsonb DEFAULT '[]'::jsonb" },
                { name: 'specs', type: "jsonb DEFAULT '{}'::jsonb" },
                { name: 'lat', type: 'double precision' },
                { name: 'lng', type: 'double precision' },
                { name: 'date_created', type: 'text' },
                { name: 'last_updated', type: 'text' },
                { name: 'created_at', type: 'timestamptz DEFAULT now()' },
                { name: 'updated_at', type: 'timestamptz DEFAULT now()' }
            ]
        },
        {
            name: 'parks',
            label: 'Industrial Parks',
            purpose: 'Territories, boundaries, map pins & specialist assignment (Dashboard > Parks)',
            primaryKey: 'id',
            columns: [
                { name: 'id', type: 'text PRIMARY KEY' },
                { name: 'ref_id', type: 'text' },
                { name: 'name', type: 'text' },
                { name: 'city', type: 'text' },
                { name: 'location', type: 'text' },
                { name: 'section', type: 'text' },
                { name: 'hidden', type: 'boolean DEFAULT false' },
                { name: 'agent_id', type: 'text' },
                { name: 'agent_name', type: 'text' },
                { name: 'remarks', type: 'text' },
                { name: 'lat', type: 'double precision' },
                { name: 'lng', type: 'double precision' },
                { name: 'specs', type: "jsonb DEFAULT '{}'::jsonb" },
                { name: 'created_at', type: 'timestamptz DEFAULT now()' },
                { name: 'updated_at', type: 'timestamptz DEFAULT now()' }
            ]
        },
        {
            name: 'agents',
            label: 'Specialist Agents',
            purpose: 'Specialist directory, REN credentials & park territories (Dashboard > Specialists)',
            primaryKey: 'id',
            columns: [
                { name: 'id', type: 'text PRIMARY KEY' },
                { name: 'name', type: 'text' },
                { name: 'ren', type: 'text' },
                { name: 'phone', type: 'text' },
                { name: 'whatsapp', type: 'text' },
                { name: 'email', type: 'text' },
                { name: 'bio', type: 'text' },
                { name: 'image', type: 'text' },
                { name: 'parks', type: "jsonb DEFAULT '[]'::jsonb" },
                { name: 'show_on_mainpage', type: 'boolean DEFAULT true' },
                { name: 'specs', type: "jsonb DEFAULT '{}'::jsonb" },
                { name: 'created_at', type: 'timestamptz DEFAULT now()' }
            ]
        },
        {
            name: 'leads',
            label: 'Customer Leads',
            purpose: 'Buyer & tenant inquiry pipeline (Dashboard > Lead List)',
            primaryKey: 'id',
            columns: [
                { name: 'id', type: 'text PRIMARY KEY' },
                { name: 'name', type: 'text' },
                { name: 'phone', type: 'text' },
                { name: 'email', type: 'text' },
                { name: 'interest', type: 'text' },
                { name: 'intent', type: 'text' },
                { name: 'property_id', type: 'text' },
                { name: 'message', type: 'text' },
                { name: 'status', type: "text DEFAULT 'New'" },
                { name: 'date', type: 'text' },
                { name: 'timestamp', type: 'text' },
                { name: 'assigned_agent_id', type: 'text' },
                { name: 'park', type: 'text' },
                { name: 'specs', type: "jsonb DEFAULT '{}'::jsonb" },
                { name: 'created_at', type: 'timestamptz DEFAULT now()' }
            ]
        },
        {
            name: 'owner_listings',
            label: 'Owner Listings',
            purpose: 'Landlord & vendor listing submissions (Dashboard > Owner List)',
            primaryKey: 'id',
            columns: [
                { name: 'id', type: 'text PRIMARY KEY' },
                { name: 'name', type: 'text' },
                { name: 'phone', type: 'text' },
                { name: 'email', type: 'text' },
                { name: 'location', type: 'text' },
                { name: 'type', type: 'text' },
                { name: 'intent', type: 'text' },
                { name: 'size', type: 'text' },
                { name: 'price', type: 'text' },
                { name: 'notes', type: 'text' },
                { name: 'status', type: "text DEFAULT 'Pending'" },
                { name: 'date', type: 'text' },
                { name: 'timestamp', type: 'text' },
                { name: 'assigned_agent_id', type: 'text' },
                { name: 'park', type: 'text' },
                { name: 'specs', type: "jsonb DEFAULT '{}'::jsonb" },
                { name: 'created_at', type: 'timestamptz DEFAULT now()' }
            ]
        },
        {
            name: 'app_users',
            label: 'CRM User Accounts',
            purpose: 'Login authentication & RBAC roles (Login + Settings > Admin Management)',
            primaryKey: 'id',
            columns: [
                { name: 'id', type: 'text PRIMARY KEY DEFAULT gen_random_uuid()::text' },
                { name: 'username', type: 'text UNIQUE NOT NULL' },
                { name: 'password', type: 'text' },
                { name: 'role', type: "text DEFAULT 'Administrator'" },
                { name: 'agent_id', type: 'text' },
                { name: 'whatsapp', type: 'text' },
                { name: 'specs', type: "jsonb DEFAULT '{}'::jsonb" },
                { name: 'created_at', type: 'timestamptz DEFAULT now()' }
            ]
        },
        {
            name: 'site_settings',
            label: 'Site & App Settings',
            purpose: 'Branding, general settings, watermark, landing locations & Insights articles',
            primaryKey: 'key',
            columns: [
                { name: 'key', type: 'text PRIMARY KEY' },
                { name: 'value', type: 'jsonb' },
                { name: 'updated_at', type: 'timestamptz DEFAULT now()' }
            ]
        },
        {
            name: 'automation_templates',
            label: 'Automation Templates',
            purpose: 'Saved outreach & notification message templates',
            primaryKey: 'id',
            columns: [
                { name: 'id', type: 'text PRIMARY KEY' },
                { name: 'name', type: 'text' },
                { name: 'content', type: 'text' },
                { name: 'is_active', type: 'boolean DEFAULT true' },
                { name: 'created_at', type: 'timestamptz DEFAULT now()' },
                { name: 'updated_at', type: 'timestamptz DEFAULT now()' }
            ]
        },
        {
            name: 'activity_logs',
            label: 'Activity Audit Logs',
            purpose: 'Admin & agent action history with Escalation Ref IDs (Settings > Activity Log)',
            primaryKey: 'id',
            columns: [
                { name: 'id', type: 'text PRIMARY KEY' },
                { name: 'created_at', type: 'timestamptz DEFAULT now()' },
                { name: 'actor_username', type: 'text' },
                { name: 'actor_role', type: 'text' },
                { name: 'category', type: 'text' },
                { name: 'action', type: 'text' },
                { name: 'target', type: 'text' },
                { name: 'details', type: 'text' },
                { name: 'specs', type: "jsonb DEFAULT '{}'::jsonb" }
            ]
        },
        {
            name: 'page_views',
            label: 'Visitor Page Views',
            purpose: 'Website traffic analytics & Overview KPI visitor charts (visit-tracker.js)',
            primaryKey: 'id',
            columns: [
                { name: 'id', type: 'bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY' },
                { name: 'visitor_id', type: 'text NOT NULL' },
                { name: 'path', type: "text DEFAULT '/'" },
                { name: 'referrer', type: 'text' },
                { name: 'created_at', type: 'timestamptz DEFAULT now()' }
            ]
        }
    ],

    CRM_SCHEMA_RPCS: [
        { name: 'get_daily_visitor_stats', label: 'Daily Visitor KPI RPC', args: {} },
        { name: 'get_visitor_stats', label: 'Monthly Visitor KPI RPC', args: {} },
        { name: 'get_daily_visitor_trend', label: 'Daily Traffic Chart RPC', args: { days_count: 14 } },
        { name: 'get_visitor_trend', label: '12-Month Traffic Chart RPC', args: {} }
    ],

    async inspectCrmDatabaseSchema(cfgOverride = null) {
        const client = cfgOverride ? this._getOrBuildCustomPrimaryClient(cfgOverride) : this.getClient();
        const storageClient = cfgOverride ? client : this.getPrimaryStorageClient();
        const activeUrl = (cfgOverride && cfgOverride.url) ? cfgOverride.url : this.getActiveDbUrl();
        const primaryBucket = (cfgOverride && cfgOverride.bucket) ? cfgOverride.bucket : this.getPrimaryBucketName();
        const refMatch = String(activeUrl || '').match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/i);
        const projectRef = refMatch ? refMatch[1] : '';

        if (!client) {
            return { ok: false, projectRef, projectUrl: activeUrl, error: 'Supabase client not initialized.', tables: [], rpcs: [], buckets: [] };
        }

        const tableResults = await Promise.all(this.CRM_SCHEMA_TABLES.map(async (tDef) => {
            const colNames = tDef.columns.map(c => c.name);
            try {
                const { error } = await client.from(tDef.name).select(colNames.join(',')).limit(1);
                if (!error) {
                    return { name: tDef.name, label: tDef.label, status: 'ready', columnCount: colNames.length, missingColumns: [], error: '' };
                }
                const errMsg = String(error.message || '');
                const isColumnError = error.code === '42703' || error.code === 'PGRST204' || /\bcolumn\b/i.test(errMsg);
                const isTableMissing = !isColumnError && (
                    error.code === '42P01' ||
                    error.code === 'PGRST205' ||
                    /could not find the table|relation .* does not exist/i.test(errMsg)
                );
                if (isTableMissing) {
                    return { name: tDef.name, label: tDef.label, status: 'missing_table', columnCount: colNames.length, missingColumns: colNames, error: errMsg };
                }
                // Table exists, check if specific column(s) are missing
                const missingCols = [];
                const colCheckRes = await Promise.all(colNames.map(async (cn) => {
                    const { error: cErr } = await client.from(tDef.name).select(cn).limit(1);
                    if (cErr && (cErr.code === '42703' || cErr.code === 'PGRST204' || /column|schema cache/i.test(String(cErr.message || '')))) {
                        missingCols.push(cn);
                    }
                }));
                void colCheckRes;
                if (missingCols.length > 0) {
                    return { name: tDef.name, label: tDef.label, status: 'missing_columns', columnCount: colNames.length, missingColumns: missingCols, error: `Missing column(s): ${missingCols.join(', ')}` };
                }
                return { name: tDef.name, label: tDef.label, status: 'error', columnCount: colNames.length, missingColumns: [], error: errMsg };
            } catch (e) {
                return { name: tDef.name, label: tDef.label, status: 'error', columnCount: colNames.length, missingColumns: [], error: e.message || String(e) };
            }
        }));

        const rpcResults = await Promise.all(this.CRM_SCHEMA_RPCS.map(async (rpcDef) => {
            try {
                const { error } = await client.rpc(rpcDef.name, rpcDef.args || {});
                if (!error) return { name: rpcDef.name, label: rpcDef.label, status: 'ready', error: '' };
                const msg = String(error.message || '');
                const missing = error.code === 'PGRST202' || error.code === '42883' || /could not find the function|does not exist/i.test(msg);
                return { name: rpcDef.name, label: rpcDef.label, status: missing ? 'missing_rpc' : 'error', error: msg };
            } catch (e) {
                return { name: rpcDef.name, label: rpcDef.label, status: 'error', error: e.message || String(e) };
            }
        }));

        const bucketNames = Array.from(new Set([primaryBucket || 'property-images', 'insight-images']));
        const bucketResults = await Promise.all(bucketNames.map(async (bName) => {
            try {
                const { data, error } = await storageClient.storage.from(bName).list('', { limit: 1 });
                if (!error && Array.isArray(data)) {
                    return { name: bName, status: 'ready', error: '' };
                }
                const msg = error ? (error.message || String(error)) : 'Bucket check failed';
                const missing = /not found|bucket/i.test(msg);
                return { name: bName, status: missing ? 'missing_bucket' : 'error', error: msg };
            } catch (e) {
                return { name: bName, status: 'error', error: e.message || String(e) };
            }
        }));

        const readyTables = tableResults.filter(t => t.status === 'ready').length;
        const readyRpcs = rpcResults.filter(r => r.status === 'ready').length;
        const primaryBucketOk = Boolean(bucketResults[0] && bucketResults[0].status === 'ready');

        return {
            ok: readyTables === tableResults.length && readyRpcs === rpcResults.length && primaryBucketOk,
            projectRef,
            projectUrl: activeUrl,
            tables: tableResults,
            rpcs: rpcResults,
            buckets: bucketResults,
            readyTables,
            totalTables: tableResults.length,
            readyRpcs,
            totalRpcs: rpcResults.length
        };
    },

    async executeSchemaViaApi({ projectRef, sql, accessToken = '', endpoint = '/api/supabase-schema' }) {
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (accessToken && String(accessToken).trim()) {
                headers['Authorization'] = `Bearer ${String(accessToken).trim()}`;
            }
            const res = await fetch(endpoint || '/api/supabase-schema', {
                method: 'POST',
                headers,
                body: JSON.stringify({ action: 'execute', projectRef, sql })
            });
            const text = await res.text();
            let data = {};
            try { data = text ? JSON.parse(text) : {}; } catch (_) {}
            if (res.status === 404 || res.status === 405) {
                return {
                    ok: false,
                    endpointUnavailable: true,
                    status: res.status,
                    error: 'Direct 1-click API (/api/supabase-schema) requires deployment on Vercel. Use "Copy SQL & Open SQL Editor" below to apply instantly.'
                };
            }
            if (!res.ok || !data.ok) {
                return { ok: false, status: res.status, error: data.error || `Schema API error (HTTP ${res.status})` };
            }
            return data;
        } catch (err) {
            return { ok: false, error: err && err.message ? err.message : String(err) };
        }
    },

    // --- DEDICATED INSIGHTS SUPABASE CONNECTION (ISOLATED STORAGE & ARTICLES DB) ---
    _insightsConfig: null,
    _insightsClient: null,
    _insightsClientSig: '',
    MAX_STORAGE_BUDGET_BYTES: 500 * 1024 * 1024, // 500 MB per-bucket budget cap
    STORAGE_WARN_BYTES: 450 * 1024 * 1024,       // 450 MB warning threshold
    R2_FREE_BUDGET_BYTES: 10 * 1024 * 1024 * 1024, // 10 GB Cloudflare R2 Free Tier reference
    _storageUsageCache: {},
    _mediaStorageConfig: null,
    _lastStorageError: null,

    getMediaStorageConfig() {
        const defaults = {
            provider: 'supabase',
            r2Endpoint: '/api/r2-storage',
            r2PublicUrl: '',
            r2Prefix: ''
        };
        let rawCfg = this._mediaStorageConfig || window.__liveMediaStorageConfig || null;
        if (!rawCfg && window.__liveSiteSettings && window.__liveSiteSettings.mediaStorage) {
            rawCfg = window.__liveSiteSettings.mediaStorage;
        }
        if (!rawCfg) {
            try {
                const stored = localStorage.getItem('industria_media_storage');
                if (stored) rawCfg = JSON.parse(stored);
            } catch (_) {}
        }
        if (!rawCfg) {
            try {
                const sRaw = localStorage.getItem('industria_settings');
                if (sRaw) {
                    const s = JSON.parse(sRaw);
                    if (s && s.mediaStorage) rawCfg = s.mediaStorage;
                }
            } catch (_) {}
        }
        const merged = Object.assign({}, defaults, (rawCfg && typeof rawCfg === 'object') ? rawCfg : {});
        merged.provider = String(merged.provider || 'supabase').toLowerCase() === 'r2' ? 'r2' : 'supabase';
        merged.r2Endpoint = String(merged.r2Endpoint || '/api/r2-storage').trim() || '/api/r2-storage';
        merged.r2PublicUrl = String(merged.r2PublicUrl || '').trim().replace(/\/+$/, '');
        merged.r2Prefix = String(merged.r2Prefix || '').trim().replace(/^\/+|\/+$/g, '');
        return merged;
    },

    setMediaStorageConfig(cfg) {
        const sanitized = {
            provider: String((cfg && cfg.provider) || 'supabase').toLowerCase() === 'r2' ? 'r2' : 'supabase',
            r2Endpoint: String((cfg && cfg.r2Endpoint) || '/api/r2-storage').trim() || '/api/r2-storage',
            r2PublicUrl: String((cfg && cfg.r2PublicUrl) || '').trim().replace(/\/+$/, ''),
            r2Prefix: String((cfg && cfg.r2Prefix) || '').trim().replace(/^\/+|\/+$/g, '')
        };
        this._mediaStorageConfig = sanitized;
        window.__liveMediaStorageConfig = sanitized;
        try {
            localStorage.setItem('industria_media_storage', JSON.stringify(sanitized));
        } catch (_) {}
        return this.getMediaStorageConfig();
    },

    getR2AdminToken() {
        if (this._r2AdminToken !== undefined && this._r2AdminToken !== null) return this._r2AdminToken;
        try {
            return String(localStorage.getItem('industria_r2_admin_token') || '').trim();
        } catch (_) {
            return '';
        }
    },

    setR2AdminToken(token) {
        const clean = String(token || '').trim();
        this._r2AdminToken = clean;
        try {
            if (clean) {
                localStorage.setItem('industria_r2_admin_token', clean);
            } else {
                localStorage.removeItem('industria_r2_admin_token');
            }
        } catch (_) {}
        return clean;
    },

    isUsingR2Storage() {
        const cfg = this.getMediaStorageConfig();
        return cfg.provider === 'r2'
            && /^https:\/\/.+/i.test(cfg.r2PublicUrl)
            && Boolean(cfg.r2Endpoint);
    },

    async _callR2Api(payload, cfgOverride = null, tokenOverride = null) {
        const cfg = cfgOverride ? Object.assign({}, this.getMediaStorageConfig(), cfgOverride) : this.getMediaStorageConfig();
        const endpoint = cfg.r2Endpoint || '/api/r2-storage';
        const token = tokenOverride !== null && tokenOverride !== undefined ? String(tokenOverride).trim() : this.getR2AdminToken();
        if (!token) {
            return { ok: false, status: 401, error: 'Missing R2 Admin Upload Token. Enter it in Dashboard > Settings > Server.' };
        }
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch (_) {
            if (res.status === 404 || res.status === 405) {
                return { ok: false, status: res.status, error: `API endpoint "${endpoint}" is unavailable on this server. Deploy on Vercel with /api/r2-storage enabled.` };
            }
            return { ok: false, status: res.status, error: `Unexpected server response (${res.status}).` };
        }
        if (!res.ok || !data.ok) {
            return Object.assign({ ok: false, status: res.status }, data, { error: data.error || `R2 API error (${res.status})` });
        }
        return data;
    },

    async testR2Connection(cfgOverride = null, tokenOverride = null) {
        const cfg = cfgOverride ? Object.assign({}, this.getMediaStorageConfig(), cfgOverride) : this.getMediaStorageConfig();
        if (!cfg.r2PublicUrl || !/^https:\/\/.+/i.test(cfg.r2PublicUrl)) {
            return { ok: false, message: 'Enter a valid HTTPS R2 Public URL (e.g. https://pub-xxxx.r2.dev or custom domain).' };
        }
        try {
            const data = await this._callR2Api({ action: 'status', prefix: cfg.r2Prefix || '' }, cfg, tokenOverride);
            if (!data.ok) {
                return { ok: false, status: data.status, message: data.error || 'Could not verify R2 endpoint.' };
            }
            return {
                ok: true,
                bucket: data.bucket,
                publicUrl: data.publicUrl,
                fileCount: data.fileCount || 0,
                totalBytes: data.totalBytes || 0,
                totalMB: data.totalMB || 0,
                limitMB: data.limitMB || 10240,
                message: `Connected to Cloudflare R2 bucket "${data.bucket}" (${data.fileCount || 0} files, ${data.totalMB || 0} MB / 10,240 MB Free Tier).`
            };
        } catch (err) {
            return { ok: false, message: err && err.message ? err.message : String(err) };
        }
    },

    getInsightsCloudConfig() {
        const defaults = {
            enabled: false,
            url: '',
            anonKey: '',
            bucket: 'insight-images',
            storageOnly: false
        };
        let rawCfg = this._insightsConfig || window.__liveInsightsCloudConfig || null;
        if (!rawCfg && window.__liveSiteSettings && window.__liveSiteSettings.insightsCloud) {
            rawCfg = window.__liveSiteSettings.insightsCloud;
        }
        if (!rawCfg) {
            try {
                const stored = localStorage.getItem('industria_insights_cloud');
                if (stored) rawCfg = JSON.parse(stored);
            } catch (_) {}
        }
        if (!rawCfg) {
            try {
                const sRaw = localStorage.getItem('industria_settings');
                if (sRaw) {
                    const s = JSON.parse(sRaw);
                    if (s && s.insightsCloud) rawCfg = s.insightsCloud;
                }
            } catch (_) {}
        }
        const merged = Object.assign({}, defaults, (rawCfg && typeof rawCfg === 'object') ? rawCfg : {});
        merged.enabled = merged.enabled === true || String(merged.enabled) === 'true';
        merged.storageOnly = merged.storageOnly === true || String(merged.storageOnly) === 'true';
        merged.url = String(merged.url || '').trim().replace(/\/+$/, '');
        merged.anonKey = String(merged.anonKey || '').trim();
        merged.bucket = String(merged.bucket || 'insight-images').trim() || 'insight-images';
        return merged;
    },

    setInsightsCloudConfig(cfg) {
        const normalized = {
            enabled: Boolean(cfg && (cfg.enabled === true || String(cfg.enabled) === 'true')),
            url: String((cfg && cfg.url) || '').trim().replace(/\/+$/, ''),
            anonKey: String((cfg && cfg.anonKey) || '').trim(),
            bucket: String((cfg && cfg.bucket) || 'insight-images').trim() || 'insight-images',
            storageOnly: Boolean(cfg && (cfg.storageOnly === true || String(cfg.storageOnly) === 'true'))
        };
        this._insightsConfig = normalized;
        window.__liveInsightsCloudConfig = normalized;
        try {
            if (typeof window.safeLocalStorageSet === 'function') {
                window.safeLocalStorageSet('industria_insights_cloud', normalized);
            } else {
                localStorage.setItem('industria_insights_cloud', JSON.stringify(normalized));
            }
        } catch (_) {}

        const sig = normalized.enabled ? `${normalized.url}|${normalized.anonKey}` : '';
        if (sig !== this._insightsClientSig) {
            this._insightsClient = null;
            this._insightsClientSig = sig;
        }
        this._invalidate('site_setting:insights_articles');
        this._invalidate('site_setting:insights_automation_settings');
        this._invalidate('site_setting:insights_access_control');
        return normalized;
    },

    hasDedicatedInsightsAccount() {
        const cfg = this.getInsightsCloudConfig();
        return Boolean(cfg.enabled && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.url) && cfg.anonKey.length > 20);
    },

    _getOrBuildInsightsClient(cfgOverride) {
        const cfg = cfgOverride ? Object.assign({}, this.getInsightsCloudConfig(), cfgOverride) : this.getInsightsCloudConfig();
        const valid = Boolean(cfg.url && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.url) && cfg.anonKey && cfg.anonKey.length > 20);
        if (!valid || !window.supabase) return null;
        if (cfgOverride) {
            return window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
        }
        const sig = `${cfg.url}|${cfg.anonKey}`;
        if (!this._insightsClient || this._insightsClientSig !== sig) {
            this._insightsClient = window.supabase.createClient(cfg.url, cfg.anonKey, {
                auth: { persistSession: false, autoRefreshToken: false }
            });
            this._insightsClientSig = sig;
        }
        return this._insightsClient;
    },

    getInsightsClient() {
        const cfg = this.getInsightsCloudConfig();
        if (this.hasDedicatedInsightsAccount() && !cfg.storageOnly) {
            return this._getOrBuildInsightsClient() || this.getClient();
        }
        return this.getClient();
    },

    getInsightsStorageClient() {
        if (this.hasDedicatedInsightsAccount()) {
            return this._getOrBuildInsightsClient() || this.getPrimaryStorageClient();
        }
        return this.getPrimaryStorageClient();
    },

    getInsightsBucketName() {
        const cfg = this.getInsightsCloudConfig();
        return this.hasDedicatedInsightsAccount() ? (cfg.bucket || 'insight-images') : this.getPrimaryBucketName();
    },

    async testInsightsConnection(cfgOverride) {
        const cfg = cfgOverride ? Object.assign({}, this.getInsightsCloudConfig(), cfgOverride, { enabled: true }) : this.getInsightsCloudConfig();
        if (!cfg.url || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.url)) {
            return { ok: false, dbOk: false, storageOk: false, message: 'Enter a valid Supabase Project URL (e.g. https://xxxxx.supabase.co).' };
        }
        if (!cfg.anonKey || cfg.anonKey.length < 25) {
            return { ok: false, dbOk: false, storageOk: false, message: 'Enter the Supabase anon public API key for the Insights project.' };
        }
        const client = this._getOrBuildInsightsClient(cfg);
        if (!client) {
            return { ok: false, dbOk: false, storageOk: false, message: 'Supabase SDK is not loaded yet.' };
        }
        const bucket = cfg.bucket || 'insight-images';
        let dbOk = false;
        let dbMsg = '';
        let storageOk = false;
        let storageMsg = '';

        try {
            const { error } = await client.from('site_settings').select('key').limit(1);
            if (error) {
                dbMsg = error.message || 'site_settings table check failed';
            } else {
                dbOk = true;
            }
        } catch (e) {
            dbMsg = e.message || String(e);
        }

        try {
            const { error: stErr } = await client.storage.from(bucket).list('', { limit: 1 });
            if (stErr) {
                storageMsg = stErr.message || `Bucket "${bucket}" check failed`;
            } else {
                storageOk = true;
            }
        } catch (e) {
            storageMsg = e.message || String(e);
        }

        const ok = (cfg.storageOnly ? storageOk : (dbOk && storageOk));
        if (ok) {
            return { ok: true, dbOk, storageOk, message: `Connected cleanly to ${cfg.url} (DB + bucket "${bucket}" ready).` };
        }
        return {
            ok: false,
            dbOk,
            storageOk,
            message: [
                !cfg.storageOnly ? `DB (site_settings): ${dbOk ? 'OK' : dbMsg}` : null,
                `Storage (${bucket}): ${storageOk ? 'OK' : storageMsg}`
            ].filter(Boolean).join(' | ')
        };
    },

    // Fetch properties from Supabase (deduplicated)
    async fetchProperties() {
        return this._dedupFetch('properties', async () => {
            const client = this.getClient();
            if (!client) return null;
            try {
                const { data, error } = await client.from('properties').select('*');
                if (error) {
                    console.error('Error fetching properties from Supabase:', error);
                    return null;
                }
                return data;
            } catch (e) {
                console.error('Exception fetching properties from Supabase:', e);
                return null;
            }
        });
    },

    // Save/Update property in Supabase
    async upsertProperty(property) {
        await this.ensurePublicConfigLoaded();
        this._invalidate('properties');
        const client = this.getClient();
        if (!client) return { success: false, error: 'Supabase client not initialized' };
        try {
            const { data, error } = await client.from('properties').upsert(property).select();
            if (error) {
                console.error('Error saving property to Supabase:', error);
                return { success: false, error: error.message || String(error) };
            }
            return { success: true, data };
        } catch (e) {
            console.error('Exception saving property to Supabase:', e);
            return { success: false, error: e.message || String(e) };
        }
    },

    // Delete property from Supabase
    async deleteProperty(id) {
        this._invalidate('properties');
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('properties').delete().eq('id', id);
            if (error) {
                console.error('Error deleting property from Supabase:', error);
                return false;
            }
            return true;
        } catch (e) {
            console.error('Exception deleting property from Supabase:', e);
            return false;
        }
    },

    // Fetch parks (deduplicated)
    async fetchIndustrialParks() {
        return this._dedupFetch('parks', async () => {
            const client = this.getClient();
            if (!client) return null;
            try {
                const { data, error } = await client.from('parks').select('*');
                if (error) return null;
                return data;
            } catch (e) {
                return null;
            }
        });
    },

    // Upsert park
    async upsertIndustrialPark(park) {
        this._invalidate('parks');
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('parks').upsert(park);
            return !error;
        } catch (e) {
            return false;
        }
    },

    // Delete park
    async deleteIndustrialPark(id) {
        this._invalidate('parks');
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('parks').delete().eq('id', id);
            return !error;
        } catch (e) {
            return false;
        }
    },

    // Fetch agents (deduplicated)
    async fetchAgents() {
        return this._dedupFetch('agents', async () => {
            const client = this.getClient();
            if (!client) return null;
            try {
                const { data, error } = await client.from('agents').select('*').order('id', { ascending: true });
                if (error) return null;
                return data.map(item => {
                    const specs = (item.specs && typeof item.specs === 'object') ? item.specs : {};
                    return {
                        ...specs,
                        id: isNaN(item.id) ? item.id : Number(item.id),
                        name: item.name || specs.name || '',
                        ren: item.ren || specs.ren || '',
                        phone: item.phone || specs.phone || '',
                        whatsapp: item.whatsapp || specs.whatsapp || '',
                        email: item.email || specs.email || '',
                        bio: item.bio || specs.bio || '',
                        image: item.image || specs.image || '',
                        parks: Array.isArray(item.parks) ? item.parks : (specs.parks || []),
                        assignedParks: Array.isArray(item.parks) ? item.parks : (specs.assignedParks || []),
                        showOnMainpage: item.show_on_mainpage !== false
                    };
                });
            } catch (e) {
                return null;
            }
        });
    },

    // Upsert agent
    async upsertAgent(agent) {
        this._invalidate('agents');
        const client = this.getClient();
        if (!client) {
            console.error('Supabase client not initialized in upsertAgent');
            return false;
        }
        try {
            let imageUrl = agent.image || '';
            if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
                const uploadRes = await this.uploadImage(imageUrl, { prefix: 'agent' });
                if (uploadRes && uploadRes.success && uploadRes.url) {
                    imageUrl = uploadRes.url;
                    agent.image = imageUrl;
                }
            }

            const cleanSpecs = Object.assign({}, agent);
            cleanSpecs.image = imageUrl;

            const payload = {
                id: String(agent.id),
                name: agent.name || '',
                ren: agent.ren || '',
                phone: String(agent.phone || ''),
                whatsapp: String(agent.whatsapp || ''),
                email: agent.email || '',
                bio: agent.bio || '',
                image: imageUrl,
                parks: Array.isArray(agent.parks) ? agent.parks : (Array.isArray(agent.assignedParks) ? agent.assignedParks : []),
                show_on_mainpage: agent.showOnMainpage !== false,
                specs: cleanSpecs
            };
            const { data, error } = await client.from('agents').upsert(payload, { onConflict: 'id' });
            if (error) {
                console.error('Supabase upsertAgent error:', error);
                throw error;
            }
            console.log('✅ Agent upserted successfully to Supabase:', payload.id, payload.name);
            return true;
        } catch (e) {
            console.error('Exception in upsertAgent:', e);
            throw e;
        }
    },

    // Delete agent
    async deleteAgent(id) {
        this._invalidate('agents');
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('agents').delete().eq('id', String(id));
            return !error;
        } catch (e) {
            return false;
        }
    },

    // Fetch app users
    async fetchUsers() {
        await this.ensurePublicConfigLoaded();
        const client = this.getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from('app_users').select('*').order('created_at', { ascending: true });
            if (error) {
                console.error('Error fetching users from Supabase:', error);
                return null;
            }
            return data.map(item => {
                const specs = (item.specs && typeof item.specs === 'object') ? item.specs : {};
                return {
                    ...specs,
                    id: item.id,
                    username: item.username || specs.username || '',
                    password: item.password || specs.password || '',
                    role: item.role || specs.role || 'Administrator',
                    agentId: item.agent_id ? (isNaN(item.agent_id) ? item.agent_id : Number(item.agent_id)) : (specs.agentId || null),
                    whatsapp: item.whatsapp || specs.whatsapp || ''
                };
            });
        } catch (e) {
            console.error('Exception fetching users from Supabase:', e);
            return null;
        }
    },

    // Authenticate user against Supabase app_users table
    async authenticateUser(username, password) {
        await this.ensurePublicConfigLoaded();
        const client = this.getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from('app_users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .maybeSingle();
            
            if (error || !data) return null;
            return data;
        } catch (e) {
            console.error('Exception during Supabase authentication:', e);
            return null;
        }
    },

    // Upsert user
    async upsertUser(user) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const payload = {
                username: user.username,
                password: user.password || '',
                role: user.role || 'Administrator',
                agent_id: user.agentId ? String(user.agentId) : null,
                whatsapp: user.whatsapp || '',
                specs: user
            };
            if (user.id) payload.id = user.id;
            const { error } = await client.from('app_users').upsert(payload, { onConflict: 'username' });
            if (error) {
                console.error('Error upserting user in Supabase:', error);
                return false;
            }
            return true;
        } catch (e) {
            console.error('Exception upserting user in Supabase:', e);
            return false;
        }
    },

    // Delete user
    async deleteUser(username) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('app_users').delete().eq('username', username);
            if (error) {
                console.error('Error deleting user from Supabase:', error);
                return false;
            }
            return true;
        } catch (e) {
            console.error('Exception deleting user from Supabase:', e);
            return false;
        }
    },

    // Fetch multiple site settings in a single query and populate per-key cache
    async fetchSiteSettingsBatch(keys) {
        const cleanKeys = [...new Set((Array.isArray(keys) ? keys : []).map(k => String(k || '').trim()).filter(Boolean))];
        if (cleanKeys.length === 0) return {};

        const result = {};
        const missing = [];
        for (const k of cleanKeys) {
            const cached = this._getCached('site_setting:' + k);
            if (cached !== undefined) {
                result[k] = cached;
            } else {
                missing.push(k);
            }
        }
        if (missing.length === 0) return result;

        const batchKey = 'site_setting_batch:' + missing.slice().sort().join(',');
        const batchPromise = this._dedupFetch(batchKey, async () => {
            const client = this.getClient();
            if (!client) return result;
            try {
                const { data, error } = await client.from('site_settings').select('key, value').in('key', missing);
                if (error) {
                    console.error('Error batch-fetching site settings:', error);
                    return result;
                }
                const foundMap = new Map((data || []).map(row => [row.key, row.value]));
                for (const k of missing) {
                    const val = foundMap.has(k) ? foundMap.get(k) : null;
                    this._setCached('site_setting:' + k, val);
                    result[k] = val;
                }
                return result;
            } catch (e) {
                console.error('Exception batch-fetching site settings:', e);
                return result;
            }
        });

        // Share in-flight batch resolution with concurrent per-key fetchSiteSetting(k) callers
        for (const k of missing) {
            const keySlot = 'site_setting:' + k;
            if (!this._inFlight.has(keySlot)) {
                const perKeyPromise = batchPromise
                    .then(map => (map && Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null))
                    .finally(() => {
                        if (this._inFlight.get(keySlot) === perKeyPromise) {
                            this._inFlight.delete(keySlot);
                        }
                    });
                this._inFlight.set(keySlot, perKeyPromise);
            }
        }

        return batchPromise;
    },

    // Fetch site setting by key (deduplicated; automatically routes 'insights_*' keys to dedicated Insights account when configured)
    async fetchSiteSetting(key) {
        const isInsightsKey = String(key || '').startsWith('insights_');
        return this._dedupFetch('site_setting:' + key, async () => {
            const client = isInsightsKey ? this.getInsightsClient() : this.getClient();
            if (!client) return null;
            try {
                const { data, error } = await client.from('site_settings').select('*').eq('key', key).maybeSingle();
                if (error || !data) return null;
                return data.value;
            } catch (e) {
                console.error(`Exception fetching site setting '${key}' from Supabase:`, e);
                return null;
            }
        });
    },

    // Upsert site setting (key, value; automatically routes 'insights_*' keys to dedicated Insights account when configured)
    async upsertSiteSetting(key, value) {
        await this.ensurePublicConfigLoaded();
        const isInsightsKey = String(key || '').startsWith('insights_');
        this._invalidate('site_setting:' + key);
        if (!isInsightsKey) {
            this._invalidate('site_setting_batch');
        }
        const client = isInsightsKey ? this.getInsightsClient() : this.getClient();
        if (!client) return false;
        try {
            const payload = {
                key: key,
                value: value,
                updated_at: new Date().toISOString()
            };
            const { error } = await client.from('site_settings').upsert(payload, { onConflict: 'key' });
            if (error) {
                console.error(`Error upserting site setting '${key}' in Supabase:`, error);
                return false;
            }
            return true;
        } catch (e) {
            console.error(`Exception upserting site setting '${key}' in Supabase:`, e);
            return false;
        }
    },

    // Best-effort upsert directly to the built-in default Supabase project (used to publish DB routing pointers for fresh browsers)
    async upsertSiteSettingToBuiltIn(key, value) {
        await this.ensurePublicConfigLoaded();
        const client = this.getBuiltInClient();
        if (!client) return false;
        try {
            const payload = {
                key: key,
                value: value,
                updated_at: new Date().toISOString()
            };
            const { error } = await client.from('site_settings').upsert(payload, { onConflict: 'key' });
            return !error;
        } catch (_) {
            return false;
        }
    },

    // Fetch leads
    async fetchLeads() {
        await this.ensurePublicConfigLoaded();
        const client = this.getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from('leads').select('*').order('created_at', { ascending: false });
            if (error) return null;
            return data.map(item => {
                const specs = (item.specs && typeof item.specs === 'object') ? item.specs : {};
                return {
                    ...specs,
                    id: isNaN(item.id) ? item.id : Number(item.id),
                    name: item.name || specs.name || '',
                    phone: item.phone || specs.phone || '',
                    email: item.email || specs.email || '',
                    interest: item.interest || specs.interest || '',
                    intent: item.intent || specs.intent || '',
                    message: item.message || specs.message || '',
                    status: item.status || specs.status || 'New',
                    date: item.date || specs.date || '',
                    timestamp: item.timestamp || specs.timestamp || ''
                };
            });
        } catch (e) {
            return null;
        }
    },

    // Add or Update customer lead
    async upsertLead(lead) {
        await this.ensurePublicConfigLoaded();
        const client = this.getClient();
        if (!client) return false;
        try {
            const leadId = (lead.id !== undefined && lead.id !== null && String(lead.id) !== 'undefined') ? String(lead.id) : String(Date.now());
            const fullSpecs = Object.assign({}, lead, { id: leadId });
            const payload = {
                id: leadId,
                name: lead.name || '',
                phone: lead.phone || '',
                email: lead.email || '',
                interest: lead.interest || '',
                intent: lead.intent || '',
                property_id: lead.property_id || lead.propertyId || null,
                message: lead.message || '',
                status: lead.status || 'New',
                date: lead.date || new Date().toLocaleDateString(),
                timestamp: lead.timestamp || new Date().toLocaleString(),
                specs: fullSpecs
            };
            const { error } = await client.from('leads').upsert(payload);
            return !error;
        } catch (e) {
            return false;
        }
    },

    // Add new customer lead
    async addLead(lead) {
        return this.upsertLead(lead);
    },

    // Delete lead
    async deleteLead(id) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('leads').delete().eq('id', String(id));
            return !error;
        } catch (e) {
            return false;
        }
    },

    // Fetch owner listings from Supabase
    async fetchOwnerListings() {
        await this.ensurePublicConfigLoaded();
        const client = this.getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from('owner_listings').select('*').order('created_at', { ascending: false });
            if (error) {
                console.error('Error fetching owner listings from Supabase:', error);
                return null;
            }
            return data;
        } catch (e) {
            console.error('Exception fetching owner listings from Supabase:', e);
            return null;
        }
    },

    // Add or Update owner listing in Supabase
    async upsertOwnerListing(listing) {
        await this.ensurePublicConfigLoaded();
        const client = this.getClient();
        if (!client) return false;
        try {
            const listingId = (listing.id !== undefined && listing.id !== null && String(listing.id) !== 'undefined') ? String(listing.id) : String(Date.now());
            const fullSpecs = Object.assign({}, listing, { id: listingId });
            const payload = {
                id: listingId,
                name: listing.name || '',
                phone: listing.phone || '',
                email: listing.email || '',
                location: listing.location || '',
                type: listing.type || '',
                intent: listing.intent || '',
                size: listing.size || '',
                price: listing.price || '',
                notes: listing.notes || '',
                status: listing.status || 'Pending',
                date: listing.date || new Date().toLocaleDateString(),
                timestamp: listing.timestamp || new Date().toLocaleString(),
                specs: fullSpecs
            };
            const { error } = await client.from('owner_listings').upsert(payload);
            if (error) {
                console.error('Error upserting owner listing in Supabase:', error);
                return false;
            }
            return true;
        } catch (e) {
            console.error('Exception upserting owner listing in Supabase:', e);
            return false;
        }
    },

    // Delete owner listing from Supabase
    async deleteOwnerListing(id) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('owner_listings').delete().eq('id', String(id));
            return !error;
        } catch (e) {
            return false;
        }
    },

    _uploadedHashCache: new Map(),

    async _computeBlobHash(fileBody) {
        try {
            if (!fileBody || typeof fileBody.arrayBuffer !== 'function') {
                return null;
            }
            const buf = await fileBody.arrayBuffer();
            if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
                const digest = await crypto.subtle.digest('SHA-256', buf);
                const bytes = Array.from(new Uint8Array(digest));
                return bytes.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
            }
            // Deterministic dual-32-bit FNV-1a fallback when crypto.subtle is unavailable (e.g. non-HTTPS preview)
            const view = new Uint8Array(buf);
            let h1 = 0x811c9dc5;
            let h2 = 0x9e3779b9;
            for (let i = 0; i < view.length; i++) {
                h1 ^= view[i];
                h1 = Math.imul(h1, 0x01000193) >>> 0;
                h2 ^= (view[i] + (i & 0xff)) & 0xff;
                h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
            }
            return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
        } catch (_) {
            return null;
        }
    },

    parseStoragePublicUrl(url) {
        const clean = String(url || '').split('?')[0].trim();
        const m = clean.match(/^(https:\/\/[^\/]+)\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/i);
        if (m) {
            return {
                provider: 'supabase',
                baseUrl: m[1].toLowerCase(),
                bucket: decodeURIComponent(m[2]),
                path: decodeURIComponent(m[3])
            };
        }
        const mediaCfg = this.getMediaStorageConfig();
        const r2Base = (mediaCfg && mediaCfg.r2PublicUrl) ? mediaCfg.r2PublicUrl.toLowerCase().replace(/\/+$/, '') : '';
        if (r2Base && clean.toLowerCase().startsWith(r2Base + '/')) {
            return {
                provider: 'r2',
                baseUrl: r2Base,
                bucket: 'r2',
                path: decodeURIComponent(clean.slice(r2Base.length + 1))
            };
        }
        return null;
    },

    async deleteStorageObjects(urls) {
        const list = Array.isArray(urls) ? urls : [urls];
        if (!list.length) return 0;

        this._lastStorageError = null;
        const grouped = new Map();
        const r2Keys = new Set();

        for (const rawUrl of list) {
            const parsed = this.parseStoragePublicUrl(rawUrl);
            if (!parsed || !parsed.path) continue;
            if (parsed.provider === 'r2') {
                r2Keys.add(parsed.path);
                continue;
            }
            if (!parsed.bucket) continue;
            const key = `${parsed.baseUrl}|||${parsed.bucket}`;
            if (!grouped.has(key)) {
                grouped.set(key, { baseUrl: parsed.baseUrl, bucket: parsed.bucket, paths: new Set() });
            }
            grouped.get(key).paths.add(parsed.path);
        }

        let deletedCount = 0;
        const builtInBase = SUPABASE_URL.toLowerCase().replace(/\/+$/, '');
        const customPrimaryCfg = this.getPrimarySupabaseConfig();
        const customPrimaryBase = (customPrimaryCfg && customPrimaryCfg.url) ? customPrimaryCfg.url.toLowerCase().replace(/\/+$/, '') : '';
        const insightsCfg = this.getInsightsCloudConfig();
        const insightsBase = (insightsCfg && insightsCfg.url) ? insightsCfg.url.toLowerCase().replace(/\/+$/, '') : '';

        for (const group of grouped.values()) {
            let client = null;
            if (group.baseUrl === builtInBase) {
                client = this.getBuiltInClient();
            } else if (customPrimaryBase && group.baseUrl === customPrimaryBase) {
                client = this._getOrBuildCustomPrimaryClient();
            } else if (insightsBase && group.baseUrl === insightsBase) {
                client = this.getInsightsStorageClient();
            }
            if (!client) continue;

            const scopeKey = `${group.baseUrl}|${group.bucket}`;
            const paths = Array.from(group.paths);
            for (let i = 0; i < paths.length; i += 50) {
                const chunk = paths.slice(i, i + 50);
                try {
                    const { error } = await client.storage.from(group.bucket).remove(chunk);
                    if (!error) {
                        deletedCount += chunk.length;
                        chunk.forEach(p => {
                            this._uploadedHashCache.delete(`${group.bucket}:${p}`);
                            this._uploadedHashCache.delete(`${scopeKey}:${p}`);
                        });
                        if (this._storageUsageCache) {
                            delete this._storageUsageCache[group.bucket];
                            delete this._storageUsageCache[scopeKey];
                        }
                    } else {
                        this._lastStorageError = error.message || String(error);
                    }
                } catch (err) {
                    this._lastStorageError = err && err.message ? err.message : String(err);
                }
            }
        }

        if (r2Keys.size > 0) {
            const keysArr = Array.from(r2Keys);
            for (let i = 0; i < keysArr.length; i += 50) {
                const chunk = keysArr.slice(i, i + 50);
                try {
                    const res = await this._callR2Api({ action: 'delete', keys: chunk });
                    if (res && res.ok) {
                        deletedCount += res.deleted || chunk.length;
                        chunk.forEach(p => this._uploadedHashCache.delete(`r2:${p}`));
                        if (this._storageUsageCache && this._storageUsageCache.r2) {
                            delete this._storageUsageCache.r2;
                        }
                    } else if (res && res.error) {
                        this._lastStorageError = res.error;
                    }
                } catch (err) {
                    this._lastStorageError = err && err.message ? err.message : String(err);
                }
            }
        }
        return deletedCount;
    },

    async listAllBucketObjects(bucketName = null, options = {}) {
        const primaryBucket = this.getPrimaryBucketName();
        const targetBucket = bucketName || primaryBucket;
        const isPrimaryBucket = (targetBucket === primaryBucket || targetBucket === DEFAULT_PRIMARY_BUCKET);
        const provider = (options && options.provider) || ((targetBucket === 'r2' || (isPrimaryBucket && this.isUsingR2Storage() && !options.forceSupabase)) ? 'r2' : 'supabase');
        if (provider === 'r2') {
            try {
                const cfg = this.getMediaStorageConfig();
                const res = await this._callR2Api({ action: 'status', prefix: cfg.r2Prefix || '', includeItems: true });
                if (!res || !res.ok) {
                    return { known: false, provider: 'r2', totalBytes: null, fileCount: null, items: [], error: (res && res.error) || 'R2 list unavailable' };
                }
                return {
                    known: true,
                    provider: 'r2',
                    bucket: res.bucket,
                    totalBytes: res.totalBytes || 0,
                    totalMB: res.totalMB || 0,
                    fileCount: res.fileCount || 0,
                    limitBytes: this.R2_FREE_BUDGET_BYTES,
                    limitMB: 10240,
                    items: Array.isArray(res.items) ? res.items : []
                };
            } catch (err) {
                return { known: false, provider: 'r2', totalBytes: null, fileCount: null, items: [], error: err && err.message ? err.message : String(err) };
            }
        }

        const insightsCfg = this.getInsightsCloudConfig();
        const isInsightsBucket = Boolean(options && options.useInsightsClient)
            || (insightsCfg && insightsCfg.bucket === targetBucket && this.hasDedicatedInsightsAccount() && !isPrimaryBucket);
        const client = (options && options._clientOverride)
            || (isInsightsBucket ? this.getInsightsStorageClient() : this.getPrimaryStorageClient());
        const limitBytes = this.MAX_STORAGE_BUDGET_BYTES || (500 * 1024 * 1024);
        if (!client || !client.storage) {
            return { known: false, provider: 'supabase', totalBytes: null, fileCount: null, limitBytes, limitMB: 500, items: [] };
        }

        let totalBytes = 0;
        let fileCount = 0;
        let offset = 0;
        const pageSize = 1000;
        const items = [];
        try {
            for (let page = 0; page < 15; page++) {
                const { data, error } = await client.storage.from(targetBucket).list('', { limit: pageSize, offset });
                if (error || !Array.isArray(data)) {
                    const errMsg = error ? (error.message || String(error)) : 'Unable to list bucket';
                    const quotaExceeded = /quota|exceed|402|payment/i.test(errMsg);
                    return { known: false, provider: 'supabase', bucket: targetBucket, totalBytes: null, fileCount: null, limitBytes, limitMB: 500, items: [], error: errMsg, quotaExceeded };
                }
                for (let i = 0; i < data.length; i++) {
                    const item = data[i];
                    if (!item || !item.name) continue;
                    const size = (item.metadata && typeof item.metadata.size === 'number') ? item.metadata.size : 0;
                    fileCount++;
                    totalBytes += size;
                    const { data: pubData } = client.storage.from(targetBucket).getPublicUrl(item.name);
                    items.push({
                        name: item.name,
                        size,
                        createdAt: item.created_at || null,
                        updatedAt: item.updated_at || null,
                        url: pubData ? pubData.publicUrl : ''
                    });
                }
                if (data.length < pageSize) break;
                offset += pageSize;
            }
        } catch (err) {
            const errMsg = err && err.message ? err.message : String(err);
            return { known: false, provider: 'supabase', bucket: targetBucket, totalBytes: null, fileCount: null, limitBytes, limitMB: 500, items: [], error: errMsg, quotaExceeded: /quota|exceed|402|payment/i.test(errMsg) };
        }

        return {
            known: true,
            provider: 'supabase',
            bucket: targetBucket,
            totalBytes,
            totalMB: Number((totalBytes / (1024 * 1024)).toFixed(2)),
            fileCount,
            limitBytes,
            limitMB: Math.round(limitBytes / (1024 * 1024)),
            items
        };
    },

    async getStorageUsageSummary(bucketName = null, options = {}) {
        const primaryBucket = this.getPrimaryBucketName();
        const targetBucket = bucketName || primaryBucket;
        const isPrimaryBucket = (targetBucket === primaryBucket || targetBucket === DEFAULT_PRIMARY_BUCKET);
        const useR2 = (targetBucket === 'r2') || (isPrimaryBucket && this.isUsingR2Storage() && !(options && options.forceSupabase));
        const limitBytes = useR2 ? this.R2_FREE_BUDGET_BYTES : (this.MAX_STORAGE_BUDGET_BYTES || (500 * 1024 * 1024));
        const limitMB = Math.round(limitBytes / (1024 * 1024));

        const insightsCfg = this.getInsightsCloudConfig();
        const isInsightsBucket = Boolean(options && options.useInsightsClient)
            || (insightsCfg && insightsCfg.bucket === targetBucket && this.hasDedicatedInsightsAccount() && !isPrimaryBucket);
        const resolvedClient = !useR2
            ? ((options && options._clientOverride) || (isInsightsBucket ? this.getInsightsStorageClient() : this.getPrimaryStorageClient()))
            : null;
        const clientBase = (resolvedClient && resolvedClient.supabaseUrl)
            ? String(resolvedClient.supabaseUrl).toLowerCase().replace(/\/+$/, '')
            : this.getActiveStorageUrl().toLowerCase().replace(/\/+$/, '');
        const cacheBucketKey = useR2 ? 'r2' : `${clientBase}|${targetBucket}`;

        const cached = this._storageUsageCache && this._storageUsageCache[cacheBucketKey];
        if (!(options && options.forceRefresh) && cached && (Date.now() - cached.fetchedAt) < 60000) {
            return cached;
        }

        if (useR2) {
            try {
                const cfg = this.getMediaStorageConfig();
                const res = await this._callR2Api({ action: 'status', prefix: cfg.r2Prefix || '' });
                if (!res || !res.ok) {
                    return { known: false, provider: 'r2', totalBytes: null, fileCount: null, limitBytes, limitMB, error: (res && res.error) || 'R2 status unavailable' };
                }
                const summary = {
                    known: true,
                    provider: 'r2',
                    bucket: res.bucket || 'r2',
                    totalBytes: res.totalBytes || 0,
                    totalMB: res.totalMB || 0,
                    fileCount: res.fileCount || 0,
                    limitBytes,
                    limitMB,
                    fetchedAt: Date.now()
                };
                if (!this._storageUsageCache) this._storageUsageCache = {};
                this._storageUsageCache.r2 = summary;
                return summary;
            } catch (err) {
                return { known: false, provider: 'r2', totalBytes: null, fileCount: null, limitBytes, limitMB, error: err && err.message ? err.message : String(err) };
            }
        }

        const client = resolvedClient;
        if (!client || !client.storage) {
            return { known: false, provider: 'supabase', totalBytes: null, fileCount: null, limitBytes, limitMB };
        }

        let totalBytes = 0;
        let fileCount = 0;
        let offset = 0;
        const pageSize = 1000;
        try {
            for (let page = 0; page < 10; page++) {
                const { data, error } = await client.storage.from(targetBucket).list('', { limit: pageSize, offset });
                if (error || !Array.isArray(data)) {
                    const errMsg = error ? (error.message || String(error)) : 'Unable to list bucket';
                    return { known: false, provider: 'supabase', totalBytes: null, fileCount: null, limitBytes, limitMB, error: errMsg, quotaExceeded: /quota|exceed|402|payment/i.test(errMsg) };
                }
                for (let i = 0; i < data.length; i++) {
                    const item = data[i];
                    if (!item || !item.name) continue;
                    fileCount++;
                    if (item.metadata && typeof item.metadata.size === 'number') {
                        totalBytes += item.metadata.size;
                    }
                }
                if (data.length < pageSize) break;
                offset += pageSize;
            }
        } catch (err) {
            const errMsg = err && err.message ? err.message : String(err);
            return { known: false, provider: 'supabase', totalBytes: null, fileCount: null, limitBytes, limitMB, error: errMsg, quotaExceeded: /quota|exceed|402|payment/i.test(errMsg) };
        }

        const summary = {
            known: true,
            provider: 'supabase',
            bucket: targetBucket,
            projectUrl: clientBase,
            totalBytes,
            totalMB: Number((totalBytes / (1024 * 1024)).toFixed(2)),
            fileCount,
            limitBytes,
            limitMB,
            fetchedAt: Date.now()
        };
        if (!this._storageUsageCache) this._storageUsageCache = {};
        this._storageUsageCache[cacheBucketKey] = summary;
        return summary;
    },

    async _uploadToR2(uniquePath, fileBody, mimeType) {
        const cfg = this.getMediaStorageConfig();
        const key = cfg.r2Prefix ? `${cfg.r2Prefix}/${uniquePath}` : uniquePath;
        const cacheKey = `r2:${key}`;
        if (this._uploadedHashCache.has(cacheKey)) {
            return { success: true, url: this._uploadedHashCache.get(cacheKey), path: key, deduplicated: true, provider: 'r2' };
        }

        const incomingBytes = (fileBody && typeof fileBody.size === 'number') ? fileBody.size : 0;
        const presign = await this._callR2Api({
            action: 'presign-put',
            key,
            contentType: mimeType,
            size: incomingBytes
        }, cfg);

        if (!presign || !presign.ok) {
            return { success: false, error: (presign && presign.error) || 'Failed to get Cloudflare R2 upload URL' };
        }

        if (presign.exists && presign.publicUrl) {
            this._uploadedHashCache.set(cacheKey, presign.publicUrl);
            return { success: true, url: presign.publicUrl, path: key, deduplicated: true, provider: 'r2' };
        }

        const putRes = await fetch(presign.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': mimeType },
            body: fileBody
        });

        if (!putRes.ok) {
            return { success: false, error: `Cloudflare R2 upload failed (${putRes.status})` };
        }

        const finalUrl = presign.publicUrl;
        if (finalUrl) {
            this._uploadedHashCache.set(cacheKey, finalUrl);
        }
        if (this._storageUsageCache && this._storageUsageCache.r2 && this._storageUsageCache.r2.known) {
            this._storageUsageCache.r2.totalBytes += incomingBytes;
            this._storageUsageCache.r2.totalMB = Number((this._storageUsageCache.r2.totalBytes / (1024 * 1024)).toFixed(2));
            this._storageUsageCache.r2.fileCount += 1;
        }
        console.log('✅ Image uploaded to Cloudflare R2:', finalUrl);
        return { success: true, url: finalUrl, path: key, provider: 'r2' };
    },

    async _uploadToBucket(client, bucketName, fileOrDataUrl, customFilename = null) {
        if (!client) return { success: false, error: 'Supabase client not initialized' };

        try {
            if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('assets/')) {
                try {
                    const response = await fetch(fileOrDataUrl);
                    if (response && response.ok) {
                        const blob = await response.blob();
                        fileOrDataUrl = blob;
                    } else {
                        return { success: true, url: fileOrDataUrl };
                    }
                } catch(e) {
                    console.warn('Could not fetch local asset for Supabase Storage upload, keeping original path:', e);
                    return { success: true, url: fileOrDataUrl };
                }
            }

            // If already a remote CDN / Supabase HTTP URL or string asset, no need to re-upload
            if (typeof fileOrDataUrl === 'string' && !fileOrDataUrl.startsWith('data:') && !(fileOrDataUrl instanceof Blob) && !(fileOrDataUrl instanceof File)) {
                return { success: true, url: fileOrDataUrl };
            }

            let fileBody = fileOrDataUrl;
            let mimeType = 'image/jpeg';
            let ext = 'jpg';

            if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
                const mimeMatch = fileOrDataUrl.match(/^data:([^;]+);base64,/);
                if (mimeMatch) {
                    mimeType = mimeMatch[1];
                    ext = mimeType.split('/')[1] || 'jpg';
                    if (ext === 'jpeg') ext = 'jpg';
                    if (ext.includes('+')) ext = ext.split('+')[0];
                }
                const base64Data = fileOrDataUrl.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                fileBody = new Blob([byteArray], { type: mimeType });
            } else if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
                mimeType = fileOrDataUrl.type || 'image/jpeg';
                ext = mimeType.split('/')[1] || 'jpg';
                if (ext === 'jpeg') ext = 'jpg';
            }

            const primaryBucket = this.getPrimaryBucketName();
            const isPrimaryBucket = (bucketName === primaryBucket || bucketName === DEFAULT_PRIMARY_BUCKET);

            // Use content-addressed SHA-256 filenames so identical images never create duplicate storage files
            let uniquePath = '';
            if (customFilename && typeof customFilename === 'object' && customFilename.prefix) {
                const hashHex = await this._computeBlobHash(fileBody);
                const prefix = String(customFilename.prefix).replace(/[^a-z0-9_-]/gi, '_');
                uniquePath = hashHex
                    ? `${prefix}_h_${hashHex}.${ext}`
                    : `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
            } else if (typeof customFilename === 'string' && customFilename.trim()) {
                uniquePath = customFilename.trim();
            } else {
                const hashHex = await this._computeBlobHash(fileBody);
                const defaultPrefix = isPrimaryBucket ? 'prop' : 'insight';
                uniquePath = hashHex
                    ? `${defaultPrefix}_h_${hashHex}.${ext}`
                    : `${defaultPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
            }

            // Route primary media bucket to Cloudflare R2 when configured in Dashboard > Settings
            if (isPrimaryBucket && this.isUsingR2Storage()) {
                return await this._uploadToR2(uniquePath, fileBody, mimeType);
            }

            const clientBase = (client && client.supabaseUrl)
                ? String(client.supabaseUrl).toLowerCase().replace(/\/+$/, '')
                : this.getActiveStorageUrl().toLowerCase().replace(/\/+$/, '');
            const scopeKey = `${clientBase}|${bucketName}`;
            const cacheKey = `${scopeKey}:${uniquePath}`;
            if (this._uploadedHashCache.has(cacheKey)) {
                return { success: true, url: this._uploadedHashCache.get(cacheKey), path: uniquePath, deduplicated: true };
            }

            // Skip re-upload if identical content-hashed filename already exists in storage
            if (uniquePath.includes('_h_')) {
                try {
                    const { data: existingList } = await client.storage.from(bucketName).list('', { search: uniquePath, limit: 10 });
                    if (Array.isArray(existingList) && existingList.some(item => item && item.name === uniquePath)) {
                        const { data: existUrlData } = client.storage.from(bucketName).getPublicUrl(uniquePath);
                        if (existUrlData && existUrlData.publicUrl) {
                            this._uploadedHashCache.set(cacheKey, existUrlData.publicUrl);
                            return { success: true, url: existUrlData.publicUrl, path: uniquePath, deduplicated: true };
                        }
                    }
                } catch (_) {}
            }

            // Enforce < 500 MB per-bucket storage budget before uploading genuinely new bytes
            const incomingBytes = (fileBody && typeof fileBody.size === 'number') ? fileBody.size : 0;
            const budget = await this.getStorageUsageSummary(bucketName, { _clientOverride: client, forceSupabase: true });
            if (budget && budget.known) {
                const projected = budget.totalBytes + incomingBytes;
                const limitBytes = this.MAX_STORAGE_BUDGET_BYTES || (500 * 1024 * 1024);
                const warnBytes = this.STORAGE_WARN_BYTES || (450 * 1024 * 1024);
                if (projected > limitBytes) {
                    const currentMB = (budget.totalBytes / (1024 * 1024)).toFixed(1);
                    const limitMB = Math.round(limitBytes / (1024 * 1024));
                    const msg = `Storage budget cap reached for ${bucketName} (${currentMB} MB / ${limitMB} MB). Clean unused files in Supabase Studio before uploading new images.`;
                    console.warn('⚠️ ' + msg);
                    return { success: false, overBudget: true, error: msg, usage: budget };
                }
                if (projected >= warnBytes) {
                    console.warn(`⚠️ Supabase Storage bucket ${bucketName} is approaching the 500 MB cap (${(projected / (1024 * 1024)).toFixed(1)} MB / 500 MB).`);
                }
            }

            const { error } = await client.storage
                .from(bucketName)
                .upload(uniquePath, fileBody, {
                    contentType: mimeType,
                    upsert: true
                });

            if (error) {
                console.error(`Error uploading image to Supabase Storage (${bucketName}):`, error);
                return { success: false, error: error.message || String(error) };
            }

            if (this._storageUsageCache && this._storageUsageCache[scopeKey] && this._storageUsageCache[scopeKey].known) {
                const cachedUsage = this._storageUsageCache[scopeKey];
                cachedUsage.totalBytes += incomingBytes;
                cachedUsage.totalMB = Number((cachedUsage.totalBytes / (1024 * 1024)).toFixed(2));
                cachedUsage.fileCount += 1;
            }

            const { data: publicUrlData } = client.storage
                .from(bucketName)
                .getPublicUrl(uniquePath);

            const publicUrl = publicUrlData ? publicUrlData.publicUrl : null;
            if (publicUrl) {
                this._uploadedHashCache.set(cacheKey, publicUrl);
            }
            console.log(`✅ Image uploaded to Supabase Storage bucket ${bucketName}:`, publicUrl);
            return { success: true, url: publicUrl, path: uniquePath };
        } catch (e) {
            console.error(`Exception uploading image to Supabase Storage (${bucketName}):`, e);
            return { success: false, error: e.message || String(e) };
        }
    },

    // Upload single image (File, Blob, or base64 DataURL) to active primary Supabase Storage bucket (default 'property-images')
    async uploadImage(fileOrDataUrl, customFilename = null) {
        await this.ensurePublicConfigLoaded();
        return this._uploadToBucket(this.getPrimaryStorageClient(), this.getPrimaryBucketName(), fileOrDataUrl, customFilename);
    },

    // Upload Insights cover / infographic / captured photo to dedicated Insights Supabase bucket (falls back to primary)
    async uploadInsightImage(fileOrDataUrl, customFilename = null) {
        await this.ensurePublicConfigLoaded();
        return this._uploadToBucket(this.getInsightsStorageClient(), this.getInsightsBucketName(), fileOrDataUrl, customFilename);
    },

    // Security Helper: HTML Entity Escaping (XSS prevention)
    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    // Security Helper: Input string trimmer & length bounder
    sanitizeInput(str, maxLen = 1000) {
        if (str === null || str === undefined) return '';
        return String(str).trim().slice(0, maxLen);
    },

    // Batch upload array of images (Base64 data URLs or Files/Blobs) to Supabase Storage bucket
    // Deduplicates identical base64 strings within the same batch & uses bounded concurrency (3 parallel uploads)
    async uploadImages(imagesArray) {
        if (!Array.isArray(imagesArray) || imagesArray.length === 0) return [];
        const uploadedUrls = new Array(imagesArray.length);
        const batchDedupe = new Map();
        const concurrency = 3;
        let currentIndex = 0;

        const uploadOnce = (item) => {
            if (typeof item === 'string' && batchDedupe.has(item)) {
                return batchDedupe.get(item);
            }
            const p = this.uploadImage(item);
            if (typeof item === 'string') {
                batchDedupe.set(item, p);
            }
            return p;
        };

        const worker = async () => {
            while (currentIndex < imagesArray.length) {
                const i = currentIndex++;
                const item = imagesArray[i];
                if (typeof item === 'string' && !item.startsWith('data:')) {
                    uploadedUrls[i] = item;
                } else {
                    const res = await uploadOnce(item);
                    if (res.success && res.url) {
                        uploadedUrls[i] = res.url;
                    } else {
                        console.warn(`Failed to upload image index ${i}, preserving original string/URL:`, res.error);
                        uploadedUrls[i] = item;
                    }
                }
            }
        };

        const workers = [];
        for (let w = 0; w < Math.min(concurrency, imagesArray.length); w++) {
            workers.push(worker());
        }
        await Promise.all(workers);
        return uploadedUrls;
    },

    // Fetch Dashboard Activity Logs
    async fetchActivityLogs(limit = 250) {
        await this.ensurePublicConfigLoaded();
        const client = this.getClient();
        if (!client) return { tableMissing: false, rows: null };
        try {
            const { data, error } = await client
                .from('activity_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
            if (error) {
                const msg = String(error.message || '').toLowerCase();
                if (error.code === '42P01' || error.code === 'PGRST205' || msg.includes('activity_logs')) {
                    return { tableMissing: true, rows: null };
                }
                console.warn('Error fetching activity_logs from Supabase:', error);
                return { tableMissing: false, rows: null };
            }
            return { tableMissing: false, rows: data || [] };
        } catch (e) {
            return { tableMissing: false, rows: null };
        }
    },

    // Insert a single Dashboard Activity Log entry
    async insertActivityLog(entry) {
        await this.ensurePublicConfigLoaded();
        const client = this.getClient();
        if (!client || !entry) return { success: false, tableMissing: false };
        try {
            const payload = {
                id: String(entry.id || `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
                created_at: entry.createdAt || new Date().toISOString(),
                actor_username: String(entry.actorUsername || 'admin'),
                actor_role: String(entry.actorRole || 'Administrator'),
                category: String(entry.category || 'System'),
                action: String(entry.action || 'Update'),
                target: String(entry.target || ''),
                details: String(entry.details || ''),
                specs: entry
            };
            const { error } = await client.from('activity_logs').upsert(payload, { onConflict: 'id' });
            if (error) {
                const msg = String(error.message || '').toLowerCase();
                if (error.code === '42P01' || error.code === 'PGRST205' || msg.includes('activity_logs')) {
                    return { success: false, tableMissing: true };
                }
                return { success: false, tableMissing: false };
            }
            return { success: true, tableMissing: false };
        } catch (e) {
            return { success: false, tableMissing: false };
        }
    },

    // Call 'capture-url-insight' Edge Function on active Insights project (falls back cleanly to primary if not deployed on 2nd project)
    async _callCaptureEdgeFunction(payload) {
        const cfg = this.getInsightsCloudConfig();
        const targets = [];
        if (this.hasDedicatedInsightsAccount()) {
            targets.push({ url: cfg.url, key: cfg.anonKey });
        }
        if (!targets.length || targets[0].url !== SUPABASE_URL) {
            targets.push({ url: SUPABASE_URL, key: SUPABASE_ANON_KEY });
        }

        let lastStatus = 0;
        let lastErr = null;
        for (const t of targets) {
            try {
                const response = await fetch(`${t.url}/functions/v1/capture-url-insight`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${t.key}`,
                        'apikey': t.key
                    },
                    referrerPolicy: 'no-referrer',
                    body: JSON.stringify(payload)
                });
                lastStatus = response.status;
                if (response.status === 404 && targets.length > 1 && t.url !== SUPABASE_URL) {
                    continue;
                }
                const data = await response.json().catch(() => null);
                if (data && typeof data === 'object') {
                    return data;
                }
            } catch (e) {
                lastErr = e;
            }
        }
        return {
            ok: false,
            error: lastStatus ? `Capture service returned HTTP ${lastStatus}.` : (lastErr && lastErr.message ? lastErr.message : 'Could not reach the URL Capture service.')
        };
    },

    // Capture webpage metadata, photos, and clean text via Supabase Edge Function 'capture-url-insight'
    async captureUrlForInsight(url) {
        const cleanUrl = String(url || '').trim();
        if (!cleanUrl) return { ok: false, error: 'Please enter a website URL to capture.' };
        return await this._callCaptureEdgeFunction({ action: 'capture', url: cleanUrl });
    },

    // Download a captured external photo server-side (CORS-free) and upload to Insights Storage bucket
    async importCapturedImageToStorage(imageUrl, slugHint = 'insight') {
        const cleanUrl = String(imageUrl || '').trim();
        if (!cleanUrl) return { success: false, error: 'No image URL provided.' };
        const activeBase = this.hasDedicatedInsightsAccount() ? this.getInsightsCloudConfig().url : this.getActiveStorageUrl();
        if (cleanUrl.startsWith('assets/') || (activeBase && cleanUrl.startsWith(activeBase))) {
            return { success: true, url: cleanUrl };
        }
        try {
            const data = await this._callCaptureEdgeFunction({ action: 'import_image', imageUrl: cleanUrl });
            if (!data || !data.ok || !data.dataUrl) {
                return { success: false, error: (data && data.error) || 'Failed to download remote photo.' };
            }
            const safeSlug = String(slugHint || 'insight').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 42) || 'insight';
            return await this.uploadInsightImage(data.dataUrl, { prefix: `insight_cap_${safeSlug}` });
        } catch (e) {
            console.error('importCapturedImageToStorage error:', e);
            return { success: false, error: e.message || 'Image import failed.' };
        }
    },

    // Discover fresh Malaysia / Klang Valley public industrial news via Edge Function
    async discoverPublicIndustrialNews({ query = '', city = '' } = {}) {
        return await this._callCaptureEdgeFunction({ action: 'discover_public', query, city });
    },

    // Auto-discover and capture the freshest unused public industrial story + photos
    async discoverAndCapturePublicInsight({ query = '', city = '', excludeUrls = [], excludeTitles = [] } = {}) {
        return await this._callCaptureEdgeFunction({ action: 'discover_and_capture', query, city, excludeUrls, excludeTitles });
    }
};

// Eagerly bootstrap Vercel environment public Supabase config as early as possible on HTTP(S)
try {
    if (window.IndustraSupabase && typeof window.IndustraSupabase.ensurePublicConfigLoaded === 'function') {
        window.IndustraSupabase.ensurePublicConfigLoaded();
    }
} catch (_) {}
