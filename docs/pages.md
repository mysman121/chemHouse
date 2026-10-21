# Publish ChemHouse on Cloudflare Pages

This repository supports both the existing Worker website and a Pages website. The Pages site uses the same `public/` app, with all three study editions. Browser AI requests stay on `/api/chat` on the Pages origin. A Cloudflare service binding forwards them privately to the existing `chemhouse` Worker, which keeps the DeepSeek secret, tutor prompt, validation and rate limiting.

## Create the Pages project in your own dashboard

1. Open Cloudflare **Workers & Pages → Create application** and choose **Pages / Get started / Connect to Git**. Choose the Pages option, rather than creating another Worker. Labels can vary.
2. Select the existing GitHub repository **mysman121/chemHouse** and production branch **main**.
3. Use these settings:

| Setting | Value |
| --- | --- |
| Project name | `chemhouse-study` |
| Framework preset | None |
| Root directory | `pages` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version, if requested | 22 |

4. Save and deploy. Use the actual `pages.dev` URL returned by Cloudflare; do not assume the requested project name is available. If a different project name is required, update `pages/wrangler.jsonc` to match before deploying.
5. The `pages/wrangler.jsonc` file declares the binding `CHEMHOUSE_API` → Worker `chemhouse`. Check **Settings → Bindings** on the Pages project after deployment. If your dashboard requires adding the binding manually, add a **Service binding**, name it **CHEMHOUSE_API**, select **chemhouse**, and redeploy. When Wrangler owns a setting, change it in the configuration file instead of the dashboard.
6. Open each study edition and submit a short chemistry question. The existing Worker runtime secret `DEEPSEEK_API_KEY` remains where it is; it must not be copied into a browser variable or the build output.

## Build or deploy from an authenticated computer

```sh
npm install
npm run check
npm run pages:build
npx wrangler login
npm run pages:deploy
```

The CLI requires an existing Pages project or an explicit project-creation step in the authenticated account. The dashboard route above also configures continuous deployment from GitHub. The existing root `wrangler.jsonc` still deploys the Worker; the separate Pages configuration prevents mixing the two deployment types.

## Access and data limitations

- A `pages.dev` hostname does not guarantee access from mainland China. Test the actual deployed URL and AI endpoint from mainland China on the intended mobile carriers and broadband networks. No mainland probe is available in this authoring environment, so no mainland reachability guarantee is made.
- Ordinary Pages hosting is not Cloudflare's separate China Network service. Cloudflare documents reliability and latency issues for cross-border traffic; a custom domain and suitable regional hosting may be needed for reliable access.
- A new hostname is a separate browser origin. Existing local notes and progress on the Worker hostname are not automatically copied to the Pages hostname. Export notes before switching. The existing native test apps continue to use their original Worker URL and are not silently retargeted.
- The Pages proxy uses the original Request through a private service binding. It does not send the student's browser to `workers.dev`, rewrite Origin to bypass checks, or embed the DeepSeek key in frontend code.
- If Pages returns `unavailable`, verify the service binding and that the `chemhouse` Worker still works. Pages deployment, real bound-service behaviour and mainland reachability require account-side verification; Node tests cover packaging and request forwarding, not those live conditions.

## References

- Pages Git integration: https://developers.cloudflare.com/pages/get-started/git-integration/
- Advanced-mode Functions: https://developers.cloudflare.com/pages/functions/advanced-mode/
- Service bindings: https://developers.cloudflare.com/pages/functions/bindings/#service-bindings
- Wrangler configuration for Pages: https://developers.cloudflare.com/pages/functions/wrangler-configuration/
- China Network: https://developers.cloudflare.com/china-network/
