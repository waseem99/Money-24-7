# Original globe broadcast concept

Status: 30.25-second visual concept for review, not an approved production package.

## Direction

The user rejected Market News Broadcast Pack as too traditional and selected Premiumilk Broadcast Business News and SPX Two Tone as inspiration. This version uses original code and artwork: a rotating geographic globe, gold/white/teal information bands, continuous crawl, coordinated curved wipes and programme handoff. No purchased template footage, source or artwork is embedded.

References:
- https://videohive.net/item/broadcast-business-news/53873634
- https://spxgraphics.com/store/#product-Two-Tone-Template-Pack

## Sequence

0–5s: The Business Brief opener.
5–13s: existing moving presenter/studio proof with new straps and crawl.
13–25.25s: operating-margin explanation and explicitly illustrative comparison.
25.25–30.25s: Earnings Explained coming-up identity.

Existing presenter speech is reused; no new paid avatar or voice generation. The example is not live market data. This concept does not demonstrate a live data connection or a full programme rundown.

## Rendering

Run `python3 production/broadcast-sample/stocks-orbit.py /absolute/path/to/stocks-orbit` after creating that output directory. Dependencies: Python, Pillow, NumPy, ffmpeg, Nimbus Sans fonts at the paths in the renderer. The renderer reads sibling workspace assets: `broadcast-motion-v2/frames/001.jpg` through `192.jpg` (1280×720 frames from the approved eight-second studio source), `program-package/open.mp3`, `program-package/next.mp3`, `full-frame-review/source.mp4`, and `segment-review/scene-1.mp4`. These media assets are not included in this source commit. It also reads the repository's `brand.mjs` and included `orbit-land-mask.b64`.

Output: Stocks-Original-Broadcast-Concept.mp4, H.264/AAC, 1280×720, 24fps, 30.25 seconds.

## Provenance and checks

Land mask derived from Natural Earth ne_110m_admin_0_countries. Made with Natural Earth. Public-domain terms: https://www.naturalearthdata.com/about/terms-of-use/ . Projection and shading implemented in the renderer.

Checked representative opener, studio and analysis frames; confirmed format and duration with ffprobe; full video/audio decode completed without ffmpeg errors. Quality remains subject to user review. Narration has not been independently transcribed for frame-exact cue validation. Production work remains: higher-resolution rendering, data binding, reusable rundown integration, audio finishing and final visual approval.
