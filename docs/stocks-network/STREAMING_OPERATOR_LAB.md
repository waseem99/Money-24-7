# Stocks Q0–Q2: LiveAvatar LITE Operator Lab — Implementation and Readiness
**14 October 2026 · No billable sessions created.** Parent epic [#52](https://github.com/waseem99/Money-24-7/issues/52), architecture [ADR-002](../stocks-network/ADR002_VENDOR_FIRST_STREAMING_AVATARS.md).

## What the code now actually does

- `stocks-streaming-lab.html` is a **private operator integration page**, distinct from the earlier public Signal site and client artwork.
- `network/streaming/operator.js` can attach **two already-authorized LiveAvatar LITE session tokens** via the SDK, listen for real media readiness/disconnection, stop or switch cameras, and show a transparent chroma-key video against a **locally selected empty studio image** (the clean background stays in the operator's browser).
- `network/streaming/keyer.js` implements a **WebGL GPU green-screen key**, with shader opacity and cleanup for each actual avatar stream. It is a technical candidate; hair/glasses halos and alpha edges require review at true source resolution.
- `network/streaming/vendor-policy.mjs` blocks auto-connection, unapproved fictional identities, per-viewer paid sessions, LIVE claims without transmission evidence and session caps over 90 seconds; each manual start requires an existing token, identity/rights approval checkbox and separate credit approval checkbox.
- **No provider token minting is implemented here.** The application has zero API keys, won't buy credits, won't run speech synthesis, and will not start anything on page load. If a user hasn't obtained a legitimate producer-issued LiveAvatar token through their separate provider account, the lab *cannot* test video. Tokens are kept in browser runtime and cleared from inputs; do not use on a public deployed URL.
- Market side panel intentionally reads **NO LICENSED MARKET FEED**; this cannot accidentally display illustrative/fake imagegen figures. No LIVE tag in the output; the preview says it is an operator test, not public TV.

## Safety and deployment

The operator page is **disabled in the default public Vite build**. In `vite.config.js`, `STOCKS_BUILD_OPERATOR_LAB=true` must be set in a dedicated private, authenticated operator environment to bundle it. For local dev, `npm run dev` then `http://localhost:3000/stocks-streaming-lab.html` is accessible; no provider connection occurs until manual Start. Do NOT expose that developer route on any public production hostname without access control and durable billing authorization.

**Browser best-effort cap:** `60` seconds by default, `90` seconds max. If browser crashes or tab sleeps, a provider session can remain billable. Before commercial deployment, implement a dedicated producer control service with persistent session ledger, server-side absolute TTL, idempotent start keys, provider STOP on heartbeat loss, and a watchdog. Tokens MUST be server-issued to authorized operator, never per audience viewer. No browser control is equivalent to a real billing cap.

## Voice and streaming limitation

Custom avatar **motion may be streamed** through LITE; our own audio/TTS → provider lip-sync remains an UNPROVEN integration. LiveAvatar's docs describe 24kHz PCM audio into LITE mode; a reported older SDK `repeatAudio` wire-format bug occurred with custom video avatars (GitHub [issue #92](https://github.com/heygen-com/liveavatar-web-sdk/issues/92), patch discussion [#103](https://github.com/heygen-com/liveavatar-web-sdk/pull/103)). Current repo dependency is `@heygen/liveavatar-web-sdk@0.0.19`, and no source audio has yet been proven end-to-end for our own avatars. **Do not claim lip sync works from a successful WebRTC session.** Confirm updated official LITE audio command usage with current vendor and run a 10s licensed PCM test before production.

## The *actual* image reference source

User-approved source: `u.s._stocks_extend_gains_broadcast.png`, 1672×941, SHA256 `385aafd5244033a7bb691e17ca5d4807364415ea642e1bd256d8307e5a20029f`.

We made simple **identity-reference-only** single-character crops:
- Nora 270×480 source crop; upscaled (no new real detail) to 1080×1920, source position [238,110,508,590].
- Marcus 270×480 source crop; upscaled to 1080×1920, source position [850,105,1120,585].
- Both original fictional face shapes visually retained, but source resolution is far too low to guarantee quality custom-avatar training. **NOT provider-enrollment-approved**. The final neutral, closed-mouth, front-facing 1080p custom avatar portraits must be created at native quality and compared to the approved original faces (not generatively replaced with different people) before applying for fictional-image LiveAvatar approval.

The source still contains pre-existing generated market figures, name bars and characters. It is an **art-direction frame**, never a green-screen/room layer or a source of financial prices.

## What we need from the user/provider

1. **Dedicated LiveAvatar** subscription/account, not merely regular HeyGen credits. Confirm supported custom image avatars of original fictional people, moderation/consent requirements, two 1080p slots, trial/sandbox, commercial TV broadcast and re-stream/record rights, data locality and account credit balance.
2. Exact authorized **test budget cap** (initial target at most one 30–60sec Nora test, not two daylong sessions). Add manual user approval and audit receipt before any provider POST.
3. Real provider source IDs and valid session token minted through a **server-side private operator**, not in public browser or GitHub; that requires a provisioned producer API with proper auth and server TTL.
4. High-resolution, identity-consistent neutral one-person image for each character; user creative review and provider eligibility first.
5. A **clean empty blue studio** image/video or virtual set, with no humans, baked words, arbitrary numeric charts, logos or LIVE tag; our independent ticker/market graphics will be drawn separately.
6. Genuine 30–60sec live avatar and PCM speech test, then two-person handoff and a 90sec moving source-approved film.

## Quality certification

Connection success ≠ face realism. Quality requires:
- actual moving frames and documented identity compared with original fictional faces
- real visible lips synchronized to our approved spoken US-market words
- clean hair/eyeglasses/shoulders edges over approved blue set at 1080p
- operator switching A wide, B Marcus, C Nora without fake simultaneous desk interaction
- no human office/cupboard leaks, no invented market data, no unlicensed on-air rights
- complete audio/visual encode and signed human review SHA

**No 3–4h/day service, brand-quality output or paid test has been delivered by this lab.**

## Vendor docs consulted
- https://docs.liveavatar.com/docs/lite-mode/overview
- https://docs.liveavatar.com/docs/guides/change-background
- https://github.com/heygen-com/liveavatar-web-sdk
- https://github.com/heygen-com/liveavatar-web-sdk/issues/92
- https://docs.liveavatar.com/api-reference/sessions/create-session-token
