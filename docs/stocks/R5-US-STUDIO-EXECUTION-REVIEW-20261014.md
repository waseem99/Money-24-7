# STOCKS R5 — US-only studio implementation and production gate
**Date:** 14 Oct 2026 | **Master tracker:** #37 | **Baseline:** PR #41

## Requirements now LOCKED from client visual feedback
- Channel is **United States markets only**. No foreign-country references, foreign indices, or recognizable Islamabad landmark.
- Keep approved image #1 **two-anchor grid and right markets panel**, plus lower headline and continuously scrolling market ticker.
- Keep image #2 **cleaner blue/graphite studio direction**, not its SIG(NAL) brand, displayed numbers, faces, chart paths or false LIVE badge.
- One **subtle, small** upper-left on-air identifier only: original uploaded round Tamasha glyph + `STOCKS`, small tagline `MARKETS  BUSINESS  PEOPLE`. No second big T/Stocks in a wall, desk, mug or prop. Large brand display is permitted only in clearly separate full-screen animated start/end idents.
- No fake LIVE for prerecorded source. Put source date/ET time explicitly; use only the dated 12 Oct 2026 09:40 ET Reuters snapshot already approved in the R5 script.
- No alternative generated anchor faces: the only original approved speaking cast is Liza/Annie Nora and Lasse/Orson Marcus.
- Keep Marcus a wider, naturally proportioned composition. Do not make the original clip reframe fill its container by center-cropping.

## Immediate no-charge work done
1. Created the canonical machine-readable studio/on-air contract at `docs/stocks/R5-LOCKED-US-ON-AIR-CONTRACT-20261014.json` and tests at `tests/stocks-r5-us-studio-contract.test.mjs`. It blocks fake LIVE, unapproved sources, alternate faces, duplicate branding and premature acceptance.
2. Preserved **all five source artifact ZIPs** in a private user-owned Google Drive folder (R5, W3, W5, W6, W7). The Drive folder returned `shared=false` and all five original file sizes match the GitHub Actions artifacts (16,129,094; 1,809,044; 930,994; 4,434,797; 1,038,923 bytes). An independent byte-for-byte downloaded SHA verification remains an optional higher-assurance follow-up; do not claim that step is complete.
3. Implemented a separate technical R5 render from approved original recordings: historic US data panel, fixed clean on-air bug, moving ticker, 3.6s R4 opener, 4.5s R4 closing, source-speed Nora (7.34s) and Marcus (12.6s); no new generation.
4. Actual technical output: `STOCKS-R5-US-STUDIO-REAL-CAST-TECHNICAL-REVIEW.mp4` — **28.066667 seconds**, full 1920×1080, 30fps, H264/AAC; full decode **PASS**, SHA256 `69f05a1a4134d6e9e46b947c4375bc6ea33111291ef00a8decd16e3cef8baccf`. It remains a private conversation video review; source audio matches actual original speaking source and soundtrack is the existing authorized original bed.
5. The studio background in this R5 render is an original procedurally layered **design candidate**, not a real photographed newsroom, and has not passed photorealistic body/desk/motion scrutiny.

## Important blocked realism problem
The most recent generative image attempt produced a **different fictional male/female cast**, a false `LIVE` label, invented numbers, and additional set branding. This mockup **must not** be inserted directly into an on-air video. We use it only as a color/layout reference, not as a source for facts, presenter identities, brand assets or camera-ready frames.

The current procedural test is also below the photo-real standard demonstrated in the user-approved second reference. Do not report it as a final creative upgrade. It is useful only to validate the separate, correct editorial layers and original presenter's framing.

## NEXT creative/production task (genuinely blocking G3)
**Produce one genuinely clean EMPTY newsroom photoreal scene (no humans, no screens containing real numbers, no words/logos/data)** with camera-master A and matching close-angle geometry B/C. Once approved, match the original R5 actor source exposure / shoulder/head framing / desk occlusion into this physical set and obtain a full-motion review on the exact video hash.

Until the empty premium plate is approved, **do not generate more talking footage** and do not extrapolate the stills into a supposedly completed studio.

After room approval: the full golden sample must be 45–65 seconds of continuous meaningful voiced, source-matched reporting, not 20s of original talking plus graphical filler. Additional approved-cast spoken media requires separate explicit authorization before any paid generation. A third correspondent is still unapproved.

## Safeguards
- New HeyGen charges this phase: $0.
- All four inherited automatic paid workflows remained disabled at earlier G1 branch.
- No Vercel deploy attempted under unauthorized Cod5 (prior 403).
- R5 technical film / screenshots are **not** client approved, despite clean encoding.
- Final 4:20 / 17-shot master remains NOT READY.
