# STOCKS G2 — Original-cast common-studio alpha composite (14 Oct 2026)

**Issue:** [#37](https://github.com/waseem99/Money-24-7/issues/37) — E05/E06 partial.  
**Production branch:** `feat/stocks-g1-approved-cast-studio-20261014` / [PR #39](https://github.com/waseem99/Money-24-7/pull/39).  
**Status:** TECHNICAL COMPOSITION PASS; CINEMATIC/CLIENT APPROVAL NOT ESTABLISHED.  
**Spend:** $0 new provider requests.

## Work actually performed
- Took existing user-approved **R5 Nora (Liza Office 6 + Annie)** and **R5 Marcus (Lasse Office 3 + Orson)** native 1920×1080 lip-synced MP4s with their matched 960×540-alpha matte WebMs.
- Recovered native alpha using FFmpeg's explicit `libvpx-vp9` decoder; checked at both first and representative frames. This isolates the real source faces/wardrobe instead of fabricating new presenters.
- Placed one presenter at a time into the **same 1920×1080, static, deterministic financial-news studio plate**. Camera framing uses non-destructive native transparency compositing (Nora matte 1600×900 at x−355,y70; Marcus matte 1280×720 at x−110,y90). The face does not have its hairline cropped by the compositor.
- Applied original user-supplied **T symbol** from `pilot/stocks/brand.mjs` once in the upper-left + Stocks text. No second back-wall/desk logo. Overlay controls mark the programme as **12 Oct 2026 EARLY SESSION / REPLAY**. Source/market-board figures match the existing Reuters 09:40 ET edition in the R5 script.
- Preserved the original speech/audio timebase from the corresponding R5 MP4s; **no new spoken words or paid generations**.
- Encoded the exact **19.969333-second** review-only MP4 at 1920×1080, H.264/30p, AAC/48kHz and fully decoded it with FFmpeg without an error. Exact SHA256: `78c82c391e425779b0447214598b76b11dd625937251386ce8f968c51fdc0d4d`.
- Delivered in-conversation: `STOCKS-G2-SAME-STUDIO-NATIVE-CAST-REVIEW.mp4`, `G2-CONTACT-SHEET.jpg`, `G2-QUALITY-REPORT.json`, `compose_room.py` (a local operator production experiment, not a published deploy).

## Correct quality interpretation
**Passed:** Original approved identities and preexisting voices are preserved; fixed source-headroom works; common studio graphic geometry; technically sound A/V; correct archival source labels; no new provider spend.

**Not passed/not claimed:** A photoreal physical newsroom comparable to Bloomberg/TraderTV; genuinely shared desk / spatially coherent two-person reactions; naturally lit shadows and clear moving hair/arm edges under all conditions; authentic standing analyst; remote correspondent; the 45–65s golden sample; 4:20 complete master; client/human visual acceptance. The original R5 presenter faces may still move unnaturally. Editorial and ingest rights are not certified by a clean tech decode.

**Do not upgrade G1/G2/G3 gates to ACCEPTED** until a real motion reviewer assesses the exact footage. Treat the studio as **technical**, not as the final background. A photoreal background-only plate must be separately created/approved before final composite. If matting facial/edge artifacts cannot be fixed, use source-native camera panels or a properly filmed/video-trained presenter after explicit casting approval—no blind retake.

## Next no-spend task
1. Inspect the exact 19.97s G2 MP4 and original sources at full display scale, tagging timecoded defects.
2. Freeze **one source-matched early-session story** and only original cast for first 60s pilot.
3. Create an empty **photoreal, spatially consistent studio** background and verify single-person source-frame matching before using expensive multi-avatar generation. Preserve full headroom and source light direction. Do not assume any generated still can itself produce authentic hands/listening.
4. Attempt an honest 45–65s short assembled film using only source-matched approved footage and a source-correct reporter package. The existing two short R5 lines total <20s; any additional lip-synced dialogue requires separate media/cost authorization.
5. Finalize durable private archive for the G0 sources before original Actions artifact expiry (earliest **27 Oct 2026**).

## Reproduction note
Local prototype used Python Pillow for still studio plate compositing and FFmpeg 7.x with explicit `-c:v libvpx-vp9` on alpha input, `format=rgba`, matched-source audio and `libx264` export. Source media and derived full MP4 are not committed into the public repository. The local `compose_room.py` is delivered as a QA handoff only, not a production-critical dependency.
