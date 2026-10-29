import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {BudgetError, CostLedger} from '../pilot/tamasha-channel/costs.mjs';
import {twoDistinctEditions, moneyEssentialsRatesEdition} from '../pilot/tamasha-channel/fixtures.mjs';
import {runFullM1} from '../pilot/tamasha-channel/m1.mjs';
import {MasterBuilder} from '../pilot/tamasha-channel/master.mjs';
import {ProductionPipeline} from '../pilot/tamasha-channel/production.mjs';
import {ReleaseError, ReleaseGate} from '../pilot/tamasha-channel/release.mjs';
import {parseReviewEmailBody} from '../pilot/tamasha-channel/review.mjs';
import {ScriptPackError, buildScriptVersion, reviseFromChanges, renderReviewHtml} from '../pilot/tamasha-channel/script-pack.mjs';
import {DeskService} from '../pilot/tamasha-channel/service.mjs';
import {FileStore} from '../pilot/tamasha-channel/store.mjs';

const temporary = async t => {
  const p = await mkdtemp(path.join(tmpdir(), 'tmw-m1-'));
  t.after(() => rm(p, {recursive: true, force: true}));
  return p;
};

test('two fixture editions are distinct and sourced', () => {
  const [a, b] = twoDistinctEditions();
  assert.notEqual(a.episodeId, b.episodeId);
  assert.notEqual(a.scriptSha, b.scriptSha);
  assert.equal(a.script.estimatedDurationSec, 300);
  assert.equal(b.script.estimatedDurationSec, 300);
  assert.ok(a.sources.length >= 1 && a.claims.length >= 1);
  assert.match(renderReviewHtml(a), /Source ledger/);
});

test('unknown source on claim is rejected', () => {
  const base = moneyEssentialsRatesEdition();
  assert.throws(() => buildScriptVersion({
    ...base,
    claims: [...base.claims, {claimId: 'c-bad', kind: 'fact', text: 'orphan', sourceIds: ['missing-source']}],
  }), ScriptPackError);
});

test('revision creates new hash and version', () => {
  const v1 = moneyEssentialsRatesEdition();
  const v2 = reviseFromChanges(v1, {requestedChanges: ['Clarify illustrative label']});
  assert.equal(v2.version, 2);
  assert.notEqual(v2.scriptSha, v1.scriptSha);
  assert.equal(v2.state, 'SCRIPT_DRAFT');
});

test('parse CHANGES ignores quoted approve', () => {
  const parsed = parseReviewEmailBody(
    'CHANGES SCRIPT ep-1 1 abcdef123456\nPlease soften the open.\n> APPROVE SCRIPT ep-1 1 abcdef123456\n',
  );
  assert.equal(parsed.command, 'CHANGES');
  assert.deepEqual(parsed.requestedChanges, ['Please soften the open.']);
});

test('ambiguous looks fine is null', () => {
  assert.equal(parseReviewEmailBody('looks fine, ship it'), null);
});

test('end-to-end CHANGES creates v2', async t => {
  const root = await temporary(t);
  const store = await new FileStore(root).init();
  const desk = new DeskService(store, ['editor@example.com']);
  const [a, b] = twoDistinctEditions();
  await store.savePack(a);
  await store.savePack(b);
  const {pack: pending, mail} = await desk.submitForReview(a.episodeId, 1);
  assert.equal(pending.state, 'REVIEW_PENDING');
  assert.match(mail.subject, /\[MarketWatch REVIEW\]/);
  const result = await desk.processEmail({
    messageId: 'm-1',
    fromEmail: 'editor@example.com',
    subject: `Re: ${mail.subject}`,
    body: `CHANGES SCRIPT ${pending.episodeId} ${pending.version} ${pending.hashToken}\nLabel money-market figure as illustrative.\n`,
    receivedAt: '2099-01-01T00:00:00+00:00',
    authenticated: true,
  });
  assert.equal(result.decision.accepted, true);
  assert.equal(result.revised.version, 2);
  assert.deepEqual(await store.listVersions(b.episodeId), [1]);
});

