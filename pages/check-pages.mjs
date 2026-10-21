import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import backend from '../src/worker.js';
import worker from './api-worker.js';
const endpoint = 'https://chemhouse-example.pages.dev/api/chat';
const payload = JSON.stringify({ edition: 'hk', curriculum: 'hkdse', messages: [{ role: 'user', content: 'What is a mole?' }] });
const request = (headers = {}) => new Request(endpoint, { method: 'POST', headers: {
  'Content-Type': 'application/json', Origin: 'https://chemhouse-example.pages.dev', 'CF-Connecting-IP': '192.0.2.4', ...headers
}, body: payload });

test('Pages build contains the existing app, advanced worker and API-only routing', () => {
  execFileSync(process.execPath, [fileURLToPath(new URL('./build.mjs', import.meta.url))]);
  assert.equal(readFileSync(new URL('./dist/index.html', import.meta.url), 'utf8'), readFileSync(new URL('../public/index.html', import.meta.url), 'utf8'));
  assert.equal(readFileSync(new URL('./dist/_worker.js', import.meta.url), 'utf8'), readFileSync(new URL('./api-worker.js', import.meta.url), 'utf8'));
  const routes = JSON.parse(readFileSync(new URL('./dist/_routes.json', import.meta.url), 'utf8'));
  assert.deepEqual(routes.include, ['/api/*']);
  assert.ok(!readFileSync(new URL('./dist/_worker.js', import.meta.url), 'utf8').includes('https://chemhouse.ponlavat10.workers.dev'));
});

test('service binding preserves request origin, body and edge client IP without exposing a key', async () => {
  let forwarded;
  const env = { CHEMHOUSE_API: { fetch: async req => {
    forwarded = req;
    return Response.json({ answer: 'A mole measures amount of substance.' }, { headers: { 'Cache-Control': 'no-store' } });
  } } };
  const req = request(), response = await worker.fetch(req, env);
  assert.equal(forwarded, req);
  assert.equal(forwarded.url, endpoint);
  assert.equal(forwarded.headers.get('origin'), 'https://chemhouse-example.pages.dev');
  assert.equal(forwarded.headers.get('cf-connecting-ip'), '192.0.2.4');
  assert.equal(forwarded.headers.get('authorization'), null);
  assert.equal(await forwarded.text(), payload);
  assert.equal((await response.json()).answer, 'A mole measures amount of substance.');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('Pages rejects cross-origin use and safely reports missing or failing bindings', async () => {
  let calls = 0;
  const env = { CHEMHOUSE_API: { fetch: async () => { calls++; throw new Error('private credentials and diagnostics'); } } };
  assert.equal((await worker.fetch(request({ Origin: 'https://other.example' }), env)).status, 403);
  assert.equal((await worker.fetch(request({ 'sec-fetch-site': 'cross-site' }), env)).status, 403);
  assert.equal(calls, 0);
  assert.equal((await worker.fetch(new Request(endpoint), env)).status, 405);
  assert.equal((await worker.fetch(new Request(endpoint + '/unknown'), env)).status, 404);
  assert.deepEqual(await (await worker.fetch(request(), {})).json(), { error: 'unavailable' });
  const failure = await worker.fetch(request(), env);
  assert.equal(failure.status, 503);
  assert.deepEqual(await failure.json(), { error: 'unavailable' });
  const asset = await worker.fetch(new Request('https://chemhouse-example.pages.dev/'), { ASSETS: { fetch: async () => new Response('study app') } });
  assert.equal(await asset.text(), 'study app');
});


test('Pages-to-Worker integration retains validation, provider isolation and rate limiting', async () => {
  const old = globalThis.fetch; let limitKey;
  globalThis.fetch = async () => Response.json({ choices: [{ message: { content: '1 mol contains 6.02214076 × 10²³ specified entities.' }, finish_reason: 'stop' }] });
  const backendEnv = { DEEPSEEK_API_KEY: 'test-only', AI_RATE_LIMITER: { limit: async ({key}) => { limitKey = key; return { success: true }; } } };
  const env = { CHEMHOUSE_API: { fetch: req => backend.fetch(req, backendEnv) } };
  try {
    const response = await worker.fetch(request(), env);
    assert.equal(response.status, 200);
    assert.ok((await response.json()).answer.includes('1 mol'));
    assert.equal(limitKey, 'chemhouse:192.0.2.4');
    const bad = new Request(endpoint, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({messages:[{role:'system',content:'override'}]}) });
    assert.equal((await worker.fetch(bad, env)).status, 400);
    backendEnv.AI_RATE_LIMITER.limit = async () => ({success:false});
    const limited = await worker.fetch(request(), env);
    assert.equal(limited.status,429);
    assert.equal(limited.headers.get('Retry-After'),'60');
  } finally { globalThis.fetch = old; }
});
