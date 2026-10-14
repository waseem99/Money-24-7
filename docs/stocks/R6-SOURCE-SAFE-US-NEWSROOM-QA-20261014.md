# Stocks R6 — source-safe US newsroom moving proof (14 October 2026)

**Tracker:** [#37](https://github.com/waseem99/Money-24-7/issues/37), specific R6 gate [#43](https://github.com/waseem99/Money-24-7/issues/43)  
**Status:** **Technical decode PASS / photoreal studio and performer realism NOT approved**  
**New HeyGen / model-video generation:** **0**  
**R5 base:** source-locked U.S.-only channel; no Pakistan content.

## Results: verified actual moving media

| Review artifact (private chat deliverable) | Seconds | SHA-256 | Technical status |
| --- | ---: | --- | --- |
| `R6-NORA-PHOTO-ROOM-MOVING-REVIEW.mp4` | 7.34 | `dc98c78e14857161ad6da165942c7b0ba7002c78c4af3fbebfb9aac54cd98b5d` | Full FFmpeg video/audio decode PASS |
| `R6-MARCUS-PHOTO-ROOM-MOVING-REVIEW.mp4` | 12.60 | `7ade625f843e710e07a0ccd6bc121175ebb6f67e8cd8d9ff4c279ab6c2fa3a94` | Full FFmpeg video/audio decode PASS |
| `STOCKS-R6-10S-NORA-REALISM-PROOF.mp4` | 10.9813 | `7d3d3ba9dfc05d53cddce7e6b862566d39720c13134397193722b8c0337b245b` | Opening plus full recorded Nora take; decode PASS |
| `STOCKS-R6-NORA-MARCUS-ROOM-SEQUENCE.mp4` | 23.5693 | `8999c9b1af950465585b29c8798dac2830e900f62e5a1057d1ef893fa0fee6ae` | Branded opening, Nora original performance, Marcus original performance; decode PASS |

**Format:** 1920×1080, 30fps H.264/AAC 48kHz in exported proof. Video preserves original R5 source voices and timing; the review compilation re-encodes audio, so it is *not* bit-for-bit the original audio stream.

**Actual source faces and recordings**: licensed pre-existing R5 originals only. Nora = Liza Office 6 / Annie source (white blazer over grey blouse, standing gestural video). Marcus = Lasse Office 3 / Orson source (blond male, grey suit/open-collar medium framing). These original R5 sources are **visibly different in wardrobe, lens and physical performance from some generated concept illustrations**. Do not misrepresent concept people as approved or source performers.

## What was improved

- Source-feasible fitting: original Nora VP9-alpha 960×540 source projected at 1530×861 and positioned x−294/y116; Marcus source 1100×619 at x194/y166. Their headrooms and on-screen eye heights are closer without cropping the original face.
- One photo-*textured* blue studio master set: skyline/window detail and ceiling pixels sampled **only from a background-only portion of earlier original synthetic concept imagery**; the original generated faces, LIVE badges, numerical graphics and repeated logos are not copied into the source plate.
- One small top-left Tamasha original icon + Stocks / Markets Business People, no extra background brand; true dated Reuters US equities, source/09:40 Eastern marking, no fake LIVE indicator.
- A single side-market data panel and deterministic ticker added as independent rendered layers. Intro reused the existing R4 animated ident, no new narration or provider work.
- Source footage and private original project imagery remain private, not committed to public repo.

## Limitations — release remains BLOCKED

- **Studio:** This is an improved digital photo-textured plate, NOT a truly filmed or creative-approved photoreal virtual newsroom matching Bloomberg/TraderTV. The room's physical detail and light integration still need work, ideally from a new clean **empty** photo-real set.
- **Actor movement:** Nora's original source looks like a standing presenter who gestures. Marcus's original has a more medium-shoulder crop. A convincing simultaneous shared-glass-desk shot and natural mutual listening behavior are **unproven and should not be invented**.
- **Wardrobe/identity:** The final intended concept illustrates different clothing/face styles than actual archived speaker clips. A definitive cast/appearance approval should use the real film, not generated portraits.
- **Source quality:** VP9 mattes provide usable transparency, but hair/shoulder motion and shadow matching must be evaluated at 1080p throughout each real take.
- **Editorial:** Both clips correspond to Oct 12 **early session**, while other generated experiments are for Oct 12 closing. They must not be merged into one report.
- **Runtime:** This proof provides only 19.94s of existing, source-matched dialogue. It is **not** the genuinely voiced 45–65s golden sample; no compatible separate remote correspondent has been approved.
- **Rights:** Market data and provider footage rights for broadcast redistribution remain a release check.
- **Deployment:** Vercel scope 403 still prevents publishing live web preview; local/private MP4 proofs work independently.

## Reproduction

Source-controlling compositor: `pilot/stocks/r6/render.mjs`.

Requires *private* original R5 `NORA.mp4`, `MARCUS.mp4`, `NORA-matte.webm`, `MARCUS-matte.webm`, plus the private accepted R6 images (`R6-BG-NORA.png`, `R6-BG-MARCUS.png`, `R6-FG-NORA.png`, `R6-FG-MARCUS.png`, `R6-TICKER-SOURCE.png`). The operator runs:

```bash
node pilot/stocks/r6/render.mjs --source /private/R5-original --plates /private/R6-plates --output /private/R6-render
```

The operator fails closed for missing files, wrong codec/resolution, invalid render and incomplete decode. This is a media-composition step and performs no network/API call. It does not independently create new backgrounds or regenerate actors; private R6 plate creator assets are retained with the conversation/source archive. Never commit raw provider media to public Git.

## Specific next actions

1. Human moving QA of both real speaker clips and room, timecode major issues. **Do not advance #43 merely because decode PASSED.**
2. Replace photo-textured digital room with a genuinely photoreal **empty** source set with matching A/B/C camera geometry (no generated actors, numbers, data, logos) and validate real-life lighting on original matte source.
3. If two-person seating remains artificial, explicitly approve **solo anchor closeups + sourced market graphics** as production language; do not hallucinate a shared studio wide shot.
4. Produce the exact approved **45–65-second fully voiced golden sample** only after cast-consistent missing speech/remote assets are sourced and any actual generation cost is separately authorized.
5. Complete 17-shot full 4:20 master only after golden sample visual/human signoff.

No G3 or final production approval is implied by this PR.
