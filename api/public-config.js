'use strict';

/**
 * Vercel Serverless Function: Public Supabase Client Configuration Bootstrap
 *
 * Exposes ONLY public client-safe Supabase connection settings configured via
 * Vercel Environment Variables so every visitor (other computers, mobile devices,
 * incognito browsers with empty localStorage) connects directly to the active
 * production Supabase project without relying on browser localStorage.
 *
 * Supported Vercel Environment Variables:
 *   - SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL / VITE_SUPABASE_URL)
 *   - SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY)
 *   - SUPABASE_BUCKET (optional, defaults to 'property-images')
 *   - SUPABASE_STORAGE_ONLY (optional, 'true' to route storage only; default 'false')
 *
 * Security: NEVER returns service_role keys; explicitly refuses JWTs whose payload role === 'service_role'.
 */

const SUPABASE_URL_RE = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i;

function isSecretSupabaseKey(key) {
    const clean = String(key || '').trim();
    if (/^sb_secret_/i.test(clean)) return true;
    try {
        const parts = clean.split('.');
        if (parts.length !== 3) return false;
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
        const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
        return Boolean(payload && String(payload.role || '').toLowerCase() === 'service_role');
    } catch (_) {
        return false;
    }
}

function cleanEnvVal(val) {
    return String(val || '').trim().replace(/^['"]+|['"]+$/g, '').trim();
}

function normalizeSupabaseOrigin(raw) {
    const cleaned = cleanEnvVal(raw).replace(/\/+$/, '');
    if (!cleaned) return '';
    try {
        const u = new URL(/^https?:\/\//i.test(cleaned) ? cleaned : ('https://' + cleaned));
        return `${u.protocol}//${u.host}`;
    } catch (_) {
        return cleaned;
    }
}

function resolvePublicConfig(env) {
    const src = env || process.env || {};
    const rawUrl = normalizeSupabaseOrigin(
        src.SUPABASE_URL ||
        src.NEXT_PUBLIC_SUPABASE_URL ||
        src.VITE_SUPABASE_URL ||
        ''
    );

    const rawAnonKey = cleanEnvVal(
        src.SUPABASE_ANON_KEY ||
        src.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        src.VITE_SUPABASE_ANON_KEY ||
        ''
    );

    const rawBucket = cleanEnvVal(
        src.SUPABASE_BUCKET ||
        src.NEXT_PUBLIC_SUPABASE_BUCKET ||
        'property-images'
    ) || 'property-images';

    const storageOnly = cleanEnvVal(src.SUPABASE_STORAGE_ONLY).toLowerCase() === 'true';

    if (!rawUrl || !rawAnonKey) {
        return { ok: true, configured: false };
    }
    if (!SUPABASE_URL_RE.test(rawUrl)) {
        return { ok: false, configured: false, error: 'Invalid SUPABASE_URL format in server environment.' };
    }
    if (rawAnonKey.length < 20 || isSecretSupabaseKey(rawAnonKey)) {
        return { ok: false, configured: false, error: 'Refusing invalid, secret, or service_role key in public config.' };
    }

    return {
        ok: true,
        configured: true,
        url: rawUrl,
        anonKey: rawAnonKey,
        bucket: rawBucket,
        storageOnly
    };
}

function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.statusCode = 405;
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify({ ok: false, error: 'Method not allowed. Use GET.' }));
        return;
    }

    const cfg = resolvePublicConfig(process.env);
    res.setHeader(
        'Cache-Control',
        cfg.configured
            ? 'public, max-age=60, stale-while-revalidate=300'
            : 'public, max-age=30'
    );
    res.statusCode = 200;
    if (req.method === 'HEAD') {
        res.end();
        return;
    }
    res.end(JSON.stringify(cfg));
}

handler.resolvePublicConfig = resolvePublicConfig;
handler.isSecretSupabaseKey = isSecretSupabaseKey;
handler.isServiceRoleJwt = isSecretSupabaseKey;

module.exports = handler;
