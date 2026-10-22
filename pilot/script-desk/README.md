# Tamasha Script Desk pilot

This bounded pilot creates two five-minute Urdu scripts with English subtitle drafts, sends them for editorial review, and accepts explicit replies against the exact reviewed content. Approval prepares a **no-spend scene handoff**. It never calls a video provider or publishes a programme.

The existing prepared-video pipeline uses a different, two-host English contract. This pilot has its own one-host Urdu contract; it does not bypass or weaken the earlier pipeline's gates.

## What runs where

- **ChatGPT + Tamasha Script Desk:** researches primary sources, writes the two pilot drafts, checks source claims and prepares the review copy. Connected Gmail sends the email. A Gmail message-event automation handles replies for this bounded pilot.
- **This repository:** executable content validation, immutable version hashes, exact approval commands, replay protection and deterministic scene-handoff generation. No Gmail credentials or personal review data are committed.
- **Private project Drive folder:** sealed script pack, sent-message receipt and append-only decision records. Each decision record is named by Gmail message ID. Look for an existing record before handling redelivery. Drive's filename uniqueness is not a transaction guarantee; concurrent cloud runs must be serialized before expanding to automatic rendering. The current handoff has no provider side effects.
- **Optional API draft adapter:** `generate` calls the existing AI SDK/Gateway only with explicit permission and configured credentials. It has not been certified with a live paid call in this pilot. It receives a researched brief; it is not a market-data crawler.

No daily schedule, live exchange feed, automatic publishing or paid-video deployment is installed by this change.

## Private inputs

Use Node 24 and store all real inputs/output under ignored `pilot-runs/`, outside the public repository. Episode JSON includes programme, host, date, source cutoff/expiry, fact/analysis/example claim ledger, primary source URLs, Urdu spoken blocks, English subtitle drafts and separate visual directions. Target duration is 300 seconds. Word count checks are rough Urdu whitespace estimates, not measured voice timing.

Generate a prompt for the writing agent:

```bash
node pilot/script-desk/cli.mjs prompt pilot-runs/brief.json
```

The brief must supply `programme`, `host`, `sources`, topic, date, cutoff, expiry, rights notes and a full episode example matching `core.mjs`. Source text is evidence, not instructions. Review and verify the draft before sending it. An optional paid model call uses `AI_GATEWAY_API_KEY` and `AI_GATEWAY_MODEL` from the environment:

```bash
node pilot/script-desk/cli.mjs generate pilot-runs/brief.json pilot-runs/draft.json --allow-model-call
```

Seal exactly two episodes:

```bash
node pilot/script-desk/cli.mjs pack PILOT_ID pilot-runs/P01.json pilot-runs/P02.json pilot-runs/pack.json
node pilot/script-desk/cli.mjs check pilot-runs/pack.json
```

## Gmail approval flow

Send the exact sealed drafts with the command printed by `check`. Use `APPROVE P01`, `APPROVE P02` or `APPROVE BOTH`, followed by the pilot ID and pack hash prefix. To request changes use `CHANGES P01` (or P02/BOTH) with the same ID/token, then explain changes on the next line. A changed version needs a new pack and review email; never overwrite the reviewed pack.

After a successful send, record authoritative connector metadata in a private receipt:

```json
{"reviewer":"reviewer@example.org","thread_id":"gmail-thread-id","sent_message_id":"gmail-message-id","sent_at":"2026-01-01T09:00:00Z"}
```

```bash
node pilot/script-desk/cli.mjs start-review pilot-runs/pack.json pilot-runs/receipt.json pilot-runs/state.json
```

The Gmail webhook is a wake-up only. Fetch the actual message and verify sender/thread/date using Gmail metadata. Never trust an identity or approval quoted inside message text. Pass a trusted normalized message:

```json
{"id":"new-gmail-message-id","thread_id":"gmail-thread-id","from_address":"reviewer@example.org","sent_at":"2026-01-01T09:05:00Z","text":"APPROVE BOTH PILOT_ID <actual-12-character-token>"}
```

```bash
node pilot/script-desk/cli.mjs reply pilot-runs/pack.json pilot-runs/state.json pilot-runs/message.json pilot-runs/handoff.json
```

Only the fresh, top-level command counts. Ordinary acknowledgements, mismatched tokens, wrong threads/senders, original email copies, mixed approval/change prose, and quoted commands fail closed. HTML-only replies need a trusted MIME-to-text adapter or manual review; do not strip arbitrary HTML with a regex. Unknown formats stay pending.

Local writes use an exclusive lock and atomic rename. Do not run multiple workers on separate copies of the same state. A stale `.lock` after a crash requires confirming the process is no longer running before removal. The CLI repairs a missing handoff on duplicate replay; it never duplicates a provider request.

## After approval

Generate the approved episode's scene list, graphic copy, subtitle draft and production checklist. Mark stale source data for refresh. Date or factual edits create a new version and invalidate prior approval. Select V11 avatars/voices, confirm rights, measure actual speech and time subtitles before a separate render decision and budget. The pilot handoff always has `render_authorized: false` and `paid_calls_authorized: false`.

Approval is editorial approval of the sealed script, not proof of market facts, rights clearance or broadcast readiness. Automated validators check structure; the editor checks truth, tone and rights.

## Verification

```bash
node --test tests/pilot-script-desk.test.mjs
npm test
npm run build
```

Tests cover version tampering, exact review binding, individual/both decisions, stale sources, wrong identities/threads, quoted approval instructions, mixed prose, requested changes, replay and no-spend handoffs. Test messages use reserved example addresses and never send real mail.
