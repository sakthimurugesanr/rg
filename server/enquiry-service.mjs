import { validateEnquiry, REQUEST_ID } from '../lib/enquiry-contract.mjs';
const encoder = new TextEncoder();
export class ApiError extends Error { constructor(status, code, message, retryAfter = 0) { super(message); this.status = status; this.code = code; this.retryAfter = retryAfter } }
export async function hmacHex(secret, value) { const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))), b => b.toString(16).padStart(2, '0')).join('') }
function numberSetting(value, fallback, min, max) { const n = Number(value || fallback); return Number.isInteger(n) && n >= min && n <= max ? n : fallback }
export function readConfig(env) {
    const script = String(env.GOOGLE_APPS_SCRIPT_URL || ''); const sheetUrl = String(env.GOOGLE_SHEET_URL || '');
    const sheetId = sheetUrl.match(/^https:\/\/docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]{20,})\//)?.[1];
    const ownerEmail = String(env.OWNER_NOTIFICATION_EMAIL || '').trim(); const secret = String(env.ENQUIRY_SHARED_SECRET || '');
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(script) || !sheetId || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/.test(ownerEmail) || ownerEmail.length > 254 || secret.length < 32) throw new ApiError(503, 'NOT_CONFIGURED', 'Online enquiries are being configured. Please call or use WhatsApp.');
    const sheetName = String(env.GOOGLE_SHEET_TAB || 'Enquiries'); if (!/^[A-Za-z0-9 _-]{1,40}$/.test(sheetName)) throw new ApiError(503, 'NOT_CONFIGURED', 'Online enquiries are being configured.');
    return { script, secret, sheetId, sheetName, ownerEmail, clientLimit: numberSetting(env.ENQUIRY_CLIENT_LIMIT, 3, 1, 10), windowSeconds: numberSetting(env.ENQUIRY_WINDOW_SECONDS, 900, 60, 3600), dailyLimit: numberSetting(env.ENQUIRY_DAILY_LIMIT, 60, 1, 500) };
}
export function createMemoryLimiter({ limit = 10, windowMs = 60000, maxEntries = 10000, now = Date.now } = {}) {
    const entries = new Map(); return { async limit({ key }) { const time = now(); for (const [k, e] of entries) if (e.reset <= time) entries.delete(k); let e = entries.get(key); if (!e) { if (entries.size >= maxEntries) return { success: false, retryAfter: 60 }; e = { count: 0, reset: time + windowMs }; entries.set(key, e) } e.count++; return { success: e.count <= limit, retryAfter: Math.max(1, Math.ceil((e.reset - time) / 1000)) } } };
}
async function readJson(request) {
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new ApiError(415, 'CONTENT_TYPE', 'Send the enquiry as JSON.');
    const reader = request.body?.getReader(); if (!reader) throw new ApiError(400, 'EMPTY', 'Please enter your requirement.');
    let size = 0; const chunks = []; while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 8192) { await reader.cancel(); throw new ApiError(413, 'TOO_LARGE', 'The enquiry is too long. Please shorten your message.') } chunks.push(value) }
    const bytes = new Uint8Array(size); let at = 0; for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.length }
    try { const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error(); return data } catch { throw new ApiError(400, 'INVALID_JSON', 'Please check your enquiry and try again.') }
}
export async function handleEnquiry(request, env, { clientIp, limiter, fetcher = fetch, now = Date.now } = {}) {
    const origin = request.headers.get('origin') || '';
    const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Vary': 'Origin' };
    if (allowed.includes(origin)) { headers['Access-Control-Allow-Origin'] = origin; headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'; headers['Access-Control-Allow-Headers'] = 'Content-Type'; headers['Access-Control-Expose-Headers'] = 'Retry-After'; headers['Access-Control-Max-Age'] = '600' }
    const respond = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...extra } });
    try {
        if (!origin || !allowed.includes(origin)) throw new ApiError(403, 'ORIGIN', 'This website is not allowed to submit enquiries.');
        if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
        if (request.method !== 'POST') return respond({ ok: false, code: 'METHOD', message: 'Use POST to submit an enquiry.' }, 405, { Allow: 'POST, OPTIONS' });
        const config = readConfig(env);
        if (!clientIp || !limiter) throw new ApiError(503, 'PROTECTION_UNAVAILABLE', 'Online enquiries are temporarily unavailable. Please call or use WhatsApp.');
        const clientHash = await hmacHex(config.secret, `ip:${clientIp}`);
        const rate = await limiter.limit({ key: `enquiry:${clientHash}` }); if (!rate.success) throw new ApiError(429, 'RATE_LIMITED', 'Too many attempts. Please wait before trying again.', rate.retryAfter || 60);
        const input = await readJson(request); if (typeof input.requestId !== 'string' || !REQUEST_ID.test(input.requestId)) throw new ApiError(400, 'REQUEST_ID', 'Please refresh the page and try again.');
        const checked = validateEnquiry(input); if (!checked.valid) return respond({ ok: false, code: 'VALIDATION', message: 'Please check the highlighted fields.', errors: checked.errors }, 400);
        const payload = JSON.stringify({ version: 1, timestamp: now(), requestId: input.requestId, clientHash, config: { sheetId: config.sheetId, sheetName: config.sheetName, ownerEmail: config.ownerEmail, clientLimit: config.clientLimit, windowSeconds: config.windowSeconds, dailyLimit: config.dailyLimit }, data: checked.data });
        const signature = await hmacHex(config.secret, payload);
        let upstream; try { upstream = await fetcher(config.script, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload, signature }), redirect: 'follow', signal: AbortSignal.timeout(25000) }) } catch { throw new ApiError(504, 'TIMEOUT', 'We could not confirm delivery. Please retry without changing the form; the same request will not be stored twice.') }
        if (!upstream.ok) throw new ApiError(502, 'GOOGLE_UNAVAILABLE', 'We could not confirm delivery. Please retry or call us.');
        let result; try { const text = await upstream.text(); if (text.length > 8192) throw Error(); result = JSON.parse(text) } catch { throw new ApiError(502, 'INVALID_UPSTREAM', 'The enquiry service did not confirm delivery. Please retry or call us.') }
        if (result?.ok === true && result.saved === true && /^RG-\d{8}-[A-F0-9]{8}$/.test(result.reference || '')) return respond({ ok: true, saved: true, reference: result.reference, notification: result.notification === 'sent' ? 'sent' : 'pending' });
        const codes = { VALIDATION: 400, RATE_LIMITED: 429, BUSY: 503, ID_CONFLICT: 409, UNAUTHORIZED: 502, CONFIGURATION: 503 }; const code = String(result?.code || 'SAVE_FAILED'); const status = codes[code] || 502;
        const message = code === 'RATE_LIMITED' ? 'You have reached the enquiry limit. Please wait or contact us by phone.' : code === 'ID_CONFLICT' ? 'Please refresh the page before submitting a different enquiry.' : 'Your enquiry was not confirmed. Please retry or call us.';
        const retry = Number.isInteger(result?.retryAfter) ? Math.min(86400, Math.max(1, result.retryAfter)) : 60;
        return respond({ ok: false, code, message }, status, status === 429 || status === 503 ? { 'Retry-After': String(retry) } : {});
    } catch (error) { const e = error instanceof ApiError ? error : new ApiError(503, 'UNAVAILABLE', 'Online enquiries are temporarily unavailable. Please call or use WhatsApp.'); return respond({ ok: false, code: e.code, message: e.message }, e.status, e.retryAfter ? { 'Retry-After': String(e.retryAfter) } : {}) }
}
