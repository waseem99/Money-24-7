import {sha256Hex, shortToken} from './hashing.mjs';

export class ScriptPackError extends Error {}

const STATES = {
  SCRIPT_DRAFT: 'SCRIPT_DRAFT',
  REVIEW_PENDING: 'REVIEW_PENDING',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  SCRIPT_APPROVED: 'SCRIPT_APPROVED',
  PRODUCTION_QUEUED: 'PRODUCTION_QUEUED',
  MEDIA_READY: 'MEDIA_READY',
  EDIT_READY: 'EDIT_READY',
  QA_PASSED: 'QA_PASSED',
  RELEASE_PENDING: 'RELEASE_PENDING',
  RELEASED: 'RELEASED',
  BLOCKED: 'BLOCKED',
  FAILED: 'FAILED',
};

export {STATES as EpisodeState};

function require(condition, message) {
  if (!condition) throw new ScriptPackError(message);
}

export function spokenText(script) {
  return `${script.opening.trim()}\n\n${script.body.trim()}\n\n${script.closing.trim()}`.trim();
}

export function validatePackInputs({
  episodeId, programme, edition, broadcastDate, script, sources, claims, charts = [], broll = [], sourceCutoff, sourceExpiry,
}) {
  require(Boolean(episodeId?.trim()), 'episodeId required');
  require(Boolean(programme?.trim()), 'programme required');
  require(Boolean(edition?.trim()), 'edition required');
  require(Boolean(broadcastDate?.trim()), 'broadcastDate required');
  require(script.estimatedDurationSec > 0, 'estimatedDurationSec must be positive');
  require(Boolean(spokenText(script)), 'script text required');
  require(sources.length > 0, 'at least one source required');
  require(claims.length > 0, 'at least one claim required');

  const sourceIds = new Set(sources.map(s => s.sourceId));
  require(sourceIds.size === sources.length, 'duplicate sourceId');
  const claimIds = new Set(claims.map(c => c.claimId));
  require(claimIds.size === claims.length, 'duplicate claimId');

  for (const claim of claims) {
    require(['fact', 'analysis', 'illustrative'].includes(claim.kind), `bad claim kind: ${claim.kind}`);
    const missing = claim.sourceIds.filter(id => !sourceIds.has(id));
    require(!missing.length, `claim ${claim.claimId} references unknown sources: ${missing}`);
    if (claim.kind === 'fact' && claim.numericValue != null) {
      require(claim.sourceIds.length > 0, `numeric fact ${claim.claimId} needs sources`);
    }
  }
  for (const chart of charts) {
    const missing = chart.claimIds.filter(id => !claimIds.has(id));
    require(!missing.length, `chart ${chart.chartId} references unknown claims: ${missing}`);
  }
  require(Boolean(sourceCutoff), 'sourceCutoff required');
  require(Boolean(sourceExpiry), 'sourceExpiry required');
  require(sourceCutoff <= sourceExpiry, 'sourceCutoff must be <= sourceExpiry');
}

export function contentFingerprint(input) {
  const {
    episodeId, programme, edition, broadcastDate, version, script, sources, claims, charts = [], broll = [],
    sourceCutoff, sourceExpiry, timezone = 'Asia/Karachi',
  } = input;
  return sha256Hex({
    episodeId, programme, edition, broadcastDate, version, timezone, sourceCutoff, sourceExpiry,
    script: {
      language: script.language,
      opening: script.opening,
      body: script.body,
      closing: script.closing,
      estimatedDurationSec: script.estimatedDurationSec,
      presenterId: script.presenterId,
      lookId: script.lookId,
    },
    sources,
    claims: claims.map(c => ({...c, sourceIds: [...c.sourceIds]})),
    charts: charts.map(c => ({chartId: c.chartId, title: c.title, claimIds: [...c.claimIds], note: c.note || ''})),
    broll,
  });
}

export function buildScriptVersion(input) {
  const {
    episodeId, programme, edition, broadcastDate, version, script, sources, claims,
    charts = [], broll = [], sourceCutoff, sourceExpiry, timezone = 'Asia/Karachi',
    state = STATES.SCRIPT_DRAFT, changeNotes = [], createdAt = new Date().toISOString(),
  } = input;
  validatePackInputs({
    episodeId, programme, edition, broadcastDate, script, sources, claims, charts, broll, sourceCutoff, sourceExpiry,
  });
  const scriptSha = contentFingerprint({
    episodeId, programme, edition, broadcastDate, version, script, sources, claims, charts, broll, sourceCutoff, sourceExpiry, timezone,
  });
  return {
    episodeId, programme, edition, broadcastDate, version, state, scriptSha,
    hashToken: shortToken(scriptSha),
    sourceCutoff, sourceExpiry, timezone, script, sources, claims, charts, broll,
    changeNotes: [...changeNotes], createdAt,
  };
}

