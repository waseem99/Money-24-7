# ADR-002 — Vendor-first real-time AI presenters for Tamasha × Stocks
**14 October 2026 · supersedes "MetaHuman-first" recommendation; DOES NOT authorize provider charges.**

## Decision

**FIRST CHOICE: BUY the animated-avatar technology; BUILD the broadcast system.**
Start with HeyGen's separate **LiveAvatar LITE Mode** service, then competitively test Beyond Presence and Tavus/Simli where beneficial. Keep Unreal Engine + original rigged MetaHumans as a contingent **fallback** only if real moving-video tests demonstrate commercial streaming avatars cannot retain the client-approved original fictional faces, cleanly match the studio, or operate at viable long-run cost/reliability.

The channel **still has 100% fictional AI on-screen hosts**, Nora and Marcus. No human spokespeople/real-person face clones/filmed actors appear in the final programme. Internal human editors and broadcast technicians remain off-camera.

We own: the original approved AI faces and character rights; fixed premium blue studio design; broadcast logo and all graphics (one small original T+Stocks bug top-left, `MARKETS BUSINESS PEOPLE`); U.S.-only financial facts, editorial/rights system, TTS voice selection and script control; rundown, switching, RTMP/SRT output, time-shift, failover and archive. **The vendor provides real-time face/body animation and streaming**—not autonomous financial commentary or our programme graphics.

## Why this is feasible now
1. Official LiveAvatar **Custom LiveAvatar Creation Guide** explicitly describes **image-to-live-avatar**, a single 1080p 16:9/9:16 image, one face, centered straight-on, chest-up, neutral closed mouth. The approved two-person full programme still must be converted to **separate approved fictional portraits for Nora and Marcus**, without redrawing identities. A two-person upload will fail. Official: https://help.heygen.com/en/articles/9612935-liveavatar-custom-avatar-creation-guide
2. LiveAvatar also documents a custom AI/non-human/3D character route. Synthetic avatar footage can be submitted with rights/consent review; some synthetic characters require manual provider approval, *not automatic guaranteed eligibility*. Official: https://help.heygen.com/en/articles/10035615-how-to-get-started-with-liveavatar
3. **LiveAvatar LITE Mode** accepts our external speech/audio and streams lip-synced avatar video, allowing our script-and-market editorial stack to remain in our control; one credit per avatar-minute vs Full's 2. Official: https://docs.liveavatar.com/docs/lite-mode/overview
4. LiveAvatar officially documents green-screen **real-time chroma key** to our background image/video using the SDK raw MediaStream and a Canvas: https://docs.liveavatar.com/docs/guides/change-background . That supports the user-designed blue TV studio without recreating a new generative background for every segment. This **does not guarantee** natural desk contact, hair/eyeglass edges or correct simultaneous two-person reactions; require direct playback QA.
5. Existing repository `main` already has `api/avatar-token.js`, `api/liveavatar/v1/sessions/[action].js`, SDK dependency `@heygen/liveavatar-web-sdk`, and prototype `src/main.js` HLS UI. This is **operator demo wiring, not a verified shared 4-hour feed**. It currently uses **FULL** session mode with a server-key-and-access-code control. Build a separately provisioned LITE test path with private credentials and strict budget controls; reuse authenticated logic only after review.

## Explicit selection comparison

| Candidate | Why trial | Risks / acceptance |
|---|---|---|
| **HeyGen LiveAvatar LITE (PRIMARY)** | Existing prototype wiring, image-based custom LiveAvatar route, own TTS/LLM, documented SDK chroma-key backgrounds, public and 1080p custom Business tier | Exact fictional images need separate high-res portraits and provider consent/moderation eligibility; one custom 1080p Business slot included, second may incur cost; 60min session maximum on Business; no natural shared-desk proof, edge-key fidelity untested |
| **Beyond Presence (SECOND)** | Custom 1080p, lower-cost speech-to-video tiers, Scale plan image/text-to-avatar capabilities, configurable session duration | Exact fictional face preservation, chroma-key/studio fit, broadcast output and licensing unverified; require independent end-to-end vendor trial |
| **Tavus CVI (THIRD)** | Higher-level conversational streaming SDK, real-time human-like avatar, image-to-replica options depending on plan | Product is oriented around interactive 1:1 conversations; costs may be high for channel hours; no proven live-program switcher/native common desk |
| **Simli (RESERVE)** | Low-latency audio-to-face real-time platform; custom faces and developer APIs | Need proof on full-HD studio camera layout, consent/commercial broadcast rights, long session stability |
| **Unreal + owned MetaHuman 3D rigs (FALLBACK, not default)** | Maximum custom camera geometry/desk/hand contact and no per-minute avatar SaaS dependency | Slowest character rig/realism route, GPU operation, grooming and motion QA costs; only approve after SaaS camera/identity tests fail |

