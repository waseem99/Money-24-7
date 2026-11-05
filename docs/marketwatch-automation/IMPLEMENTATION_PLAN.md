# MarketWatch automation implementation plan

Updated 5 November 2026. Repository: waseem99/Money-24-7. First implementation: `automation/marketwatch/`.

## Outcome and current status

Deliver sourced scripts and complete Flow scene packs two hours before each programme, record version-specific email decisions, generate bounded video jobs, then hand clips to the editor and approved masters to Playout.video. Ninety fresh editorial minutes daily; repeats and social derivatives do not count.

Phase 1 is implemented and locally testable. Phase 2 now includes PostgreSQL queue schema, calendar-job insertion, leased claims, recovery, incident outbox and an injected-handler worker tick. It is NOT a running production service. PostgreSQL review-state migration, hosted execution, private media storage and real handlers remain pending. Live Drive/Gmail transports, script research/generation, video API submission, production scheduling and Playout publishing remain unimplemented. Adding an API key alone will not finish those integrations.

## Existing work and integration decision

- Main inspected at `0796055b8c3422db493acbae19dc263e15849b8a`.
- Existing documentation/backlog: draft PR #78 and issues #66–#76; retain these as the parent roadmap rather than create a duplicate project.
- PR #65 (`codex/tamasha-script-approval-pilot`) is a separate two-script Urdu review pilot. Its contract fixes five-minute, single-host episodes and explicit approvals. Do not merge it blindly or weaken it to fit this daily 12-programme workflow. Reuse its transport/parser ideas after audit; this phase uses a separate versioned contract for both languages and variable durations. Its provider/wardrobe work remains available for later phases.
- Existing `pilot/store.mjs` and media/provider tools remain unchanged. Their episode-level spend reservation is not yet a channel-wide budget service.
- Current user instructions supersede older proposal text: Sara/Ali local references, Nora/Arjun international references; Flow native audio pilot; cloud Playout output; automatic SCRIPT approval after ten minutes of silence. Final-video release remains separate.

## Phase sequence and acceptance

| Phase | Deliverable | Pass condition | Status |
|---|---|---|---|
| 1 | Calendar compiler, script sealing, durable review rules, local prompt-pack export, no-spend CI | Thursday/Friday times, 90 minutes, revision/reply/timeout tests and baseline tests pass | Implemented in this branch |
| 2 | Hosted Node 24 service, PostgreSQL state/outbox, private media storage, one-minute due-job worker | Restart and concurrent workers produce one job/email per episode/version/stage; missed deadlines alert | Queue subset implemented; deployment/review migration/storage pending |
| 3 | Drive folder resolver and Gmail send/read authorization | One real script pack saved; one real review email and reply processed; outage cannot auto-approve | Pending credentials and implementation |
| 4 | Research/scripting provider and validation | Local and international scripts have source/claim ledgers, freshness, clean voice copy, prompts and exact assets; numeric verification passes | Pending |
| 5 | Account-qualified Google video adapter and budget service | One 60–90s sample meets identity/voice/dialogue QA and measured spend/time limits | Pending |
| 6 | Editor handoff and exact-master review | Two distinct complete episodes pass human playback and release by master SHA | Pending |
| 7 | Full daily schedule and Playout delivery | 90 fresh minutes, weekend slate, source refreshes, timed premieres, overlays and 24-hour continuity verified | Pending |

Planning estimates after access is available: phases 2–3, 3–5 developer days; phase 4, 2–4; phase 5, 2–4 plus qualification; phase 6, 2–3; then a supervised full-day test and seven-day rehearsal. These are estimates, not committed airtimes. Daily 90-minute capacity is unproven until measured.

See [queue operations and acceptance](QUEUE_RUNBOOK.md) for commands, tests and remaining Phase 2 gaps.

## Calendar and production clock

