# STOCKS — Vendor streaming-avatar implementation preflight

**Status:** source-safe, offline engineering scaffold. No real streaming service, avatar creation, paid session, provider permission or broadcaster output is claimed.

## Completed in this branch
- Provider-agnostic validation contract `network/live-avatar/provider-contract.mjs`.
- Offline checks for two fictional US-financial presenters, one portrait per character, 1080p or greater input, face/asset commercial approvals and script/voice/billing locks.
- Tests reject human likenesses, unapproved fictional identities, per-viewer avatar sessions, false LIVE, unsourced prices, and unsafe chroma key.
- Existing `api/avatar-token.js` and `api/liveavatar/v1/sessions/[action].js` on main are an older **FULL Mode** limited operator preview. Do not reuse those unchanged as a continuous shared live channel or expose token/session creation publicly.

## Sequence to complete next

1. **Character images.** Derive *separate*, identity-preserving high-resolution head/chest portraits of the approved fictional Nora and Marcus, straight-on, neutral mouth, no other faces or baked-in financial data; creative approval on each original image and actual SHA.
2. **Provider rights and account.** Obtain access to the correct **separate LiveAvatar workspace** (not ordinary HeyGen Free account). Verify image-to-avatar eligibility for fictional subjects, 2 custom identity slots at suitable resolution, LITE API entitlement, prices/overages, consent/usage, green-screen capture, simultaneous sessions, broadcaster redistribution/recording, failover and session duration **in writing**.
3. **Read-only vendor integration check.** Refactor the legacy API token+session proxy into a server-only interface with access control, manual budget limits and explicit stream authorization; mock it first. Do not call session/token/start while paidEnabled is false.
4. **Studio compositor.** Capture one sandbox/preset avatar stream as raw video, key provider's uniform background over our approved empty/clean blue newsroom, add exactly one Tamasha bug and deterministic text/chart ticker, record proof, inspect hair/glasses/edge transparency. No image-model text/numbers or false LIVE.
5. **Paid first speaker test ONLY IF authorized.** Run one 30–60s approved fictional Nora custom LITE source, approved synthetic audio, bounded test budget; verify lip sync, face identity and background interaction. No autoretry. Stop on mismatch.
6. **Marcus + two source switching.** Separately qualify Marcus; cut controlled wide/close/graphics. A shared two-person full-body desk must NOT be asserted without actual moving interaction proof. Use clean close-ups or approved synchronized pre-recorded synthetic paired shot if the streaming provider cannot make mutual listening believable.
7. **Reliability.** Record source stream fps, sound drift, session expiration/restarts, browser/GPU CPU load, billed minutes, expected concurrently active source count; test 30/60-minute segmentation with title-card fallback.
8. **Distribution.** One shared 1080p broadcast feed via persistent playout engine, not one paid avatar per viewer; integrate on-air QC and Tamasha SRT/RTMP only after contract.

## Engineering go/no-go
The deliverable to unlock recurring paid use is a *real moving* 60–90 second dual-host sample including genuine lip-sync, original fictional face continuity, brand/graphics, factual script and professional audio, approved by a human reviewer. A still/frame-motion video or provider "completed" status is not a pass.

## What user needs to supply or authorize later
- The user-approved *individual* creative identities or approval of identity-preserving portraits we prepare.
- LiveAvatar workspace subscription/keys/slots if not connected; current linked HeyGen Free is not proof of LiveAvatar paid entitlements.
- Bounded budget approval for each custom avatar and first sessions.
- Confirmation of commercial broadcast use in provider T&C and Tamasha ingest requirements.

No external charges/deploys have occurred under this branch.
