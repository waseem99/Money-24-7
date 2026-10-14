# STOCKS Broadcast OS — 3–4 Hours/Day Premium US Financial Television
**Architecture decision record v2 — AI-NATIVE ONLY · 14 October 2026 · Design/engineering plan, NOT a deployed station**

> **PRECEDENCE: [AI-native on-air mandate](AI_NATIVE_MANDATE.md). The viewer-facing programme has no filmed human actors, spokespeople, presenters or representatives. Nora/Marcus are original fictional rigged digital characters; all multi-camera shots render from a single stable Unreal studio. Human market editors/operators are strictly behind the scenes.**

**Latest build-vs-buy decision (14 Oct): [ADR-002: vendor-first licensed fictional LiveAvatar streams](ADR002_VENDOR_FIRST_STREAMING_AVATARS.md). The original Unreal/MetaHuman actor approach below is an optional fallback, NOT a mandatory upfront investment.**

**Product:** Tamasha × Stocks, US markets exclusively.  
**Goal:** Operate 180–240 minutes/day of consistently professional, accurately sourced programming, potentially including live, live-to-tape, recorded, explainers and explicitly labelled replays. 30 broadcast days = 90–120 linear hours/month; US trading weekdays and market-closed weekends require separate formats. **Do not confuse linear airtime with new daily original production.**

## Decision 1 — A single AI-native studio, not text-to-video loops
The user requires **zero filmed human presenters on screen**. Build a permanent, photoreal **Unreal Engine + MetaHuman** world with two *original fictional rigged* digital anchors (Nora and Marcus) reflecting the client-approved concept image. The digital scene itself produces all camera shots: no pasted office avatars, third-party filmed human source, random text-to-video scene regeneration or altered faces between episodes.

Performances are generated as final licensed synthetic speech audio + offline audio-driven MetaHuman facial solve + curated Control Rig listener/gaze/gesture animations + desk IK and shadows. Human production artists and financial editors work only behind the scenes. Test mouth/eye/hand naturalness against moving film before attempting full-length programmes.

### On-air synthesis methods and go/no-go
| Method | Decision | Main use | Required proof |
|---|---|---|---|
| Original fictional MetaHuman-compatible 3D anchors in one Unreal level | **PRIMARY**; no human filming | Daily multi-camera programme, same digital room and stable identities | 90s same-scene two-actor speaking/listening and desktop interaction at 1080p30 |
| Audio-to-face + curated Control Rig body/gesture states | **CORE**; governed by locked speech/animation version | Natural original fictional anchor performance | Original TTS words sync; no teeth/hair/eye/desk artifacts |
| AI video generation from stills | **LIMITED ONLY** | Original title sting, non-speaking stock footage with source/licensing review | No character drift, no fabricated US market data |
| Existing Liza/Lasse office photo-avatars and filmed presenter sources | **EXCLUDED FROM NEW ON-AIR PIPELINE** | Historical comparison only | They cannot substitute for the current fictional cast or common set |

## Decision 2 — Immutable 3D scene, characters and broadcast layers
**Client-approved premium blue newsroom** becomes ONE versioned `Stocks_Newsroom` Unreal Level with actual virtual geometry for glass desk, chairs, skyline, reflections, lights, shadows and camera A/B/C/D. Original Nora and Marcus are rigged *fictional* 3D character assets in that Level. Their identity and clothing lock to hashed `character_id`/`groom`/`wardrobe`/`voice_id` versions, so frames do not mutate as a model invents different people.

Render/compose separate layers: (1) 3D room; (2) rigged 3D actors and hand/desk IK; (3) frozen approved audio-to-face + curated listener animation and natural body motion; (4) independent deterministic source-driven on-air overlays; (5) audio, captions, as-of time and recorded/live status. **No baked LIVE or AI-generated stock prices in the Level.**

Mandatory camera registry, all inside ONE 3D scene:
- **A:** actual rendered 2-character shared desk with tested silent listener animation and arm contacts.
- **B:** Marcus medium close, stable lens/eye height/lighting/headroom/wardrobe.
- **C:** Nora medium close, matching the wide desk geometry and fixed character face.
- **D:** verified-data charts and presenter inset generated in post; on-screen virtual actor is from the locked rig.
- **R:** digital correspondent *only* after creating a separately approved fictional rig and compatible program source.

Use independent real-time graphics/CasparCG or Remotion overlays, not generative text inside backplates. The earlier still art is the visual reference, not a machine-ready model; a character artist/technical director must sculpt, rig, texture and verify the source-accurate models. See [AI-native mandate](AI_NATIVE_MANDATE.md) for full tests and asset deliverables.

