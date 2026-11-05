# MarketWatch developer handoff: manual Flow and automated production

Updated: 5 November 2026. Owner: Codistan engineering. Foundation: [PR #80](https://github.com/waseem99/Money-24-7/pull/80).

## Agreed direction

Run two tracks in parallel:
1. Production team continues generating videos manually in Google Flow, assembling in Premiere Pro and uploading approved masters to Playout.video.
2. Engineering builds the automation in this repository, initially using fixtures and dry runs, then a bounded Google video API pilot.

The API route calls Google's developer video-generation service directly; it does not operate the Flow app or inherit its projects, voice settings or subscription credits. "Google video API" is a generic description, not a product called "Google Flow API." Select a supported model and route after checking the account's capabilities and billing. Do not promise identical output across Flow and the API.

No deployment, paid rendering or programme cutover is authorized by this documentation change alone. Build/test work proceeds; production activation follows the acceptance gates below and configured spending limits.

## Verified starting point

On 5 November, PR #80 is open and draft; its inspected head before this documentation change is `15bb8a022cf175f2ac9bfdb832e1f145cd009fd7`.

Already present on that branch:
- Twelve trading-day programme timings, Friday overrides and a 90-minute daily total.
- Immutable script-version review rules and local scene-pack export.
- PostgreSQL queue migration, leased jobs, recovery, incident/outbox records and an injected-handler worker.
- Foundation tests and CI configuration.

These are foundations, not operational integrations. Hosted execution, PostgreSQL review-state migration, live Drive/Gmail/research handlers, delivered alerts, private media storage, video generation and publishing remain pending. Recheck branch state and CI before implementation or merging.

Read [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and [QUEUE_RUNBOOK.md](QUEUE_RUNBOOK.md). Continue the existing backlog (#66–#76 and #77) rather than creating duplicate work. Keep the separate explicit-approval pilot in PR #65 distinct.

## Delivery sequence and ownership

Roles below are assignments to make at kickoff, not named staff commitments.

| Order | Suggested owner | Work | Required evidence |
|---|---|---|---|
| 1 | Backend / DevOps | Review PR #80; provision hosted worker, PostgreSQL and private media storage; migrate review state; wire minute-level scheduling and delivered alerts | Restart/concurrency test produces one job per stage; missed job produces a received alert |
| 2 | Integration developer | Connect existing Drive roots and Gmail send/read; save versioned programme packs and process reviews | Real saved pack, confirmed email receipt, explicit reply, timeout, HOLD and inbox-outage tests |
| 3 | AI / backend developer | Wire scripting and research API; validate sources, freshness, dialogue, asset mapping and scene packs | One local and one international pack checked against manual production requirements |
| 4 | AI engineer | Implement configurable video adapter, spending reservations, job tracking, downloads and scene-only retries | Dry run passes; account capability probe identifies a supported model; generation remains disabled |
| 5 | AI engineer + Flow operator + editor | Produce the same approved 60–90-second sample manually in Flow and through the API | Comparison report with quality, latency, retries, editing time and actual cost |
| 6 | Project lead + engineering | Enable one programme after acceptance; expand after supervised rehearsal | On-time complete handoff, rollback drill and single authoritative sender |
| 7 | Editor / channel operator | Edit, approve exact master, upload and check Playout output; retain live ticker separately | Human playback review, master hash and actual playout evidence |

## Programme clock and approvals

Use `Asia/Karachi` for broadcast dates and display times; persist UTC instants for jobs.

| Programme | Review email PKT | Airtime PKT |
|---|---|---|
| Market Ahead | 06:45; Friday 06:30 | 08:45; Friday 08:30 |
| Asia & Gulf | 07:00 | 09:00 |
| Morning Brief | 08:00 | 10:00 |
| Money Essentials 1 | 09:00 | 11:00 |
| Midday Brief | 10:15 | 12:15 |
| Economy in Context | 11:00 | 13:00 |
| Afternoon Brief | 12:45 | 14:45 |
| Company in Focus | 13:00 | 15:00 |
| Closing Review | 14:00; Friday 15:00 | 16:00; Friday 17:00 |
| Europe & Americas | 16:00 | 18:00 |
| Money Essentials 2 | 17:00 | 19:00 |
| Evening Brief | 18:00 | 20:00 |

This is the agreed 5–30 November trading-day slate; do not assume holiday/weekend airtimes or automatically extend it beyond November. Resolve actual market state from verified exchange information.

- Prepare evergreen features the previous evening. Start live research early enough that the completed script and prompt pack can be emailed at airtime minus two hours.
- The ten-minute script review window starts only after confirmed email send.
- No reply after ten minutes means `AUTO_APPROVED`, distinctly recorded from analyst review, only after successful inbox catch-up.
- HOLD, changes or substantive feedback block automatic approval. New content versions restart review. Late holds must cancel queued work and quarantine generated outputs.
- An email outage or ambiguous send must never count as silence.
- Closing Review's first pack is explicitly PRE-CLOSE. Verified closing figures require a revised version and another review window; adjust the premiere if production cannot fit.
- Script approval does not authorize final-video publication. Human final-master review remains separate.
- Two hours is a scheduling target to validate against measured generation, editing and review time.

## Drive and scene-pack contract

Reuse the existing production and approved-asset folders; the reviewer address and folder IDs are already supplied in the project session. Transfer these privately into deployment configuration.

Layout: `Market Watch / YYYY-MM-DD / Programme /`
- `Scripts`
- `Flow Prompts and Assets`
- `Review and Approvals`
- `Generated Clips and Final Video`

Use immutable version/hash identifiers and persist Drive IDs to avoid duplicate roots or folders.

Every pack contains:
- Programme/date, language, presenter, target duration, source cutoff and immutable script version/hash.
- Exact spoken dialogue, pronunciation notes, source links, claim/number ledger and verification status.
- Numbered scenes: exact dialogue, complete generation prompt, framing, delivery and timing estimate.
- Exact presenter/studio/wardrobe asset filenames, private Drive IDs and checksums.
- Charts/captions/graphics references, assembly order, editor notes and review status.

Current cast: Sara/Ali for local programmes; Nora for Europe/Americas; Arjun for Asia/Gulf. Bind exact reference files in a private manifest. Voice identity and pronunciation are qualification tasks; do not invent approved voice IDs. Operators must load actual references into Flow; the API adapter must submit supported reference media, not merely a Drive URL.

## Configuration needed

| Configuration | Purpose |
|---|---|
| Hosted worker and PostgreSQL connection | Persistent production execution and records |
| Private media storage | Large outputs and intermediate assets |
| Google OAuth client and authorized service mailbox | Drive save/read and Gmail send/reply handling |
| Private reviewer address and existing folder IDs | Correct recipient and asset destinations |
| Research/scripting provider credentials and model | Automated sourced script generation |
| Google video API credentials or workload identity, model/route/project/region as applicable | Qualified paid pilot |
| Generation-enable flag; numerical pilot, daily and monthly limits | Bounded paid work |
| Alert destination and operations owner | Delivery failures, stale sources and deadline misses |

Names in the existing environment example are a starting point, not evidence that transports exist. Keep secrets server-side. This repository is public: never commit OAuth tokens, reviewer details, private Drive IDs, licensed scripts or media. Supply access through secure deployment settings; do not request keys in WhatsApp or GitHub issues.

## Video adapter and pilot acceptance

Adapter operations: capability check, submit, poll, download and reconcile. Persist external job IDs and output hashes; safe retries must not repeat an uncertain paid submission. Reserve cost across concurrent jobs before submission; begin with at most two paid attempts per scene. Keep default spend at zero and paid generation disabled until a numerical cap and account access are configured.

Pilot:
1. Freeze one approved 60–90-second script, presenter and references.
2. Run dry tests for missing credentials, quota errors, duplicate execution, restart, timeout and failed downloads.
3. Generate the same segment manually in Flow and via the qualified API.
4. Compare exact dialogue and numbers, face/wardrobe consistency, voice drift, Urdu-English pronunciation, lip-sync, continuity and audio quality.
5. Record attempts, wall-clock time, editor time and actual total cost; calculate cost per accepted minute including failed attempts.
6. Accept only with no unresolved spoken-word/number errors, human quality sign-off, spend within the agreed cap and measured completion within the programme budget.
7. Test two complete programmes and supervised schedule/recovery before wider rollout. A 90-second pilot alone does not prove 90 fresh minutes daily.

Generate exact financial charts/numbers deterministically in editing. Keep live clock/ticker on the channel overlay so repeats remain usable. Initial editing and publishing stay manual; verify Playout's supported integration before adding upload or scheduling automation.

## Cutover and rollback

Existing ChatGPT schedules and the new worker are independent and can send duplicates. Dry runs must not send real production emails.

Before enabling a real programme:
- Inventory its existing triggers; nominate one authoritative sender per programme/date.
- Disable only the matching old trigger at controlled cutover, then observe the new trigger.
- Verify saved pack, received email, review decision and editor handoff.
- If it fails, disable the worker stage before restoring the old trigger.
- Keep manual Flow production available throughout. Never mark content AIRED without actual playout evidence.

## Kickoff deliverables from developers

- Assign an owner and estimate to each row of the delivery sequence in the existing backlog.
- List missing credentials/infrastructure privately, without asking again for already supplied folder links or reviewer details.
- Demonstrate hosted queue + Drive + Gmail before moving to paid video.
- Provide the matched Flow/API pilot comparison and recommend whether to enable one programme.
- Report evidence and remaining blockers; distinguish code complete, integrated, deployed and production verified.

## Technical references

- [Google video-generation developer documentation](https://ai.google.dev/gemini-api/docs/video)
- [Google API billing](https://ai.google.dev/gemini-api/docs/billing)
- [Google Flow introduction](https://blog.google/innovation-and-ai/products/google-flow-veo-ai-filmmaking-tool/)
- [GitHub Actions troubleshooting](https://docs.github.com/en/actions/how-tos/troubleshoot-workflows)

Recheck supported model IDs, capabilities and pricing at activation; do not hardcode an older preview model from documentation examples.
