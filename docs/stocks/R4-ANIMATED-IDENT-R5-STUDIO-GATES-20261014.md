# STOCKS R4 — Animated opening and end ident; R5 photoreal studio upgrade queued

**Edition:** 12 October 2026, Reuters 09:40 ET early session — a prerecorded source-dated demonstration, not LIVE.
**Parent tracker:** https://github.com/waseem99/Money-24-7/issues/37
**R3 styling:** https://github.com/waseem99/Money-24-7/pull/40
**Status:** R4 animated brand **technical proof**, not a green G3 broadcast-quality sample.

## Stakeholder decision captured 14 October
The R3 channel layout looks better than the early dummy studio and is acceptable as a **direction**. An animated start and end/tail are requested. The user correctly expects the studio background, lighting and camera integration to be substantially improved **before final creative acceptance**.

This means we lock the **broadcast graphic structure**, NOT the synthetic/background rendering.

## R4 animation implemented without new provider charges

Local exact review master delivered in chat:
- \`STOCKS-R4-ANIMATED-IDENT-CHANNEL-REVIEW.mp4\`
- **50.066667 seconds**, 1920 × 1080, 30 fps, H.264, source AAC 48 kHz; FFmpeg decode PASS.
- Exact SHA-256 **\`b8f8bffa08ef6da3afaeafc1034581325b70329c7d61270846121069819efc5c\`**.
- New **3.6-second animated start**: original single T + STOCKS mark, smooth reveal, topic beats Oil / Bank Earnings / Inflation, no invented financial data.
- New **4.5-second animated closing/tail**: the same brand, thank-you mark and next-update context, subdued moving geometry.
- **Original R3 soundtrack, dialogue, footage, ticker and channel layout unchanged**; audio stream MD5 \`2ab8411f1784c2f216cfa063fde7d25b\` before and after (bitstream identical).
- Source-specific brand/date treatment; no fake LIVE indicator, and no new HeyGen/voice generation.
- Original provider footage not committed to public repo.
- Portable script \`pilot/stocks/ident_animation.py\` accepts \`--source\`, \`--logo\` and \`--outdir\`; Pillow + NumPy + FFmpeg are run-time dependencies. It needs **private approved** source and brand assets supplied locally; those bytes are excluded from Git.

**Not yet delivered:** a new photoreal newsroom; improved matching of original actor source lighting; both speakers naturally reacting at the same shared desk; 45–65 seconds of genuine continuous dialogue; original correspondent performance; 4:20 full broadcast. Existing photos/generated studio references cannot be silently treated as approved on-air assets.

## R5 — Photoreal set and physical-integrity requirements (NEXT)

**Design direction:** A plausible single-room financial newsroom with neutral charcoal/graphite, balanced steel/slate architectural lines and warm practical lights against restrained cyan accents. Premium network environment with plausible glass and skyline bokeh but **not a generic blue background**.

**Source discipline:**
1. Create an **empty studio plate**, no humans, names, fictional data, LIVE, financial text, repeated branding, mugs, props that would hide the correct approved actors, or sourced-provider logos. The renderer (not the set image) owns T+Stocks and real graphics.
2. Exactly **one dominant event/data wall**, kept on the side away from active speaker. No dozens of duplicate monitors or enormous floating bright-blue panels.
3. Camera master A (realistic wide / establishing), B (Marcus), C (Nora), D/E (source-chart presenter inset), R (distinct authorized remote). All studio views must share camera height, horizon, desk plane, softbox direction, key / rim colors and architecture.
4. Match **actual** Liza/Lasse matte light direction, exposure, skin tone, resolution and wardrobe; desk occlusion masks must not sever shoulders/hands or create halo/ghost outlines; no zoomed Marcus, no head cropping.
5. Moving listener or simultaneous speaking full-body two-shot is **not assumed**. If the source cannot produce natural mutual eyelines, establish the room briefly then cut between clean presenter closeups and verified charts. No frozen listener stitched into a "live" conversation.
6. Source financial figures remain **Reuters 09:40 ET** early-session (or a separately editorially authorized new edition). All changing numerical graphics/tickers must be deterministic, dated, reviewed and independent of any generated still.
7. Do not use incompatible W3/W5/W6 synthetic characters; do not copy Bloomberg/TraderTV set assets.

**R5 acceptance (first, not final):**
- Review 2–3 still angles from one empty physical set plus a **full-motion 8–12s composited clip** with the **actual** approved source presenter face, revealing no cropping, foreground alpha, mismatched perspective or ghosting.
- Render both Nora and Marcus at controlled scale with consistent headroom; check the *whole* moving take in original resolution and inspect 0.5-second samples around transition/gesture.
- Scene passes human judgement for believable physical placement, lighting and natural facial movement. A technical pass alone does not suffice.
- Professional newsroom variant approved by stakeholder **before** further source-media generation.

## G3 — Next golden sample after R5
Create a genuinely voiced **45–65 second** contiguous sample with dated sourced material, Nora, Marcus, meaningful dialogue, a correspondent *if source-matched*, actual ticker and opening/tail, not 30 seconds of music-backed graphics. Current R5 approved audio is only ~19.94 seconds. Any missing cast-compatible narration requires an explicit future spending or filming decision. Do not falsely fill missing dialogue with unlicensed voice or unrelated close-edition audio.

## Sequence and budget
1. R4 opening/tail animation: **DONE as review proof (no new paid requests)**.
2. R5 photoreal empty-room set + approved original actor physical composites: **NEXT; zero HeyGen credits for initial layout and trials**.
3. Short motion realism assessment, defect register and corrected room: **PENDING**.
4. New source-matched script/audio and remote footage only if still required **after a user-approved estimate**.
5. Fully voiced 60s G3 proof, exact-hash human approval, then 17-shot full film.

Keep every payment-triggering workflow gated. Neither R4 nor R5 design proof is permission to incur paid HeyGen requests.
