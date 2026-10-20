# Cloudflare deployment

The static website is complete in `public/index.html`. Publishing requires a Cloudflare account login; this session has no connected Cloudflare deployment credentials.

## Recommended: link the existing repository to Cloudflare Pages

1. Open https://dash.cloudflare.com/ and sign in.
2. Go to **Workers & Pages → Create application → Pages → Import an existing Git repository**.
3. Authorize GitHub access if prompted; select **mysman121/chemHouse**.
4. Use the following values:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `exit 0` |
| Build output directory | `public` |
| Root directory | Repository root |
| Environment variables | None required |

5. Save and deploy.
6. Open the **actual URL returned by Cloudflare**. Do not assume a particular `pages.dev` hostname is available.

Later commits to the connected branch can deploy automatically. Students need only the resulting public URL.

## Alternative: Deploy to Cloudflare button (Workers)

https://deploy.workers.cloudflare.com/?url=https://github.com/mysman121/chemHouse

This opens the supported Cloudflare setup flow. It may clone the repository into a new repository, then use Workers Builds to deploy. The included `wrangler.jsonc` serves `public/` as static assets; no server code or secrets are needed. Keep this distinction in mind if you want future changes to deploy from the existing `chemHouse` repository.

For local CLI deployment from your own authenticated machine:

```sh
npm install
npx wrangler login
npm run deploy
```

The resulting hostname is assigned within your Cloudflare account and is unknown until deployment succeeds.

## Verify after publication

- Open the returned URL on a phone and computer.
- Switch between English and 人教版 · 简体中文.
- Open a lesson; mark it explored; reload.
- Answer a question incorrectly, then retry it correctly and check the notebook.
- Save notes in each edition and confirm they remain separate after reload.
- Test 9 g / 18 g·mol⁻¹ = 0.5 mol and 0.20 mol / 0.50 L = 0.4 mol·L⁻¹.
- Test the URL from the mainland before claiming access there.

No production deployment or browser layout verification was possible in the authoring session.

## Official references

- Static HTML on Pages: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- Git integration: https://developers.cloudflare.com/pages/get-started/git-integration/
- Worker static assets: https://developers.cloudflare.com/workers/static-assets/binding/
- Deploy buttons: https://developers.cloudflare.com/workers/platform/deploy-buttons/
