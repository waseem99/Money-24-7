# Five-minute AI newsroom approval pilot

Status: prepared-pilot pipeline implemented; see PILOT_RUNBOOK.md and PILOT_VERIFICATION.md. A 300-second silent fixture is verified. Actual presenter footage, voice quality and stakeholder approval remain pending; no finished realistic pilot is claimed.
Created: 8 October 2026.

Extension planned 10 October 2026: [AI_FIRST_BROADCAST_V2_PLAN.md](docs/AI_FIRST_BROADCAST_V2_PLAN.md) defines the reference-inspired animated graphics, unequal multi-presenter scene, coordinated dialogue and movement experiments. Use its code map and linked task backlog for new V2 work. This file remains the original approval-milestone baseline; V2 planning does not certify real footage or a finished film.
Repository: waseem99/Money-24-7.
Audited production baseline: b19dfb2aa51dc9c20e059b5e8a415d891809654b.
Approval tracker: [#6](https://github.com/waseem99/Money-24-7/issues/6).

## Objective and priority

Deliver one polished, uninterrupted five-minute recording that earns stakeholder approval for a premium AI business/economics/stocks channel. The intended experience is two realistic consistent presenters, natural voices and handovers, a credible branded studio, analysis graphics timed to speech, supporting images, and professional audio/pacing.

The deliverable is the actual watchable recording and review package. A website, provider integration, script, build, test count or recording control alone cannot pass the milestone.

AI-first means repeatable generation of dialogue, production instructions, illustration prompts, voice and media from a structured brief. It does not remove the need to choose a strong presenter and review the final programme. Automate routine production; use human creative direction and final quality acceptance at defined gates.

Prepared avatar shots and advance rendering are acceptable for the pilot. Do not make the 60–120-second generation target, native live avatar interaction or a 24/7 stream a prerequisite to delivering a convincing approval video. Demonstrate interaction separately if claiming it. Maintain truthful prepared/delayed/AI-generated labels.

## Current implementation and what to keep

- Vite/plain JavaScript frontend, Vercel functions, existing Signal identity and GitHub deployment.
- Single browser-managed LiveAvatar FULL-mode session using repeat(text).
- Fixed demo script and deterministic price/headline narration.
- Browser canvas + MediaRecorder capture; useful for auditions but not the final automated pipeline.
- Local quote/headline Q&A without persistence.
- Optional HLS playback adapter, without a centrally running producer.
- Existing data validation, stale-data handling, authorization tests and session diagnostics.

Keep these assets and the working preview while building a separate episode production path. No framework migration is required. Existing issues #2/#3/#4/#5 retain the provider/session history; do not mark them completed from planning alone.

The prior cloud test browser failed WebRTC after provider acceptance. The user's browser showed working sandbox video and reported audio. Professional motion, voice and finished recording quality remain uncertified. Do not spend credits repeating the same failing environment without a material change.

## Scope boundary

### P0 — required for the approval recording

1. Show bible, approved dated source snapshot and 300-second rundown.
2. Two actual auditioned presenter identities/voices.
3. Structured AI director with reproducible prompts and source validation.
4. Resumable voice, video and visual generation jobs.
5. Studio/graphics templates and a single media timeline.
6. Server-side or asynchronous-provider capture/render, final MP4 and private artifact storage.
7. Protected review playback, full QA and stakeholder approval.

### P1/P2 — after visual approval

Managed production-scale database/queues, always-on collection, live-stock/news subscriptions and display permissions, open public chat, automatic session renewals, continuous playout/CDN, high availability, 24/7 budgets, and soak certification.

Use pilot contracts that can expand to this system, but do not build the entire platform before showing a strong recording.

## Five-minute editorial and visual rundown

Initial language: English, matching the prototype. Lock it in the brief; do not assume multilingual voice quality.
Timing below is a target. Generate speech, measure actual durations, then revise text/pacing to fit. Avoid unnatural time-stretching.

| Time | Duration | Sequence | Required picture/sound |
|---|---:|---|---|
| 00:00–00:15 | 15 s | Signal opening | Restrained ident/music, studio reveal |
| 00:15–00:40 | 25 s | Two-presenter introduction | Anchor introduces topic and analyst; natural handover |
| 00:40–01:45 | 65 s | Market overview | Dated approved snapshot, presenter plus market board |
| 01:45–02:45 | 60 s | Analysis exchange | Question from anchor, analyst response, synchronized comparison chart |
| 02:45–03:45 | 60 s | Business/economics explainer | Full-screen visual, illustrated or licensed supporting image, voiceover |
| 03:45–04:40 | 55 s | Selected audience question | Question card, two-presenter response, relevant supporting visual |
| 04:40–05:00 | 20 s | Recap and next-programme transition | Clean sign-off and branded continuity |
| Total | 300 s | | |

If the audience question is prepared, label it as a demonstration. To prove fresh interaction, capture submission of an unplanned question and its subsequent automated generation separately, with timestamps. Do not imply the polished assembled recording was generated in real time.

Use original show direction; do not copy another broadcaster's identity. Start with close-ups, split screen and presenter-next-to-chart. A shared physical desk or full 3D set is optional and must not delay or lower realism.

## Presenter and provider selection gate

Audition each intended presenter with the same 20–30-second script containing company names, percentages, currencies, pauses and a handover. Compare actual samples, not vendor marketing.

Fast route: existing LiveAvatar integration, with LITE/external audio introduced only after compatibility and worker connectivity are tested.
Prepared route: an asynchronous audio-to-video provider, initially HeyGen on supported avatar engines, if the actual output is better.

Choose the route producing the strongest finished footage. Keep a provider interface so the renderer is replaceable. Do not assume stock avatars are exclusive IP or that an image-based character automatically works identically across providers. Store own character masters, voice recordings and agreements privately, not in this public repo.

For every audition record:
- Character/voice/look IDs and supported modes.
- Source resolution and delivered output resolution.
- Lip-sync, teeth/mouth, eye contact, skin, hair/hand artifacts and identity stability.
- Pronunciation, cadence, emotional restraint, pauses and audio quality.
- Elapsed render time, duration, retries and measured usage/cost.
- Consent/licensing/provenance reference and privacy settings.
- Decision: accepted, revise, or reject.

No purchase or unlimited overage is implied by this plan. Existing configured credentials should be checked securely; a separate rendered-video API may require separate access. Stop on missing account access or exhausted budget and name that dependency.

## AI production pipeline

1. Load versioned show bible, presenter profiles, brief and approved source snapshot.
2. Build a factual story brief; attach evidence for every factual claim.
3. Generate two-presenter dialogue, shot choices, chart specs and illustration prompts.
4. Validate schema, facts/numbers/units, timing estimate and supported actions.
5. Generate timed audio and independent visual assets.
6. Generate avatar footage using the exact approved audio where supported.
7. Validate returned media and resolve measured audio/video offsets.
8. Compose the timeline and export the episode.
9. Run automated media checks and human full-length review.
10. Regenerate only failed turns/scenes, rebuild, publish the approved review package.

The director chooses creative options within templates. Code owns numeric calculations, scheduling, retries, storage and publishing. External source text is evidence, not instructions that can change tool permissions, destinations or editorial rules.

Use the established project stack. A new agent runtime may be evaluated if needed; do not add a framework solely to label this AI-first.

## Proposed code map

These are new implementation locations unless marked existing.

| Location | Responsibility |
|---|---|
| production/show-bible.json | Format, roles, pacing, editorial rules and visual direction |
| production/presenters.json | Provider-neutral identity, voice and look registry |
| production/prompts/ | Versioned director, dialogue, visual and revision prompts |
| production/contracts/ | Brief, sources, segment, media, cue and QA schemas |
| production/pilot/ | Approved non-sensitive input examples and manifests |
| workers/director/ | Source-grounded episode planning and validation |
| workers/jobs/ | Job persistence, idempotency, retries and spend limits |
| workers/audio/ | TTS, pronunciation, alignment and audio normalization |
| workers/media/providers/ | LiveAvatar and async video provider adapters |
| workers/visuals/ | Template charts, illustrations and fallback assets |
| production/studio/ and production/graphics/ | Reusable scenes, captions and transitions |
| workers/compositor/ | Timeline assembly, media normalization and export |
| scripts/build-pilot.mjs | dry-run / render / resume workflow |
| scripts/render-pilot.mjs | Rebuild from ready assets without new paid calls |
| src/review/ and api/review/ | Protected playback, source list and review status |
| tests/pilot/ | Contract, consistency, resume and exported-media checks |
| Existing src/main.js | Separate viewer and operator modes; preserve audition |
| Existing lib/presenter.js | Extend via registry; preserve existing preview |
| Existing src/broadcast-demo.js | Keep browser recording as an audition utility |
| Existing api/avatar-token.js | Keep private preview; new worker credentials server-only |

Do not reorganize the entire existing repository as a prerequisite. Use small isolated PRs with verifiable outcomes.

## Core contracts

Episode manifest must include:
- episodeId, schemaVersion, revision, status, targetDurationMs.
- briefHash, sourceSnapshotIds, promptVersion, model/provider configuration references.
- segments with stable IDs, expiry policy and source references.
- turns with presenterId, exact text, claimIds, audioAssetId and measured duration.
- visuals with approved template ID, validated data or illustration provenance.
- cues referencing phrases/turns and resolved times on the final media clock.
- asset hashes, actual resolution, codec, provider job ID and quality results.
- final output, generation metrics, review status and known limitations.

Persist state: draft -> validated -> producing -> quality_checked -> ready -> assembled -> reviewed.
Also support failed, cancelled, expired and superseded. Do not overwrite aired/approved history.

Job identity: episode revision + turn/scene + input hash + provider configuration version.
Persist returned provider job ID before polling. Deduplicate callbacks and retry delivery safely. Do not assume exactly-once paid generation; reconcile ambiguous timeouts with provider job status before retrying.

Pilot persistence: SQLite on an attached durable volume or existing PostgreSQL if already provisioned, plus private object storage for media. Never place SQLite on ephemeral Vercel function storage. Save checkpoints off disposable workers. Move to managed PostgreSQL/queue for the continuous service without changing episode contracts.

CLI interface to implement:
- build-pilot --brief <path> --dry-run : validate and estimate; no paid calls.
- build-pilot --brief <path> --render --budget <configured-limit> : create bounded jobs.
- build-pilot --episode <id> --resume : reuse completed assets.
- render-pilot --episode <id> : assemble only ready assets.

A dry-run or synthetic test is not evidence of a real finished episode.

## Visual and audio production

- Target delivery: 1920x1080, 30 fps, H.264/AAC MP4, 48 kHz delivery audio.
- Store actual source dimensions; scaling a 720p avatar is not native 1080p.
- Initial web-master loudness target: approximately -16 LUFS integrated, true peak no higher than -1 dBTP; final mixer review can revise before locking.
- Use one final timeline and align graphics to generated speech, checking avatar offsets.
- Chart values, labels, units and dates come from the same snapshot as spoken claims.
- AI images are optional illustrations; use approved fallback if late or poor quality.
- Keep captions, branding and essential labels readable inside tested safe margins.
- Verify chroma/matting capability and edge quality before choosing studio layout.
- No doubled speech, browser TTS in the final master, awkward dead air or abrupt cutoffs.
- Prepared footage, historical data and AI illustrations must be represented accurately.

## Quality gates and final deliverables

Required deliverables:
1. signal-newsroom-pilot-v1.mp4 — 300-second target, ±2-second delivery tolerance.
2. Protected review playback and accessible master download.
3. Episode script, approved dated sources and asset provenance manifest.
4. Timestamped QA report covering the full five minutes.
5. Generation trace, measured cost/time, source resolution and known limitations.
6. Optional separate interaction evidence recording if fresh-response capability is claimed.

Automated QA: decodable A/V tracks, expected dimensions/rate/duration, audio clipping/silence, missing or black/frozen frames, schema integrity and numeric consistency. Automated detection flags material for review; it does not independently certify human realism.

Human QA: mouth/teeth/eyes/hands, identity consistency, lip-sync, voice suitability, financial pronunciation, handovers, pacing, charts, readability and editorial meaning. Review the entire export on desktop/mobile and headphones. Log timecode, severity, owner and retest result.

Suggested sync target: no visible drift; investigate offsets greater than 100 ms. Do not claim measured accuracy without measurement. No severe facial/voice defects can remain in the approval cut. Moderate defects require correction or explicit acceptance.

Do not close #6 because tests pass. Close only after the real recording and evidence exist and stakeholder acceptance is recorded. Use approval pending if the file is finished but feedback is outstanding.

## Tasks, dependencies and completion evidence

### PILOT-01 — [#7](https://github.com/waseem99/Money-24-7/issues/7)
lock show bible, five-minute rundown and evidence snapshots

Dependencies: None; reuse evidence from #3 and #4.

Work: Create a 300-second target newsroom rundown with two presenters and a selected audience-question segment. Define original Signal studio style, shot list, presenter roles, pronunciation and rights/provenance requirements. Use approved dated facts or explicitly illustrative data; live APIs are deferred. Mark prepared content accurately. Reserve optional manual stakeholder approval for show direction; routine generation should be automatic.

Acceptance: Rundown slots total 300 seconds; each factual claim and chart input has a source and timestamp; brief contains visual/voice targets and forbidden unsupported claims; generated illustrations cannot masquerade as event evidence.

### PILOT-02 — [#8](https://github.com/waseem99/Money-24-7/issues/8)
audition two realistic presenters and select production route

Dependencies: PILOT-01; existing #2/#3/#4 account and media evidence.

Work: Run small bounded auditions with the same 20–30-second financial script for each intended identity. Compare the working LiveAvatar route with asynchronous audio-to-video only where account access permits. Measure actual elapsed generation time, source resolution, quality and cost. Verify chosen custom faces work in the selected engine and confirm private asset handling. Prefer the best actual footage for approval; streaming mode is not mandatory for this recording. Stop repeating cloud WebRTC failures without a material change. An asynchronous API-render/download route can avoid that dependency; it needs separately verified access.

Acceptance: Two actual audible moving-video samples and timestamped review; identity/voice/wardrobe locked; financial terms pronounced correctly; chosen route documented with measured timing and cost. Configuration presence or a still image cannot pass. No unapproved purchases or unbounded credit use.

### PILOT-03 — [#9](https://github.com/waseem99/Money-24-7/issues/9)
implement AI episode director and resumable production jobs

Dependencies: PILOT-01; presenter capability contract from PILOT-02.

Work: Generate a structured episode manifest: verified claims, speaker turns, visual prompts and timeline cues. Use versioned show/presenter instructions, schema validation and code-based numeric checks. Support dry-run, render and resume commands, provider adapters, durable job status, idempotency, bounded retries and spend ceilings. Start with one persisted production worker and private artifact storage; PostgreSQL/large queue infrastructure is not a gate for the pilot. Keep backend model keys out of the browser.

Acceptance: One command can turn a brief into a validated manifest and dispatch jobs. Restart resumes without duplicate completed renders; dry-run makes no paid calls; claim/snapshot disagreement fails validation; prompt/model/source versions and job outcomes are recorded.

### PILOT-04 — [#10](https://github.com/waseem99/Money-24-7/issues/10)
produce timed speech and two-presenter footage

Dependencies: PILOT-02 and PILOT-03.

Work: Generate consistent per-turn speech, pronunciation dictionaries, audio alignment and deliberate pauses. Produce short avatar shots, including coherent listening shots where needed. Verify media against the chosen master audio; avoid duplicated or mismatched tracks. Capture through a server worker or use asynchronous provider files, chosen by audition. Store generation metadata and let failed turns regenerate without remaking the entire episode.

Acceptance: All required presenter clips have real audio/video, stable identity, required duration, acceptable lip-sync and accessible private artifact references. Source dimensions and render times are recorded. No browser speech synthesis is in the final master.

### PILOT-05 — [#11](https://github.com/waseem99/Money-24-7/issues/11)
implement newsroom studio, synchronized charts and visual assets

Dependencies: PILOT-01 and PILOT-03; final timings from PILOT-04.

Work: Build reusable close-up, split-screen, analyst-with-chart, full-screen visual and question scenes. Generate illustration prompts automatically from approved briefs; retain a licensed/approved fallback visual. Render figures/text deterministically from frozen snapshots. Implement phrase-timed highlights, lower thirds, captions and restrained transitions. Verify avatar background/matting support; do not assume alpha output. Do not require a 3D shared-desk shot if it lowers realism.

Acceptance: At least one chart analysis and supporting image are rendered into the programme; figures match narration and sources; text is readable at 1080p and scaled playback; visual cues follow actual media timing; assets include rights/provenance.

### PILOT-06 — [#12](https://github.com/waseem99/Money-24-7/issues/12)
assemble and export the five-minute newsroom master

Dependencies: PILOT-04 and PILOT-05.

Work: Use a server-side timeline/compositor and FFmpeg-compatible delivery path to assemble approved shots, graphics, audio and transitions. Target 1920x1080/30 H.264/AAC MP4 with 48 kHz delivery audio and consistent loudness. Measure actual durations then revise script/pacing; do not speed speech unnaturally to hit runtime. Check A/V offsets, black/frozen frames, silence and clipping. Store a private master, review copy and build manifest.

Acceptance: One uninterrupted 300-second target MP4 within ±2 seconds; no severe facial artifacts, clipped dialogue or accidental silence; correct source-resolution disclosure; same manifest can be rebuilt or resumed. A download button or successful build is not completion evidence.

### PILOT-07 — [#13](https://github.com/waseem99/Money-24-7/issues/13)
publish review playback, quality report and approval package

Dependencies: PILOT-06; all earlier pilot gates.

Work: Provide protected review playback and master download, separate from public avatar/session controls. Review the entire episode on desktop/mobile and headphones; log defects with timestamps and regenerate affected shots. Include scripts, source list, measured generation time/cost, actual source resolution, automation trace and known limitations. Demonstrate a newly submitted question through the same pipeline in a separate short evidence capture if claiming interaction; prepared question dialogue in the master is not proof of real-time response. Update stale docs.

Acceptance: Accessible final MP4 and review URL; full timestamped QA report; all severe defects resolved; stakeholder acceptance or concrete revision list. Do not close #6 until an actual finished recording exists. No public claim of 24/7 readiness.

### POST-01 — [#14](https://github.com/waseem99/Money-24-7/issues/14)
after pilot approval, expand to buffered shared 24/7 newsroom

Dependencies: Approval milestone #6.

Work: Carry forward the entire architecture audit: persistent PostgreSQL source/claim/segment/asset/job/rundown/question/usage records; managed durable queue; central two-presenter LITE sessions and renewals; calibrated TTS alignment; dynamic graphics; automated source collection; public question selection; one continuous shared stream; operator/worker authorization; provider callback verification; idempotency/leases; health and spend controls. Verify LiveAvatar/LiveKit worker networking, continuous encoder handoff, expiry/corrections and source display rights. Introduce live stock/news feeds only after the video approval goal. Keep data structures/provider interfaces compatible with the pilot.

Acceptance: Measured 60–120-second freshness target for eligible short updates/questions under declared load, including delivery delay; 15-minute then one-hour/24-hour sustained tests; injected render/session/network failures recover without double broadcast; all viewers share programme; no dependence on browser; real costs and quotas documented. Targets require measurement, not promises.


## Execution order and AI-first working rules

Critical path: PILOT-01 -> PILOT-02 -> PILOT-03 -> PILOT-04 -> PILOT-06 -> PILOT-07.
PILOT-05 can proceed after the approved brief/contracts, then use final speech timing before assembly.

Implementation agents should take one bounded issue at a time, inspect relevant repository instructions, use the linked contracts, deliver small reviewable changes and attach real evidence. Mock providers are useful for contract/recovery tests but cannot close media acceptance. No automatic self-modification of production editorial policy. No automatic purchase or provider switching that changes rights/identity.

Do not set a committed delivery date until the first accepted presenter sample and render timing are measured. Track active implementation time separately from provider/account delays. Report task status as planned / in progress / blocked / verified; never conflate those states.

## Full architecture audit mapping after approval

| Audit area | Pilot implementation | Continuous-channel expansion |
|---|---|---|
| Viewer/operator/producer separation | Protected review plus independent episode worker | Independent always-on newsroom and playout services |
| Persistence/jobs/media | Durable pilot job ledger, schemas, private media | PostgreSQL, managed queue, retention and lifecycle policies |
| AI editor/director | Structured brief-to-episode automation | Continuous topic selection, updates and correction handling |
| Two presenters | Accepted identities and generated turns | Central session pool, renewal, concurrency and idle budgets |
| Voice/timing | Timed master speech and measured alignment | Continuous low-latency audio and session boundary handling |
| Studio/graphics | Reusable scenes rendered into MP4 | Fresh timestamped graphics on the shared programme clock |
| Media capture | Independent worker or async provider files | Supervised media workers with measured throughput headroom |
| Scheduler/playout | Fixed episode timeline | Ready queue, deadlines, expiring segments and fallback programming |
| Shared distribution | Protected recording playback | One persistent stream, CDN/HLS, reconnect and return-to-live |
| Audience questions | Selected question segment and optional fresh-response test | Persistent moderated public queue linked to viewer playback context |
| Auth/health/spend | Protected review, backend secrets, bounded render budget | Roles, service auth, session ownership, quotas, monitoring and alerting |
| Acceptance/migration | Five-minute finished-recording gate | 15-minute automation, one-hour then 24-hour failure/recovery tests |

## Risks and practical fallbacks

- Poor custom-avatar realism: revise source assets or audition another supported route before building more UI.
- WebRTC worker failure: validate network requirements; use supported asynchronous rendering for the recorded pilot when available. Do not bypass access restrictions.
- No async provider credentials: complete non-provider code and clearly record the single secure setup dependency.
- Generated image misses deadline: use approved library asset or clean template graphic.
- Long render time: produce in advance for approval; record latency as a limitation for later interactive work.
- Budget exhaustion: stop dispatching; keep ready assets and status. Never silently enable overage.
- Source disagreement: omit or revise the claim and rebuild affected assets.
- Two-minute preview cap: do not extend the public preview blindly. Use bounded private worker jobs or separate prepared shots.
- Avatar export/voice incompatibility: verify supported combination before a full episode render.

## Technical references reviewed during planning

- https://docs.liveavatar.com/docs/lite-mode/overview
- https://docs.liveavatar.com/docs/lite-mode/configuration
- https://docs.liveavatar.com/docs/core-concepts/avatars
- https://docs.liveavatar.com/docs/faq/credits
- https://developers.heygen.com/audio-to-video
- https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- https://docs.livekit.io/transport/media/ingress-egress/egress/custom-template/
- https://developers.cloudflare.com/stream/stream-live/

Recheck provider contracts and account capabilities at implementation time. The plan is not a vendor latency, exclusivity or quality guarantee.
