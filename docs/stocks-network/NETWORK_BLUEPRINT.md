# STOCKS Broadcast OS — 3–4 Hours/Day Premium US Financial Television
**Architecture decision record v1 · 14 October 2026 · Design/engineering plan, NOT a deployed station**

**Product:** Tamasha × Stocks, US markets exclusively.  
**Goal:** Operate 180–240 minutes/day of consistently professional, accurately sourced programming, potentially including live, live-to-tape, recorded, explainers and explicitly labelled replays. 30 broadcast days = 90–120 linear hours/month; US trading weekdays and market-closed weekends require separate formats. **Do not confuse linear airtime with new daily original production.**

## Decision 1 — A real network pipeline, not text-to-video loops
For a 3–4h/day premium network, make a **permanent set with repeatable multi-camera capture** and use AI mainly for editorial preparation, fact extraction, shot scheduling, chart generation, subtitles, technical quality assurance and reusable pre-recorded presenter packages. No black-box generative clip engine should be trusted to keep 2 actors, hands, glass desk, backdrop numbers and lighting unchanged for hours. The existing "approved perfect still" is a design reference, NOT a layered rig/camera/performance source.

**Default on-air performer path:** two contracted/consenting real presenters filmed in a small, genuine, controllable blue studio or physical foreground + calibrated virtual LED/green-screen back wall. Exactly one master physical/3D room, same furniture/light/camera axes. Consistent multi-camera footage is the most reliable route to an exact, believable shared desk with listener gaze and hand contact.

**Supplemental on-air path:** separately qualified video-trained/live digital twins for off-hours prerecorded news inserts; always consented/licensed, tested as single-frame medium shots and capped to approved use. Fully 3D MetaHuman/live animation may become a parallel R&D project, NOT the first release bottleneck. Existing Liza/Lasse photo avatars from past runs are not evidence of human-realistic continuous desk performance.

### Options and go/no-go
| Talent method | Visual reliability for 4h/day | Operational role | Pre-release proof |
|---|---|---|---|
| Actual filmed on-camera anchors + physical desk (RECOMMENDED) | High if properly shot and staffed | Main/flagship programmes and multi-person desk | 90s uninterrupted wide/close/return interview + 2 camera voices |
| Video-trained AI digital presenter with consent | Varies; can work for one speaking waist-up camera | Secondary updates, pre-recorded explainers or emergency | 60s measured natural lip/eye/wardrobe, same-room integration + rights |
| Animated MetaHuman/3D actor in one Unreal scene | One room/geometry feasible; facial realism difficult | Parallel scalable R&D for off-hours packages | 2min speaking + 60s listener and multi-camera, no uncanny valley |
| One-image → 5–15s generative animation | Not stable as a programme source | Opening stings, transitions or visual B-roll only | Art direction; NEVER pass as full presenter footage |

## Decision 2 — Visual studio is an immutable production asset
Design to match approved blue desk style but **do not paste generated figures/heads/market metrics**. Physical layers:
1. Background: real room or one Unreal Engine level (lighting calibrated, cityscape licensed, no built-in LIVE/title/ticker/quotes).
2. Physical desk/laptops/chairs/prop geometry; consistent camera optical height, lens metadata, eye-line lines, keys, floor contact, shadow catchers.
3. Original consenting on-camera presenter feeds; optional licensed/filmed AI clone *only after review*.
4. Independently drawn broadcast overlays (one *small* real Tamasha T + Stocks, MARKETS BUSINESS PEOPLE, individual names, headline, right source-driven market panel, ticker, replay/recorded/live status).
5. Deterministic voice/caption/time-code and data overlay; the 16:9 frame is composed live or offline from these same assets.

Mandatory production camera registry:
- A: natural wide of both actual people at single physical desk; no stitched cross-actor visual fraud.
- B: Marcus medium with measured headroom/desk edge, original camera lighting/wardrobe.
- C: Nora medium matching eye level/perspective.
- D: chart-screen and presenter picture-in-picture, original own lip/audio.
- E: desk-to-analyst/vertical board only if physically shot.
- R: genuine remote SRT/call source with separate editorial fact/source package.

