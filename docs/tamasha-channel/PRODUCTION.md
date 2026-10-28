# Stage 1: daily editorial and production

## Scheduling
Timezone Asia/Karachi; persist UTC instants plus local broadcast date. Use exchange calendars rather than weekday assumptions. International exchange timezone/DST is separate. Do not call an unfinished US session the US close.
V11 working baseline:
|Programme|Fresh minutes/day|Proposed premiere PKT|
|---|---:|---|
|Market Ahead|10|08:45; Friday 08:30|
|Across Markets: Asia & Gulf|8|09:00|
|MarketWatch Brief ×4 distinct editions|20|10:00, 12:15, 14:45, 20:00|
|The Closing Review|15|16:00; Friday 17:00|
|Across Markets: Europe & Americas|10|18:00|
|Economy in Context|10|Editor to assign|
|Company in Focus|7|Editor to assign|
|Money Essentials ×2 new editions|10|Editor to assign|
|Total|90|12 units|
Non-trading baseline: Weekly Review20 + Sector Lens15 + four new Money Essentials5 each + Company in Focus15 + Economy in Context15 + global Brief5 =90, nine units. Saturday, Sunday and consecutive holidays require different scripts. Monthly Scorecard30 replaces Sector Lens15 + Company in Focus15; Quarterly Scorecard45 additionally replaces Economy in Context15, only on editor-selected dates after sufficient data exists.
Reject overlapping/unassigned enabled slots. Keep schedule version, effective date and editor sign-off. Maintain a rolling 7-day slate and 14-day story/airing history.

## Lead times
Features: prepare 1–3 days early and recheck before release. Standard lane starting budget: draft A−150m, refresh A−120m, lock A−90m. These are planning values until measured.
Script lock = airtime minus measured p95 render/assembly + QA + delivery + retry reserve. Source cutoff must also allow research, fact checking and human review before lock.
Fast briefs: use templated graphics/voice, not deadline-sensitive Flow shots. A−20m lock is permitted only after measured feasibility, including editorial review before lock. Close show must use actual confirmed close; if 15-minute production cannot fit the proposed half-hour window, amend premiere. Never label intraday prices as close.
Reminder at half review window and escalation at lock deadline to assigned backup. Silence never means approval. Late item is removed from the playlist and replaced by approved, unexpired content; freshness deficit remains visible.

## Research and writing
Use primary issuer/exchange/regulator releases and licensed snapshots. Store URL/source ID, observed_at, published_at, market session, currency, units and rights. Separate facts, analysis and illustrative examples. Conflicts/missing data block numeric claims.
Natural urban Pakistani Urdu-English for local programming; international English for international editions. Stable voice identity; opening identifies presenter/edition and relevant date, conversational transitions, restrained wit, useful closing watchpoint. No invented live reporting, personal experiences or interviews. Avoid dramatic/over-literary delivery.
Readable review pack: full script HTML/PDF or Doc, source ledger, proposed charts, source cutoff/expiry, changes, estimated duration, presenter/look, planned B-roll. JSON accompanies it for machines, never as sole review deliverable.

## Review via email
One named editor + backup per edition. Configure addresses privately. Dedicated Gmail OAuth mailbox with least required scopes; stored refresh token encrypted. Pub/Sub notifications wake a worker; Gmail history checkpoint + periodic catch-up handles missed events/renewals.
Email subject: [MarketWatch REVIEW] date / programme / edition / vNN.
Body carries authenticated review-page link and explicit command:
APPROVE SCRIPT EPISODE_ID VERSION HASH_TOKEN
CHANGES SCRIPT EPISODE_ID VERSION HASH_TOKEN
Then requested changes on subsequent lines. For batch approvals, identify the immutable pack and explicit episode set; no unqualified “both” after a pack changes.
Fetch message through Gmail; validate sender allowlist, trusted authentication metadata, expected thread, timestamp after request, unexpired hash and top-level fresh command. Quoted/forwarded approvals, conflicting prose, spoofed display names, ambiguous “looks fine”, wrong hash and stale versions remain pending.
Signed single-use review links show exact version and require authenticated reviewer action; GET must not approve (email scanners follow links). POST records decision. Mail approval needs equivalent verified identity; suspect messages go to manual review.
Unique Gmail message ID; transactionally insert decision + outbox event. Replay or concurrent delivery produces exactly one handoff. Retain old decisions; revision creates new hash, new request and invalidates dependent production/release.
Editorial approval unlocks production only under an explicitly configured production authorization and budget policy. It is not broadcast approval.

