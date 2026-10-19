# Stocks — broadcast motion-design commissioning brief

**Project:** Codistan × Tamasha Stocks  
**Repository:** waseem99/Money-24-7 · draft PR #63  
**Decision date:** 19 October 2026  
**Status:** ready for a designer to start; no designer commissioned or assigned yet.

## 1. Outcome

Create an original, contemporary financial-news graphics package that works with our approved moving newsroom footage and can be populated automatically for future episodes.

The client-approved vendor videos establish the expected production finish. Our recent opener and chart experiments have been rejected as PowerPoint-like and dated. Do not continue those treatments. The latest presenter layout is a working reference only, not final approval for the whole package.

The first deliverable is one complete 20–25-second motion sequence. Review it with presenter footage, narration and sound. A portfolio of static slides is not sufficient.

## 2. Reference material and what to study

Use the original clips, not cropped contact sheets, when evaluating motion.

| Reference file | Sampled timestamps | Design questions |
|---|---|---|
| WhatsApp Video 2026-10-19 at 1.39.22 PM.mp4 | about 6s, 26s, 46s, 66s, 86s, 106s | Opening-to-studio transition; single/two-presenter coverage; chart-wall integration; foreground information hierarchy |
| WhatsApp Video 2026-10-19 at 1.39.21 PM.mp4 | about 6s, 26s, 47s, 67s, 87s, 107s | Programme/segment identities; stock-mover board; anchor plus information; section transitions |
| WhatsApp Video 2026-10-16 at 12.22.43 PM.mp4 | about 6s, 28s, 50s, 71s, 93s, 115s | Opening dimensionality; consistent studio; presenter framing and conversational shot changes |

These timestamps identify inspected frames, not verified cut boundaries. The designer must watch the full sequences and annotate actual transition durations.

Additional research: CNBC graphics-system reporting dated December 2023 and December 2025:
- https://www.newscaststudio.com/2023/12/12/cnbc-new-graphics-logo-ticker/
- https://www.newscaststudio.com/2025/12/15/cnbc-new-logo-opens/

These are dated references, not a claim that we have verified every network's current on-air appearance. Borrow principles, not another network's logo, title animation or distinctive brand assets.

## 3. Fixed project constraints

- Small Tamasha symbol plus **Stocks**; do not repeat the word Tamasha.
- Retain approved presenter identities and voice bindings. This assignment does not replace or regenerate them.
- International English business/economy programming.
- Preserve visible faces and natural conversational framing.
- A coherent family of shows within one channel, beginning with The Business Brief and Earnings Explained.
- Avoid changing the studio architecture to solve an overlay problem.
- Social-brand alignment is unresolved: no exact approved social reference was supplied. Do not invent an official social brand guide.
- Review master: 1920×1080, 24fps to match existing footage. Distribution frame rate must be confirmed separately before playout commissioning.
- No new subscriptions, stock-template purchases or paid avatar renders are included in this brief without a specific decision.

## 4. First motion test — gate before the full package

Use the existing approved eight-second studio proof and existing programme voice clips.

| Approximate duration | Shot | Required demonstration |
|---|---|---|
| 0–3s | Programme identity | Original title composition, deliberate movement and sound cue |
| 3–11s | Existing studio conversation | Headline entrance; unobstructed presenters; continuous crawl |
| 11–19s | Earnings explanation | One idea, precise data, progressive emphasis and a motivated transition |
| 19–23s | Next-program handoff | Clear continuity into Earnings Explained using the same channel identity |

The chart must have a locked script and narration cue sheet before final timing approval. Existing audio may be used only where its words actually match. A temporary timed read is acceptable for internal timing review if explicitly identified; it is not final voice approval.

Suggested chart narration for timing:
“Revenue rose twenty percent. Operating profit fell twenty percent. The margin narrowed from twelve percent to eight percent.”

