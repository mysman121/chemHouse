# ChemHouse native apps

These are native shells for the current live ChemHouse study app at https://chemhouse.ponlavat10.workers.dev/. They use the same lessons, English / Traditional Chinese Hong Kong / Simplified Chinese mainland editions, calculators, notebook and DeepSeek tutor as the website. Internet access is required. Existing notes in a web browser are not copied into a native app; each app has its own local study storage. Website changes appear in the apps without reinstalling the shell.

The DeepSeek API key remains in the Cloudflare Worker. No API key is included in an installer or requested from students.

## Build outputs

| Package | Intended system | Output |
| --- | --- | --- |
| Android preview | Android 8.0+ with an updated Android System WebView / Chrome | Installable test-signed APK |
| Android publishing input | Android / Google Play | Unsigned release AAB; needs the owner's signing key |
| Windows modern x64 | Windows 10 and 11, 64-bit | NSIS installer and portable EXE |
| Windows legacy x64 | Windows 7 SP1, 8, 8.1, 64-bit | NSIS installer and portable EXE |
| Windows legacy ia32 | Windows 7 SP1, 8, 8.1, 32-bit; also a fallback for 32-bit Windows 10 | NSIS installer and portable EXE |
| macOS arm64 | Apple Silicon, macOS 13+ | DMG and ZIP |
| macOS x64 | Intel, macOS 13+ | DMG and ZIP |

Windows 7/8/8.1 compatibility requires Electron 22.3.27, whose upstream browser no longer receives security fixes. That separate app is explicitly labelled **ChemHouse Legacy**, uses a separate app ID and profile, and displays a warning. Modern Windows and macOS use Electron 44.9.2. These are build targets, not a claim that every OS has been exercised on physical hardware.

## Download and install

Open the repository's **Actions → Build ChemHouse apps → successful run → Artifacts**. Download the package for your operating system and extract the artifact ZIP. Artifacts expire after 30 days; rebuild when needed.

- Android: install the preview APK and allow installation from your chosen file manager if Android prompts. The AAB is not directly installable. Preview APKs are signed with an automatically generated development key; a rebuild may require uninstalling the old preview, which removes local notes. Export notes first. Use a stable owner-controlled signing key before distributing updates to students.
- Windows: use the Setup EXE or Portable EXE. Desktop packages are unsigned, so Windows may display an unknown-publisher warning. Do not change system-wide security settings.
- macOS: open the DMG and drag the app to Applications, or extract the ZIP. The initial packages are not Developer ID signed or notarized. macOS may block them. For general student distribution, sign and notarize with the owner's Apple Developer credentials. Do not disable Gatekeeper globally.

The included SHA256SUMS.txt artifact lets you verify downloaded package bytes.

## Build locally

### Desktop

Install Node.js 22 and run from `native/desktop`:

```sh
npm ci
npm run dist -- --win --x64
npm run dist -- --mac --arm64
npm run dist -- --mac --x64
```

macOS packaging must run on macOS. Windows packaging runs on Windows in CI. To build the legacy Windows variant:

```sh
npm install --save-dev --package-lock=false electron@22.3.27
npm run dist -- --win --x64 --config legacy.config.cjs
npm run dist -- --win --ia32 --config legacy.config.cjs
```

### Android

Use JDK 17, Gradle 8.9 and Android SDK 35:

```sh
cd native/android
gradle :app:assembleDebug :app:bundleRelease :app:lintDebug
```

CI provisions those tools automatically. A Gradle wrapper binary is not checked into this repository.

## Native behaviours

- Only the ChemHouse HTTPS origin can load inside the apps. External HTTPS links open in the system browser. Node integration and insecure mixed content are disabled.
- Android uses a WebView message listener restricted to the exact ChemHouse origin and main frame for note exports and printing. It never exposes a general JavaScript-to-Java interface. Note export uses Android's document picker; no storage permission is requested.
- Android has Home, Reload, Open in browser and Print menu actions, back navigation and a connection-retry screen. Keep WebView up to date.
- Desktop apps have native study, edit, zoom, fullscreen, print and browser actions, an offline retry page, separate persisted app storage and no unnecessary device permissions.
- Certificate errors are not bypassed. The shells have no secret, filesystem or arbitrary command bridge exposed to remote pages.

## Validation

`npm run check` from the repository root verifies the current web app. `node --test native/check-native.cjs` checks native URL policy, runtime separation and critical security configuration. GitHub Actions compiles Android, runs Android lint, and builds each desktop architecture. Physical-device installation, macOS notarization and Windows 7 runtime testing remain separate checks.

## References

- Electron Windows 7/8/8.1 policy: https://www.electronjs.org/blog/windows-7-to-8-1-deprecation-notice
- Electron 22.3.27 end of support: https://releases.electronjs.org/release/v22.3.27
- Electron 44 platform requirements: https://www.electronjs.org/docs/latest/breaking-changes
- Electron security: https://www.electronjs.org/docs/latest/tutorial/security
- Android WebView: https://developer.android.com/develop/ui/views/layout/webapps/webview