## Production and Flow
1. Lock script, evidence, cast/voice and wardrobe for the edition.
2. TTS first: approved Urdu-English voice, pronunciation dictionary for tickers/numbers/currencies; listen to financial passages. Measure audio, then align captions and scenes. Preserve voice on retries.
3. Shot plan separates presenter, data graphics, cleared footage and illustrative B-roll. Flow is for selected cinematic inserts, not prices, logos, headlines or 90 minutes of dialogue.
4. Flow operator task contains scene ID, approved prompt/references, aspect ratio, target duration, output resolution, model choice, maximum generations/credits and deadline. Operator records actual model, project/render reference, attempts, spend and downloads. Import checksum/provenance; QA before acceptance. Never automate browser sign-in, CAPTCHA bypass or unlimited retries.
5. Optional future Google API adapter implements submit/poll/import/reconcile capabilities using currently supported models and separate API billing. No claim of a verified Flow API. Never silently substitute provider, model or look.
6. For speaking avatars, use the existing audio-driven provider route after qualification. Adding a separate VO to a speaking Flow clip does not guarantee lip sync. Presenter freeze/identity/skin glare issues remain gated by #64.
7. Render deterministic studio, lower thirds, sourced charts, subtitles, intros/outros and transitions. Use per-programme layouts and exact locked graphics data. Source/source-time labels and approved AI-presenter disclosure.
8. Export clean master WITHOUT dynamic current ticker; build social cuts separately, not fresh quota.
9. Technical QA + complete human playback; approve exact master SHA for release.
Suggested master pending Tamasha confirmation: 1920×1080 progressive, H.264, constant frame rate 25 OR30 agreed globally, AAC stereo48kHz. Existing pilot30fps/−16LUFS is not automatically Tamasha spec. Target loudness/true peak confirmed with receiving team. No speed-up of speech or truncation to hit timing.

## State and storage contract
PLANNED → RESEARCH_READY → SCRIPT_DRAFT → REVIEW_PENDING → SCRIPT_APPROVED → PRODUCTION_QUEUED → MEDIA_READY → EDIT_READY → QA_PASSED → RELEASE_PENDING → RELEASED → SCHEDULED → AIRED.
Side states CHANGES_REQUESTED, BLOCKED, EXPIRED, FAILED, QUARANTINED. Only playout evidence creates AIRED. Never resume a revoked/expired master.
Tables: programmes, schedule_versions, episodes, script_versions, sources/claims, reviews, cast_looks, wardrobe_reservations, assets/rights, jobs, spend_reservations, releases, playlist_versions, air_events, ticker_snapshots, incidents, outbox.
Every episode: immutable ID; programme/edition/date; script SHA; source cutoff/expiry; scheduled_at; duration budget; identity/voice/look IDs; source and rights references.
Every job: idempotency key (episode/version/stage/scene/attempt), provider job ID, state, lease expiry, heartbeat, estimate/reserved/actual usage and error. DB unique constraint; claim with transaction/lease. Retry GET/poll with backoff; UNKNOWN_SUBMISSION retains reserved spend until provider reconciliation, never blind resubmit.
Assets: private object URI, SHA256, duration, codecs, dimensions, rights territory/expiry, content cutoff and source IDs. No raw credentials, personal inbox contents or licensed footage in public GitHub.
Release binds script SHA + audio/scene hashes + master SHA + reviewer + QA results + valid repeat window. Storage paths date/programme/edition/version/stage; immutable versions.
