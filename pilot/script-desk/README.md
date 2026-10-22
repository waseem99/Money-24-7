# Tamasha Script Desk pilot

This bounded pilot creates two five-minute Pakistani Urdu-English scripts with English subtitle drafts, sends them for editorial review, and accepts explicit replies against the exact reviewed content. Approval prepares a **no-spend scene handoff**. It never calls a video provider or publishes a programme.

The existing prepared-video pipeline uses a different, two-host English contract. This pilot has its own one-host Urdu contract; it does not bypass or weaken the earlier pipeline's gates.

## What runs where

- **ChatGPT + Tamasha Script Desk:** researches primary sources, writes the two pilot drafts, checks source claims and prepares the review copy. Connected Gmail sends the email. A Gmail message-event automation handles replies for this bounded pilot.
- **This repository:** executable content validation, immutable version hashes, exact approval commands, replay protection and deterministic scene-handoff generation. No Gmail credentials or personal review data are committed.
- **Wardrobe planner:** approved outfit selection per episode, daily/previous-day repeat prevention, persistent reservations and a readable HTML production sheet. With a configured catalogue and ledger it runs as part of the approval handoff. The connected daily production worker and final avatar assets are still pending.
- **Private project Drive folder:** sealed script pack, sent-message receipt and append-only decision records. Each decision record is named by Gmail message ID. Look for an existing record before handling redelivery. Drive's filename uniqueness is not a transaction guarantee; concurrent cloud runs must be serialized before expanding to automatic rendering. The current handoff has no provider side effects.
- **Optional API draft adapter:** `generate` calls the existing AI SDK/Gateway only with explicit permission and configured credentials. It has not been certified with a live paid call in this pilot. It receives a researched brief; it is not a market-data crawler.

No daily schedule, live exchange feed, automatic publishing or paid-video deployment is installed by this change.

## Private inputs

### Spoken language and voice direction

Local programmes use conversational urban Pakistani Urdu naturally mixed with everyday English business terms. Use Urdu sentence structure, retain terms such as earnings, market, investors, interest rates, revenue and cash flow, and explain unfamiliar concepts briefly. There is no fixed Urdu/English percentage. Avoid literary Urdu, literal translation, forced slang and accent changes between languages. Use Urdu script plus Latin-script English in voice copy; use Roman Urdu for review unless actual voice testing supports it. The base language field remains `ur-PK`; it does not guarantee a provider's bilingual capability.

Apply the same direction to openings, closings, dialogue and local social cuts. Test each selected voice on conversational and figure-heavy Urdu-English passages before production. Maintain one voice throughout a passage and measure the actual read. A catalogue locale or monolingual preview is insufficient proof. Retain English subtitle drafts; international English programming remains under its existing contract. Approved scripts remain immutable: style revisions require a new sealed version and exact-version review.

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

After a successful send, record authoritative connector metadata in a private receipt. Optional `reviewer_aliases` may contain only send-as addresses verified through the same connected Gmail account; never infer aliases from a reply body:

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

## Automatic wardrobe rotation

Each new edition gets a distinct outfit for its host, including separate briefs on the same day. An outfit is also excluded if that host wore/reserved it on their previous broadcast day, even across a holiday. Face, voice, wardrobe and provider look remain fixed across all scenes of an edition and on retries. Repeats and derivative social cuts reuse the original episode assignment; they must not be submitted as new editions merely to change clothing.

The wardrobe catalogue is an approved asset library, not a daily image-generation prompt. Store the real catalogue and ledger under ignored `pilot-runs/` or in a private persistent store. The reviewer approves an identity/voice and each look once; regular selection among these approved assets does not require daily wardrobe approval. New looks require visual and lip-sync QA plus an approval record. `APPROVED`, `qa_passed` and approval references must be populated from actual evidence by a trusted production operator, not by a script-writing model. IDs must come from the provider. Different camera angles in the same clothes share an `outfit_id`.

Start from `wardrobe.example.json`, which is deliberately unapproved and cannot render or allocate. Set the two paths in the worker that handles approved scripts:

```bash
export TAMASHA_WARDROBE_CATALOG=/private/tamasha/wardrobe-catalogue.json
export TAMASHA_WARDROBE_LEDGER=/private/tamasha/wardrobe-ledger.json
```

The existing `reply PACK STATE MESSAGE HANDOFF` command then allocates wardrobe automatically after script approval. Explicit catalogue and ledger arguments can also follow `HANDOFF`. A wardrobe problem does not undo editorial approval: the handoff records `BLOCKED` and its reason, and the ledger remains unchanged. With no catalogue configured, it records `AWAITING_APPROVED_LOOKS`.

For an already-approved pack:

```bash
node pilot/script-desk/cli.mjs wardrobe pilot-runs/pack.json pilot-runs/state.json pilot-runs/wardrobe-catalogue.json pilot-runs/wardrobe-ledger.json pilot-runs/dressed-handoff.json
```

Both commands write a companion `HANDOFF.wardrobe.html` showing the date, programme/edition, presenter and outfit in plain language. The machine handoff binds each scene to the exact `provider_avatar_id`, identity and voice. A future video adapter must consume these pinned fields, reject any status other than `ASSIGNED`, and retain the existing freshness, timing, rights and render/budget gates. This change adds no provider calls, spending, daily scheduler or deployment.

### Inventory and continuity

- Four editions per host/day need **at least eight distinct eligible outfits** to avoid same-day and previous-day repeats. Add headroom for specials, QA withdrawals and programme-specific clothing. Three looks remain sufficient for auditioning, not for that full rotation.
- The configurable `avoid_previous_broadcast_days` defaults to one and cannot be zero. A five-day cooldown for four daily editions needs at least 24 eligible outfits (today plus five preceding appearance days).
- The planner uses least-recently-used outfits with programme eligibility. Full daily batches are preferred so restricted programmes receive suitable looks. A shortage blocks the entire batch; it never silently repeats clothes or generates an unapproved substitute.
- Reservations count immediately, even before a render. Cancelled reservations remain conservative exclusions until reviewed; this release intentionally has no automatic cancellation/release operation. They are not evidence of airing.
- A new script hash/date/programme under an already-reserved episode ID requires review and a new edition ID. The old reservation is retained. New backdated allocations are blocked once a later date has reservations; replaying an existing earlier edition is safe.
- Keep the **same persistent ledger across days and programme batches**. One local worker uses an exclusive ledger lock and atomic rename. Do not create per-run ledger copies or use independent cloud files as a concurrent lock. A distributed production deployment needs transactional shared storage/one queue worker before enabling multiple instances.
- Catalogue changes or revoked approvals invalidate reuse of affected reservations. A lock left after a crash must only be removed after confirming its owner has stopped. Rerunning after a write failure preserves already-reserved outfits and repairs the handoff/review sheet.

## Verification

```bash
node --test tests/pilot-script-desk.test.mjs
npm test
npm run build
```

Tests cover version tampering, exact review binding, individual/both decisions, stale sources, wrong identities/threads, quoted approval instructions, mixed prose, requested changes, replay and no-spend handoffs. Test messages use reserved example addresses and never send real mail.
