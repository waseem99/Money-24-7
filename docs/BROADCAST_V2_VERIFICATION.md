# Broadcast V2 implementation evidence

Date: 10 October 2026. This records implementation and synthetic verification, not a real-provider audition or stakeholder approval.

## Implemented

| Area | Evidence | Limit |
| --- | --- | --- |
| V2 profiles/contracts | `src/broadcast/contracts.js`, `data.js`; exact sample/pilot durations; three-identity sequence test; explicit V1 migration | A simultaneous three-person panel is not a current template |
| Six layouts | Shared native SVG scene renderer; browser controls, deterministic seek/reduced motion; 45/300-second actual MP4 exports | Public preview uses placeholders; it does not display real avatars |
| Financial graphics | OHLCV, SMA/EMA, Wilder RSI, MACD line/signal/histogram, timestamped board/ticker, exact snapshot binding | Real OHLC is imported normalized data; quote feeds are not expanded into fabricated history |
| AI director | Structured scene/turn output, whole-claim insertion, validation and at most two repair attempts; durable budget test | Gateway output/semantic quality needs real-key audition and editorial review |
| Dialogue/media | Per-turn provider bindings, saved asynchronous jobs, moving listener registry, transparent WebM capability check | Silent reactions currently use accepted imported takes; sequential provider scheduling |
| Timing/composition | Exact spoken-token mapping through pronunciation aliases and repetitions; measured cue times; one active audio source; transparent overlay path | Metadata cannot prove phoneme-to-mouth lip sync |
| Review/revisions | Authenticated V2 endpoints, rendered video/captions, timed defects, exact-master approval, selective retakes and approved-output archive | Human review remains required; fixture/test patterns cannot be approved |
| Movement preparation | Screen/world coordinate mapping and three-route experiment specification | No executed walking/pointing/MetaHuman route |
| Later playout preparation | Durable readiness/expiry/supersession/claim ledger and question intake; restart test | No shared encoder, real fresh-answer loop or latency/soak certification |

## Tests and media

- `npm test`: 84 passing tests, including the previous 70 regressions and 14 V2 cases.
- `npm run build`: succeeds with the original viewer, V1 review and new broadcast preview.
- `npm run verify:broadcast`: actual synthetic moving-media import/composition, three turns, two identities, decoded VP9 alpha, listener coverage, measured cue/caption mapping, 1080p30/AAC/48 kHz, loudness and synthetic-approval rejection. Mock asynchronous production also verifies three speech submissions and three avatar submissions survive six status polls and a further resume without duplicate requests. No provider credits used.
- The CI workflow runs the V1 media verification and V2 media integration after tests/build. See the PR checks for the result on the published commit.

Full-duration fixtures rendered during this implementation:

| Profile | Frames | Duration | Output | SHA-256 |
| --- | ---: | ---: | --- | --- |
| Sample | 1,350 | 45.000 s | 1920×1080, H.264 30 fps, AAC stereo 48 kHz | `f537a9bbd79edf8cc1e20f0b8c73f2501a1d52bc5e8b747d610e705873b3918d` |
| Pilot | 9,000 | 300.000 s | 1920×1080, H.264 30 fps, AAC stereo 48 kHz | `9e9434fca7f2d374f5c438b635c2e47b7da2318665c350205ae186cd7173b257` |

These are silent, labelled layout rehearsals. They were produced before the final MACD histogram/board-detail refinement; the final graphics also pass the moving-media integration path. Run manifests retain their exact renderer hashes. Neither output is an acceptable real-presenter approval film.

The five-minute fixture's graphics pass took 304.5 seconds on this shared worker; total render/QA took 318.7 seconds while other verification ran. This is an observation for that run, not a controlled performance benchmark and not AI generation latency. Native SVG was selected for shared deterministic output, existing Sharp/FFmpeg compatibility and no additional renderer licence. Remotion and browser chart renderers were not benchmarked in this implementation; no comparative performance claim is made.

Visual inspection: the unequal split with the analyst/chart wall was rasterized and reviewed at 1280×720. Browser automation locally was blocked by the unavailable browser executable and failed browser download; the deployed preview is checked separately when available. Dense technical labels are intended for full-screen chart views; human review of actual presenter compositions is still pending.

## Remaining acceptance gates

1. #24 / NR-07: actual 45-second conversational audition with compatible realistic faces/voices, standing alpha and acceptable non-speaking listener performances.
2. #26 plus #12/#13/#6: real five-minute master, complete quality review and stakeholder acceptance. Existing code is not sufficient evidence to close these.
3. #25 / NR-08: execute movement route comparisons using permitted clips or a GPU/rigged 3D setup, then record an explicit creative decision.
4. #27 / NR-09: after film approval, implement/connect the hosted shared output and fresh-answer worker; run the 30-minute, 20-sample trial with failure injection. The 60–120-second freshness target is unproven.

Credentials, private faces/voices/media, local tokens and runtime job databases are not committed. Provider prices are not invented; operator reservations are estimates and actual invoices remain separate. See [the runbook](BROADCAST_V2_RUNBOOK.md) for the exact next commands and account-dependent inputs.
