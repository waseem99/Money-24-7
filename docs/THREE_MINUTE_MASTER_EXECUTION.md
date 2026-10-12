# Jazz AI Channel / Signal — 3-minute broadcast master plan

**Goal:** Deliver a genuinely watchable **3:00 / 180-second** financial-news film with the user-locked public video-trained presenters **Rumi + Annie** and **Kevin + Orson**. The five-minute version can be extended **after** the first master passes stakeholder review. This is not an authorization to create a 24/7 stream or to buy additional software.

**Status (12 October 2026):** The Rumi+Annie first native-avatar test finished successfully at **10.8408 seconds**, video ID `12186d2986911a13710d9298344c7ab5` ([watch actual provider clip](https://app.heygen.com/videos/12186d2986911a13710d9298344c7ab5)). The exact identity and native voice were verified with the direct API. **Human visual/lip-sync approval of the output is pending.** Kevin+Orson still requires its first actual video test. The complete 180-second master **has not been rendered**.

## Frozen cast and production identity

| Role | Visible public video-trained avatar | Spoken voice |
| --- | --- | --- |
| Lead anchor | **Rumi**, look `efa5d7cf738a4efd84b1dac501d9aef8` (portrait 720x1280) | **Annie — Lifelike**, voice `330290724a1b470fb63153f34d4c0183` |
| Analyst | **Kevin**, look `c8f428c549ea448488fdb2214dbcad57` (landscape 1280x720) | **Orson — Firm & Measured**, voice `00e3d285aba44b27a83c47c02c9c2d9c` |

The previous Araj look is explicitly **rejected** and blocked by source code and tests. Do not change this cast without a new user instruction. Public HeyGen preview metadata alone is not evidence of generated-video naturalness.

## Editorial rundown and timeline

The full authored dialogue, overlays and model-checkable timing are in [`pilot/v2/three-minute-plan.mjs`](../pilot/v2/three-minute-plan.mjs). The timeline below sums to exactly 180 seconds.

| Range | Duration | Treatment | On-air speaker |
| --- | ---: | --- | --- |
| 00:00–00:05 | 5s | Clean SIGNAL opening mark and audio signature | No avatar |
| 00:05–00:23 | 18s | Rumi anchors: what lies beyond one market headline | Rumi / Annie |
| 00:23–00:43 | 20s | Animated synthetic market board, timestamp and timeframe | Rumi / Annie |
| 00:43–01:03 | 20s | Kevin reframes price action by timeframe and volume | Kevin / Orson |
| 01:03–01:23 | 20s | Candlestick anatomy; explain body and wick | Kevin / Orson |
| 01:23–01:39 | 16s | Rumi asks an intelligent natural follow-up | Rumi / Annie |
| 01:39–02:02 | 23s | Volume and moving averages; clear chart overlays | Kevin / Orson |
| 02:02–02:23 | 21s | RSI and MACD definitions; uncertainty visible | Kevin / Orson |
| 02:23–02:45 | 22s | Rumi: source, time window and evidence | Rumi / Annie |
| 02:45–02:56 | 11s | Kevin: clear concluding takeaway | Kevin / Orson |
| 02:56–03:00 | 4s | Minimal Signal end slate | No avatar |

**Editorial safeguards:** No invented breaking news, unlabelled live market quotes, financial predictions or unsupported attribution. The existing deterministic SIGNAL 500 synthetic instrument can power explanatory charts; a persistent **ILLUSTRATIVE / SIMULATED DATA** lower-third must remain legible. Disclosure: “AI presenters · Prepared demonstration · Illustrative market data, not live prices.”

## Premium design and sound direction

- 1920x1080 / 30 fps, H.264 video, AAC 48 kHz stereo; target consistent loudness around -16 LUFS after source normalization.
- Signal brand: deep navy `#07162a`, teal `#41e0d0`, white `#f4f7fa`, restrained blue data accents. Modern newsroom graphics, no generic neon-tunnel filler.
- Camera discipline: Rumi source is 9:16; preserve natural facial proportions in an elegant right/left anchor panel inside the 16:9 canvas. Kevin's 16:9 source can occupy a medium market-analysis frame. Charts fill the screen as *intentional editorial cutaways* while a genuine generated speaker's audio continues.
- Use the existing six templates as the design reference, but **do not** fabricate a simultaneous dual-presenter listening reaction or imply real standing transparent footage we have not captured. Until that source exists, use single-speaker shots, chart cutaways and natural turn-to-turn transitions.
- No artificial laughter, forced smile loop or unsynchronized charts. Use short captions and premium lower thirds; keep on-screen title/data readable on mobile.
- Royalty-cleared music optional, not a mandatory paid provider. No ElevenLabs credits required for the **new independent HeyGen-native audition**; the existing full V2 worker has an ElevenLabs word-alignment dependency that must be bypassed deliberately in a separately tested film compositor, not asserted as already removed.

## Budget at the published Avatar III 1080p rate

Pure plan audit (`node pilot/v2/three-minute-plan.mjs`) expects:

- **Total runtime:** 180 seconds.
- **Paid speaking-video shots:** 9 clips covering ~171 seconds. Intro + end are local graphics.
- **Nominal Avatar III speaking footage:** ~**$2.85** at $1/generated minute.
- **Conservative internal estimate:** **$3.30** including a three-second per-speaking-shot timing cushion.
- **NOT** a provider-side wallet limit or final invoice. Real provider metering, rounding, failures, retakes, taxes, renderer compute, hosting, incidental services and previous short auditions are outside this estimate. First inspect the actual API-wallet balance, including deductions for the Araj and Rumi trial clips.

Attempting the complete 300-second film at $1/min would already consume $5 **for avatar footage alone** and leave no room in the existing prepayment for auditions or retakes. Therefore the **180-second first master is the budget-safe choice**. A 4–5 minute extension can be considered after the 3-minute film passes review and a new budget is approved.

## Release gates (in order)

1. **Done:** User approved Rumi's public recorded visual preview and Annie voice; Kevin and Orson were approved earlier. The direct GitHub Actions key check passed for both exact looks and public Starfish voice IDs.
2. **Done technically, pending human review:** Rumi + Annie 10.8408-second authentic provider clip exists. Check visibly feminine on-screen look, natural facial and lip movement, accent/pace, anatomy consistency. A previous false-positive with Araj means no API metadata can replace this review.
3. **Next once Rumi passes:** One paid **Kevin + Orson** Avatar III clip, with separate permanent single-use submission tag and the same private GitHub API key. Human-review its look/voice realism.
4. **Then:** Produce the nine authorized 3-minute spoken segments one at a time, inspect real duration and billed usage, download each provider clip before signed URLs expire, and build the locally composed 1920x1080 master using FFmpeg outside Vercel. No blind paid retries. Respect a documented total wallet budget.
5. **Acceptance:** Film must be 180s (plus/minus a few frames), chart graphics/data correct, mouth/voice matching, non-repeating movements, no false listener footage, correct caption timing and audio, clean opening/outro, complete media QA and the user's signoff.
6. **Later only:** Expand to 5 minutes and prepare the broader 24/7 streaming infrastructure, with its own cost and integrations.

The PR remains draft; the actual 3-minute film is **not complete** until both faces have been human-reviewed and the composite passes technical/editorial QA. Only the first Rumi clip has been generated during the current phase.