## 3–4h/day operating model
**3–4h per day is PROGRAMME AIRTIME, not necessarily 3–4h active streamed avatar.** With each studio show:
- One shared broadcast channel output; never create an avatar session per viewer.
- Run two presenter provider connections **only when needed**; switch to single speaking person while other anchor is idle/off-screen, and replace shared wide with source-accurate chart cutaways or a pre-recorded **fully approved** simultaneous two-person establishing scene. Do not claim natural two-person desk interaction simply from two composited separate feeds.
- A dedicated continuous compositor (e.g. vMix/CasparCG/LiveKit/WebRTC source capture on persistent GPU machine) controls camera switching, chroma key/background, sound mixing, script timing, presenter naming, sourced market data screens, lower thirds, ticker, ident, playout, recording and broadcaster feed.
- A long linear playout consists of short editorially approved LIVE/RECORDED/REPLAY blocks, and runs independently of any one avatar's fixed session lifetime. Backups are rights-cleared pre-recorded US market explainers without false LIVE badges.
- Provider cost is based on **billable simultaneous avatar-session minutes**, not TV viewership or programme length per se; two concurrently billable sources may double avatar minutes. Session limits require seamless handoff at approved programme breaks and backup slate on disconnect.
- Market facts require independent source/redistribution licences and human US market editorial signoff. Generated studio mockups must never contain fabricated prices.

## Current commercial indicators — validate live account and quote before spend
- LiveAvatar service is separate from standard HeyGen API wallet. As published on official LiveAvatar website, Business lists `$475/mo, 5,000 credits, up to 60-minute sessions, one custom 1080p avatar`. In LITE Mode, 1 credit/minute ⇒ ~5,000 avatar-minutes included; Full uses 2/minute ⇒ ~2,500 avatar-minutes. Provider documentation and site snapshots sometimes disagree on included credits, so confirm **live account, regional taxes, overages, two custom 1080p slots, commercial broadcaster permissions and sessions/restarts** with vendor sales and written quote.
- 3h/day × 30 = 5,400 and 4h/day × 30 = 7,200 *programme minutes*. Continuous ONE avatar would exceed the illustrative 5k monthly included LITE minutes; running TWO avatars simultaneously may double charge. Time spent on graphics, interstitials and curated media does not require an avatar session.
- References: https://www.liveavatar.com/ ; https://help.heygen.com/en/articles/10035615-how-to-get-started-with-liveavatar ; https://www.beyondpresence.ai/pricing ; https://www.tavus.io/pricing ; https://www.simli.com/ .
- **Do not pay, purchase or silently generate** without explicit account/source-specific approval.

## Zero-paid prototype: provider gate V0–V5

**V0 — Character source rights and readiness.** Produce two original, neutral, front-facing, chest-up **single-subject** portraits derived from the client-approved fictional Nora and Marcus faces. No background words, charts or logos; minimum source 1080p in permitted ratio. Show identity-preservation/contact sheet to user before upload. One avatar per image.

**V1 — Provider eligibility.** Verify with LiveAvatar dashboard/representative that these are eligible fictional image-to-avatar assets; confirm image-to-avatar accepts fictional AI identities and moderation/consent in our account. Confirm at least 2 separately licensed full-HD custom avatar slots or a cheaper staged alternative. **No guess that ordinary HeyGen-photo-avatar IDs work with LiveAvatar.**

**V2 — Single-source end-to-end real motion.** Using approved limited billing, start 30–60s **LITE Mode** API stream for ONE fictional character with source-script and voice; capture raw WebRTC video+audio, motion and clean background key over our studio. Verify facial identity, blink/mouth expression, source audio matching, smooth 1080p edges and recording. Compare EXACT frames with approved portrait reference.

**V3 — Dual-anchor handoff & TV visual grammar.** Two separate approved avatar sources; one actual programme-clock composition with wide establishing (only if it looks legitimate), Nora close, Marcus close, data/PIP, lower-thirds/ticker and *no baked numbers*; 60–90s with natural listener motion or cutaways. Degrade to clean single-anchor shots if shared desk physical interaction fails. Visual acceptance is a mandatory human review; do not declare it from SDK stream activity alone.

**V4 — Soak, failover, session churn.** Test actual provider limits: continuous 15–60min session, segment handoff/reconnection with a branded chart/recorded insert, stream restart, audio-video offset, silent-frame/freeze failure, standby switchover under studio operator control; baseline minutes, 1080p source fps, latency, error rate and true vendor bill. Require written commercial TV feed reuse permission.

**V5 — Working channel integration.** After positive QA, wire real source into persistent compositor and one authenticated shared program feed. Maintain separate Vercel web operator interface and versioned approved media; build 30min/day → 60min/day → 2h → 3–4h. Every programme must still pass US finance fact/source/rights approval.

**Fallback trigger:** If SaaS animation cannot preserve exact fictional faces in our background, green-screen edges remain distracting, concurrent studio interaction cannot pass, or costs/session churn make continuous output operationally unreliable, evaluate **Unreal original 3D character rigs** and/or a different streaming avatar provider. Do not revert to image-to-video stills as a channel pipeline.

## Next GitHub tasks
- Read-only audit the existing LiveAvatar FULL Mode Vercel operator API for a LITE test path; do NOT start a billed session.
- Obtain 2 clean source portrait assets from image 2, verify fictional/original identity rights, one person per image and ready 1080p.
- Build isolated provider adapter contracts and mock WebRTC stream routing with no API key; add tests that block generated LIVE prices, on-air human faces, unapproved characters and per-viewer paid sessions.
- Convert charter Issue #48/AI-only design from "MetaHuman only" to "external licensed fictional AI presenter first"; preserve MetaHuman as optional fallback.
