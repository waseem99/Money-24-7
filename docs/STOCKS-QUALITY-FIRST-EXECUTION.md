# STOCKS — October 12, 2026: quality-first production gate

## Status: preflight implemented; full film NOT released

Production owner chose one tightly bounded speaking-motion proof before generating the complete 4:20 newsroom. This branch is layered on the existing Signal R4 draft branch and does **not** mutate or deploy main. The old Signal render remains unchanged.

### Frozen inputs
- Programme: **Stocks**, not Signal, Stalks, Stocks GPT or ChatGPT.
- One user-provided **T + Stocks** bug in the **top-left only**. The Tamasha T must not appear on any background wall, desk, mug, laptop or other prop.
- Nora Ellery = HeyGen **Liza Office 6**, avatar `5ee67ac453c34ffebd71e8eedb47b2fe`, Annie voice `330290724a1b470fb63153f34d4c0183`.
- Marcus Varden = HeyGen **Lasse Office 3**, avatar `de9f36c26bd841c891489a0c9d6174de`, Orson voice `00e3d285aba44b27a83c47c02c9c2d9c`.
- Remote contributor is a **candidate only**, not approved or budgeted. Do not claim three-person performance is complete.
- All on-screen data must come from October 12 Reuters 09:40 ET (or other directly cited historical snapshot), BLS's Oct 14 release calendar, corporate IR or SIFMA. No invented time-series, unsourced tickers, or false LIVE transmission.
- User reported topping up **$5 in HeyGen API Pay-As-You-Go**. The connected app profile does not expose the underlying API wallet balance.

### What this branch implements
1. `pilot/stocks/episode.mjs`: immutable 17-shot newsroom script, cast/voice IDs, 4:20 timecodes, sourced market data.
2. `pilot/stocks/brand.mjs`: optimized original T symbol from user's actual uploaded source asset. Embedded **once**.
3. `pilot/stocks/preflight.mjs`: pure, zero-network editor/source/timing/branding validator; deterministic hash for the two-turn paid proof; **separate blocked full-master** gate.
4. `pilot/stocks/render-frame.mjs`: 1080p brand and Reuters chart backdrop for the motion-proof; no fictional data or wall logo.
5. `pilot/stocks/composite-proof.mjs`: combines two **already-generated local MP4s**, hard-fails on missing video or audio, produces a 1080p H.264/AAC master and SHA-256/QA receipt. Never calls HeyGen.
6. `tests/stocks-quality.test.mjs`: source, identity, budget, safety and branding regression gates.

### Reproducible non-billable checks
```bash
node pilot/stocks/preflight.mjs
node pilot/stocks/preflight.mjs --full     # Expected non-zero: full master is not yet releasable
node --test tests/stocks-quality.test.mjs
npm test
npm run build
```

### Exact paid proof, only after API access and spend permissions
The two turns are **shots 15 and 16 in the actual script**, not new words:

- Nora: "So here's what we know and what we're watching: oil is already pressuring sentiment, bank reports arrive Tuesday, and inflation lands Wednesday. Marcus, what's your single takeaway for this week?"
- Marcus: "Watch the evidence, not the noise: earnings guidance, energy prices and the inflation surprise. Those will set the next tone."

Engine: **Avatar IV** at **1080p**, approximately **20–30 seconds combined**, with maximum *planned* 30 seconds and **$1.50 estimated provider cost** at published $3/min Photo Avatar IV. Each requested turn uses its exact previously locked avatar look and voice ID, generated **once**. Do **not** assume the estimate enforces billing or prevents unexpected charges. Do not retry an unknown job, and never authorize the remaining ~$3.50 for a full film automatically.

Only when both output IDs and successful provider status exist, download the existing files and run the no-charge compositor:

```bash
node pilot/stocks/composite-proof.mjs ./nora.mp4 ./marcus.mp4 ./stocks-quality-proof.mp4
```

### Human acceptance criteria for motion proof
1. Nora/Marcus exactly match selected looks; wardrobe and skin/eye details look natural.
2. Both voices match the original Annie/Orson recordings, with legible phonemes and stable lip synchronization.
3. Natural pace on question -> answer; no clipped last words, no false reaction footage, no audible jump.
4. On-air graphics say **Stocks** only, original T symbol exactly once at top-left; no Signal/GPT/STALKS/no repeated back-wall icon.
5. Sourced Reuters fixed-time data, credible cinematic framing; no placeholder market levels.
6. 1920x1080, 30fps H.264/AAC, full-decode QA, preview and actual billed API amount recorded.

### Known remaining blockers before 4:20 master
- The proof demonstrates *speaker alternation*, not two simultaneously filmed conversational bodies or eye-line fidelity. Those remain unsatisfied until a true compositing/motion test is reviewed.
- Public Photo Avatar looks do **not** ensure standing footage. The analyst wall must receive separately acceptable standing footage, or be shot as seated half-body/chart inset.
- The remote reporter needs one licensed, visually approved look/voice, a real audio take, and a distinct remote background.
- 17 scenes still require completed speaker clips, measured word-level captions, graphics choreography and human factual review.
- API wallet read endpoint and auto-top-up state are not surfaced by the connected HeyGen account. The user-reported top-up is not independently reflected in that tool.
- The published API price of **$3/Avatar IV Photo minute** implies roughly **$12.70** for 254 seconds of footage before retakes, so $5 is insufficient for an all-Avatar-IV full episode.

Do not merge the proof branch into main or call this an approved finished video until all required gates are passed.
