import {randomUUID} from 'node:crypto';
import {mkdir, readFile, writeFile, appendFile, access} from 'node:fs/promises';
import path from 'node:path';
import {sha256Hex} from './hashing.mjs';

export class BudgetError extends Error {}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

export class CostLedger {
  constructor(root, rates = {}) {
    this.root = root;
    this.rates = {
      voicePer1kCharsUsd: 0.016,
      flowPerClipUsd: 0.45,
      editAssembleUsd: 0.05,
      dailyCapUsd: 25,
      monthlyCapUsd: 400,
      ...rates,
    };
    this.path = path.join(root, 'cost_log.jsonl');
    this.capsPath = path.join(root, 'caps.json');
  }

  async init() {
    await mkdir(this.root, {recursive: true});
    if (!(await exists(this.capsPath))) {
      const now = new Date();
      await writeFile(this.capsPath, JSON.stringify({
        dailyCapUsd: this.rates.dailyCapUsd,
        monthlyCapUsd: this.rates.monthlyCapUsd,
        spentTodayUsd: 0,
        spentMonthUsd: 0,
        day: now.toISOString().slice(0, 10),
        month: now.toISOString().slice(0, 7),
      }, null, 2) + '\n', 'utf8');
    }
    return this;
  }

  async _caps() {
    const caps = JSON.parse(await readFile(this.capsPath, 'utf8'));
    const day = new Date().toISOString().slice(0, 10);
    const month = new Date().toISOString().slice(0, 7);
    if (caps.day !== day) { caps.day = day; caps.spentTodayUsd = 0; }
    if (caps.month !== month) { caps.month = month; caps.spentMonthUsd = 0; }
    return caps;
  }

  async _saveCaps(caps) {
    await writeFile(this.capsPath, JSON.stringify(caps, null, 2) + '\n', 'utf8');
  }

  async _rows() {
    if (!(await exists(this.path))) return [];
    return (await readFile(this.path, 'utf8'))
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
  }

  async _rewrite(rows) {
    await writeFile(this.path, rows.map(r => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''), 'utf8');
  }

  async openReservations() {
    return (await this._rows())
      .filter(r => r.status === 'reserved')
      .reduce((sum, r) => sum + Number(r.reservedUsd), 0);
  }

  async settledTotal({episodeId = null, version = null} = {}) {
    return (await this._rows())
      .filter(r => r.status === 'settled')
      .filter(r => !episodeId || r.episodeId === episodeId)
      .filter(r => version == null || Number(r.version) === version)
      .reduce((sum, r) => sum + Number(r.actualUsd || 0), 0);
  }

  estimateVoice(text) {
    const chars = Math.max(String(text).length, 1);
    return Number(((chars / 1000) * this.rates.voicePer1kCharsUsd).toFixed(6));
  }

  estimateFlow(clipCount) {
    return Number((clipCount * this.rates.flowPerClipUsd).toFixed(6));
  }

  estimateEdit() {
    return this.rates.editAssembleUsd;
  }

  async reserve({episodeId, version, stage, sceneId, idempotencyKey, estimatedUsd, provider}) {
    const rows = await this._rows();
    const existing = rows.find(r => r.idempotencyKey === idempotencyKey);
    if (existing) return existing;

    const caps = await this._caps();
    const open = await this.openReservations();
    if (caps.spentTodayUsd + open + estimatedUsd > caps.dailyCapUsd) {
      throw new BudgetError(`daily cap blocked: stage=${stage} scene=${sceneId}`);
    }
    if (caps.spentMonthUsd + open + estimatedUsd > caps.monthlyCapUsd) {
      throw new BudgetError(`monthly cap blocked: stage=${stage} scene=${sceneId}`);
    }

    const reservation = {
      reservationId: randomUUID(),
      episodeId,
      version,
      stage,
      sceneId,
      idempotencyKey,
      estimatedUsd,
      reservedUsd: estimatedUsd,
      actualUsd: null,
      currency: 'USD',
      provider,
      status: 'reserved',
      receipt: `reserve:${idempotencyKey}`,
      createdAt: new Date().toISOString(),
      settledAt: '',
    };
    await appendFile(this.path, JSON.stringify(reservation) + '\n', 'utf8');
    return reservation;
  }

  async settle(reservationId, {actualUsd, receipt}) {
    const rows = await this._rows();
    const found = rows.find(r => r.reservationId === reservationId);
    if (!found) throw new BudgetError(`unknown reservation ${reservationId}`);
    if (found.status === 'settled') return found;
    found.status = 'settled';
    found.actualUsd = Number(actualUsd);
    found.receipt = receipt;
    found.settledAt = new Date().toISOString();
    await this._rewrite(rows);
    const caps = await this._caps();
    caps.spentTodayUsd = Number((caps.spentTodayUsd + Number(actualUsd)).toFixed(6));
    caps.spentMonthUsd = Number((caps.spentMonthUsd + Number(actualUsd)).toFixed(6));
    await this._saveCaps(caps);
    return found;
  }

  async costLogSha() {
    const raw = (await exists(this.path)) ? await readFile(this.path) : Buffer.alloc(0);
    return sha256Hex(raw);
  }

  async exportEpisodeCosts(episodeId, version) {
    return (await this._rows())
      .filter(r => r.episodeId === episodeId && Number(r.version) === version);
  }
}
