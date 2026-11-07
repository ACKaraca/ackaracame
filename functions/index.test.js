import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('the production Functions module loads with valid endpoint options', async () => {
  const endpoints = await import('./index.js');
  assert.deepEqual(Object.keys(endpoints).sort(), [
    'auditAdminMediaUploads',
    'auditInquiryWrites',
    'auditJournalWrites',
    'auditProjectWrites',
    'auditSiteSettingsWrites',
    'collectOrphanedMedia',
    'deletePromotedMedia',
    'dispatchAutomaticRebuilds',
    'getLatestSiteRebuildStatus',
    'getPublishedPafta',
    'getSiteRebuildStatus',
    'promoteMedia',
    'requestSiteRebuild',
    'restrictUserCreation',
    'restrictUserSignIn',
    'seedContent',
    'submitInquiry'
  ]);
});

test('every admin callable awaits the owner-policy-backed admin check', () => {
  const source = fs.readFileSync(new URL('./index.js', import.meta.url), 'utf8');
  const calls = source.match(/assertVerifiedAdmin\(request\)/gu) || [];
  assert.equal(calls.length, 6);
  assert.equal((source.match(/await assertVerifiedAdmin\(request\)/gu) || []).length, calls.length);
  const start = source.indexOf('const assertVerifiedAdmin = async');
  assert(start >= 0);
  assert.match(source.slice(start, source.indexOf('\n};', start)), /db\.doc\(OWNER_POLICY_PATH\)\.get\(\)/u);
});

test('every function runs as the dedicated least-privilege service account', () => {
  const source = fs.readFileSync(new URL('./index.js', import.meta.url), 'utf8');
  const regions = (source.match(/region: FUNCTION_REGION,/gu) || []).length;
  assert(regions >= 13);
  assert.equal((source.match(/serviceAccount: FUNCTIONS_SERVICE_ACCOUNT,/gu) || []).length, regions);
});

test('the automatic dispatcher does not retry when the rebuild hook is unconfigured', () => {
  const source = fs.readFileSync(new URL('./index.js', import.meta.url), 'utf8');
  const start = source.indexOf('export const dispatchAutomaticRebuilds');
  const end = source.indexOf('export const auditAdminMediaUploads', start);
  assert(start >= 0 && end > start);
  const handler = source.slice(start, end);
  assert.match(handler, /error\.code === 'failed-precondition'/u);
  assert.match(handler, /console\.warn\('Automatic rebuild skipped/u);
});

test('the manual rebuild callable delegates to the shared dispatcher', () => {
  const source = fs.readFileSync(new URL('./index.js', import.meta.url), 'utf8');
  const start = source.indexOf('export const requestSiteRebuild');
  const end = source.indexOf('const readSiteRebuildStatus', start);
  assert(start >= 0 && end > start);
  const callableSource = source.slice(start, end);
  assert.match(callableSource, /await dispatchSiteRebuildQueue\(/u);
  assert.doesNotMatch(callableSource, /buildRebuildWebhookRequest|fetch\(/u);
  assert.equal((source.match(/const deadlineMs = Date\.now\(\) \+ REBUILD_WAIT_TIMEOUT_MS/gu) || []).length, 1);
});
