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
- **DeepSeek AI tutor:** chemistry and English Q&A, follow-up questions, optional lesson context, and Hong Kong HKDSE / mainland 人教版 / general course guidance in English or Chinese.
- Responsive, self-contained frontend. Students do not need API keys. AI runs through a server-side Cloudflare Worker; the owner supplies an encrypted DeepSeek secret.

This is a starter topic collection; it does not claim complete textbook coverage, page-by-page alignment or publisher endorsement. See [curriculum and edition status](docs/editions.md).

## Publish with Cloudflare

Deploy to the existing **chemhouse** Cloudflare Worker using this repository's `wrangler.jsonc` and `npm run deploy`. It now includes both the static website and `/api/chat`; deploying only `public/` cannot run AI tutoring. Existing Workers Builds can track `main` automatically.

Activate the tutor in Cloudflare: **Workers & Pages → chemhouse → Settings → Variables and Secrets → Add → Secret**. Name it `DEEPSEEK_API_KEY` and enter the key privately there, then deploy the new code. Never put it in GitHub, frontend JavaScript, or a variable prefixed with `VITE_`. `DEEPSEEK_MODEL` defaults to `deepseek-flash` and may be changed server-side.

See [deployment details](docs/cloudflare.md).

## Preview and check

Open `public/index.html` directly in a browser, or serve the public folder with a local HTTP server.

```sh
python3 -m http.server 8000 --directory public
npm run check
```

Then open `http://localhost:8000`. No frontend build step is needed. A static local server can preview the study pages; use `npm run dev` to test the AI endpoint with a local ignored `.dev.vars` secret.

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

