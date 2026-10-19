# Broadcast motion revision — 19 October 2026

Status: internal visual study, not client approved or broadcast ready.

## Reference recovery
Found and sampled six timestamps in each of three existing uploaded WhatsApp videos (119.49, 121.69 and 129.90 seconds). These show a dimensional opener, full-screen studio, display walls, presenter close-ups and two-person coverage. The earlier Blockster Valon reference was also recovered; its single-presenter format is a different visual benchmark. This was frame inspection, not a complete audio or motion-quality audit.

## Delivered study
28 seconds, 1280x720, 24fps, H.264/AAC.
- 00–05: glass/metal architectural identity, independently composited text.
- 05–13: existing approved moving studio footage, full screen, unobstructed faces, lower third and continuous educational crawl.
- 13–23: code-rendered illustrative comparison in a framed perspective display; crawl continues.
- 23–28: next-program identity using the existing fixed Nora voice.
No new avatar or voice API generation. No vendor footage republished.

## Limits and quality gate
The architectural plate is an AI-generated raster image with a small animated push. It is not a newly modeled, independently controllable 3D set or a true camera fly-through.
The display and bezel are perspective-projected geometry, with deterministic chart rendering.
The chart section is unvoiced. This is a design study, not a finished news story.
The dataset is explicitly hypothetical: revenue 100 to 120; operating profit 12 to 9.6; margin 12% to 8%. Bar charts have zero baselines; separate metrics use separate scaling.
No real-time feed, LIVE badge, walking presenter or new lip-sync work.
Vendor-level motion and finish remain an approval gate, not an achieved claim.

## Reproduce
Use production/broadcast-sample/broadcast-motion-v2.py with sibling brand.mjs and broadcast-identity-plate.b64.
Requires Python, Pillow, NumPy, ffmpeg and URW Nimbus fonts.
Output directory must contain frames/001.jpg through frames/192.jpg from the existing eight-second full-frame source, center cropped to 1280x720.
Output parent must contain full-frame-review/source.mp4 and program-package/open.mp3 and next.mp3.
Run: python3 production/broadcast-sample/broadcast-motion-v2.py /absolute/output-directory
Encoding threads capped at two.

## Next production milestone
Replace raster push with authored 3D camera, materials and lighting; establish a consistent display wall matching the presenter studio; bind exact-script narration to story cues; carry the approved graphics into the longer program. Do not extend this study as though those items were already solved.

## Generated asset
Built-in image generation; final prompt: text-free 16:9 premium financial broadcast opening, photoreal CGI curved smoked-glass ribbons, brushed titanium frames, amber/cyan edge lights, charcoal/silver/teal palette, dark left-side title space, reflective stone floor, layered cinematic depth; no charts, numbers, letters, logos, people or slide/UI layout. Plate stored as JPEG encoded in the sibling .b64 asset for reproducibility.