Minimal set: 2–3 camera lenses, actual desk/chairs, key/fill/rim lights, capture equipment, controlled audio, clean physical backdrop with optional green/LED, switcher operator. For virtual backgrounds, Unreal Composure/Live Link/Virtual Camera can match geometry; it does not automatically create believable actors.

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
 JOB --> PRES[Filmed Anchors / Approved Digital Inserts]
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
| 3D studio | **Actual partial set first**; Unreal Engine when camera matching earns value | Consistent set, matched cameras, shadows and desk/lighting geometry |
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
- Real presenter records approved rundown (multicamera ISO + clean audio); synthetic inserts generated only with human approved exact script/voice/likeness and capped billing.
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

**Unreal/MetaHuman**: supports calibrated virtual cameras, compositing and real-time face motion; must be tested for realism and performance, *not treated as an all-in-one human replacement*.

**LiveAvatar**: standalone from HeyGen standard plans. As of vendor's published 2026 Help Center: Lite = 1 credit/min, Full = 2 credits/min; Business $475/month for 5,000 credits (up to 5,000 Lite minutes or 2,500 Full minutes), max 60min session, 1080p custom; 3h/day×30 days = 5,400min and 4h/day×30 = 7,200min, exceeding that included Lite allowance even if a single avatar runs continuously. LiveAvatar also requires trained custom source footage and is not cross-compatible with every HeyGen avatar. **This is feasibility math, not a cost quote or recommendation to stream 4h of avatar speech**. Check current entitlements, overage, availability, broadcast license and latency before commitment.

**Cloudflare Stream**: published $5/month per 1,000 stored minutes and $1 per 1,000 viewer-minutes delivered, with ingestion and encoding included. For example 100 average concurrent viewers × 210min/day × 30 days = 630,000 viewer-minutes ≈ $630/month delivery, excluding any separate live playout and talent/licensing; 1,000 viewers ≈ $6,300. Only relevant if Stocks itself pays viewer distribution (Tamasha may instead distribute on its own CDN). Prices may change and need contract validation.

Other financial drivers: broadcast presenter salaries/rights, US finance editors and fact checkers, production crew, licensed exchange data, camera/lighting/desk/LED rentals, GPU workers, playback backup, live monitoring, music/footage rights, maintenance. **Do not propose a confident fixed budget until camera, viewer/concurrency, freshness, and new-minutes/day are decided.**

## Indicative rollout gates (dependent on vendor, staffing and rights)
**G0 (1–2 weeks):** Tamasha integration spec, content/day definition, rights strategy, engineering baseline, script/data proofs, story approvals. No budgeted supplier activated automatically.
**G1 (2–4 weeks):** real/partial set, cameras, source-trained cast shoot, branded data-driven graphics; continuous *90s two-presenter* proof.
**G2 (weeks 4–7):** data ledger + editorial CMS, asset warehouse, 10–30min original programme with QA, rehearsal studio dashboard.
**G3 (weeks 7–9):** live playout/encoder, 30–60min/day supervised UAT, independent capture, failover tests.
**G4 (weeks 9–12+):** increase schedule through 2h to 3–4h/day; require ≥7 consecutive error-budget-compliant runs, US exchange/news rights and consistent operations roster.

Estimates assume dedicated engineers, creative technical directors and market editors. Real vendor training/moderation or procurement can move these dates.

## Minimum operational roles
Executive Producer/Showrunner; US Financial Editor + second checker; 2 lead on-camera presenters and backup; Broadcast Technical Director/Playout Operator; Motion Graphics/Virtual Set TD; Broadcast Audio/Video Engineer; AI+data backend engineer; SRE/monitoring/operator; Rights/Compliance coordinator. Some roles can be combined in lower-volume pilot, but must have *actual coverage and substitutes* for daily 3–4 hour output. A real 4h/day channel is an operating team, not just a software build.

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
