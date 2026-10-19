# Stocks production execution — 19 October 2026

Status: reference baseline established; production-quality presenter method unproven.

This is the current execution direction for the international English-language business channel. Earlier prototype plans remain historical implementation evidence, not proof of accepted visual quality. No existing production deployment changes in this milestone.

## Product and scope

- Eight permanent presenter identities and voices; activate the lead pair first, then four, then eight. Lead names/identities require reconciliation with the approved vendor cast; do not silently substitute public presets.
- Six recurring formats: Global Brief, Market Pulse, Company Watch, Economy Explained, Next Economy, Closing Picture.
- One coherent studio family: discussion set, desk set, market wall, correspondent screen. Fixed approved camera compositions and lighting. Editable 3D bodies are not required. Build a Blender environment only if the selected production method benefits from spatial control.
- Prepared original programming with live graphics; scheduled simulcast to Tamasha and YouTube. A streaming channel is not evidence of real-time presenter generation.
- Proposed launch volume: 45–60 fresh minutes within a 3–4-hour daily schedule. This volume, repeat policy, coverage window, ad inventory and monthly budget require commercial agreement before launch.
- International editorial scope; regional figures and landmarks in references are not content requirements. Brand implementation must reconcile latest references with the earlier approved Tamasha bug + Stocks rule.

## Architecture and reuse

Keep current Vite frontend and Node worker during the proof; do not rewrite to Next.js merely for the plan. Extend existing `pilot/v2/workflow.mjs`, `pilot/store.mjs`, `src/broadcast/` and private review. Existing code already supports source-bound direction, paid-job records, imports, full-duration listeners and hash-bound human approval. Audit provider adapters before real use; old account/catalog checks do not certify the new cast.

Target production components: PostgreSQL for registries and audit; Temporal for durable orchestration when the proof advances to scheduling; Python/TypeScript source ingestion and numerical checks; a versioned LLM adapter for source-grounded scripting; fixed voice adapter; replaceable presenter adapter; React/SVG graphics and Remotion for prepared compositions; FFmpeg for assembly/QC; CasparCG for playout and live HTML overlays; independent destination encoders; object storage and local broadcast cache; monitoring and standby playout. Remotion requires an appropriate company licence. GitHub Actions handles tests/deployment, not continuous broadcasting.

## Milestones and evidence gates

| ID | Work / role | Dependencies | Required exit evidence |
|---|---|---|---|
| M0 | Baseline and executable benchmark / engineering | Supplied references | File fingerprints, measured metadata, explicit unknowns, runnable cost model; no visual-quality claims |
| M1 | Lead cast, voices and studio package / creative + engineering | Reference source handover OR independently owned replacement assets | Two fixed identities and voice bindings, rights records, camera layouts, accepted voice samples; provider capability matrix |
| M2 | First 60–90-second proof / production + QA | M1, factual script, bounded paid budget | New dialogue; paired listening; entrance; chart interaction; 1080p master; timestamped defect report; cost and manual time |
| M3 | Repeatability proof / production + editorial | M2 corrections | Second distinct script with same cast/set plus ten-story batch; accepted-minute cost, pass rate, p50/p95 turnaround and manual minutes |
| M4 | Programme automation / engineering | M3 | Six templates, eight-person registry, casting, source ledger, expiry/corrections, versioned caches and durable job recovery |
| M5 | Private simulcast / broadcast engineering | M3, destination access | Independent outputs, dynamic quotes, as-run log, restart and destination-failure tests; no double-air |
| M6 | Seven-day rehearsal / editorial + operations | M4–M5, licensed feeds | Schedule fulfilment, freshness, fallback logs, reconciliation of actual spend and zero unreviewed critical defects |
| M7 | Controlled launch / product owner | M6, stakeholder acceptance, operating budget | Signed scope, staffed escalation, contribution acceptance, rollback and monitoring |

M1 asset discovery and graphics contract work can progress alongside M0. Do not commit a launch date until M2 render latency and asset access are known. Each milestone gets a reviewable deliverable; avoid software-only progress being described as a finished programme.

