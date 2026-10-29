import {randomUUID} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {sha256Hex, stableStringify} from './hashing.mjs';
import {EpisodeState, spokenText} from './script-pack.mjs';

export class ProductionError extends Error {}

export class ProductionPipeline {
  constructor(store, ledger) {
    this.store = store;
    this.ledger = ledger;
    this.PROVIDER_VOICE = 'fixture-tts-v1';
    this.PROVIDER_FLOW = 'fixture-flow-v1';
  }

  async queueApproved(episodeId, version) {
    const pack = await this.store.loadPack(episodeId, version);
    if (pack.state !== EpisodeState.SCRIPT_APPROVED) {
      throw new ProductionError(`need SCRIPT_APPROVED, got ${pack.state}`);
    }
    return this.store.updateState(episodeId, version, EpisodeState.PRODUCTION_QUEUED);
  }

  async runVoiceAndFlow(episodeId, version) {
    const pack = await this.store.loadPack(episodeId, version);
    if (![EpisodeState.PRODUCTION_QUEUED, EpisodeState.MEDIA_READY].includes(pack.state)) {
      throw new ProductionError(`cannot produce from state ${pack.state}`);
    }
    const assets = [];
    const jobs = [];
    const voice = await this._produceVoice(pack);
    assets.push(voice.asset);
    jobs.push(voice.job);
    for (const scene of pack.broll) {
      const flow = await this._produceFlow(pack, scene.sceneId, scene.description, scene.targetDurationSec);
      assets.push(flow.asset);
      jobs.push(flow.job);
    }
    for (const chart of pack.charts) {
      assets.push(await this._writeGraphicsPlate(pack, chart.chartId, chart.title));
    }
    for (const asset of assets) await this.store.saveAsset(asset);
    for (const job of jobs) await this.store.saveJob(job);
    const updated = await this.store.updateState(episodeId, version, EpisodeState.MEDIA_READY);
    return {
      episodeId,
      version,
      state: updated.state,
      assets,
      jobs,
      costUsd: await this.ledger.settledTotal({episodeId, version}),
    };
  }

  async _mediaDir(pack) {
    const dir = this.store.mediaDir(pack.episodeId, pack.version);
    await mkdir(dir, {recursive: true});
    return dir;
  }

  async _produceVoice(pack) {
    const text = spokenText(pack.script);
    const key = `${pack.episodeId}/v${pack.version}/voice/${pack.scriptSha}/${this.PROVIDER_VOICE}`;
    const estimate = this.ledger.estimateVoice(text);
    const reservation = await this.ledger.reserve({
      episodeId: pack.episodeId, version: pack.version, stage: 'voice', sceneId: 'full-vo',
      idempotencyKey: key, estimatedUsd: estimate, provider: this.PROVIDER_VOICE,
    });
    const job = {
      jobId: randomUUID(), episodeId: pack.episodeId, version: pack.version, stage: 'voice', sceneId: 'full-vo',
      idempotencyKey: key, state: 'running', reservationId: reservation.reservationId, assetId: null,
      error: '', createdAt: new Date().toISOString(), finishedAt: '',
    };
    const payload = {
      kind: 'voice', provider: this.PROVIDER_VOICE, presenterId: pack.script.presenterId,
      language: pack.script.language, scriptSha: pack.scriptSha, text,
    };
    const raw = Buffer.from(stableStringify(payload) + '\n', 'utf8');
    const out = path.join(await this._mediaDir(pack), 'voice.tts.json');
    await writeFile(out, raw);
    const digest = sha256Hex(raw);
    const settled = await this.ledger.settle(reservation.reservationId, {
      actualUsd: estimate,
      receipt: `${this.PROVIDER_VOICE}:${digest.slice(0, 16)}`,
    });
    const asset = {
      assetId: randomUUID(), episodeId: pack.episodeId, version: pack.version, stage: 'voice', sceneId: 'full-vo',
      path: out, sha256: digest, bytes: raw.length, durationSec: pack.script.estimatedDurationSec,
      codec: 'fixture-tts+json', provider: this.PROVIDER_VOICE, providerRef: settled.receipt,
      rights: 'synthetic-fixture', createdAt: new Date().toISOString(),
    };
    job.state = 'succeeded';
    job.assetId = asset.assetId;
    job.finishedAt = new Date().toISOString();
    return {asset, job};
  }

  async _produceFlow(pack, sceneId, description, durationSec) {
    const key = `${pack.episodeId}/v${pack.version}/flow/${sceneId}/${pack.scriptSha}/${this.PROVIDER_FLOW}`;
    const estimate = this.ledger.estimateFlow(1);
    const reservation = await this.ledger.reserve({
      episodeId: pack.episodeId, version: pack.version, stage: 'flow', sceneId,
      idempotencyKey: key, estimatedUsd: estimate, provider: this.PROVIDER_FLOW,
    });
    const job = {
      jobId: randomUUID(), episodeId: pack.episodeId, version: pack.version, stage: 'flow', sceneId,
      idempotencyKey: key, state: 'running', reservationId: reservation.reservationId, assetId: null,
      error: '', createdAt: new Date().toISOString(), finishedAt: '',
    };
    const payload = {
      kind: 'flow-broll', provider: this.PROVIDER_FLOW, sceneId, description, durationSec,
      scriptSha: pack.scriptSha, lookId: pack.script.lookId,
    };
    const raw = Buffer.from(stableStringify(payload) + '\n', 'utf8');
    const out = path.join(await this._mediaDir(pack), `flow-${sceneId}.json`);
    await writeFile(out, raw);
    const digest = sha256Hex(raw);
    const settled = await this.ledger.settle(reservation.reservationId, {
      actualUsd: estimate,
      receipt: `${this.PROVIDER_FLOW}:${digest.slice(0, 16)}`,
    });
    const asset = {
      assetId: randomUUID(), episodeId: pack.episodeId, version: pack.version, stage: 'flow', sceneId,
      path: out, sha256: digest, bytes: raw.length, durationSec,
      codec: 'fixture-flow+json', provider: this.PROVIDER_FLOW, providerRef: settled.receipt,
      rights: 'synthetic-fixture', createdAt: new Date().toISOString(),
    };
    job.state = 'succeeded';
    job.assetId = asset.assetId;
    job.finishedAt = new Date().toISOString();
    return {asset, job};
  }

  async _writeGraphicsPlate(pack, chartId, title) {
    const payload = {
      kind: 'graphics', chartId, title, scriptSha: pack.scriptSha,
      claims: pack.claims.map(c => c.claimId),
    };
    const raw = Buffer.from(stableStringify(payload) + '\n', 'utf8');
    const out = path.join(await this._mediaDir(pack), `gfx-${chartId}.json`);
    await writeFile(out, raw);
    const digest = sha256Hex(raw);
    return {
      assetId: randomUUID(), episodeId: pack.episodeId, version: pack.version, stage: 'graphics', sceneId: chartId,
      path: out, sha256: digest, bytes: raw.length, durationSec: 6,
      codec: 'fixture-gfx+json', provider: 'fixture-graphics-v1', providerRef: `gfx:${digest.slice(0, 16)}`,
      rights: 'deterministic-internal', createdAt: new Date().toISOString(),
    };
  }
}