export function reviseFromChanges(current, {requestedChanges, script, sources, claims, charts, broll, sourceCutoff, sourceExpiry}) {
  require(requestedChanges?.length, 'requestedChanges required');
  const notes = [
    ...current.changeNotes,
    `v${current.version} → v${current.version + 1}: ${requestedChanges.join('; ')}`,
  ];
  return buildScriptVersion({
    episodeId: current.episodeId,
    programme: current.programme,
    edition: current.edition,
    broadcastDate: current.broadcastDate,
    version: current.version + 1,
    script: script || current.script,
    sources: sources || current.sources,
    claims: claims || current.claims,
    charts: charts || current.charts,
    broll: broll || current.broll,
    sourceCutoff: sourceCutoff || current.sourceCutoff,
    sourceExpiry: sourceExpiry || current.sourceExpiry,
    timezone: current.timezone,
    state: STATES.SCRIPT_DRAFT,
    changeNotes: notes,
  });
}

function esc(s) {
  return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

export function renderReviewHtml(pack) {
  const sourceRows = pack.sources.map(s =>
    `<tr><td>${esc(s.sourceId)}</td><td>${esc(s.title)}</td><td><a href="${esc(s.url)}">${esc(s.url)}</a></td><td>${esc(s.observedAt)}</td><td>${esc(s.rights)}</td></tr>`
  ).join('');
  const claimRows = pack.claims.map(c =>
    `<tr><td>${esc(c.claimId)}</td><td>${esc(c.kind)}</td><td>${esc(c.text)}</td><td>${esc(c.sourceIds.join(', '))}</td></tr>`
  ).join('');
  const changes = pack.changeNotes.length
    ? pack.changeNotes.map(n => `<li>${esc(n)}</li>`).join('')
    : '<li>None</li>';
  const spoken = esc(spokenText(pack.script)).replaceAll('\n', '<br/>');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>${esc(pack.programme)} / ${esc(pack.edition)} v${pack.version}</title></head>
<body>
  <h1>${esc(pack.programme)} — ${esc(pack.edition)}</h1>
  <p>Episode <code>${esc(pack.episodeId)}</code> · date ${esc(pack.broadcastDate)} · version <strong>v${String(pack.version).padStart(2, '0')}</strong></p>
  <p>Script SHA <code>${esc(pack.scriptSha)}</code> · hash token <code>${esc(pack.hashToken)}</code></p>
  <p>Source cutoff ${esc(pack.sourceCutoff)} · expiry ${esc(pack.sourceExpiry)} · TZ ${esc(pack.timezone)}</p>
  <p>Presenter ${esc(pack.script.presenterId)} / look ${esc(pack.script.lookId)} · est. ${pack.script.estimatedDurationSec}s · lang ${esc(pack.script.language)}</p>
  <h2>Script</h2><p>${spoken}</p>
  <h2>Source ledger</h2>
  <table border="1" cellpadding="6"><thead><tr><th>ID</th><th>Title</th><th>URL</th><th>Observed</th><th>Rights</th></tr></thead><tbody>${sourceRows}</tbody></table>
  <h2>Claims</h2>
  <table border="1" cellpadding="6"><thead><tr><th>ID</th><th>Kind</th><th>Text</th><th>Sources</th></tr></thead><tbody>${claimRows}</tbody></table>
  <h2>Change history</h2><ul>${changes}</ul>
</body></html>`;
}

export function reviewEmailSubject(pack) {
  return `[MarketWatch REVIEW] ${pack.broadcastDate} / ${pack.programme} / ${pack.edition} / v${String(pack.version).padStart(2, '0')}`;
}

export function reviewEmailBody(pack, reviewUrl = 'https://review.local/pack') {
  return `Please review this exact pack.
Review page: ${reviewUrl}?episode=${pack.episodeId}&v=${pack.version}&h=${pack.hashToken}

Reply with ONE top-level command:
APPROVE SCRIPT ${pack.episodeId} ${pack.version} ${pack.hashToken}
or
CHANGES SCRIPT ${pack.episodeId} ${pack.version} ${pack.hashToken}
Then list requested changes on subsequent lines.
`;
}
