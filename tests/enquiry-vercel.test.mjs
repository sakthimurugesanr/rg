import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/enquiries.mjs';

test('Vercel route answers preflight, rejects other origins and requires trusted edge identity', async () => {
  const previous = { ...process.env };
  try {
    Object.assign(process.env, {
      ALLOWED_ORIGINS: 'https://shop.example.test',
      GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/test/exec',
      GOOGLE_SHEET_URL: 'https://docs.google.com/spreadsheets/d/abcdefghijklmnopqrstuv1234567890/edit',
      OWNER_NOTIFICATION_EMAIL: 'owner@example.test',
      ENQUIRY_SHARED_SECRET: 'test-only-secret-at-least-32-characters',
    });
    const request = (method, origin = 'https://shop.example.test') => new Request('https://api.example.test/api/enquiries', { method, headers: { Origin: origin, 'x-real-ip': '203.0.113.10' } });
    const preflight = await handler.fetch(request('OPTIONS'));
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'https://shop.example.test');
    assert.equal((await handler.fetch(request('OPTIONS', 'https://evil.test'))).status, 403);
    assert.equal((await handler.fetch(request('GET'))).status, 405);
    delete process.env.VERCEL;
    const unavailable = await handler.fetch(request('POST'));
    assert.equal(unavailable.status, 503);
    assert.equal((await unavailable.json()).code, 'PROTECTION_UNAVAILABLE');
    process.env.VERCEL = '1';
    const response = await handler.fetch(request('POST'));
    assert.equal(response.status, 415); // Trusted IP reached content-type validation.
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});
