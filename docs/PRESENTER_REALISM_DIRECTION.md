# Superseded casting notes

**Current approved audition casting: Araj (female lead anchor) + Kevin (male market analyst), with Avatar III and payment blocked.** The historical options below are retained for comparison only. See [Final casting and audition plan](FINAL_CASTING_AUDITION.md) for the authoritative identities, script, cost and one-clip-at-a-time release requirements.

---

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
| **C: Recast to video-trained digital twins — stronger realism candidate** | [Veronica recorded preview](https://files2.heygen.ai/avatar/v3/5d7b598f4a564ea2b072b2440b249648/full/2.2/preview_video_target.mp4) | [Kevin recorded preview](https://resource2.heygen.ai/avatar/v3/c8f428c549ea448488fdb2214dbcad57/half/2.2/preview_video_target.mp4) | Avatar V (also supports Avatar III for cheaper test) | **$4/min on V; $1/min on III** | Both have **1280×720 landscape recorded references** and advertise Avatar V. More promising for human motion, but faces change and output quality is untested |

*Rates:* HeyGen's published 1080p API pricing table, https://help.heygen.com/en/articles/10060327-heygen-api-pricing-explained, as checked 2026-10-10. Examples for speaking-avatar footage only: 45 seconds is $2.25 (A) or $0.75 (B), and five minutes is $15 (A) or $5 (B). These are estimates based on billable generated seconds, **not** all-in finished-programme quotes. Extra listener takes, matting/standing, retakes, narration outside the avatar, market-data rights and hosted streaming are excluded. No minimum spend is claimed beyond provider's pay-as-you-go wallet terms.

**Editorial recommendation:** For a higher-realism goal, inspect **route C: Veronica and Kevin**, because both identities have landscape video-trained looks compatible with Avatar V. Keep **route B (Daphne/Bryce, Studio III)** as the lowest-cost filmed alternative. Do not assume C is objectively more lifelike without watching preview footage and a short paid test. Route C footage estimates are $3 for 45 seconds / $20 for five minutes on Avatar V, while its Avatar III budget fallback is $0.75 / $5 respectively. Pricing is based on HeyGen's October 2026 Avatar V API rate reported at https://www.heygen.com/blog/best-ai-avatar-talking-head-apis (approximately $4/min). Neither route is exclusive to Signal. If faces **must** remain Liza/Lasse, use route A and accept that its photo-generated-motion realism has a ceiling unless consented reference footage of the same individuals becomes available.

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
- [x] Public filmed studio and video-trained digital-twin alternatives catalogued and freely previewable.
- [x] Deterministic route/cost comparison in `pilot/v2/realism-casting.mjs`, with tests; **not a production cast switch**.
- [ ] Stakeholder decides whether to keep Liza/Lasse's exact faces or approve recasting to filmed identities (Veronica/Kevin preferred preview; Daphne/Bryce budget alternate).
- [ ] Stakeholder approves the selected *free video previews* for overall body/facial realism and accent.
- [ ] Direct HeyGen account's read-only look/voice/engine eligibility verified using the private API key (when available).
- [ ] The final selected route is implemented in the paid-audition adapter with exact IDs, engine and framing. Current `native-audition.mjs` stays pinned to Liza/Lasse until approval.
- [ ] Stakeholder approves an explicit first clip and total spending ceiling; provider wallet/auto-recharge state checked.
- [ ] **Only then:** make one short paid audition clip, review it at normal playback, and decide whether to proceed.

**No paid credits or renders have been authorized.** Main branch / production deployment unchanged. Draft issue PR #30 remains a controlled review surface.
