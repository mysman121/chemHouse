const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { isTrusted, isExternal } = require('./desktop/navigation.cjs');
const config = require('./desktop/package.json');
const legacy = require('./desktop/legacy.config.cjs');
test('only the ChemHouse HTTPS origin is trusted inside the application', () => {
  for (const url of ['https://chemhouse.ponlavat10.workers.dev/', 'https://chemhouse.ponlavat10.workers.dev/#/hk/ai']) assert.equal(isTrusted(url), true);
  for (const url of ['http://chemhouse.ponlavat10.workers.dev', 'https://chemhouse.ponlavat10.workers.dev.evil.test/', 'https://evil.test', 'file:///etc/passwd', 'javascript:alert(1)', 'https://user:pass@chemhouse.ponlavat10.workers.dev/', 'https://chemhouse.ponlavat10.workers.dev:444/']) assert.equal(isTrusted(url), false);
  assert.equal(isExternal('https://github.com/mysman121/chemHouse'), true);
  for (const url of ['javascript:alert(1)', 'file:///test', 'data:text/html,hi', 'http://evil.test', 'https://user:password@example.org']) assert.equal(isExternal(url), false);
});
test('modern and legacy builds have distinct app identities and explicit runtime pins', () => {
  assert.equal(config.devDependencies.electron, '44.9.2');
  assert.equal(legacy.electronVersion, '22.3.27');
  assert.notEqual(config.build.appId, legacy.appId);
  assert.equal(config.build.mac.minimumSystemVersion, '13.0.0');
  assert.ok(legacy.files.includes('offline.html'));
});
test('native shells do not contain a DeepSeek credential or direct provider calls', () => {
  const sources = ['desktop/main.cjs', 'android/app/src/main/java/com/chemhouse/study/MainActivity.java'];
  for (const filename of sources) {
    const source = fs.readFileSync(path.join(__dirname, filename), 'utf8');
    assert.ok(!source.includes('api.deepseek.com'));
    assert.ok(!/sk-[A-Za-z0-9]{12,}/.test(source));
  }
  const desktop = fs.readFileSync(path.join(__dirname, 'desktop/main.cjs'), 'utf8');
  assert.match(desktop, /nodeIntegration: false/);
  assert.match(desktop, /contextIsolation: true/);
  assert.match(desktop, /sandbox: true/);
  const android = fs.readFileSync(path.join(__dirname, sources[1]), 'utf8');
  assert.match(android, /Collections.singleton\(ORIGIN\)/);
  assert.match(android, /handler.cancel\(\)/);
  assert.ok(!android.includes('addJavascriptInterface'));
});