## Decision 3 — Editorial programme model and US time context
Suggested **210-minute scheduling pattern** (example ONLY, not yet commissioned):
| Linear block | Minutes | Planned freshly editorial minutes | Other minutes (replays/explainers/graphics) |
|---|---:|---:|---:|
| Pre-market briefing | 30 | 15 | 15 |
| Opening Bell & Market Watch | 45 | 25 | 20 |
| Sectors and Mega-caps | 35 | 10 | 25 |
| Earnings Desk | 30 | 10 | 20 |
| Fed & Macro Explain | 40 | 10 | 30 |
| Midday Roundup | 30 | 10 | 20 |
| **Total** | **210** | **80** | **130** |

This is a potential **mature mix**, not 80 minutes of approved/produced material today. Clearly mark repeats, historical market updates, data cutoffs, market-closed weekends. No repeated clip can display current prices or claim LIVE; real LIVE requires an actual human-monitored output feed. Replays should carry original recording date and a current clearly labelled context card.

Additional recurring formats: premarket open watch, ETF/sector radar, earnings preview/review, US macro and Federal Reserve context, ETF fundamentals, SEC filing explainer, interviews, sector profiles, market-close package, weekend educational programming. Financial commentary does not imply specific investment advice. If Tamasha requires 3–4 hours of all-new original on-camera content daily, the crew/edit and licensing budgets must be separately designed and approved.

## Architecture diagram

```mermaid
flowchart LR
 SEC[SEC EDGAR / BLS / Fed / FRED / EIA] --> SRC[Source ingest + rights check]
 DATA[Licensed US equity/news feeds] --> SRC
 SRC --> CL[Immutable Fact & Claim Ledger]
 CL --> AI[AI Research / Script Draft / Graphics Planning]
 AI --> ED[Human Market Editor + Rights Approval]
 ED --> JOB[Durable Production Job Queue]
 JOB --> PRES[Locked original AI Nora & Marcus / MetaHuman audio-driven 3D performance]
 JOB --> GFX[Graphics Engine: Remotion / HTML/SVG]
 PRES --> ASSET[Versioned Media Registry + QC]
 GFX --> ASSET
 ASSET --> RUN[Approved Day Rundown / EPG]
 RUN --> PL[vMix pilot or CasparCG control-room playout]
 PL --> ENC[Persistent Encoder: SRT/RTMP]
 ENC --> TAM[Tamasha contracted ingest + distribution]
 PL --> REC[Program Monitor + Aircheck + Failover]
 REC --> OPS[Operator dashboard / incidents]
 ```

### Separation of services
| Component | Phase-1 recommendation | Responsibilities |
|---|---|---|
| Operator/approval console | Existing React/Vite/Next app on **Vercel only as control plane** | View data, source provenance, scripts, shot previews, approvals, budget, schedule, editorial history |
| API + workers | Node/Python on persistent compute; PostgreSQL/Neon, Redis queues | Source snapshots, graph of claims, job state, schedule validation, idempotency, retention |
| Object storage | Private S3/R2 or enterprise-approved bucket | Approved MP4s, audio, clean studio source, rights docs, per-asset checksums, expiry |
| 3D studio + digital cast | **One Unreal Engine Level + two original rigged MetaHuman-compatible fictional anchor characters** | Deterministic same-scene camera/lighting/desk geometry, scripted mouth/eyes/gestures and consistent face ID |
| Programme render | Remotion/FFmpeg/NVENC; generated sequences for repeatable 15–60min packages | Lower thirds, timestamped charts, subtitles, burned proof, video encode |
| Live graphics | CasparCG HTML data templates (or vMix GT titles during pilot) | One real brand mark, independent overlay data, live/provenance clocks, PIP |
| Production switcher | **vMix pilot on dedicated Windows GPU machine**; optionally CasparCG for automated 24/7 playout | 3 camera angles, media playback, program/preview, audio, simultaneous record/stream |
| Delivery | Authenticated SRT/RTMP as Tamasha specifies; HLS/Cloudflare only if distribution owned by Stocks | One shared program feed, not an AI session for every viewer |
| Monitoring + fallback | Separate watchdog, second playout source, 20–30min rights-cleared standby playlist | Black/silence/frozen-frame/encoder health alerts, on-air recording, emergency switch |

*Do not build an always-on 3–4h video feed in Vercel serverless functions.* A persistent compositor/encoder and source custody must be deployed separately. Cloud costs scale with **viewer-minutes**, not just source programme length.

## Editorial & market-data trust layer
**Sources:** SEC EDGAR/company filings, BLS CPI/jobs calendars and releases, Federal Reserve announcements, FRED macro series/vintages and EIA energy. For live share prices/trades/options/indices, contract a provider giving explicit **external display/redistribution/broadcast** rights, exchange entitlements and data-delay rules. Generic personal/developer quote plans do not imply redistribution rights. Reuters/etc headline/article/footage use requires licensed reuse or fully original paraphrased script with proper attribution where allowed.

