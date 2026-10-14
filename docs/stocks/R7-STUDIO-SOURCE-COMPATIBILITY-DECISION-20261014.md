# STOCKS — Studio-first, source-compatible production decision (October 14, 2026)

**Owner objective:** Match the client-approved two-presenter blue financial-newsroom composition, while retaining real, licensed original speaker performances, accurate US-market information and the small Tamasha × Stocks corner mark. Never imply an on-air release has passed creative QA simply because a file decodes.

**Root-cause correction:** Earlier films displayed offices with cupboards, white shelving, household objects and inconsistent lighting because the licensed performer source clips were **generated or recorded in those offices**. A reference still is a single internally consistent image; it is NOT a recording, a layered 3D studio, actor rig, synchronized dialogue, or proof of spatial camera continuity. Removing/background-replacing the existing offices only partly works: the original standing/medium-shot bodies, perspective and motion edges do not establish two naturally interacting people at the same desk.

## Track 1 — urgent *source-safe* recorded bulletin: done as a production review, not a physical shared desk

Output generated privately and independently from existing authentic materials:
- `STOCKS-SOURCE-SAFE-CORRECTED-REVIEW-1080P.mp4`: **140.766667 seconds (2:20.77)**, 1920×1080, 30fps H264, AAC/48k, **13,945,619 bytes**, SHA256 **`e2f40f21c0b14d9d1fdbea30348300203911c352318126efc541abfeadb8a574`**. Full FFmpeg A/V decode passed. Local QA sheet: `STOCKS-SOURCE-SAFE-QA-SHEET.jpg`.
- No new provider requests, video actors, audio voices, unlicensed third-party clips or paid generation.
- FIRST genuine moving video appearances use `NORA.mp4` / `NORA-matte.webm` and `MARCUS.mp4` / `MARCUS-matte.webm` **with their exact matching original audio only**; their baked-in cupboards and shelving are not presented. No unmatched voiceover with mouths moving.
- Remaining previously licensed dated market narration is retained **as audio only** under separate, source-grounded full-opacity topical infographics, never with the original office picture or a frozen faux listener.
- Same dated US-market identity throughout; 1 small T + Stocks bug at upper-left, one topical metrics panel, lower thirds, historical market ticker, animated original intro/tail, `REPLAY` label rather than false LIVE.
- Detected scrolling ticker crossing the fixed left and right label blocks; applied full-opaque bottom-corner shields to stop the overlap. Full frame sampling from intro through closing complete. Exact publication rights and per-fact editorial signoff remain open; do not call this live or Bloomberg-level set footage.

**Honest presentation label:** `Stocks — US Market Watch / Recorded Editorial Pilot / 12 October 2026`. This is the more coherent/no-baked-office replacement for the earlier 2:13 cut. It is a *salvage deliverable* with presenter shots and graphic cutaways, NOT the desired full-shot shared-desk program.

### Work actually required for exact approved newsroom look

**A. One physical studio as the primary asset** — build a single licensed photoreal 3D/virtual set or film an actual set, *without people or baked-in graphics*. Lock wall geometry, glass desk, virtual LED source wall, true chair positions, skyline, master lighting, grade and reflections. All camera views must come from the **same scene**:
- Camera A wide: two presenters physically behind one desk, eye line/shoulder/hand geometry feasible
- Camera B Marcus close: lens, eyeline, shadow and wardrobe actually consistent
- Camera C Nora close: same requirements
- Camera D/E sourced market charts + speaker inset; Camera R separately licensed correspondent if actually needed
- Keep one right market board, reserved subtitle zone and bottom ticker; no second T/Stocks on back wall, no fictitious LIVE, no unverified data embedded in generated pixels

