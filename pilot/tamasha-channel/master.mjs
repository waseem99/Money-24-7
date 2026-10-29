import {randomUUID} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {sha256Hex, stableStringify} from './hashing.mjs';
import {EpisodeState, spokenText} from './script-pack.mjs';

export class MasterError extends Error {}

export class MasterBuilder {
  constructor(store, ledger) {
    this.store = store;
    this.ledger = ledger;
  }

  async assemble(episodeId, version) {
    const pack = await this.store.loadPack(episodeId, version);
    if (![EpisodeState.MEDIA_READY, EpisodeState.EDIT_READY, EpisodeState.QA_PASSED].includes(pack.state)) {
      throw new MasterError(`need MEDIA_READY+, got ${pack.state}`);
    }
    const assets = await this.store.listAssets(episodeId, version);
    const voice = assets.find(a => a.stage === 'voice' && a.sceneId === 'full-vo');
    if (!voice) throw new MasterError('missing voice asset');
    const sceneShas = Object.fromEntries(
      assets.filter(a => a.stage === 'flow' || a.stage === 'graphics').map(a => [a.sceneId, a.sha256]),
    );
    if (!Object.keys(sceneShas).length) throw new MasterError('no scene assets for master');

    const key = `${episodeId}/v${version}/edit/${pack.scriptSha}/${voice.sha256}`;
    const estimate = this.ledger.estimateEdit();
    const reservation = await this.ledger.reserve({
      episodeId, version, stage: 'edit', sceneId: 'master',
      idempotencyKey: key, estimatedUsd: estimate, provider: 'fixture-edit-v1',
    });

    await this.store.updateState(episodeId, version, EpisodeState.EDIT_READY);
    const mediaDir = this.store.mediaDir(episodeId, version);
    await mkdir(mediaDir, {recursive: true});
    const masterPath = path.join(mediaDir, 'master.mp4.json');
    const captionsPath = path.join(mediaDir, 'captions.vtt');
    const captions = vttFromScript(spokenText(pack.script), pack.script.estimatedDurationSec);
    await writeFile(captionsPath, captions, 'utf8');

    const masterDoc = {
      kind: 'master-bundle',
      episodeId, version,
      programme: pack.programme,
      edition: pack.edition,
      scriptSha: pack.scriptSha,
      audioSha: voice.sha256,
      sceneShas,
      width: 1920, height: 1080, fps: 25,
      durationSec: pack.script.estimatedDurationSec,
      ticker: null,
      captionsSha: sha256Hex(Buffer.from(captions, 'utf8')),
      assets,
    };
    const raw = Buffer.from(stableStringify(masterDoc) + '\n', 'utf8');
    await writeFile(masterPath, raw);
    const masterSha = sha256Hex(raw);
    await this.ledger.settle(reservation.reservationId, {
      actualUsd: estimate,
      receipt: `fixture-edit-v1:${masterSha.slice(0, 16)}`,
    });

    const bundle = {
      episodeId, version,
      scriptSha: pack.scriptSha,
      audioSha: voice.sha256,
      sceneShas,
      masterSha,
      masterPath,
      captionsPath,
      durationSec: pack.script.estimatedDurationSec,
      width: 1920, height: 1080, fps: 25,
      createdAt: new Date().toISOString(),
    };
    await this.store.saveMaster(bundle);
    await this.store.saveQa(episodeId, version, {
      episodeId, version, masterSha,
      checks: {
        hasVoice: true, hasScenes: true, noLiveTicker: true,
        durationSec: bundle.durationSec, resolution: '1920x1080', fps: 25,
      },
      status: 'QA_PASSED',
      at: new Date().toISOString(),
      qaId: randomUUID(),
    });
    await this.store.updateState(episodeId, version, EpisodeState.QA_PASSED);
    await this.store.updateState(episodeId, version, EpisodeState.RELEASE_PENDING);
    return bundle;
  }
}

function vttFromScript(text, durationSec) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const parts = lines.length ? lines : [text];
  const slot = Math.max(durationSec / parts.length, 1);
  const out = ['WEBVTT', ''];
  let t = 0;
  parts.forEach((line, i) => {
    const start = ts(t);
    const end = ts(Math.min(t + slot, durationSec));
    out.push(String(i + 1), `${start} --> ${end}`, line, '');
    t += slot;
  });
  return out.join('\n');
}

function ts(seconds) {
  const ms = Math.round(seconds * 1000);
  const h = Math.floor(ms / 3_600_000);
  const rem = ms % 3_600_000;
  const m = Math.floor(rem / 60_000);
  const rem2 = rem % 60_000;
  const s = Math.floor(rem2 / 1000);
  const milli = rem2 % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(milli).padStart(3, '0')}`;
}