Every displayed market claim must carry:
- `claim_id`, `instrument`, `value`, `unit`, `period`, `observed_at_utc`, `published_at_utc`, `source_id` + source URL/doc revision.
- Entitlement ID: external TV/broadcast rights `true` or `false`; `quote_kind`: live, delayed, snapshot, historical.
- Precision/exchange/session calendar/delay, permission to derive charts; staleness TTL; timezone converted from UTC to ET for presentation.
- Verification state: `gathered → validated → reviewed → approved → superseded/corrected`. Numerical claims rejected by default without structured provenance and human signoff.

LLM may summarize and suggest graphics/scripts, but **never invent prices, draw unsourced candlestick series or directly go on-air**. A market-moving claim should receive independent verification or editorial hold, and all breaking-news corrections must propagate to ticker, recorded pack and future replays.

## Producer workstream (reproducible media factories)
- Source ingest queue → classify/rank → journalist selects stories → structured fact ledger → AI draft with claim IDs.
- Editor approves text + pronunciations + footage rights.
- Produce the final approved TTS audio using locked fictional voice IDs; run offline MetaHuman audio-driven face solving, schedule curated idle/listener/gaze/body/hand animation in Sequencer, and render approved 3D camera takes; all model inference costs are budget-gated and no human performer is filmed.
- Editors cut speaker to camera A/B/C; graphics auto-render from claims, never from model-created mockup text.
- On-air captions from timed transcript; professional audio mix with source-target loudness agreed with Tamasha.
- Each scene gets SHA256, ingest profile, camera ID, source claims, source audio ID, dialogue/timecodes and approval.
- Compose per-block package (5–30min); human QA plus automated full decode, 0 black/silent unwanted segments, frame size, sampled cut-point images and caption timings. No automatic release on mere render success.

## Playout, redundancy and safety
- Maintain a **210–240min signed rundown** with cumulative durations, on-air type `LIVE` vs `RECORDED` vs `REPLAY` vs `EVERGREEN`, title, owned media, data-as-of, provenance, approvals and exact rights.
- Use one master program clock in America/New_York and store UTC instants. Timezone/DST and NYSE closed/holiday schedules are not assumed by LLM.
- Playout engine reads only READY, verified, checksum-matched packages; previously expired/withdrawn sources cannot enter.
- Live segments have live source health/producer authorization; if missing or failed, substitute **dated recorded** editorial or rights-cleared neutral standby, never fraudulently tag as LIVE.
- Record clean program feed and isolated audio; log real output start/finish and clip hash; watchdog independently detects black, freeze, silence, timestamp/queue loss and alerts operator.
- Separate backup encoder/recorded programme, manual switch procedure, two storage regions/portable source backup, and an incident review path.
- Per-shift on-air producer verifies multi-camera, data-feed freshness, layout, replay disclaimer and fallback before pressing start.

**Proposed SLO targets for pilot (to be measured, not promised):** scheduled airtime availability ≥99.5%; zero unreviewed/fictitious prices or missing broadcast rights; 100% approved clips and timestamped fact references; no known P0 lip-sync/identity mismatch; recovery-to-standby within 30s on planned fault injection; 48kHz and 1080p/29.97 or 30 by Tamasha spec. The actual loudness spec belongs to Tamasha (not arbitrary EBU/ATSC selection).

## Vendor feasibility and economics
**vMix**: official MAX subscription advertised at $50/mo, Pro lifetime $1,200; NDI/OMT/SRT and advanced titles available, but dedicated GPU/Windows hardware and operations are separate. Pilot choice is not a purchase.

**CasparCG**: open-source layered video/HTML playout via AMCP for automation; more engineering/operator integration but better long-term programmability.

**Unreal/MetaHuman**: PRIMARY original fictional character rig/3D newsroom pipeline. MetaHuman Animator supports audio-driven facial animation but convincing eyelids, gestures, hands, seated interaction and renderer throughput must still be engineered and visual-QA'd.

**LiveAvatar**: standalone from HeyGen standard plans. As of vendor's published 2026 Help Center: Lite = 1 credit/min, Full = 2 credits/min; Business $475/month for 5,000 credits (up to 5,000 Lite minutes or 2,500 Full minutes), max 60min session, 1080p custom; 3h/day×30 days = 5,400min and 4h/day×30 = 7,200min, exceeding that included Lite allowance even if a single avatar runs continuously. LiveAvatar also requires trained custom source footage and is not cross-compatible with every HeyGen avatar. **This is feasibility math, not a cost quote or recommendation to stream 4h of avatar speech**. Check current entitlements, overage, availability, broadcast license and latency before commitment.

