import {randomUUID} from 'node:crypto';
import {EpisodeState} from './script-pack.mjs';

export class ReviewError extends Error {}

const COMMAND_RE = /^(APPROVE|CHANGES)\s+SCRIPT\s+(\S+)\s+(\d+)\s+([0-9a-f]{8,64})\s*$/i;

function isQuotedOrNoise(line) {
  const lower = line.toLowerCase();
  if (line.startsWith('>') || line.startsWith('|')) return true;
  if (lower.startsWith('on ') && lower.includes(' wrote:')) return true;
  if (lower.startsWith('from:') || lower.startsWith('sent:')) return true;
  if (lower.startsWith('-----original message-----')) return true;
  return false;
}

export function parseReviewEmailBody(body) {
  const lines = body.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let command = null;
  const changeLines = [];
  let collectingChanges = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (isQuotedOrNoise(line)) continue;
    const match = line.match(COMMAND_RE);
    if (match) {
      if (command) return null; // conflicting second command
      command = {
        command: match[1].toUpperCase(),
        episodeId: match[2],
        version: Number(match[3]),
        hashToken: match[4].toLowerCase(),
        requestedChanges: [],
      };
      collectingChanges = command.command === 'CHANGES';
      continue;
    }
    if (collectingChanges && command) changeLines.push(line);
  }

  if (!command) return null;
  if (command.command === 'CHANGES') {
    return {...command, requestedChanges: changeLines};
  }
  return command;
}

export function applyInboundReview({pack, email, editorAllowlist, reviewSentAt = null}) {
  const at = new Date().toISOString();
  const sender = email.fromEmail.trim().toLowerCase();
  const allow = new Set([...editorAllowlist].map(e => e.toLowerCase()));

  const reject = (reason, command = 'PENDING_MANUAL') => ({
    decisionId: randomUUID(),
    episodeId: pack.episodeId,
    version: pack.version,
    hashToken: pack.hashToken,
    command,
    reviewerEmail: sender,
    messageId: email.messageId,
    requestedChanges: [],
    at,
    accepted: false,
    reason,
  });

  if (!email.authenticated) return reject('untrusted authentication metadata');
  if (!allow.has(sender)) return reject('sender not on editor allowlist');
  if (reviewSentAt && email.receivedAt < reviewSentAt) return reject('message timestamp before review request');

  const parsed = parseReviewEmailBody(email.body);
  if (!parsed) return reject('no clear top-level command / ambiguous or conflicting prose');
  if (parsed.episodeId !== pack.episodeId) return reject('episodeId mismatch', parsed.command);
  if (parsed.version !== pack.version) return reject('stale or wrong version', parsed.command);
  if (parsed.hashToken !== pack.hashToken) return reject('hash token mismatch', parsed.command);
  if (![EpisodeState.REVIEW_PENDING, EpisodeState.CHANGES_REQUESTED].includes(pack.state)) {
    return reject(`pack state ${pack.state} not awaiting review`, parsed.command);
  }
  if (parsed.command === 'CHANGES' && !parsed.requestedChanges.length) {
    return reject('CHANGES requires requested change lines', 'CHANGES');
  }

  return {
    decisionId: randomUUID(),
    episodeId: pack.episodeId,
    version: pack.version,
    hashToken: pack.hashToken,
    command: parsed.command,
    reviewerEmail: sender,
    messageId: email.messageId,
    requestedChanges: [...parsed.requestedChanges],
    at,
    accepted: true,
    reason: 'accepted',
  };
}
