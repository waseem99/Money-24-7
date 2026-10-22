import { digest } from './core.mjs';

const need = (ok, message) => { if (!ok) throw new Error(message); };
const text = value => typeof value === 'string' && value.trim().length > 0;
const day = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const key = item => JSON.stringify([item.episode_id, item.host_id]);
const approved = item => item?.status === 'APPROVED' && text(item.approval_ref);

export const WARDROBE_POLICY = Object.freeze({
  unique_outfit_per_host_per_day: true,
  avoid_previous_broadcast_days: 1,
  preserve_outfit_on_retry: true,
});

export function emptyWardrobeLedger() { return { schema: 1, assignments: [] }; }

function validateCatalogue(catalogue) {
  need(catalogue?.schema === 1 && catalogue.timezone === 'Asia/Karachi', 'Invalid wardrobe catalogue/timezone');
  need(Array.isArray(catalogue.hosts), 'Wardrobe hosts required');
  need(new Set(catalogue.hosts.map(h => h.host_id)).size === catalogue.hosts.length, 'Duplicate wardrobe host');
  const policy = { ...WARDROBE_POLICY, ...catalogue.policy };
  need(policy.unique_outfit_per_host_per_day === true && policy.preserve_outfit_on_retry === true,
    'Daily outfit uniqueness and retry continuity are mandatory');
  need(Number.isInteger(policy.avoid_previous_broadcast_days) && policy.avoid_previous_broadcast_days >= 1
    && policy.avoid_previous_broadcast_days <= 14, 'Previous broadcast-day window must be 1–14');
  const providerLooks = new Set();
  for (const host of catalogue.hosts) {
    need(text(host.host_id) && Array.isArray(host.looks), 'Invalid wardrobe host');
    need(new Set(host.looks.map(l => l.look_id)).size === host.looks.length, 'Duplicate look ID');
    for (const look of host.looks) {
      need(text(look.look_id) && text(look.outfit_id) && text(look.label), 'Look ID, outfit ID and readable label required');
      need(Array.isArray(look.programmes) && look.programmes.length > 0 && look.programmes.every(text), 'Look programme eligibility required');
      if (approved(look) && text(look.provider_avatar_id)) {
        need(!providerLooks.has(look.provider_avatar_id), 'A provider look cannot be registered as multiple outfits/hosts');
        providerLooks.add(look.provider_avatar_id);
      }
    }
  }
  return policy;
}

function usable(host, look) {
  return approved(host) && text(host.avatar_identity_id) && text(host.voice_id) && text(host.language)
    && approved(look) && look.qa_passed === true && text(look.provider_avatar_id)
    && look.avatar_identity_id === host.avatar_identity_id;
}
const fits = (look, request) => look.programmes.includes('*') || look.programmes.includes(request.programme);
function asset(host, look) {
  return { avatar_identity_id: host.avatar_identity_id, voice_id: host.voice_id, language: host.language,
    look_id: look.look_id, provider_avatar_id: look.provider_avatar_id, outfit_id: look.outfit_id,
    outfit_label: look.label, identity_approval_ref: host.approval_ref, look_approval_ref: look.approval_ref };
}

function validateLedger(ledger) {
  need(ledger?.schema === 1 && Array.isArray(ledger.assignments), 'Invalid wardrobe ledger');
  const keys = new Set(), outfits = new Set();
  for (const a of ledger.assignments) {
    need(text(a.episode_id) && text(a.host_id) && text(a.programme) && text(a.script_hash) && day(a.broadcast_date)
      && text(a.outfit_id) && text(a.asset_signature), 'Invalid saved wardrobe assignment');
    need(!keys.has(key(a)), 'Duplicate saved episode/host'); keys.add(key(a));
    const outfitKey = JSON.stringify([a.host_id, a.broadcast_date, a.outfit_id]);
    need(!outfits.has(outfitKey), 'Saved wardrobe repeats an outfit within a host/day'); outfits.add(outfitKey);
  }
}