Illustrative dataset:
- Period 1: revenue $100m, operating profit $12m, margin 12%.
- Period 2: revenue $120m, operating profit $9.6m, margin 8%.
- Changes: revenue +20%; operating profit −20%; margin −4 percentage points.
- On screen: **Illustrative example — not market data**.
- Do not invent additional historical points for visual decoration.

## 5. Full package — only after the motion test passes

1. Channel/programme identity: opener, short sting, closer and programme handoff.
2. Lower thirds: one-line and two-line headline; anchor/guest name; correspondent location; source and timestamp.
3. Information bands: continuous crawl and separate quote/index strip, with long-text and stale-data states.
4. Market boards: indices, gainers/losers and economic calendar.
5. Analysis templates: time series, comparisons and earnings summary.
6. Interview layouts: two presenters, presenter plus correspondent, presenter plus chart.
7. Operational states: coming up, recorded/replay, technical holding and data unavailable.

Each family must share typography, spacing, motion rules and stable information positions. “Breaking” and “Live” must be editorially controlled, not decorative labels.

## 6. Design direction and exclusions

Show the designer's proposal against the original reference footage. Establish what makes it recognisably television in composition, timing and information behaviour.

Avoid:
- Generic title slides and default chart styling.
- Decorative freestanding monitors, stands, bevels and metallic frames.
- Random architectural backgrounds unrelated to the studio.
- Large panels that shrink presenters unnecessarily.
- Dense dashboard widgets or arbitrary movement.
- Using extra 3D depth as a substitute for good graphic design.

Charts need clear units, periods, source, direct labels and a justified scale. Distinguish percentage change from percentage-point change. Sound must support transitions without masking speech.

## 7. Editable delivery and automation contract

Deliver:
- Native editable project files, linked assets and font/license inventory.
- Clean background/title animation separately from live text and data.
- Transparent overlay renders, reference composites and clean plates where applicable.
- Alpha-capable image sequences or another tested alpha format; verify straight/premultiplied alpha with the compositor.
- Exact frame counts, start/hold/exit ranges and cue markers.
- Design tokens: colours, typography, spacing, line weights, safe areas.
- A field map for every template and examples of minimum/maximum supported content.
- Master preview with sound plus a silent version for comparison.

Minimum template fields:
`template_id`, `program_id`, `headline`, `subheadline`, `speaker_name`, `speaker_role`, `source_label`, `as_of`, `data_status`, `disclosure`, `series`, `units`, `cue_frames`.

Engineering will validate inputs, bind data, schedule cues, render graphics and integrate them into playout. The designer must identify which elements are pre-rendered and which must remain dynamic. Do not bake changing market values into reusable background videos.

## 8. Acceptance gates

**Gate A — motion test**
- Compare side by side with vendor references at equal playback size.
- User accepts the opener and financial graphic explicitly.
- Headline, ticker and presenter remain readable at normal viewing size.
- Transitions feel connected to the story and audio.
- No clipped text, face occlusion or unlabelled sample data.

**Gate B — engineering reproduction**
- Reproduce the approved look from supplied assets.
- Swap in a second headline and dataset without manual redesign.
- Exercise long headline, negative value, missing quote and stale timestamp.
- Verify chart calculations, cue timing, alpha edges and full video/audio decode.

**Gate C — programme extension**
- Apply the package across a complete programme opening, story, close and next-show handoff.
- Check consistency and long-running crawl behaviour.
- Only then extend the package to additional shows and live-data integration.

A visually rejected motion test does not pass because its renderer works.

## 9. Responsibility and immediate decision

**Broadcast motion designer:** art direction, motion, sound treatment and editable source delivery.  
**Codex/engineering:** reference preparation, data contract, compositor, automated population, technical validation and integration.  
**Waseem:** assign the designer and accept/reject visual direction.

Next external dependency: nominate one available broadcast motion designer from Codistan/Momentum Lab, or authorize a separate sourcing task. No outreach, hiring or purchase has been performed. Keep PR #63 as draft and do not publish the rejected experiments as client-ready work.