**Cloudflare Stream**: published $5/month per 1,000 stored minutes and $1 per 1,000 viewer-minutes delivered, with ingestion and encoding included. For example 100 average concurrent viewers × 210min/day × 30 days = 630,000 viewer-minutes ≈ $630/month delivery, excluding any separate live playout and talent/licensing; 1,000 viewers ≈ $6,300. Only relevant if Stocks itself pays viewer distribution (Tamasha may instead distribute on its own CDN). Prices may change and need contract validation.

Other financial drivers: fictional digital character design and rigging, synthetic voice licence/usage, US finance editors and fact-checkers, virtual production technical artists/animators, licensed exchange data, dedicated GPU rendering and storage, backup playout, live monitoring, music/footage rights and maintenance. **Do not propose a confident fixed budget until camera, viewer/concurrency, freshness, and new-minutes/day are decided.**

## Indicative rollout gates (dependent on vendor, staffing and rights)
**G0 (1–2 weeks):** Tamasha integration spec, content/day definition, rights strategy, engineering baseline, script/data proofs, story approvals. No budgeted supplier activated automatically.
**G1 (2–5+ weeks estimated, may be longer):** model and rig two original fictional 3D anchors, create one approved Unreal virtual set/cameras, generate audio-driven motion and branded independent graphics; render continuous **90s fully synthetic two-presenter** proof and certify facial/desk realism.
**G2 (weeks 4–7):** data ledger + editorial CMS, asset warehouse, 10–30min original programme with QA, rehearsal studio dashboard.
**G3 (weeks 7–9):** live playout/encoder, 30–60min/day supervised UAT, independent capture, failover tests.
**G4 (weeks 9–12+):** increase schedule through 2h to 3–4h/day; require ≥7 consecutive error-budget-compliant runs, US exchange/news rights and consistent operations roster.

Estimates assume dedicated engineers, creative technical directors and market editors. Real vendor training/moderation or procurement can move these dates.

## Minimum operational roles
Executive Producer/Showrunner; US Financial Editor + second checker; **Character Artist/Technical Animator for two fictional 3D anchors**; Unreal Virtual Set TD + GPU Render/Pipeline Engineer; Broadcast Technical Director/Playout Operator; Motion Graphics and Sound Engineer; AI Speech/Data Engineer; SRE/monitoring/operator; Rights/Compliance coordinator. **No real human on-camera presenter roles.** Some roles can be combined in lower-volume pilot, but must have *actual coverage and substitutes* for daily 3–4 hour output. A real 4h/day channel is an operating team, not just a software build.

## Source documents consulted (official)
- Epic virtual production and camera calibration: https://dev.epicgames.com/documentation/en-us/unreal-engine/in-camera-vfx-overview-in-unreal-engine
- Epic MetaHuman Live Link: https://dev.epicgames.com/documentation/metahuman/realtime-animation-using-live-link
- CasparCG playout + HTML producer: https://casparcg.com/docs/wiki/server/ and https://www.casparcg.com/docs/wiki/media/html-templates
- vMix official license/comparison: https://www.vmix.com/purchase/default.aspx and https://docs.vmix.com/help29/NDIandOMT1.html
- LiveAvatar custom video training/plan/session: https://help.heygen.com/en/articles/10035615-how-to-get-started-with-liveavatar
- Cloudflare Stream cost basis: https://developers.cloudflare.com/stream/pricing/
- SEC corporate public API: https://www.sec.gov/search-filings/edgar-application-programming-interfaces
- FRED series and vintages: https://fred.stlouisfed.org/docs/api/fred/
- BLS economic calendar: https://www.bls.gov/schedule/news_release/cpi.htm
- Example market-data redistribution restriction: https://massive.com/terms/market_data_terms.pdf
- Remotion programme render comps: https://www.remotion.dev/docs/composition and https://www.remotion.dev/docs/render

## Repository implementation order
1. Reserve new architecture branch from R7 source-safety (do not merge experimental paid triggers).
2. Add auditable daily rundown type/contracts + fail-closed normalizer and examples. CI green does NOT authorize public feed.
3. Add claim provenance/quote license schema, signed approval records and stale/expiry policy.
4. Integrate protected operator UI/DB + proof of a *offline* 210min rundown generated from approved media once real assets exist.
5. Provision playout on dedicated persistent compute and run disaster/fallback drills.
6. ONLY THEN authorize market-data rights/commercial video avatar services and Tamasha feed deployment.

**Current release:** architecture v1 drafted only; daily rundown validator scaffold is the first engineering deliverable, not a real channel. No client delivery or paid provider inference is authorized by this ADR.
