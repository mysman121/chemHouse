'use strict';
const ORIGIN = 'https://chemhouse.ponlavat10.workers.dev';
function isTrusted(value) {
  try { const u = new URL(value); return u.origin === ORIGIN && !u.username && !u.password; }
  catch { return false; }
}
function isExternal(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; }
  catch { return false; }
}
module.exports = { ORIGIN, isTrusted, isExternal };
