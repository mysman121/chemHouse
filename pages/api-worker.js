// Pages invokes the existing Worker privately. Browser requests stay on the Pages origin.
// The existing Worker retains its DeepSeek secret, tutor prompt and rate-limit binding.
const reply = (code, status, headers = {}) => Response.json({ error: code }, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers }
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (url.pathname !== '/api/chat') return reply('not_found', 404);
    if (request.method !== 'POST') return reply('method_not_allowed', 405, { Allow: 'POST' });
    const origin = request.headers.get('origin');
    if ((origin && origin !== url.origin) || request.headers.get('sec-fetch-site') === 'cross-site')
      return reply('forbidden', 403);
    if (!env.CHEMHOUSE_API || typeof env.CHEMHOUSE_API.fetch !== 'function') return reply('unavailable', 503);
    try {
      // Forward the original Request via a service binding: do not rewrite Origin or
      // client-IP headers, add credentials, or make a public workers.dev request.
      return await env.CHEMHOUSE_API.fetch(request);
    } catch {
      return reply('unavailable', 503);
    }
  }
};
