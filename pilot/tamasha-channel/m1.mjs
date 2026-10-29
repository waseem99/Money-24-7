import {CostLedger} from './costs.mjs';
import {twoDistinctEditions} from './fixtures.mjs';
import {MasterBuilder} from './master.mjs';
import {ProductionPipeline} from './production.mjs';
import {ReleaseGate} from './release.mjs';
import {DeskService} from './service.mjs';
import {FileStore} from './store.mjs';

async function runEditionWithChanges({
  store, desk, production, masters, releases, pack, editor, qaReviewer, releaseApprover, messagePrefix, changeLines,
}) {
  await store.savePack(pack);
  const {pack: v1, mail: mail1} = await desk.submitForReview(pack.episodeId, 1);
  const changed = await desk.processEmail({
    messageId: `${messagePrefix}-changes`,
    fromEmail: editor,
    subject: `Re: ${mail1.subject}`,
    body: `CHANGES SCRIPT ${v1.episodeId} ${v1.version} ${v1.hashToken}\n${changeLines.join('\n')}\n`,
    receivedAt: '2099-01-01T00:00:00+00:00',
    authenticated: true,
  });
  if (!changed.decision.accepted || !changed.revised) {
    throw new Error(`CHANGES failed for ${pack.episodeId}: ${changed.decision.reason}`);
  }

  const {pack: v2, mail: mail2} = await desk.submitForReview(changed.revised.episodeId, changed.revised.version);
  const approved = await desk.processEmail({
    messageId: `${messagePrefix}-approve`,
    fromEmail: editor,
    subject: `Re: ${mail2.subject}`,
    body: `APPROVE SCRIPT ${v2.episodeId} ${v2.version} ${v2.hashToken}\n`,
    receivedAt: '2099-01-01T00:00:01+00:00',
    authenticated: true,
  });
  if (!approved.decision.accepted) {
    throw new Error(`APPROVE failed for ${pack.episodeId}: ${approved.decision.reason}`);
  }

  await production.queueApproved(v2.episodeId, v2.version);
  await production.runVoiceAndFlow(v2.episodeId, v2.version);
  const master = await masters.assemble(v2.episodeId, v2.version);
  const release = await releases.release(v2.episodeId, v2.version, {
    qaReviewer,
    releaseApprover,
    expectedMasterSha: master.masterSha,
  });
  const finalPack = await store.loadPack(v2.episodeId, v2.version);
  return {
    episodeId: finalPack.episodeId,
    programme: finalPack.programme,
    edition: finalPack.edition,
    versions: await store.listVersions(finalPack.episodeId),
    approvedVersion: finalPack.version,
    scriptSha: finalPack.scriptSha,
    masterSha: release.masterSha,
    audioSha: release.audioSha,
    sceneShas: release.sceneShas,
    costTotalUsd: release.costTotalUsd,
    costLogSha: release.costLogSha,
    releaseId: release.releaseId,
    state: finalPack.state,
  };
}

/** Full M1: two DISTINCT 5min editions through changes→approve→Flow/voice→master→release. */
export async function runFullM1(dataDir, {
  editor = 'editor@example.com',
  qaReviewer = 'qa.operator@example.com',
  releaseApprover = 'producer@example.com',
  rates = {},
} = {}) {
  const store = await new FileStore(dataDir).init();
  const ledger = await new CostLedger(store.costs, rates).init();
  const desk = new DeskService(store, [editor]);
  const production = new ProductionPipeline(store, ledger);
  const masters = new MasterBuilder(store, ledger);
  const releases = new ReleaseGate(store, ledger);
  const [a, b] = twoDistinctEditions();

  const editions = [
    await runEditionWithChanges({
      store, desk, production, masters, releases, pack: a, editor, qaReviewer, releaseApprover,
      messagePrefix: 'm1-a',
      changeLines: [
        'Label money-market figure clearly as illustrative.',
        'Add one sentence separating policy rate from bank lending rates.',
      ],
    }),
    await runEditionWithChanges({
      store, desk, production, masters, releases, pack: b, editor, qaReviewer, releaseApprover,
      messagePrefix: 'm1-b',
      changeLines: [
        'Do not imply a US close; keep Asia-open framing.',
        'Emphasize energy marker as the Pakistan-relevant watchpoint.',
      ],
    }),
  ];

  if (editions[0].episodeId === editions[1].episodeId) throw new Error('editions not distinct');
  if (editions[0].scriptSha === editions[1].scriptSha) throw new Error('script hashes collided');
  if (editions[0].masterSha === editions[1].masterSha) throw new Error('master hashes collided');

  return {editions, dataDir};
}
