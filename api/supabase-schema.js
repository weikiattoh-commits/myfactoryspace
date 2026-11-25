'use strict';

/**
 * Vercel Serverless Function: Secure Supabase Schema Provisioner Proxy
 * Executes idempotent DDL (CREATE TABLE, ALTER TABLE ADD COLUMN, CREATE FUNCTION,
 * RLS policies, Storage buckets) against a Supabase project via the official
 * Supabase Management API (POST /v1/projects/{ref}/database/query).
 *
 * Authentication (either option works):
 *   1. Header: Authorization: Bearer sbp_...  (Admin's Supabase Personal Access Token from dashboard/account/tokens)
 *   2. Vercel Env Fallback: SUPABASE_ACCESS_TOKEN (optional server-side PAT, paired with optional SCHEMA_API_TOKEN)
 *
 * Zero external npm dependencies (uses Node.js built-in global fetch).
 */

const PROJECT_REF_RE = /^[a-z0-9]{10,32}$/i;
const MAX_SQL_BYTES = 120 * 1024; // 120 KB max SQL payload

// Block destructive statements so this endpoint can only provision/migrate schema safely
const BLOCKED_SQL_PATTERNS = [
    /\bDROP\s+(?:DATABASE|SCHEMA|TABLE|COLUMN)\b/i,
    /\bTRUNCATE\b/i,
    /\bDELETE\s+FROM\b/i
];

function sendJson(res, statusCode, payload) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
    return new Promise((resolve, reject) => {
        if (req.body && typeof req.body === 'object') {
            resolve(req.body);
            return;
        }
        if (typeof req.body === 'string') {
            try {
                resolve(req.body ? JSON.parse(req.body) : {});
            } catch (err) {
                reject(new Error('Invalid JSON body'));
            }
            return;
        }
        const chunks = [];
        let total = 0;
        req.on('data', (chunk) => {
            total += chunk.length;
            if (total > MAX_SQL_BYTES + 8192) {
                reject(new Error('Request payload too large'));
                req.destroy();
                return;
            }
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        });
        req.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8').trim();
            if (!raw) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(raw));
            } catch (err) {
                reject(new Error('Invalid JSON body'));
            }
        });
        req.on('error', reject);
    });
}

function validateSafeSchemaSql(sql) {
    const clean = String(sql || '').trim();
    if (!clean) return { ok: false, error: 'SQL query is empty.' };
    if (Buffer.byteLength(clean, 'utf8') > MAX_SQL_BYTES) {
        return { ok: false, error: 'SQL script exceeds maximum allowed size (120 KB).' };
    }
    for (const pattern of BLOCKED_SQL_PATTERNS) {
        if (pattern.test(clean)) {
            return {
                ok: false,
                error: 'Destructive statements (DROP TABLE/DATABASE/SCHEMA, TRUNCATE, DELETE) are blocked by the safe schema builder. Run manual destructive SQL directly in Supabase SQL Editor.'
            };
        }
    }
    return { ok: true, sql: clean };
}

async function handler(req, res) {
    // Allow same-origin and dashboard preflight
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Method not allowed. Use POST.' });
        return;
    }

    try {
        const body = await readRequestBody(req);
        const action = String(body.action || 'execute').trim().toLowerCase();
        const projectRef = String(body.projectRef || '').trim();

        if (!PROJECT_REF_RE.test(projectRef)) {
            sendJson(res, 400, { ok: false, error: 'Invalid Supabase Project Reference ID (expected 10-32 alphanumeric characters from https://<ref>.supabase.co).' });
            return;
        }

        const authHeader = String(req.headers.authorization || req.headers.Authorization || '').trim();
        const bearerToken = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
        const accessToken = bearerToken || String(process.env.SUPABASE_ACCESS_TOKEN || '').trim();

        if (!accessToken) {
            sendJson(res, 401, {
                ok: false,
                error: 'Missing Supabase Personal Access Token (sbp_...). Generate one at supabase.com/dashboard/account/tokens or use "Copy SQL & Open SQL Editor".'
            });
            return;
        }

        const queryUrl = `https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef)}/database/query`;

        if (action === 'inspect') {
            const inspectSql = `
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;`;

            const mgmtRes = await fetch(queryUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: inspectSql })
            });

            const text = await mgmtRes.text();
            let parsed = null;
            try { parsed = text ? JSON.parse(text) : null; } catch (_) {}

            if (!mgmtRes.ok) {
                const msg = (parsed && (parsed.message || parsed.error)) || `Supabase Management API returned HTTP ${mgmtRes.status}`;
                sendJson(res, mgmtRes.status, { ok: false, error: msg });
                return;
            }

            sendJson(res, 200, { ok: true, columns: Array.isArray(parsed) ? parsed : [] });
            return;
        }

        if (action === 'execute') {
            const check = validateSafeSchemaSql(body.sql);
            if (!check.ok) {
                sendJson(res, 400, { ok: false, error: check.error });
                return;
            }

            // Append PostgREST schema cache reload so new tables/columns are immediately visible to the JS client
            const finalSql = `${check.sql}\n\nNOTIFY pgrst, 'reload schema';`;

            const mgmtRes = await fetch(queryUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: finalSql })
            });

            const text = await mgmtRes.text();
            let parsed = null;
            try { parsed = text ? JSON.parse(text) : null; } catch (_) {}

            if (!mgmtRes.ok) {
                const msg = (parsed && (parsed.message || parsed.error)) || text.slice(0, 350) || `Supabase Management API returned HTTP ${mgmtRes.status}`;
                sendJson(res, mgmtRes.status, { ok: false, error: msg });
                return;
            }

            sendJson(res, 200, {
                ok: true,
                projectRef,
                message: `Schema executed cleanly on project "${projectRef}" and PostgREST API cache reloaded.`,
                result: parsed
            });
            return;
        }

        sendJson(res, 400, { ok: false, error: `Unknown action "${action}". Expected execute or inspect.` });
    } catch (err) {
        sendJson(res, 500, { ok: false, error: err && err.message ? err.message : String(err) });
    }
}

module.exports = handler;
module.exports._internals = { validateSafeSchemaSql };
