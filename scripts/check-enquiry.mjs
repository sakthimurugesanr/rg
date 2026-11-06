import { readConfig, hmacHex } from '../server/enquiry-service.mjs';
try { process.loadEnvFile('.env'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
let failures = 0;
const fail = message => { failures++; console.error(`FAIL: ${message}`); };
let config;
try { config = readConfig(process.env); console.log('PASS: private Google configuration is valid (values hidden).'); }
catch { fail('Check private Google settings and the shared secret in .env.'); }
const origin = process.env.NEXT_PUBLIC_SITE_URL;
const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
if (!origin || !allowed.includes(origin)) fail('NEXT_PUBLIC_SITE_URL must be an exact entry in ALLOWED_ORIGINS.');
const endpoint = process.env.NEXT_PUBLIC_ENQUIRY_API_URL;
let target;
try {
  target = new URL(endpoint, origin);
  if (!endpoint || !['https:', 'http:'].includes(target.protocol) || target.hostname === 'script.google.com' || target.hostname.endsWith('.googleusercontent.com')) throw Error();
  console.log('PASS: public endpoint points to an API bridge.');
} catch { fail('Set NEXT_PUBLIC_ENQUIRY_API_URL to your bridge /api/enquiries URL.'); }
if (process.argv.includes('--remote')) {
  if (target && origin) {
    try {
      const response = await fetch(target, { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' }, signal: AbortSignal.timeout(15000) });
      if (response.status !== 204 || response.headers.get('access-control-allow-origin') !== origin) fail(`API preflight failed (HTTP ${response.status}). Deploy api/enquiries.mjs and check Vercel ALLOWED_ORIGINS.`);
      else console.log('PASS: deployed API preflight allows the website.');
    } catch { fail('Cannot reach the deployed API. Check its host and network.'); }
  }
  if (config) {
    // Deliberately invalid data: verifies signing but cannot save a row or send mail.
    const payload = JSON.stringify({ version: 1, timestamp: Date.now(), requestId: crypto.randomUUID(), clientHash: '0'.repeat(64), config: {}, data: {} });
    try {
      const response = await fetch(config.script, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload, signature: await hmacHex(config.secret, payload) }), redirect: 'follow', signal: AbortSignal.timeout(25000) });
      let result; try { result = await response.json(); } catch {}
      if (response.ok && result?.code === 'VALIDATION') console.log('PASS: Google deployment and shared secret verified; no row or mail created.');
      else if (result?.code === 'UNAUTHORIZED') fail('Apps Script Script Property ENQUIRY_SHARED_SECRET does not match .env.');
      else fail('Google did not return the expected response. Check /exec deployment, Anyone access, and current Code.gs version.');
    } catch { fail('Cannot reach Apps Script. Check the configured /exec URL and network.'); }
  }
}
process.exitCode = failures ? 1 : 0;