// Pure, atomic planning: nothing is committed if any requested episode cannot be dressed.
// A persistent reservation counts as usage even before rendering, preventing concurrent
// productions from claiming the same outfit. The CLI serializes writes to one ledger.
export function planWardrobe(requests, catalogue, ledger = emptyWardrobeLedger()) {
  const policy = validateCatalogue(catalogue); validateLedger(ledger);
  need(Array.isArray(requests) && requests.length > 0, 'At least one episode appearance required');
  need(new Set(requests.map(key)).size === requests.length, 'Duplicate episode/host request');
  const hosts = new Map(catalogue.hosts.map(h => [h.host_id, h]));
  const next = structuredClone(ledger), assigned = new Map(next.assignments.map(a => [key(a), a]));
  const pending = [];
  for (const request of requests) {
    need(text(request.episode_id) && text(request.host_id) && text(request.programme)
      && text(request.script_hash) && day(request.broadcast_date), 'Episode, host, programme, script hash and broadcast date required');
    const host = hosts.get(request.host_id);
    need(host && approved(host) && host.language === request.language, `Approved identity/voice needed for ${request.host_id}`);
    const previous = assigned.get(key(request));
    if (previous) {
      need(['script_hash', 'programme', 'broadcast_date'].every(k => previous[k] === request[k]),
        `Episode ${request.episode_id} changed after wardrobe reservation; use a new edition ID`);
      const look = host.looks.find(l => l.look_id === previous.look_id);
      need(look && usable(host, look) && fits(look, request) && digest(asset(host, look)) === previous.asset_signature,
        `Reserved look for ${request.episode_id} changed or is no longer approved; review required`);
      need(Object.entries(asset(host, look)).every(([k, v]) => previous[k] === v)
        && digest(previous.policy) === digest(policy), 'Saved wardrobe binding or policy changed; review required');
    } else pending.push(request);
  }

  // Stable chronological order; programme-constrained editions participate in a matching
  // problem so a general programme cannot consume another programme's only eligible look.
  const groups = new Map();
  for (const request of pending.sort((a, b) => a.broadcast_date.localeCompare(b.broadcast_date) || a.host_id.localeCompare(b.host_id) || a.episode_id.localeCompare(b.episode_id))) {
    const groupKey = JSON.stringify([request.broadcast_date, request.host_id]);
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(request);
  }
  for (const group of groups.values()) {
    const { host_id, broadcast_date } = group[0], host = hosts.get(host_id);
    const history = next.assignments.filter(a => a.host_id === host_id);
    need(!history.some(a => a.broadcast_date > broadcast_date),
      `Cannot insert an older wardrobe date for ${host_id}; review the existing schedule first`);
    const previousDays = [...new Set(history.filter(a => a.broadcast_date < broadcast_date).map(a => a.broadcast_date))]
      .sort().reverse().slice(0, policy.avoid_previous_broadcast_days);
    const forbidden = new Set(history.filter(a => a.broadcast_date === broadcast_date || previousDays.includes(a.broadcast_date)).map(a => a.outfit_id));
    const lastUsed = outfit => history.filter(a => a.outfit_id === outfit).map(a => a.broadcast_date).sort().at(-1) || '';
    const candidates = new Map(group.map(request => [key(request), host.looks
      .filter(l => usable(host, l) && fits(l, request) && !forbidden.has(l.outfit_id))
      .sort((a, b) => lastUsed(a.outfit_id).localeCompare(lastUsed(b.outfit_id)) || a.outfit_id.localeCompare(b.outfit_id) || a.look_id.localeCompare(b.look_id))]));
    const owners = new Map(), selections = new Map();
    function match(requestKey, seen) {
      for (const look of candidates.get(requestKey)) {
        if (seen.has(look.outfit_id)) continue;
        seen.add(look.outfit_id);
        const owner = owners.get(look.outfit_id);
        if (!owner || match(owner, seen)) {
          owners.set(look.outfit_id, requestKey); selections.set(requestKey, look); return true;
        }
      }
      return false;
    }
    for (const request of [...group].sort((a, b) => candidates.get(key(a)).length - candidates.get(key(b)).length || a.episode_id.localeCompare(b.episode_id))) {
      need(match(key(request), new Set()),
        `Wardrobe shortage for ${host_id} on ${broadcast_date}: ${group.length} new editions need distinct approved outfits outside the previous ${policy.avoid_previous_broadcast_days} broadcast day(s). No outfit was silently repeated.`);
    }
    for (const request of group) {
      const selected = asset(host, selections.get(key(request)));
      const record = { ...request, ...selected, asset_signature: digest(selected), policy: { ...policy } };
      next.assignments.push(record); assigned.set(key(record), record);
    }
  }
  return { ledger: next, assignments: requests.map(r => structuredClone(assigned.get(key(r)))), policy };
}

