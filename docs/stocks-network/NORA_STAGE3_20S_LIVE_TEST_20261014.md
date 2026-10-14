# Stocks Stage 3 — Nora 20.9s genuine LiveAvatar speaking proof

**Date:** 14 October 2026 · **User:** Steps 1 and 2 approved/completed (LiveAvatar login in their own browser; fictional Nora/Marcus identity direction locked).  
**Current status:** `SYNTHETIC_AUDIO_CREATED_REAL_AVATAR_VIDEO_BLOCKED_ON_ACCOUNT_ACCESS`. No claim that a real moving video already exists.

## Produced now
- **Actual licensed synthetic voice take created in the connected HeyGen app**: `Ceecee - Serious`, voice ID `080f8e5cb3ae424989242b0efe5205e6`, engine `heygen_voice / legacy orca`. Audio duration **20.897959 s**. Played/downloaded through the HeyGen inline audio player; audio is NOT silently checked into public GitHub.
- Exact approved Stage-3 script:
  > Good morning, and welcome to Stocks. I'm Nora. Today, we're watching the forces shaping U.S. markets: corporate earnings, Federal Reserve policy, and the outlook for inflation. Our team separates verified data from forecasts, giving you the context behind every market move. Here's what matters now.
- No unverified stock prices, no fake LIVE, no Pakistan content.
- Packaged one **Nora** 1920×1080 approved-candidate portrait, one **empty** licensed blue newsroom candidate and original **T icon** into a private 4.5MB source bundle for LiveAvatar enrollment, separately verified with SHA-256: `784db11b2b1e49ceebb210d999f15033bc00674f257377d4eae75e2a3646034f`.
- Implemented `network/streaming/lite-audio.mjs`: local WAV/MP3 decode→mono PCM16 24kHz; client-side takes a local previously generated/signed-off synthetic audio file; imposes 5–35s limit.
- Updated private `stocks-streaming-lab.html` and `network/streaming/operator.js`: explicit local Nora WAV selector + one-shot `session.repeatAudio` call **only after** real LiveAvatar LITE video stream ready and original avatar approved. No auto-send and no auto-retry after unknown provider state.
- Added `tests/stocks-nora-lite-audio.test.mjs` verifying PCM little-endian encoding, limits and one-shot protocol usage.

## Critical SDK caveat — provider-side real-world testing mandatory
Official LiveAvatar LITE docs specify `agent.speak` PCM16 **24 kHz mono BASE64**, suggested ~1s chunks. Developer-reported LiveAvatar SDK bug #92/#103 observed that `repeatAudio` in older versions transmitted **raw** binary strings rather than Base64 and could produce no audible lip sync even when session stream connected. Original Stocks repo uses `@heygen/liveavatar-web-sdk@0.0.19`, but this has **not** been tested with the current custom Nora service. Never mark `repeatAudio` request as a successful talking avatar without observable `agent.speak_started`/`speak_ended`, correct matching audio AND actual mouth animation. If bug occurs, seek official SDK/vendor fix or test a standards-compliant documented WebSocket sender in provider sandbox before billable retry.
References: https://docs.liveavatar.com/docs/lite-mode/events ; https://github.com/heygen-com/liveavatar-web-sdk/issues/92 .

## Why moving video is not available to ChatGPT yet
- Current connected **HeyGen app** has **Free** entitlement, **not** a connected LiveAvatar workspace. LiveAvatar is a separate billing/API product.
- User logging in at `https://app.liveavatar.com/home` on their own browser **does not give tools an authenticated session**. The available TinyFish cloud-browser profile has **no signed-in sites**. Remote Desktop Commander's Windows machine is offline.
- User confirmed **step 1 (sign-in) and 2 (identity approval)**, NOT completion of separate provider custom avatar **training** or provision of a nonsecret **custom Nora LiveAvatar avatar ID**, secure API key in environment, and valid LITE session token.
- The HeyGen connector cannot import the previously generated source PNG using an old file ID: `import_asset_from_chat` rejected it because it requires a **fresh user-attached file reference**. We did not create an unrelated photo-avatar with random faces.
- No authorized persistent Vercel GPU/source producer or external LiveAvatar API credentials have been connected to this conversation. **No LiveAvatar session or on-screen motion was generated or charged**.

## Exact next dependency / how to unblock without exposing secrets
**Preferred:** user explicitly authorizes authenticated cloud-browser setup for `app.liveavatar.com`. After user says yes, use the supported browser profile sign-in setup link; they sign in privately. This connects only the interactive browser profile, not the API key. Then use it to inspect fictional-avatar eligibility/create/verify Nora, without blindly starting a paid session. A real stream is subsequently started from authorized account with bounded 30sec budget and QA.

**Alternative developer/operator:** user provides **only nonsecret** ready Nora `avatar_id` after uploading portrait in LiveAvatar; secure API key and account authorizations are entered into hosting provider secrets by the authorized developer. Never put account passwords or API tokens in GitHub or chat.

## Correct acceptance gate
20–30s **moving Nora face** in blue Stocks studio, correct approved fictional identity and lip-sync to the 20.897959s recorded speech, clean key/hair/jaw, professionally stable background, 1920×1080 recorded + complete A/V decode, source-locked SHA and visual approval. **Not** a static image, UI placeholder, empty virtual stage, unrelated avatar, or synthetic voice-only clip.

Until the above real-media acceptance exists, next stage (Marcus) and full 2:45 demo are blocked. This PR only gets the client pipeline ready for the first real film.
