# Natural presenter direction — Signal / Jazz AI Channel

**Date:** 2026-10-10  
**Production status:** zero-spend research and preparation only. **No real video render has been produced.**  
**Decision held:** Liza and Lasse remain the approved public *faces*, but their realism was explicitly rejected as too AI-looking. Do not silently replace them with another cast or buy credits.

## Diagnosed limitation

The connected HeyGen public library contains **28 Liza** looks and **23 Lasse** looks; all are `photo_avatar`. These are animated stills, not a filmed motion-reference/digital-twin recording of the same people. Better prompts can modify micro-gestures but **cannot reconstruct their actual natural mannerisms from missing recorded reference footage**. Photo IV custom motion is limited to approximately 10 seconds before loop/hold for longer scenes, so prompts should **not** be the default on a 15–20-second shot. See: https://help.heygen.com/en/articles/12805098-fine-tune-avatar-gestures-and-movements-with-custom-motion-prompts-avatar-iv-v and https://help.heygen.com/en/articles/9964694-avatar-looks-explained.

## Two no-cost casting routes to preview

| Route | Lead anchor | Financial analyst | Motion engine | Provider API footage rate | Visual trade-off |
| --- | --- | --- | --- | --- | --- |
| **A: Keep approved public faces** | [Liza Office 1 preview](https://resource2.heygen.ai/public-avatars/Liza/image_videos/office80_p2_a1.mp4) | [Lasse Office 3 preview](https://resource2.heygen.ai/public-avatars/Lasse/image_videos/office120_p3_a1.mp4) | Photo Avatar IV | **$3 per rendered minute** | Familiar faces, but generated photo motion remains a realism limitation |
| **B: Recast to filmed studio looks — proposed** | [Daphne in Grey blazer preview](https://files2.heygen.ai/avatar/v3/180f7fceee0f4548acead17f466c267c_63120/preview_video_target.mp4) | [Bryce in Blue blazer preview](https://files2.heygen.ai/avatar/v3/61b1f2295f114bcf9a467a28854ae7f5_63020/preview_video_target.mp4) | Studio Avatar III (both selected looks advertise III only) | **$1 per rendered minute** | Motion derived from a recorded video look; different actual faces and voices, must be approved |

*Rates:* HeyGen's published 1080p API pricing table, https://help.heygen.com/en/articles/10060327-heygen-api-pricing-explained, as checked 2026-10-10. Examples for speaking-avatar footage only: 45 seconds is $2.25 (A) or $0.75 (B), and five minutes is $15 (A) or $5 (B). These are estimates based on billable generated seconds, **not** all-in finished-programme quotes. Extra listener takes, matting/standing, retakes, narration outside the avatar, market-data rights and hosted streaming are excluded. No minimum spend is claimed beyond provider's pay-as-you-go wallet terms.

**Editorial recommendation:** Prefer a **recorded studio look** if free previews demonstrate better natural motion; it is both lower-cost and less dependent on inventing head/eye/hand behavior from a single photograph. This does not automatically make the avatar indistinguishable from real video. If faces **must** remain Liza/Lasse, use route A and accept that there is a motion fidelity ceiling until licensed consented footage of those exact people becomes available. Stock public looks are not exclusive proprietary identities.

## Distinct character treatment (applies to either route)

**Lead anchor — steady and approachable**

- Calm authoritative opener, conversational warmth and a trace of imperfection; avoid a constant advertisement smile.
- Restrained eyebrow movement and small natural pauses before questions; direct camera address for opener/closer only.
- Close/medium shot, eye-level lens, neutral daytime newsroom lighting; medium-depth background and no cosmetic-skin plasticity effects.
- Cool-charcoal / off-white palette with a small restrained Signal accent; personal wardrobe should differ from analyst.
- Spoken copy uses short sentences, real explanatory clauses, not forced enthusiasm or repetitive handover phrases.

**Financial analyst — thoughtful and informal-professional**

- Lower-key, slightly slower analytical delivery, short thoughtful hesitations before interpreting a number, no monotone or rehearsed sales speech.
- 3/4 angle toward the studio chart and only occasional camera-facing sentences. Do not claim actual pointing unless real media proves it.
- Distinct navy/blue blazer, no visual match to anchor; show a wider chart wall and use detailed numbers on graphics rather than mouth-only talking shots.
- Questions should invite clarification; analyst answers in one or two facts and a caveat, not lengthy textbook paragraphs.

## Camera, audio, editing and QA guardrails

1. Frame and light each presenter differently (anchor at desk, analyst toward chart). Avoid front-facing symmetrical two-card talk boxes for the whole segment.
2. Start with measured, natural speaker speech. Preserve real pauses and varied phrasing; do not inject unnatural 'um' or stumbles artificially. Review voice pace, pronunciation and accent against a live segment example, including `Signal`, market instrument names, percentages and units.
3. Cut to charts and relevant data where the presenter would normally be discussing a visual. The reviewer should see **what is being explained**, not a face continuously talking for the full episode.
4. A non-speaking presenter must not mouth the other person's speech or freeze unnaturally. Until licensed moving listener footage exists, show the active presenter or full-screen chart; no fake silent reaction.
5. For photo IV, start with **low expressiveness** and default motion. Custom motion should be one small gesture on a segment <=10s where a loop cannot occur; a prompt cannot control camera, location, prop actions, walking or reliable pointing.
6. For studio Avatar III, do **not** send IV-only motion controls. Source images are near-square; use **contain** in the 16:9 graphics panel to avoid unnaturally cropped heads or hands. Check actual video width/height separately from requested 1080p output.
7. No face-filter smoothing, heavy contrast, exaggerated glow, fake bokeh around hair, forced smiles or dramatic gesture repetition. Broadcast should look slightly imperfect and lived-in, not synthetic-polished.
8. Require an actual clip QA: lip/mouth closure, teeth stability, blinking, eye contact, cheek/jaw drift, hand continuity, expression-to-word alignment, voice pacing, source resolution, subtitle/data sync and whether it looks credible during **normal playback**, not merely one screenshot.
9. Failing acceptance means stop, investigate *why*, and prepare a targeted revision; **never** silently spend on multiple renders hoping for improvement.
10. Retain on-screen AI disclosure. We aim for credible human-like presentation, not misleading viewers about the use of AI.

## Exact zero-spend release gates

- [x] Existing photo faces and voices catalogued.
- [x] Two public studio/video-look alternatives catalogued and freely previewable.
- [x] Deterministic route/cost comparison in `pilot/v2/realism-casting.mjs`, with tests; **not a production cast switch**.
- [ ] Stakeholder decides whether to keep Liza/Lasse's exact faces or accept changing faces to Daphne/Bryce.
- [ ] Stakeholder approves the selected *free video previews* for overall body/facial realism and accent.
- [ ] Direct HeyGen account's read-only look/voice/engine eligibility verified using the private API key (when available).
- [ ] The final selected route is implemented in the paid-audition adapter with exact IDs, engine and framing. Current `native-audition.mjs` stays pinned to Liza/Lasse until approval.
- [ ] Stakeholder approves an explicit first clip and total spending ceiling; provider wallet/auto-recharge state checked.
- [ ] **Only then:** make one short paid audition clip, review it at normal playback, and decide whether to proceed.

**No paid credits or renders have been authorized.** Main branch / production deployment unchanged. Draft issue PR #30 remains a controlled review surface.