test('wrong hash rejected', async t => {
  const root = await temporary(t);
  const store = await new FileStore(root).init();
  const desk = new DeskService(store, ['editor@example.com']);
  const a = moneyEssentialsRatesEdition();
  await store.savePack(a);
  await desk.submitForReview(a.episodeId, 1);
  const result = await desk.processEmail({
    messageId: 'm-bad',
    fromEmail: 'editor@example.com',
    subject: 'Re: review',
    body: `CHANGES SCRIPT ${a.episodeId} 1 deadbeefdead\nFix tone.\n`,
    receivedAt: '2099-01-01T00:00:00+00:00',
    authenticated: true,
  });
  assert.equal(result.decision.accepted, false);
  assert.match(result.decision.reason, /hash/);
  assert.equal(result.revised, null);
});

test('full M1 releases two distinct editions', async t => {
  const root = await temporary(t);
  const result = await runFullM1(path.join(root, 'm1'));
  assert.equal(result.editions.length, 2);
  const [a, b] = result.editions;
  assert.notEqual(a.episodeId, b.episodeId);
  assert.notEqual(a.scriptSha, b.scriptSha);
  assert.notEqual(a.masterSha, b.masterSha);
  for (const ed of result.editions) {
    assert.deepEqual(ed.versions, [1, 2]);
    assert.equal(ed.approvedVersion, 2);
    assert.equal(ed.state, 'RELEASED');
    assert.ok(ed.costTotalUsd > 0);
    assert.equal(ed.scriptSha.length, 64);
    assert.equal(ed.masterSha.length, 64);
    assert.ok(Object.keys(ed.sceneShas).length);
  }
  const store = await new FileStore(path.join(root, 'm1')).init();
  assert.equal((await store.loadPack(a.episodeId, 1)).state, 'CHANGES_REQUESTED');
});

test('wrong master sha blocks release', async t => {
  const root = await temporary(t);
  const store = await new FileStore(root).init();
  const ledger = await new CostLedger(store.costs).init();
  const desk = new DeskService(store, ['editor@example.com']);
  const prod = new ProductionPipeline(store, ledger);
  const masters = new MasterBuilder(store, ledger);
  const gate = new ReleaseGate(store, ledger);
  const pack = moneyEssentialsRatesEdition();
  await store.savePack(pack);
  const {pack: v1, mail} = await desk.submitForReview(pack.episodeId, 1);
  await desk.processEmail({
    messageId: 'approve-direct',
    fromEmail: 'editor@example.com',
    subject: `Re: ${mail.subject}`,
    body: `APPROVE SCRIPT ${v1.episodeId} ${v1.version} ${v1.hashToken}\n`,
    receivedAt: '2099-01-01T00:00:00+00:00',
    authenticated: true,
  });
  await prod.queueApproved(v1.episodeId, 1);
  await prod.runVoiceAndFlow(v1.episodeId, 1);
  const master = await masters.assemble(v1.episodeId, 1);
  await assert.rejects(
    () => gate.release(v1.episodeId, 1, {
      qaReviewer: 'qa@example.com',
      releaseApprover: 'prod@example.com',
      expectedMasterSha: '0'.repeat(64),
    }),
    ReleaseError,
  );
  const release = await gate.release(v1.episodeId, 1, {
    qaReviewer: 'qa@example.com',
    releaseApprover: 'prod@example.com',
    expectedMasterSha: master.masterSha,
  });
  assert.equal(release.status, 'RELEASED');
});

test('budget cap blocks new spend', async t => {
  const root = await temporary(t);
  const ledger = await new CostLedger(root, {dailyCapUsd: 0.01, flowPerClipUsd: 0.45}).init();
  await assert.rejects(
    () => ledger.reserve({
      episodeId: 'x', version: 1, stage: 'flow', sceneId: 's1',
      idempotencyKey: 'k1', estimatedUsd: 0.45, provider: 'fixture-flow-v1',
    }),
    BudgetError,
  );
});
