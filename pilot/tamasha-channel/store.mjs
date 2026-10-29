import {mkdir, readFile, writeFile, readdir, access} from 'node:fs/promises';
import path from 'node:path';
import {renderReviewHtml} from './script-pack.mjs';

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

export class FileStore {
  constructor(root) {
    this.root = root;
    this.episodes = path.join(root, 'episodes');
    this.reviews = path.join(root, 'reviews');
    this.outbox = path.join(root, 'outbox');
    this.media = path.join(root, 'media');
    this.costs = path.join(root, 'costs');
    this.releases = path.join(root, 'releases');
  }

  async init() {
    for (const p of [this.episodes, this.reviews, this.outbox, this.media, this.costs, this.releases]) {
      await mkdir(p, {recursive: true});
    }
    return this;
  }

  episodeDir(episodeId) {
    return path.join(this.episodes, episodeId);
  }

  mediaDir(episodeId, version) {
    return path.join(this.media, episodeId, `v${String(version).padStart(2, '0')}`);
  }

  async savePack(pack) {
    const ed = this.episodeDir(pack.episodeId);
    await mkdir(ed, {recursive: true});
    const versionPath = path.join(ed, `v${String(pack.version).padStart(2, '0')}.json`);
    await writeFile(versionPath, JSON.stringify(pack, null, 2) + '\n', 'utf8');
    await writeFile(
      path.join(ed, `v${String(pack.version).padStart(2, '0')}.review.html`),
      renderReviewHtml(pack),
      'utf8',
    );
    await writeFile(
      path.join(ed, 'latest.json'),
      JSON.stringify({episodeId: pack.episodeId, version: pack.version}, null, 2) + '\n',
      'utf8',
    );
    return versionPath;
  }

  async loadPack(episodeId, version = null) {
    const ed = this.episodeDir(episodeId);
    let v = version;
    if (v == null) {
      const latest = JSON.parse(await readFile(path.join(ed, 'latest.json'), 'utf8'));
      v = latest.version;
    }
    const p = path.join(ed, `v${String(v).padStart(2, '0')}.json`);
    if (!(await exists(p))) throw new Error(`missing pack ${episodeId} v${v}`);
    return JSON.parse(await readFile(p, 'utf8'));
  }

  async listVersions(episodeId) {
    const ed = this.episodeDir(episodeId);
    if (!(await exists(ed))) return [];
    const names = await readdir(ed);
    return names
      .map(n => n.match(/^v(\d+)\.json$/))
      .filter(Boolean)
      .map(m => Number(m[1]))
      .sort((a, b) => a - b);
  }

  async updateState(episodeId, version, state) {
    const pack = await this.loadPack(episodeId, version);
    pack.state = state;
    await this.savePack(pack);
    return pack;
  }

  async saveDecision(decision) {
    const p = path.join(this.reviews, `${decision.messageId}.json`);
    if (await exists(p)) return p;
    await writeFile(p, JSON.stringify(decision, null, 2) + '\n', 'utf8');
    await writeFile(
      path.join(this.outbox, `${decision.decisionId}.json`),
      JSON.stringify({
        type: 'review_decision',
        decisionId: decision.decisionId,
        episodeId: decision.episodeId,
        version: decision.version,
        command: decision.command,
        accepted: decision.accepted,
      }, null, 2) + '\n',
      'utf8',
    );
    return p;
  }

  async getDecisionByMessage(messageId) {
    const p = path.join(this.reviews, `${messageId}.json`);
    if (!(await exists(p))) return null;
    return JSON.parse(await readFile(p, 'utf8'));
  }

  async saveAsset(asset) {
    const d = path.join(this.mediaDir(asset.episodeId, asset.version), 'assets');
    await mkdir(d, {recursive: true});
    const p = path.join(d, `${asset.stage}-${asset.sceneId}.json`);
    await writeFile(p, JSON.stringify(asset, null, 2) + '\n', 'utf8');
    return p;
  }

  async listAssets(episodeId, version) {
    const d = path.join(this.mediaDir(episodeId, version), 'assets');
    if (!(await exists(d))) return [];
    const names = (await readdir(d)).filter(n => n.endsWith('.json')).sort();
    return Promise.all(names.map(async n => JSON.parse(await readFile(path.join(d, n), 'utf8'))));
  }

  async saveJob(job) {
    const d = path.join(this.mediaDir(job.episodeId, job.version), 'jobs');
    await mkdir(d, {recursive: true});
    const p = path.join(d, `${job.stage}-${job.sceneId}.json`);
    await writeFile(p, JSON.stringify(job, null, 2) + '\n', 'utf8');
    return p;
  }

  async saveMaster(master) {
    const d = this.mediaDir(master.episodeId, master.version);
    await mkdir(d, {recursive: true});
    const p = path.join(d, 'master-bundle.json');
    await writeFile(p, JSON.stringify(master, null, 2) + '\n', 'utf8');
    return p;
  }

  async loadMaster(episodeId, version) {
    const p = path.join(this.mediaDir(episodeId, version), 'master-bundle.json');
    if (!(await exists(p))) throw new Error(`missing master ${episodeId} v${version}`);
    return JSON.parse(await readFile(p, 'utf8'));
  }

  async saveQa(episodeId, version, qa) {
    const d = this.mediaDir(episodeId, version);
    await mkdir(d, {recursive: true});
    const p = path.join(d, 'qa.json');
    await writeFile(p, JSON.stringify(qa, null, 2) + '\n', 'utf8');
    return p;
  }

  async loadQa(episodeId, version) {
    const p = path.join(this.mediaDir(episodeId, version), 'qa.json');
    if (!(await exists(p))) throw new Error(`missing qa ${episodeId} v${version}`);
    return JSON.parse(await readFile(p, 'utf8'));
  }

  async saveRelease(release) {
    await mkdir(this.releases, {recursive: true});
    const p = path.join(this.releases, `${release.episodeId}-v${String(release.version).padStart(2, '0')}.json`);
    await writeFile(p, JSON.stringify(release, null, 2) + '\n', 'utf8');
    await writeFile(
      path.join(this.outbox, `release-${release.releaseId}.json`),
      JSON.stringify({type: 'release', ...release}, null, 2) + '\n',
      'utf8',
    );
    return p;
  }

  async loadRelease(episodeId, version) {
    const p = path.join(this.releases, `${episodeId}-v${String(version).padStart(2, '0')}.json`);
    if (!(await exists(p))) throw new Error(`missing release ${episodeId} v${version}`);
    return JSON.parse(await readFile(p, 'utf8'));
  }
}