export function dressHandoff(handoff, catalogue, ledger) {
  need(handoff?.stage === 'PREPRODUCTION_ONLY' && handoff.render_authorized === false
    && handoff.paid_calls_authorized === false, 'Expected a no-spend editorial handoff');
  need(handoff.episodes.length > 0, 'No approved scripts to dress');
  need(handoff.episodes.every(e => !e.needs_source_refresh && !e.needs_date_refresh), 'Refresh expired/date-stale scripts before wardrobe allocation');
  need(handoff.episodes.every(e => e.hosts?.length && e.scenes.every(s => e.hosts.some(h => h.host_id === s.speaker))), 'Every scene needs a registered episode host');
  const requests = handoff.episodes.flatMap(e => e.hosts.map(host => ({
    episode_id: e.episode_id, script_hash: e.script_hash, programme: e.programme,
    broadcast_date: e.broadcast_date, host_id: host.host_id, language: host.language,
  })));
  const planned = planWardrobe(requests, catalogue, ledger);
  const output = structuredClone(handoff);
  output.wardrobe = { status: 'ASSIGNED', policy: planned.policy, assignment_hash: digest(planned.assignments) };
  for (const e of output.episodes) {
    e.wardrobe = planned.assignments.filter(a => a.episode_id === e.episode_id);
    for (const scene of e.scenes) scene.presenter = e.wardrobe.find(a => a.host_id === scene.speaker);
    e.blockers = e.blockers.filter(b => b !== 'Select and approve V11 avatar and voice');
  }
  return { ...planned, handoff: output };
}

// Human-readable output for production review; no JSON is needed by the reviewer.
export function wardrobeReviewHTML(handoff) {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rows = handoff.episodes.flatMap(e => (e.wardrobe || []).map(a => `<tr><td>${escape(e.broadcast_date)}</td><td>${escape(e.programme)}<small>${escape(e.episode_id)}</small></td><td>${escape(a.host_id)}</td><td>${escape(a.outfit_label)}</td></tr>`)).join('');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Tamasha wardrobe review</title><style>body{font:16px/1.5 system-ui,sans-serif;color:#15253a;max-width:1100px;margin:40px auto;padding:0 24px}h1{font-size:30px}table{width:100%;border-collapse:collapse}th,td{padding:14px;text-align:left;border-bottom:1px solid #ccd5df;vertical-align:top}th{background:#eef2f6}small{display:block;color:#526377}p{max-width:900px}@media print{body{margin:0;padding:0}tr{break-inside:avoid}}</style><h1>Daily presenter wardrobe</h1><p>Status: ${escape(handoff.wardrobe?.status || 'AWAITING_APPROVED_LOOKS')}. Each outfit stays fixed throughout its episode and on retries. These are production reservations, not records of programmes aired.</p>${handoff.wardrobe?.reason ? `<p>${escape(handoff.wardrobe.reason)}</p>` : ''}<table><thead><tr><th>Date</th><th>Programme / edition</th><th>Presenter</th><th>Outfit</th></tr></thead><tbody>${rows}</tbody></table><p>Wardrobe selection does not authorize rendering or publishing. Script freshness, measured timing, media rights and the production budget still follow the existing checks.</p></html>`;
}
