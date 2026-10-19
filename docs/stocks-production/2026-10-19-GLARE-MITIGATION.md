# Existing-footage glare mitigation

Output: Stocks-Reduced-Glare-Review.mp4, based on the existing 91.521-second demo. This is a review revision, not a release approval and not a repair of facial geometry. Issue #64 remains open.

No new AI generation, face enhancement, face reshaping, interpolation or voice generation. Original audio stream copied unchanged.

FFmpeg grade: curves master='0/0 0.25/0.25 0.5/0.49 0.7/0.65 0.85/0.76 1/0.90', saturation=0.97. Apply through a feathered 1920x1080 grayscale mask: white rectangle x=0..1920, y=170..760, Gaussian blur radius 32; black elsewhere. This is a broad presenter-region mask, not tracked skin isolation; it also affects the newsroom within that region. Top logo and lower graphics are outside the main correction region. Bypass grade during identity sting (10–12.5s) and closing card (87.5s onward).

Encoding: H.264, 1080p, CRF18, yuv420p, faststart; original AAC copied. Preserves programme timing.

Purpose: compress bright skin and fabric highlights, slightly reduce saturation, retain shadow detail. Does not remove underlying generated material texture or temporal facial drift. Compare against the original moving footage before further release approval. No new paid generation credits used.
