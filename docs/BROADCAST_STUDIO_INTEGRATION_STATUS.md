# Jazz AI Channel — formal wardrobe, studio graphics and production integration status

**Status (12 October 2026): Graphics bridge proven on a 10-second clip; full film and formal wardrobe still incomplete. This is a technical implementation audit, not a finished programme approval.** The user's expectation is a premium, formal 3–5-minute financial-news programme featuring Rumi (voice Annie) and Kevin (voice Orson) inside the previously agreed Signal broadcaster architecture. **The existing raw HeyGen clips do not show the studio graphics or guaranteed formal clothing.**

## What already exists in GitHub

| Required broadcast element | Verified code | Real presenter footage integrated? |
| --- | --- | --- |
| Signal identity, brand header, navy/teal newsroom design | [Existing SVG graphics renderer](../src/broadcast/render.js), [theme/fixtures](../src/broadcast/fixtures.js) | **Not yet in a full real 3-minute master** |
| Animated lower thirds, presenter names/roles, scene headlines | `renderSVG`, `renderOverlay`, state/cue mapping | Renderer exists; direct HeyGen auditions were exported without it |
| News replay/synthetic market ticker, timestamp and source disclosure | `renderOverlay` and its `ILLUSTRATIVE FIGURES` warning | Same: verified design code, not in raw auditions |
| Market snapshots, price/volume, candlesticks and SMA/EMA/RSI/MACD indicators | [Source-driven chart engine](../src/broadcast/render.js), [financial metrics](../src/broadcast/data.js) | Rendered in synthetic layout verification; needs timed genuine voice integration |
| Six templates: anchor-full, discussion-two, presenter-board, anchor-analyst-wall, chart-full, story-visual | [Template map](../src/broadcast/timeline.js), [state/validation](../src/broadcast/contracts.js) | All available as a silent fixture rehearsal; two-presenter real compositions still require source footage |
| Animation, audio, caption and actual media compositing | [V2 FFmpeg composer](../pilot/v2/render.mjs) | **Separate full V2 worker requires timed speech and genuine listener/standing sources** |
| One 180-second target film with dialogue and beat timing | [3-minute shot plan](../pilot/v2/three-minute-plan.mjs), [production rundown](THREE_MINUTE_MASTER_EXECUTION.md) | **Editorial plan only, not a completed or wired render job** |
| Rumi + Annie user-approved visual/voice IDs and Kevin + Orson | [Read-only casting manifest](../pilot/v2/budget-preflight.mjs) | One real Rumi speaking clip generated (10.8408s), **not** integrated into full film |
| Formal professional wardrobe on both public digital-twin actors | HeyGen public look groups verified through user account | **NOT implemented**; each group has one video-trained look plus a photo-avatar look, but **no already-verified formal video-trained look** |

## Why the viewer saw casual clothes and a bare presentation

The first Rumi+Annie file was generated using the direct `POST /v3/videos` avatar route with only avatar, voice, script, engine, framing and resolution. That route does not automatically add the external Signal graphics. It uses the **existing filmed outfit** from Rumi's video-trained public look. The user did not view the composited V2 film: **that film does not yet exist**.

Putting the person in a virtual studio **does not change their clothing**. Face/voice identity is frozen as the user decided. Wardrobe is its own outstanding production requirement. The user's requested **business-formal jacket/blazer/newsroom professional styling must be addressed before declaring a full master approved**.

## Wardrobe options consistent with the frozen identity

HeyGen's [Avatar Looks documentation](https://help.heygen.com/en/articles/9964694-avatar-looks-explained) describes customizable *Photo Looks* (outfit/scene variants) and separate filmed *Video Looks*. A public video-trained Rumi or Kevin look with casual attire is not magically re-dressed by adding a suit prompt to the speaking-video API. The public groups currently expose no ready, independently approved formal **video** look.

Before spending on another presenter, the team may explore whether the existing **public** look permits a formal corporate *Photo Look* or Look Pack through HeyGen; public avatar remix permissions, any separate credits, and whether that new look retains acceptable natural video motion **must be verified first**. The connected catalog contains look-pack themes titled **Presenter** and **Modern Corporate**, but **we have not generated or applied them to Rumi/Kevin**. A new photo look could differ in realism from the approved video-trained source. No paid wardrobe edit or change of face is authorized simply by this document.

The immediate zero-extra-credit option is **tighter anchor close-ups plus professional studio framing and lower-thirds**, which can reduce visible informal clothing but **cannot truthfully be claimed as a formal wardrobe change**. If jackets/blazers must visibly appear on both presenters, obtain a suitable formal look and review its free appearance before funding an additional speaking render.

## Bridge the disconnected pipelines

- **Approved layout renderer:** Signal V2 SVG → 1920×1080 backdrop featuring logo/header, explanatory headline, anchor role label, source disclosure and lower ticker.
- **Approved identity:** Rumi+Annie source (portrait) and future Kevin+Orson source (landscape).
- **Graphics bridge verified successfully:** the existing Rumi+Annie source has now been composited over the actual Signal V2 logo/header, a newsroom presenter panel and lower-third, main headline, illustrative source disclosure and lower ticker. The result is a **10.84-second 1920x1080 H.264/AAC graphics proof**, available in [GitHub Actions artifact #11726389471](https://github.com/waseem99/Money-24-7/actions/runs/38205178482/artifacts/11726389471) (includes MP4, still and readme). [Job #38205178482](https://github.com/waseem99/Money-24-7/actions/runs/38205178482) succeeded. It uses authenticated GET of an existing rendered HeyGen asset, and the actual V2 renderer on main; **zero new HeyGen render credits were used**. **Limitations:** backing graphics are static, source clothes unchanged, Kevin not composited, and this is not the 180-second real programme.
- **Next production integration:** use the proof to finalize the compositing approach; implement actual 180-second clip ingestion, scene-specific timeline/graphics, local FFmpeg assembly, correct captions and audio. Do not promise the paid full film until formal wardrobe, real performance and source/budget gates are met.

## Required acceptance gate before calling the final deliverable complete

1. Rumi is visually recognizable and genuinely woman-presenting; Annie speech sounds human and lips/eyes track naturally.
2. Kevin is clearly a different professional male presenter; Orson is natural; the pair has diverse, credible on-air presence.
3. Both have suitable **business-formal wardrobe**, not simply a studio wallpaper covering casual clothes.
4. Every on-air shot uses the correct signed-off look ID, voice ID, actual saved source file, framing and name/role lower-third.
5. The delivered 16:9 master includes the exact Signal newsroom graphics (intro, logo, headline strap, lower-third, ticker, timestamp, charts, closing slate) with synchronized transitions.
6. Claims and timestamps consistently label all figures as simulated or sourced; no fake live-market claims or invented listeners.
7. 180 seconds of clean H.264/30 fps video with genuine approved avatar scenes, measurable complete audio and independently reviewable captions.
8. Actual account charges and the remaining $5 wallet are reviewed before expensive 171 seconds of avatar generation.

**Do not conflate the design system, a graphic proof, and a completed three-minute film. These are three different production milestones.**