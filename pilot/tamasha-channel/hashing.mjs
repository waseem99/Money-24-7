import {createHash} from 'node:crypto';

/** Deterministic JSON for hashing (sorted keys, no whitespace). */
export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

export function sha256Hex(payload) {
  const raw = Buffer.isBuffer(payload) ? payload : Buffer.from(stableStringify(payload), 'utf8');
  return createHash('sha256').update(raw).digest('hex');
}

export function shortToken(scriptSha, length = 12) {
  return scriptSha.slice(0, length);
}