## Benchmark sequence (target 80 seconds)

0–5: studio establish/entrance. 5–18: lead introduction. 18–30: question and paired handover. 30–48: second presenter answers with visible listening. 48–65: sourced chart explanation. 65–75: follow-up. 75–80: closing wide. Final timing follows approved speech, not forced speed changes.

Use an evergreen financial-literacy topic first (revenue versus profit), with explicitly labelled illustrative figures if necessary. The second edition covers a different topic. Do not present fixture figures as live news. A short entrance must preserve face/body/background continuity. Do not replace the hard paired scene with isolated talking heads and claim it passed.

## Acceptance

Human review: identity continuity, fixed voice, lips/audio alignment, natural listening without short idle loops, eyelines, plausible hands, floor contact when visible, coherent set, no face occlusion, readable motion graphics, accurate sources and appropriate disclosure. Review at native resolution with audio; contact sheets alone cannot certify lip sync. No critical defect passes. Log timecode, severity, owner and correction. Obtain partner visual acceptance separately from automated tests.

Technical: 1920×1080 progressive master, declared constant frame rate, complete audio, no black/frozen intervals beyond intentional transitions, no clipped words, correct captions/labels, matching source/claim/graphic values. Preserve clean programme masters separately from current-price overlays. Expired reports cannot fill fallback slots.

## Reliability and economics

Before paid generation: validate exact script/voice/identity versions; reserve estimated cost; persist intent and provider request/job IDs. Reconcile timeouts before retry; provider failure is not permission for unbounded regeneration. Cache per shot. Record source duration, separately billed presenter layers, attempt cost, rejected cost, manual minutes and accepted duration. Run `node production/benchmark/preflight.mjs cost 60 0.4 30 1.25 4.83` for a transparent planning example; prices are explicit inputs, not live quotations.

Measure unit economics before scale. Initial illustrative 60 fresh min/day, 40% presenter footage, 30 days and 1.25 attempt factor produces 900 billed presenter minutes assuming one layer. Data/news rights, voices, compute, egress, licences and people are additional. A two-person scene billed as separate layers needs a larger factor. Current provider capability and pricing require verification at purchase time.

Playout: cache upcoming media; proposed 60-minute approved buffer plus evergreen fallback. Separate output processes and queues per destination; stale quotes visibly age or disappear. Standby activation must prevent split-brain publishing. Failures in generation must not stop transmission. Keep immutable as-run records and withdraw corrected content from future schedules.

## External inputs and fallback paths

1. Vendor original master, editing project, clean performances, references, generation settings and rights: useful for reproducing approved look. If unavailable, build owned assets against the benchmark; cannot infer their workflow from MP4s.
2. Tamasha contribution specification: protocol/endpoints, codec/frame rate/audio, EPG, captions, ad cues and backup expectations. Proceed with local/YouTube private testing while pending.
3. YouTube channel access/live eligibility and private ingest credentials: use server secrets, never repository files.
4. Market/news redistribution and footage rights: use labelled fixture data for engineering until contracted.
5. Production budget and creative/editorial role owners: assign actual people before time commitments. Engineering implementation can continue without invented assignees.

## Partner confidence protocol

Share only an evidence packet: playable original-resolution master, comparison with agreed criteria, known defects, measured costs/manual work and exact next gate. Label progress as planned, implemented, technically verified, visually accepted or operationally proven. Never use a passing build as evidence of realism. Do not send partner communications automatically; prepare them for the project owner.

## Immediate execution order

1. Run reference inventory and cost tests (M0).
2. Inventory reusable assets/provider bindings in existing production branches; reconcile lead cast with vendor references (M1).
3. Freeze two lead identity packages, voice samples and three camera views.
4. Run the short paired performance before any long bulletin or full cast generation.
5. Integrate accepted footage into the existing V2 review/assembly system and produce both proof editions.

Related historical work: `docs/BROADCAST_V2_BACKLOG.json`, `docs/BROADCAST_V2_VERIFICATION.md`, PR #61. Reuse proven components selectively; rejected full-pilot visuals and repeated idle footage are not the target.
