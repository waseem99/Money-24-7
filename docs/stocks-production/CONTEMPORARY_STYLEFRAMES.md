# Contemporary broadcast styleframes — proposed, not approved

Three 1920x1080 stills: typography-led programme identity; existing presenters with lower thirds; indexed financial analysis.
This supersedes the glass/metal and freestanding-monitor visual experiments as a proposed direction only.
Palette: off-white #f6f5f1, near-black #111318, cobalt #0057ff, orange #ff713c.
Existing Tamasha symbol plus Stocks retained. Social brand alignment remains unverified; no specific social reference was supplied.
All numeric content is a labelled hypothetical example. Six-period line series are indexed to 100; endpoint revenue rises 20%, operating profit falls 20%. Underlying initial revenue/profit 100/12 and endpoint 120/9.6 yield margins 12% and 8%.
Static review frames do not demonstrate a working ticker, transitions, timing or new presenter footage.

## Reproduce
Extract presenter-source.png at 3 seconds from the existing full-frame-review/source.mp4, scaled/cropped to 1920x1080.
Place in the output folder, then run:
python3 production/broadcast-sample/contemporary-frames.py /absolute/output-folder
Requires Pillow, URW Nimbus fonts and sibling brand.mjs.

## Proposed motion after visual approval
Identity: bracket mask opens in 12 frames; title resolves over 18 frames; hold for readability; programme sting total approximately 3 seconds.
Lower third: 8-frame programme tag entrance then 10-frame headline reveal; reserve bottom channel-information bands.
Chart: axes first, revenue series followed by profit series; endpoint labels appear at final plotted values; annotation arrives on the corresponding narration cue.
Educational crawl scrolls continuously in a dedicated row; no fictitious live quotes.
Validate text bounds, face clearance, chart correctness and narration alignment before the next video.

## Research boundaries
Reviewed reporting on CNBC's 2023 graphics system and its December 2025 logo update. The latter reports the broader graphics remained substantially unchanged. This is a dated reference, not proof of the exact current on-air appearance or an assertion that Stocks matches it.
https://www.newscaststudio.com/2023/12/12/cnbc-new-graphics-logo-ticker/
https://www.newscaststudio.com/2025/12/15/cnbc-new-logo-opens/