**B. Presenter SOURCE produced for the studio** — our current photo-avatar material cannot provide reliable naturally seated shared-desk interaction. Two viable routes:
1. **Preferred reliable:** professionally film two consented presenters in the same physical lighting/camera setup (or video-train licensed custom presenter looks from such footage); capture 16:9, equivalent camera height, matched desk forearms, quiet neutral poses, on-camera turns and listening reactions.
2. **Experimental AI-native:** generate one **whole-scene** native short two-person establishing clip (not two independent isolated photos) with consistent cast; test identity + lip sync/gesture. Stop if it alters approved appearance or invents text/graphics. Requires specific user authorization and budget.
Both alternatives must use approved identities or obtain explicit recast authorization. A still image does not authorize a new performer.

**C. Deterministic on-air compositor** — original small Tamasha logo, Stocks wordmark and `MARKETS BUSINESS PEOPLE`; named lower thirds; one right-side source-driven metrics panel; lower headline; scrolling US index/stock ticker; historical date/as-of; original stinger and tail. All broadcast text and charts belong in code, not background image generation. No static background layers containing random logos/prices/anchors.

**D. Actual shot QA (human, no “successful API” substitute)**:
- No cupboards, shelving, household objects, floating limbs, hair halos, chopped head or desk penetration anywhere
- No different actor, sudden wardrobe change, false off-camera listening loop or unrelated lip sync
- Same room/lens/eyelines/lighting for Camera A/B/C
- Both sources audible, no false data/date; fast natural editorial cuts
- Full-frame scrub every 0.5–1 sec plus actual full playback, source rights, checksum and A/V decode
- ZERO unresolved P0/P1 issues before 45–65s golden-sample approval
- **Do not generate any full-length cast assets until the 8–12s whole-scene motion QA passes** and exact billable job/voice/look permission is granted.

## Production phases and decision gates

| Phase | Deliverable | Pass condition | Next on fail |
|---|---|---|---|
| Short-term (now) | Source-safe 2:21 dated MP4 + QA | Complete decode; no baked source office in graphics; time-locked claims and voices | Isolate problematic scene; do not invent a shared desk |
| Studio asset | One photoreal *empty* room A/B/C | Real common camera/perspective + desk/lights, no pixels of strangers/numerical facts | Rebuild same 3D set; no random independent images |
| Presenter proof | 8–12 sec actual moving studio performance | Approved identities, source lip sync, natural motions, occlusion | Film consenting presenters or explicitly approved new video-trained look |
| Golden pilot | 45–65 sec fully voiced, real cuts and graphics | Zero P0/P1 and creative approval to exact SHA | Fix only failed shot |
| 2–5min master | Full original editorial programme | Source/rights/fact QA, broadcast ingest, 1080p/30fps and client signoff | No release |
| Scale | Daily/weekly template | Versioned newsroom/cast/camera data + monitoring | Suspend publishing if date/rights/media mismatch |

## Follow-up authority needed — not a blocker for no-spend tests
- Does the client **require the same two approved Liza/Lasse faces** in a convincing simultaneous shared desk? Their current footage doesn't meet that; authentic filmed/video-trained pair is the reliable route.
- Agreement to spend on a short whole-scene test, or to supply new licensed filmed source; any spend must be specifically approved before submission.
- Tamasha/Jazz ingest profile and allowed use of market data/editorial assets for commercial distribution.

## Engineering controls
- All historical source media stay in the *private Google Drive archive* created previously; do not commit video/voices/likeness assets to the public repository.
- Review-only pipeline is offline; input manifest must pair every onscreen talking video with its own original video/audio or prohibit it entirely, and must prohibit baked offices when production camera preset = `shared_studio`.
- New paid generation locked to manual approvals and exact request hashes. Never trigger provider jobs via GitHub PR/push event.
- On video generating provider failure or unknown completion, do GET-status recovery before any spend; no automatic retries.
- Keep R5 12 Oct early-session voice material separate from W5/W6 12 Oct market-close voices. Do not mix scripts/editions.

**Issues:** #37 production master; #43 photoreal studio gate; #45 root-cause/source-first correction. This branch only documents and guards the strategy. No merger to main, no paid API call, no claim of an approved true two-person desk video.
