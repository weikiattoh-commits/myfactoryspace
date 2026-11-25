'use strict';

/**
 * Vercel Serverless Function: Cloudflare R2 S3-Compatible Presign, Usage & Cleanup API
 * Zero external npm dependencies (uses Node.js built-in crypto + global fetch).
 *
 * Required Vercel Environment Variables:
 *   R2_ACCOUNT_ID          - Cloudflare Account ID
 *   R2_ACCESS_KEY_ID       - Cloudflare R2 S3 API Access Key ID
 *   R2_SECRET_ACCESS_KEY   - Cloudflare R2 S3 API Secret Access Key
 *   R2_BUCKET              - Cloudflare R2 Bucket Name (e.g. myfactoryspace-media)
 *   R2_PUBLIC_URL          - Public bucket URL or custom domain (e.g. https://pub-xxxx.r2.dev)
 *   R2_API_TOKEN           - Admin bearer secret shared with Dashboard Admin Upload Token
 */

const crypto = require('crypto');

const ALLOWED_IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|gif|svg|ico)$/i;
const SAFE_KEY_RE = /^[a-z0-9][a-z0-9_./-]{0,180}$/i;
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon'
]);
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB per image

function rfc3986Encode(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function encodeObjectKey(key) {
    return String(key || '')
        .split('/')
        .filter(Boolean)
        .map(rfc3986Encode)
        .join('/');
}

function sanitizeKey(rawKey) {
    const key = String(rawKey || '').trim().replace(/^\/+/, '');
    if (!key || key.includes('..') || key.includes('//') || key.includes('\\')) return null;
    if (!SAFE_KEY_RE.test(key) || !ALLOWED_IMAGE_EXT_RE.test(key)) return null;
    return key;
}

function sha256Hex(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

function hmacSha256(key, data) {
    return crypto.createHmac('sha256', key).update(data).digest();
}

function getSigningKey(secretKey, dateStamp, region = 'auto', service = 's3') {
    const kDate = hmacSha256('AWS4' + secretKey, dateStamp);
    const kRegion = hmacSha256(kDate, region);
    const kService = hmacSha256(kRegion, service);
    return hmacSha256(kService, 'aws4_request');
}

function formatAmzDates(date = new Date()) {
    const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    return {
        amzDate: iso,
        dateStamp: iso.slice(0, 8)
    };
}

function buildCanonicalQuery(params) {
    return Object.keys(params)
        .sort()
        .map((k) => `${rfc3986Encode(k)}=${rfc3986Encode(params[k])}`)
        .join('&');
}

function signS3Request({
    method,
    host,
    canonicalUri,
    queryParams = {},
    headers = {},
    payload = '',
    accessKeyId,
    secretAccessKey
}) {
    const { amzDate, dateStamp } = formatAmzDates();
    const payloadHash = sha256Hex(payload);

    const lowerHeaders = {
        host,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate
    };
    Object.keys(headers).forEach((k) => {
        lowerHeaders[k.toLowerCase()] = String(headers[k]).trim();
    });

    const sortedHeaderKeys = Object.keys(lowerHeaders).sort();
    const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${lowerHeaders[k]}\n`).join('');
    const signedHeaders = sortedHeaderKeys.join(';');
    const canonicalQueryString = buildCanonicalQuery(queryParams);

    const canonicalRequest = [
        method.toUpperCase(),
        canonicalUri,
        canonicalQueryString,
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n');

    const scope = `${dateStamp}/auto/s3/aws4_request`;
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonicalRequest)].join('\n');
    const signingKey = getSigningKey(secretAccessKey, dateStamp, 'auto', 's3');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    const finalHeaders = Object.assign({}, lowerHeaders, { Authorization: authorization });
    delete finalHeaders.host;

    const url = `https://${host}${canonicalUri}${canonicalQueryString ? '?' + canonicalQueryString : ''}`;
    return { url, headers: finalHeaders };
}

function generatePresignedPutUrl({ host, bucket, key, accessKeyId, secretAccessKey, expiresSeconds = 120 }) {
    const { amzDate, dateStamp } = formatAmzDates();
    const scope = `${dateStamp}/auto/s3/aws4_request`;
    const canonicalUri = `/${rfc3986Encode(bucket)}/${encodeObjectKey(key)}`;

    const queryParams = {
        'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
        'X-Amz-Credential': `${accessKeyId}/${scope}`,
        'X-Amz-Date': amzDate,
        'X-Amz-Expires': String(expiresSeconds),
        'X-Amz-SignedHeaders': 'host'
    };

    const canonicalQueryString = buildCanonicalQuery(queryParams);
    const canonicalRequest = [
        'PUT',
        canonicalUri,
        canonicalQueryString,
        `host:${host}\n`,
        'host',
        'UNSIGNED-PAYLOAD'
    ].join('\n');

    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonicalRequest)].join('\n');
    const signingKey = getSigningKey(secretAccessKey, dateStamp, 'auto', 's3');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

function xmlDecode(str) {
    return String(str || '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
}

function xmlEscape(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function parseListObjectsXml(xmlText, publicUrl) {
    const items = [];
    const contentsRe = /<Contents>([\s\S]*?)<\/Contents>/g;
    let match;
    while ((match = contentsRe.exec(xmlText)) !== null) {
        const block = match[1];
        const keyMatch = block.match(/<Key>([\s\S]*?)<\/Key>/);
        const sizeMatch = block.match(/<Size>(\d+)<\/Size>/);
        const modMatch = block.match(/<LastModified>([\s\S]*?)<\/LastModified>/);
        if (keyMatch) {
            const name = xmlDecode(keyMatch[1]);
            const size = sizeMatch ? Number(sizeMatch[1]) : 0;
            const updatedAt = modMatch ? modMatch[1].trim() : null;
            items.push({
                name,
                size,
                updatedAt,
                url: publicUrl ? `${publicUrl}/${encodeObjectKey(name)}` : ''
            });
        }
    }
    const truncatedMatch = xmlText.match(/<IsTruncated>(true|false)<\/IsTruncated>/i);
    const tokenMatch = xmlText.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/);
    return {
        items,
        isTruncated: Boolean(truncatedMatch && truncatedMatch[1].toLowerCase() === 'true'),
        nextToken: tokenMatch ? xmlDecode(tokenMatch[1]) : null
    };
}

function verifyBearerToken(req, expectedToken) {
    const authHeader = String(req.headers && (req.headers.authorization || req.headers.Authorization) || '');
    if (!authHeader.startsWith('Bearer ')) return false;
    const supplied = authHeader.slice(7).trim();
    const a = Buffer.from(supplied, 'utf8');
    const b = Buffer.from(expectedToken, 'utf8');
    if (a.length !== b.length || a.length === 0) return false;
    return crypto.timingSafeEqual(a, b);
}

async function readJsonBody(req) {
    if (req.body && typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string' && req.body.trim()) {
        return JSON.parse(req.body);
    }
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const raw = Buffer.concat(chunks).toString('utf8').trim();
    return raw ? JSON.parse(raw) : {};
}

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed. Use POST.' }));
        return;
    }

    const accountId = String(process.env.R2_ACCOUNT_ID || '').trim();
    const accessKeyId = String(process.env.R2_ACCESS_KEY_ID || '').trim();
    const secretAccessKey = String(process.env.R2_SECRET_ACCESS_KEY || '').trim();
    const bucket = String(process.env.R2_BUCKET || '').trim();
    const publicUrl = String(process.env.R2_PUBLIC_URL || '').trim().replace(/\/+$/, '');
    const apiToken = String(process.env.R2_API_TOKEN || '').trim();

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            ok: false,
            configured: false,
            error: 'Cloudflare R2 environment variables are not configured on Vercel yet (need R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL, R2_API_TOKEN).'
        }));
        return;
    }

    if (!apiToken) {
        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            ok: false,
            configured: false,
            error: 'R2_API_TOKEN is missing on Vercel. Configure an admin secret token before enabling R2 uploads.'
        }));
        return;
    }

    if (!verifyBearerToken(req, apiToken)) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, error: 'Unauthorized: invalid or missing R2 Admin Upload Token.' }));
        return;
    }

    let body;
    try {
        body = await readJsonBody(req);
    } catch (_) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON request body.' }));
        return;
    }

    const host = `${accountId}.r2.cloudflarestorage.com`;
    const action = String(body.action || '').trim().toLowerCase();

    try {
        if (action === 'status') {
            const prefix = String(body.prefix || '').trim().replace(/^\/+/, '');
            const includeItems = Boolean(body.includeItems);
            let continuationToken = null;
            let totalBytes = 0;
            let fileCount = 0;
            const collected = [];

            for (let page = 0; page < 10; page++) {
                const qp = { 'list-type': '2', 'max-keys': '1000' };
                if (prefix) qp.prefix = prefix;
                if (continuationToken) qp['continuation-token'] = continuationToken;

                const signed = signS3Request({
                    method: 'GET',
                    host,
                    canonicalUri: `/${rfc3986Encode(bucket)}`,
                    queryParams: qp,
                    accessKeyId,
                    secretAccessKey
                });

                const s3Res = await fetch(signed.url, { method: 'GET', headers: signed.headers });
                const xml = await s3Res.text();
                if (!s3Res.ok) {
                    res.statusCode = 502;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ ok: false, error: `R2 list error (${s3Res.status})`, details: xml.slice(0, 300) }));
                    return;
                }

                const parsed = parseListObjectsXml(xml, publicUrl);
                for (let i = 0; i < parsed.items.length; i++) {
                    fileCount++;
                    totalBytes += parsed.items[i].size || 0;
                    if (includeItems) collected.push(parsed.items[i]);
                }
                if (!parsed.isTruncated || !parsed.nextToken) break;
                continuationToken = parsed.nextToken;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                ok: true,
                configured: true,
                provider: 'r2',
                bucket,
                publicUrl,
                fileCount,
                totalBytes,
                totalMB: Number((totalBytes / (1024 * 1024)).toFixed(2)),
                limitBytes: 10 * 1024 * 1024 * 1024,
                limitMB: 10240,
                items: includeItems ? collected : undefined
            }));
            return;
        }

        if (action === 'presign-put') {
            const key = sanitizeKey(body.key);
            if (!key) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, error: 'Invalid image filename/key.' }));
                return;
            }

            const contentType = String(body.contentType || 'image/jpeg').split(';')[0].trim().toLowerCase();
            if (!ALLOWED_MIME_TYPES.has(contentType)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, error: `Unsupported image content-type: ${contentType}` }));
                return;
            }

            const size = Number(body.size || 0);
            if (size > MAX_UPLOAD_BYTES) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, error: 'Image exceeds 15 MB per-file upload limit.' }));
                return;
            }

            const finalPublicUrl = `${publicUrl}/${encodeObjectKey(key)}`;

            // Deduplicate check against R2 directly (HEAD object)
            const headReq = signS3Request({
                method: 'HEAD',
                host,
                canonicalUri: `/${rfc3986Encode(bucket)}/${encodeObjectKey(key)}`,
                accessKeyId,
                secretAccessKey
            });
            const headRes = await fetch(headReq.url, { method: 'HEAD', headers: headReq.headers });
            if (headRes.status === 200) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: true, exists: true, key, publicUrl: finalPublicUrl }));
                return;
            }

            const uploadUrl = generatePresignedPutUrl({
                host,
                bucket,
                key,
                accessKeyId,
                secretAccessKey,
                expiresSeconds: 120
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                ok: true,
                exists: false,
                key,
                uploadUrl,
                publicUrl: finalPublicUrl
            }));
            return;
        }

        if (action === 'delete') {
            const rawKeys = Array.isArray(body.keys) ? body.keys : [];
            const validKeys = [];
            for (let i = 0; i < rawKeys.length && validKeys.length < 100; i++) {
                const clean = sanitizeKey(rawKeys[i]);
                if (clean && !validKeys.includes(clean)) validKeys.push(clean);
            }
            if (!validKeys.length) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: true, deleted: 0 }));
                return;
            }

            const xmlBody = `<Delete><Quiet>true</Quiet>${validKeys.map((k) => `<Object><Key>${xmlEscape(k)}</Key></Object>`).join('')}</Delete>`;
            const contentMd5 = crypto.createHash('md5').update(xmlBody, 'utf8').digest('base64');

            const signed = signS3Request({
                method: 'POST',
                host,
                canonicalUri: `/${rfc3986Encode(bucket)}`,
                queryParams: { delete: '' },
                headers: {
                    'content-type': 'application/xml',
                    'content-md5': contentMd5
                },
                payload: xmlBody,
                accessKeyId,
                secretAccessKey
            });

            const delRes = await fetch(signed.url, {
                method: 'POST',
                headers: signed.headers,
                body: xmlBody
            });
            if (!delRes.ok) {
                const errText = await delRes.text();
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, error: `R2 delete error (${delRes.status})`, details: errText.slice(0, 300) }));
                return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, deleted: validKeys.length }));
            return;
        }

        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, error: `Unknown action "${action}". Expected status, presign-put, or delete.` }));
    } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, error: err && err.message ? err.message : String(err) }));
    }
}

module.exports = handler;
module.exports._internals = {
    sanitizeKey,
    encodeObjectKey,
    parseListObjectsXml,
    generatePresignedPutUrl,
    signS3Request
};