`calendar.json` records the user's session-approved trading-day airtimes for 5–30 November. Presenter-to-programme assignments are provisional routing defaults; asset/voice mapping must be verified before paid production. Holidays require an actual exchange-calendar observation; weekday alone is insufficient. `buildDay` requires the caller's trading-state evidence URL and does not fetch or authenticate it.

For each programme: draft target A−150 minutes; review email A−120; ten-minute response window from confirmed send; final upload/playback target A−15. These are orchestration targets. Measure p95 generation/editing/retry time before committing to them. Prepare evergreen features the previous evening and refresh news close to each handoff.

Closing Review at A−120 is a PRE-CLOSE draft. Final closing figures create a new script version and review window after verified close. No intraday figure may be labelled an official close. If the remaining production window is insufficient, the operator must adjust the premiere.

Weekends/holidays remain blocked until the approved nine-unit 90-minute slate and airtimes are entered. Do not run Friday's script as Saturday's fresh edition. Calendar extension beyond November must be explicit.

## Review rules

1. Save an immutable script version and full content hash, including dialogue, source ledger and asset links.
2. A live Gmail adapter sends to the configured reviewer (the user supplied the address; keep it in private environment configuration).
3. Only a confirmed Gmail send receipt starts the ten-minute clock. An uncertain send is reconciled by message ID before any resend.
4. APPROVED is an explicit authenticated decision. HOLD, CHANGES REQUIRED and other substantive feedback block automatic approval. A revision is necessary after a hold/change.
5. No reply after ten minutes produces `AUTO_APPROVED`, distinctly labelled as a policy decision, not analyst review. Before applying it, catch up Gmail history and process all replies through the current check time. Failed inbox synchronization leaves the version pending.
6. Sender identity, trusted authentication metadata, thread, current version/hash and unique Gmail message ID must match. Extract only newly authored text; ignore quotes and forwarded approvals. `reply()` is an INTERNAL trusted-adapter boundary, not an HTTP endpoint; its `authenticated` flag cannot come from a client.
7. A late HOLD cancels queued handoff. Once external work exists, the hosted service must also cancel/quarantine jobs and prohibit release. This external cancellation is not implemented in phase 1.
8. New dialogue/figures/assets/source changes require a new version and a new review window. Changes must invalidate pending renders and final release dependencies.
9. Script approval never means automatic publication. Final-master approval binds the actual video SHA and QA evidence.

## Data and storage

GitHub: source, tests, public-safe calendar and documentation. This existing repository is public: never commit reviewer addresses, OAuth tokens, market-feed keys, private scripts, asset downloads or licensed media.

Drive: preserve the existing Market Watch production folder and approved assets folders. Resolve by stored file IDs; do not recreate parallel roots. Target layout:

`Market Watch / YYYY-MM-DD / Programme / Scripts | Flow Prompts and Assets | Review and Approvals | Generated Clips and Final Video`

Use immutable `vNN-HASH` files/subfolders within each stage. Store exact asset filenames + Drive IDs + checksum; downloading/uploading actual reference media is a production step, not replaced by a URL in a prompt.

Phase 1 SQLite is a private single-host development state store only. Phase 2 uses PostgreSQL transactions, unique idempotency keys, job leases and an outbox. Drive is not a queue or locking system. Private object storage holds large media/intermediates; retain Drive handoff copies and a durable pointer ledger.

Required records: calendar versions, episodes, script versions, sources/claims, cast/assets/rights, Gmail receipts/history checkpoints, decisions, jobs, spend reservations, media hashes, releases and incidents. No fake `AIRED` status: only actual playout logs count.

## Google video adapter and spending

Use an adapter with `submit`, `poll`, `download`, `reconcile` and capability-check methods. Model and API route are deployment configuration. Google Flow app credits and programmatic API billing are separate. Do not automate the Flow browser or assume all Flow controls exist in the API.

Official Google documentation checked 5 November says Veo 3.1 **preview** models in the Gemini API shut down on 22 October. It points to Gemini Omni Flash or available GA enterprise routes. Do not hardcode retired model IDs. Account access, reference-image/audio handling and exact spoken dialogue must be proved in the pilot before selecting a route.

