# Cloudflare Worker deployment and DeepSeek activation

The existing application is https://chemhouse.ponlavat10.workers.dev/. Deploy the repository root to the **chemhouse** Worker. `wrangler.jsonc` now serves `public/` and routes `/api/*` to `src/worker.js`. No frontend build is needed. A static-only Pages deployment does not support this endpoint.

## Activate in the dashboard

1. Open **Workers & Pages → chemhouse → Settings → Variables and Secrets**.
2. Add an encrypted **Secret** named `DEEPSEEK_API_KEY`. Paste your DeepSeek key privately into the secret value and save it. Do not commit the key or send it to students.
3. Deploy the latest `main` from `mysman121/chemHouse`. With Workers Builds, use `npm run check` for the build command and `npx wrangler deploy` for deployment. If automatic deployment is enabled, check that its latest deployment includes the AI tutor commit. Dashboard navigation labels may vary.
4. Open **Ask AI / AI 答疑** on the site and ask a short chemistry question, then a follow-up. Only a real request can verify key validity, account credit and DeepSeek reachability.

`DEEPSEEK_MODEL` is a non-secret server setting, defaulting to `deepseek-flash` per current DeepSeek documentation. Change it in `wrangler.jsonc` if needed. The key is not a build-time variable; it must be a Worker runtime secret.

## CLI deployment

From an authenticated local checkout:

```sh
npm install
npx wrangler login
npx wrangler secret put DEEPSEEK_API_KEY
npm run check
npm run deploy
```

The secret command prompts for the value. Never put the actual key on the command line. For local testing, put `DEEPSEEK_API_KEY=your-local-key` in ignored `.dev.vars`, then run `npm run dev`. Do not publish `.dev.vars`.

## Behaviour and limits

- Students choose HKDSE, 人教版 or general high-school guidance. The tutor replies in the student's question language, with the app edition as fallback. Guidance does not imply official syllabus certification.
- The browser calls same-origin `/api/chat`. Only the Worker sends the key to DeepSeek. Cross-origin browser requests are refused; this is not user authentication.
- Each request is limited to 64 KiB, nine alternating messages, 4,000 characters per student message and 1,400 output tokens. The UI sends up to two previous exchanges, trimming older context to fit. Upstream requests time out after 60 seconds. There are no automatic paid retries.
- The included rate-limit binding permits approximately 10 requests per minute per network IP at each Cloudflare location. Shared school networks share this allowance. This is an abuse throttle, not a hard account spending cap; monitor DeepSeek usage and credit. The Worker fails closed if the binding is absent.
- Chat stays in tab memory, separate for each edition; reloading clears it. The question, recent exchanges and selected lesson are sent to DeepSeek. Notes, names and student IDs are not requested or automatically attached. The application does not log chat or persist it server-side; the provider's own data handling still applies.
- Model output is escaped plain text, preserving chemical symbols and line breaks. No AI-generated HTML is executed.

## Troubleshooting

- **Tutor not available:** check the deployed Worker has its runtime secret and rate-limit binding. For account configuration or credit problems, check the DeepSeek dashboard. Private upstream errors are never exposed to students.
- **Too many questions:** wait one minute; a shared network can hit the throttle.
- **Network / busy / timeout:** retry manually. The draft is kept after failure. Stop waiting cancels the browser's wait; an upstream request already accepted by DeepSeek may still incur charges.
- **AI page missing:** confirm the Worker is deployed from the current original repository and refresh. Deploy-button copies can track a different repository.

## Verification

`npm run check` covers existing study features plus tutor context, follow-ups, bilingual isolation, escaping, reset races, payload validation, origin checks, rate limiting, missing configuration and safe upstream-error handling. These checks use DOM stubs and a mocked provider. They do not verify browser layout, a real DeepSeek account or production deployment.

## Official references

- DeepSeek API: https://api-docs.deepseek.com/
- Worker secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Worker scripts with assets: https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
- Rate-limit bindings: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
