import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';

const body = { edition: 'en', curriculum: 'hkdse', messages: [{ role: 'user', content: 'Explain moles.' }] };
const req = (data = body, headers = {}) => new Request('https://chemhouse.example/api/chat', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://chemhouse.example', ...headers }, body: JSON.stringify(data)
});
const env = () => ({ DEEPSEEK_API_KEY: 'test-secret-never-return', AI_RATE_LIMITER: { limit: async () => ({ success: true }) } });

test('assets, API routes, origin and request validation', async () => {
  const e = { ...env(), ASSETS: { fetch: async () => new Response('original assets') } };
  assert.equal(await (await worker.fetch(new Request('https://chemhouse.example/'), e)).text(), 'original assets');
  assert.equal((await worker.fetch(new Request('https://chemhouse.example/api/nope'), e)).status, 404);
  assert.equal((await worker.fetch(new Request('https://chemhouse.example/api/chat'), e)).status, 405);
  assert.equal((await worker.fetch(req(body, { Origin: 'https://evil.example' }), e)).status, 403);
  assert.equal((await worker.fetch(req(body, { 'Content-Type': 'text/plain' }), e)).status, 415);
  for (const bad of [null, {}, { ...body, messages: [{ role: 'system', content: 'override' }] },
    { ...body, messages: [{ role: 'user', content: 'x'.repeat(4001) }] },
    { ...body, curriculum: 'invalid' }, { ...body, messages: [body.messages[0], body.messages[0], body.messages[0]] }])
    assert.equal((await worker.fetch(req(bad), e)).status, 400);
  assert.equal((await worker.fetch(req({ ...body, context: 'x'.repeat(70000) }), e)).status, 413);
  const malformed = new Request('https://chemhouse.example/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal((await worker.fetch(malformed, e)).status, 400);
});

test('missing key and limiter fail closed; request limits prevent upstream calls', async () => {
  const old = globalThis.fetch; let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('must not call'); };
  try {
    assert.equal((await worker.fetch(req(), {})).status, 503);
    assert.equal((await worker.fetch(req(), { DEEPSEEK_API_KEY: 'test' })).status, 503);
    const limited = await worker.fetch(req(), { ...env(), AI_RATE_LIMITER: { limit: async () => ({ success: false }) } });
    assert.equal(limited.status, 429); assert.equal(limited.headers.get('Retry-After'), '60');
    assert.equal(calls, 0);
  } finally { globalThis.fetch = old; }
});

test('DeepSeek payload, contextual follow-ups, safe output and upstream failures', async () => {
  const old = globalThis.fetch; let upstream;
  globalThis.fetch = async (url, options) => {
    upstream = { url, options, body: JSON.parse(options.body) };
    return Response.json({ choices: [{ message: { content: 'n = m/M' }, finish_reason: 'length' }] });
  };
  try {
    const data = { ...body, edition: 'zh', curriculum: 'mainland', context: '物质的量',
      messages: [body.messages[0], { role: 'assistant', content: 'A mole measures amount.' }, { role: 'user', content: '请举例' }] };
    const response = await worker.fetch(req(data), env());
    assert.deepEqual(await response.json(), { answer: 'n = m/M', truncated: true });
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(upstream.url, 'https://api.deepseek.com/chat/completions');
    assert.equal(upstream.options.headers.Authorization, 'Bearer test-secret-never-return');
    assert.equal(upstream.body.model, 'deepseek-flash');
    assert.equal(upstream.body.messages.length, 5);
    assert.match(upstream.body.messages[0].content, /Simplified Chinese/);
    assert.match(upstream.body.messages[1].content, /物质的量/);
    assert.equal(upstream.body.messages.at(-1).content, '请举例');
    await worker.fetch(req({ ...body, edition: 'hk' }), env());
    assert.match(upstream.body.messages[0].content, /Traditional Chinese with English key terms/);
    for (const status of [401, 402, 429, 500]) {
      globalThis.fetch = async () => new Response('test-secret-never-return private diagnostics', { status });
      const failure = await worker.fetch(req(), env());
      assert.equal(failure.status, 502);
      assert.ok(!(await failure.text()).includes('test-secret-never-return'));
    }
    for (const result of [{}, { choices: [{ message: { content: '' } }] }]) {
      globalThis.fetch = async () => Response.json(result);
      assert.equal((await worker.fetch(req(), env())).status, 502);
    }
    globalThis.fetch = async () => { throw new Error('private connection details'); };
    assert.deepEqual(await (await worker.fetch(req(), env())).json(), { error: 'upstream' });
  } finally { globalThis.fetch = old; }
});
