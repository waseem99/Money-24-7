# Stocks real presenter capture — 15 October 2026

## Verified result
- Amina in Blue Suit: genuine 1280x720 source, approximately 24.4 seconds, 602 rendered frames, real audio track, provider speech-start and speech-end events, provider stop confirmed.
- Dexter Lawyer: same successful source and stop checks, captured sequentially after Amina ended.
- Amina run: https://github.com/waseem99/Money-24-7/actions/runs/38702610236
- Dexter run: https://github.com/waseem99/Money-24-7/actions/runs/38702937687
- Final read-only included-credit balance: 5.6. Initial balance was 9.0; debugging and the two successful preset sessions consumed 3.4 credits. Subsequent Wayne sandbox diagnostics were zero-credit.
- 219 repository tests pass.

## Corrected implementation
Full Chrome with H264 receive capability is required by this capture path. Earlier Chromium headless builds negotiated audio but delivered no video. Codec readiness is now checked before session token creation.
First LITE speech follows a verified provider connected event plus genuine subscribed live tracks; rendered frame count remains a success criterion after speech. The earlier moving-frame-before-first-speech requirement blocked startup.
Capture workflows are manual-only after this authorized run. Code pushes no longer start credit-consuming sessions. Each run uses one session, a provider time cap, explicit stop, and no automatic retry.

## Acceptance limits
The narration is the user's previously approved Nora/Ceecee take, reused for protocol diagnostics. It says “I'm Nora”; this is not Amina/Dexter identity or final voice approval, especially for the male preset. Technical previews explicitly disclose this. Do not present them as a finished client bulletin.
Native source is 720p. A 1920x1080 branded composition is an output canvas, not newly generated 1080p facial detail.
Final presenter-specific scripts/voices, editorial content, and the full 2–3-minute bulletin remain unfinished.
