import {randomUUID} from 'node:crypto';
import {EpisodeState} from './script-pack.mjs';

export class ReleaseError extends Error {}

export class ReleaseGate {
  constructor(store, ledger) {
    this.store = store;
    this.ledger = ledger;
  }

  async release(episodeId, version, {qaReviewer, releaseApprover, expectedMasterSha = null}) {
    const pack = await this.store.loadPack(episodeId, version);
    if (pack.state !== EpisodeState.RELEASE_PENDING) {
      throw new ReleaseError(`need RELEASE_PENDING, got ${pack.state}`);
    }
    const master = await this.store.loadMaster(episodeId, version);
    if (master.scriptSha !== pack.scriptSha) throw new ReleaseError('master scriptSha does not match pack');
    if (expectedMasterSha && expectedMasterSha !== master.masterSha) {
      throw new ReleaseError('exact master SHA mismatch — refusing release');
    }
    const qa = await this.store.loadQa(episodeId, version);
    if (qa.status !== 'QA_PASSED' || qa.masterSha !== master.masterSha) {
      throw new ReleaseError('QA gate failed for this exact master');
    }
    const costRows = await this.ledger.exportEpisodeCosts(episodeId, version);
    if (!costRows.length) throw new ReleaseError('missing real cost logs for release');
    if (costRows.some(r => r.status !== 'settled')) throw new ReleaseError('unsettled reservations remain');

    const costTotalUsd = await this.ledger.settledTotal({episodeId, version});
    const now = new Date();
    const record = {
      releaseId: randomUUID(),
      episodeId,
      version,
      scriptSha: pack.scriptSha,
      masterSha: master.masterSha,
      audioSha: master.audioSha,
      sceneShas: {...master.sceneShas},
      qaReviewer,
      releaseApprover,
      costTotalUsd: Number(costTotalUsd.toFixed(6)),
      costLogSha: await this.ledger.costLogSha(),
      releasedAt: now.toISOString(),
      repeatValidUntil: new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString(),
      status: 'RELEASED',
    };
    await this.store.saveRelease(record);
    await this.store.updateState(episodeId, version, EpisodeState.RELEASED);
    return record;
  }
}
