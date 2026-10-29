import {EpisodeState, reviseFromChanges, reviewEmailBody, reviewEmailSubject} from './script-pack.mjs';
import {ReviewError, applyInboundReview, parseReviewEmailBody} from './review.mjs';

export class DeskService {
  constructor(store, editorAllowlist) {
    this.store = store;
    this.editorAllowlist = new Set([...editorAllowlist].map(e => e.toLowerCase()));
    this.reviewSentAt = new Map();
  }

  async submitForReview(episodeId, version = null) {
    const pack = await this.store.loadPack(episodeId, version);
    if (![EpisodeState.SCRIPT_DRAFT, EpisodeState.CHANGES_REQUESTED].includes(pack.state)) {
      throw new ReviewError(`cannot submit state ${pack.state}`);
    }
    const pending = await this.store.updateState(pack.episodeId, pack.version, EpisodeState.REVIEW_PENDING);
    const sentAt = new Date().toISOString();
    this.reviewSentAt.set(`${pending.episodeId}:${pending.version}`, sentAt);
    return {
      pack: pending,
      mail: {
        subject: reviewEmailSubject(pending),
        body: reviewEmailBody(pending),
        sentAt,
        episodeId: pending.episodeId,
        version: pending.version,
        hashToken: pending.hashToken,
      },
    };
  }

  async processEmail(email) {
    const existing = await this.store.getDecisionByMessage(email.messageId);
    if (existing) {
      const previous = await this.store.loadPack(existing.episodeId, existing.version);
      let revised = null;
      if (existing.accepted && existing.command === 'CHANGES') {
        const latest = await this.store.loadPack(existing.episodeId);
        if (latest.version > existing.version) revised = latest;
      }
      return {decision: existing, previous, revised};
    }

    const parsed = parseReviewEmailBody(email.body);
    if (!parsed) throw new ReviewError('ambiguous email; cannot bind to pack');

    const pack = await this.store.loadPack(parsed.episodeId, parsed.version);
    const sentAt = this.reviewSentAt.get(`${pack.episodeId}:${pack.version}`) || null;
    const decision = applyInboundReview({
      pack,
      email,
      editorAllowlist: this.editorAllowlist,
      reviewSentAt: sentAt,
    });
    await this.store.saveDecision(decision);

    let revised = null;
    if (decision.accepted && decision.command === 'CHANGES') {
      await this.store.updateState(pack.episodeId, pack.version, EpisodeState.CHANGES_REQUESTED);
      const newScript = {
        ...pack.script,
        body: `${pack.script.body}\n\n[Editor revision notes applied]\n${decision.requestedChanges.map(c => `- ${c}`).join('\n')}`,
      };
      revised = reviseFromChanges(pack, {
        requestedChanges: decision.requestedChanges,
        script: newScript,
      });
      await this.store.savePack(revised);
    } else if (decision.accepted && decision.command === 'APPROVE') {
      await this.store.updateState(pack.episodeId, pack.version, EpisodeState.SCRIPT_APPROVED);
    }
    return {decision, previous: pack, revised};
  }
}
