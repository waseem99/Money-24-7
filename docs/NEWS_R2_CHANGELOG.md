# Signal — R2 financial-news edition (12 October 2026)

## User-requested fixes implemented

- **Eliminated silence padding**: the previous editor allocated about 2.66 additional seconds to every speaker to force 180 seconds. New scene cutting uses a maximum **0.11-second intentional handover tail**; output may vary with genuine speech. Verified V1 voice boundary silence of 2.4–2.9 seconds reduced to mostly 0.3–0.55 seconds in the revised MP4.
- **Natural pacing**: Liza and her Annie voice/face sped up together by **1.065×**, Lasse+Orson by **1.025×**, keeping pitch and synchronization. No fake listening or motion cycles.
- **0:33 uncanny expression**: updated edit cuts away from prolonged Liza exposure. Now camera appearances are **2.4 seconds maximum** for Liza and **3.0 seconds maximum** for Lasse before relevant financial graphics take over. The time 0:33 in the new film displays rates/evidence, not a held artificial facial expression.
- **Header defect**: removed vertical separator and extra “FINANCIAL NEWSROOM” masthead label beside the final L in SIGNAL. Replaced with a clean **SIGNAL** wordmark and **MARKET WATCH / 12 OCT 2026**.
- **News content**: 4 new single-use licensed Liza/Lasse spoken takes focus on Q3 bank earnings expectations, Federal Reserve September policy range, high U.S. Treasury yields, oil above $100, and the CPI release scheduled for October 14. These are reported and explicitly date-stamped; not a live news feed or market quote.
- **Storytelling**: 6 additional dated/sourced editorial cards in two visual modes (cream evidence cards and dark-navy risk/implication contrasts); dynamic ticker alternates based on source type, moving reveal bars and scoreboards. Simulated candlestick, volume, RSI/MACD data **stay separately labelled illustrative**.
- **Visual typography**: reworked source legibility, source dates, headline hierarchy and subtitles; reduced heavy text treatment.
- **Original cast/wardrobe locked**: Liza Office 6 / Annie and Lasse Office 3 / Orson. No replacement faces. No additional voice tools, avatars or subscriptions.

## Data policy and sources

**Prepared as of Monday 12 October 2026.** Data must not be represented as a streaming feed. Commentary may become stale. Not investment advice. The moving mock-chart is deterministic illustrative footage and is NOT a chart of any reported financial asset.

| On-screen claim | Evidence and as-of date |
|---|---|
| Fed target range 3.75%–4.00% | [Federal Reserve policy announcement, 16 Sep 2026](https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm) |
| US Treasury 10-year yield approximately 5.24% | [Reuters weekly outlook, 9 Oct 2026](https://www.reuters.com/business/wall-st-week-ahead-bank-earnings-cpi-headline-busy-markets-week-sp-500-hovers-2026-10-09/) — historical reported level, not live |
| Brent crude trading above $100/barrel | [Reuters markets, 12 Oct 2026](https://www.reuters.com/world/china/global-markets-wrapup-1-2026-10-12/) — snapshot, not current price |
| September US CPI release due Wednesday 14 Oct, 08:30 ET | [US Bureau of Labor Statistics official October 2026 release calendar](https://www.bls.gov/schedule/2026/10_sched_list.htm) |
| Major US bank quarterly reporting begins this week | [Reuters weekly outlook, 9 Oct 2026](https://www.reuters.com/business/wall-st-week-ahead-bank-earnings-cpi-headline-busy-markets-week-sp-500-hovers-2026-10-09/) — forecasts/expectations, not published results |
| IMF October WEO scheduled October 13 | [IMF publication schedule](https://www.imf.org/en/publications/weo/issues/2026/10/13/world-economic-outlook-october-2026) — not actual conclusions |

## Production deliverable and remaining QA

- Film: `SIGNAL-R2-MARKETS-CROSSROADS-1080p-REVISION.mp4` — **1920×1080 H.264, 30 fps, AAC stereo 48kHz; final duration about 185.84 seconds**.
- Captions: `SIGNAL-R2-captions.vtt` (scene-proportional word grouping; human subtitle-sync review still recommended).
- Technical report: `SIGNAL-R2-technical-QA.json` (sources, timestamps, playback-speed multipliers, source names, duration and handover timings).
- 7-panel film contact sheet.
- **No automatic AI-video retries**: four additional provider videos were separately generated once each. Existing eight verified clips were reused, no further provider generation needed for final graphics correction.
- **Human review remains required** for authority, natural lip movements, subtitles and overall on-air presentation. Final editorial judgement is not proven by codec tests.