# ChemHouse · 化学小屋

An original high-school chemistry and English study website, prepared for Cloudflare hosting.

[Deploy to Cloudflare](https://deploy.workers.cloudflare.com/?url=https://github.com/mysman121/chemHouse)

The link opens Cloudflare's deployment setup; it is not a published website URL.

## Website features

- **English edition:** 15 chemistry lessons and 3 academic English lessons, with 36 explained practice questions.
- **Mainland chemistry edition:** 15 original chemistry lessons and 30 explained questions in Simplified Chinese, grouped into the five 人教版 high-school chemistry course volumes.
- Searchable lessons, worked examples and common mistakes.
- Per-edition lesson progress, practice records, wrong-answer review and local study notes with text export.
- Mole and concentration calculators with input validation; interactive first-20-element reference.
- Responsive, self-contained HTML. No API keys or external fonts, scripts or stylesheets are required for students.

This is a starter topic collection; it does not claim complete textbook coverage, page-by-page alignment or publisher endorsement. See [curriculum and edition status](docs/editions.md).

## Publish with Cloudflare

Choose either:

1. [Deploy to Cloudflare](https://deploy.workers.cloudflare.com/?url=https://github.com/mysman121/chemHouse), sign in and follow the setup to deploy the static assets using the included `wrangler.jsonc`. Cloudflare may create a copy of this repository; use the dashboard's existing-repository integration below to keep deployments linked to this original repository.
2. In Cloudflare **Workers & Pages → Create application → Pages → Import an existing Git repository**, choose `mysman121/chemHouse`. Set production branch `main`, framework preset `None`, build command `exit 0` and output directory `public`. Save and deploy.

The actual public URL is the one returned by Cloudflare after successful deployment. Hosting and mainland-China reachability have not been verified in this authoring session.

See [deployment details](docs/cloudflare.md).

## Preview and check

Open `public/index.html` directly in a browser, or serve the public folder with a local HTTP server.

```sh
python3 -m http.server 8000 --directory public
node scripts/check-site.mjs
```

Then open `http://localhost:8000`. No application build step is needed.

For a direct Workers deployment from your own authenticated machine:

```sh
npm install
npm run deploy
```

## Source and validation status

The website is a separate implementation created directly in this repository. The supplied Android source ZIP and APK could not be opened in the authoring execution environment and remain unimported. No feature parity with the Android app is claimed.

JavaScript logic and rendered-markup smoke checks passed in the authoring runtime. Browser visual testing, real Cloudflare deployment, public URL access and mainland-China connectivity remain unverified. The included Node checker reproduces the essential logic checks with DOM stubs.

## Supplied artifacts awaiting inspection and import

- `Reaction-Room-3.0.0-School-Chemistry.apk`
- `reaction-room-source.zip`
- `reaction-room-source (1).zip`

These are pending inputs, not files currently in this repository.