Reserve estimated cost atomically across ALL episodes/retries under daily/monthly limits before submitting. Track actual charges separately. Initial maximum: two paid attempts per scene, configurable after measurement. A submission timeout becomes `UNKNOWN_SUBMISSION`; retain its reservation and reconcile the provider job before retrying. Polling failures do not authorize duplicate submissions. Record job IDs before continuing and download outputs promptly.

No default spending ceiling is invented. Configuration starts at zero and generation disabled. A qualified model, funded account, explicit operator enablement and numeric cap are prerequisites; existing keys do not authorize unlimited generation.

## Editing, ticker and channel

Scene pack: exact dialogue, pronunciation notes, presenter/studio/wardrobe assets, framing, delivery, duration estimate, visual cue and assembly notes. Keep accurate charts/numbers deterministic in editing. Preserve generated audio; test lip-sync and voice drift scene by scene. Export clean masters with programme graphics, captions and AI-presenter disclosure. Live ticker/date/time belongs on the Playout output, not repeated dated video.

Start with manual Premiere assembly and operator upload. Add Playout automation only after verifying supported account/API capabilities and actual output behavior; do not invent an upload/publish endpoint. Capital Stake/international data rights are separately required for ticker use.

## Credentials and handover checklist

| Setting | Why | Needed for |
|---|---|---|
| `MW_REVIEWER_EMAIL` | User-selected reviewer | Gmail review |
| `MW_DRIVE_ROOT_ID`, `MW_ASSETS_ROOT_ID` | Existing production/asset roots | Drive save and reference lookup |
| Google OAuth client ID/secret/refresh token | Dedicated service mailbox and folder access with least scopes | Gmail/Drive adapters |
| `MW_SCRIPT_API_KEY` + selected scripting provider/model | Scheduled research and writing; a ChatGPT subscription is not a worker API | Script generation |
| `MW_VIDEO_API_KEY`, `MW_VIDEO_MODEL` | Qualified Google generation route; enterprise route may instead need service-account identity/project/region | Video pilot |
| Database URL, private object storage and hosted-worker settings | Durable queues/media | Deployment |
| Generation enable flag and actual numeric caps | Controlled spending | Paid activation |

The supplied Drive roots and reviewer address are already known in session; configure them privately during phase 3. Do not ask the user to repeat them or paste tokens into GitHub issues. Voices still require qualification; no approved voice model ID is assumed.

## Scheduling and migration

Use GitHub Actions for CI and manual fixture runs. A hosted scheduler executes due jobs and catches up after restart; GitHub's own schedule events can be delayed/dropped. Store UTC instants and Asia/Karachi broadcast date; international source sessions use their own exchange timezone/DST.

Keep current ChatGPT tasks unchanged until replacements are verified. Before any real email/generation activation, export the task inventory, choose the authoritative sender per programme/date, disable the matching old trigger, then run one watched new trigger. Roll back by disabling the worker before restoring the old trigger. Unique keys prevent duplicates inside the service, but cannot deduplicate unrelated ChatGPT sends without this cutover.

## Developer commands

```
npm ci
npm test
npm run build
npm run marketwatch -- doctor
npm run marketwatch -- plan --date 2026-11-05 --market-state trading --calendar-source https://example.org/fixture-calendar
npm run marketwatch -- pack --script /private/episode.json --out /private/packs
```

The example calendar URL and test scripts are fixtures, not real market evidence. `doctor` reports presence only and makes no network calls. No production scheduler is activated by this PR.

## Official technical references

- https://ai.google.dev/gemini-api/docs/video — current video models and retirement notice.
- https://docs.github.com/en/actions/how-tos/troubleshoot-workflows — scheduled workflow delay/drop behavior.
- Existing project acceptance/backlog: https://github.com/waseem99/Money-24-7/pull/78 and issues #66–#76.
