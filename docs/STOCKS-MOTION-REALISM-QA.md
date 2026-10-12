# Stocks — presenter-motion diagnosis and no-spend fallback review (12 Oct 2026)

**Decision: ALL NEW PAID PRESENTER GENERATION ON HOLD.** The October 12 Nora/Annie Photo Avatar IV clip was human rejected for overexpressive / forced facial delivery. DO NOT treat the completed video as usable or proceed with Marcus, repeated Nora clips, background edits, or the full 4:20 production.

## Evidence inspected (NOT a same-script A/B)

| Original | Video/asset | Source | Result |
| --- | --- | --- | --- |
| Rejected 720p Nora | HeyGen `df8eba2ec9c124e500c2ee0b11e1de3e`; 10.8931s, Avatar IV, `expressiveness=low`, script in `pilot/stocks/episode.mjs` shot 15 | Current HeyGen `get_video` + `get_video_scenes`, original first render request | Human viewer rejected facial expression and forced delivery. No second provider charge was made. |
| Older 1080p Liza | HeyGen `9180a425a289d33d75c4ef82178ce9a8`; 8.12408s. Same public Liza Office 6 photo look `5ee67ac453c34ffebd71e8eedb47b2fe`, same Annie voice, Avatar III, **different script** | Provider `get_video_scenes` + genuine composite artifact [#11730311697](https://github.com/waseem99/Money-24-7/actions/runs/38213206045/artifacts/11730311697); Liza/Lasse 17.008s 1080p composite re-inspected via local FFmpeg at 0.5-second+ intervals | Earlier filmed composite displays broad Liza hand motions, an office source backdrop and static graphics. Does **not** certify natural newsroom acting. |
| Earlier Lasse | HeyGen `d69f9b79b86a04dec1dee7473e9cf9db`; 8.85551s | Same GitHub artifact | Source exists; not yet approved as natural interaction or non-speaking listener. |

### Review qualifications

- The rejected IV video was confirmed *complete* with correct source look, voice, original script, 720p resolution and duration via authenticated HeyGen reads. The IV original video file was not available in the local video-decoding environment; the **human rejection is the authoritative performance review**. Do not claim this audit produced a side-by-side, frame-synchronized comparison.
- The older III clip **was** actually recovered and reviewed as existing real motion via the previously built GitHub artifact. The two clips have different dialogue. No objective statement that Avatar III is superior to Avatar IV can be made.
- The user had already selected the least expressive Avatar IV setting on the rejected IV job. A simple `expressiveness=low` rerender would repeat the current configuration, not fix it.
- HeyGen catalogue `list_avatar_looks(groupId='3727ecd034ef4248afea2a3443f7d2b7')` returned **28 Photo Avatar looks and zero Video Avatar / Studio Avatar / Digital Twin looks for Liza**. Swapping Liza's Office 6 photo for another photo look is not a natural-motion guarantee.
- Rejected quality is unrelated to the newsroom resolution. Upscaling 720p to 1080p will not fix exaggerated face motion. The previous attempt at 1080p was blocked by the provider with `resolution_not_allowed` on that route.

## Non-billable alternate video-trained options (RECAST REQUIRES USER APPROVAL)

Public HeyGen **Studio Avatars** already carry provider preview videos and are not the same faces as Liza or Lasse. They are therefore **look options only**, not selected replacements. This workspace currently reports no private user-owned video-trained avatar.

| Role | Studio look ID | Existing provider preview | Availability |
| --- | --- | --- | --- |
| Female / recommended first preview | `Freja_public_6` (Freja in Grey blazer) | https://files2.heygen.ai/avatar/v3/c85726249c114102ba83a6393b1b156d_62620/preview_video_target.mp4 | public, `studio_avatar`, Avatar III, complete |
| Male / recommended first preview | `Bryce_public_2` (Bryce in Grey blazer) | https://files2.heygen.ai/avatar/v3/90f19ae257644acdbc7f814d60a3adc3_63030/preview_video_target.mp4 | public, `studio_avatar`, Avatar III, complete |
| Female alternative | `Daphne_public_1` (Daphne in Grey blazer) | https://files2.heygen.ai/avatar/v3/180f7fceee0f4548acead17f466c267c_63120/preview_video_target.mp4 | public, portrait-oriented studio look |
| Male alternative | `Albert_public_1` (Albert in Blue suit) | https://files2.heygen.ai/avatar/v3/57a701a3f0af49e6bda8cf47f1f7c7df_62550/preview_video_target.mp4 | public, studio look |

**Why investigate:** HeyGen's own [Photo Avatar](https://help.heygen.com/en/articles/10034438-how-to-get-started-with-photo-avatars) and [Avatar Looks](https://help.heygen.com/en/articles/9964694-avatar-looks-explained) documentation notes that photo motion is synthetic while video looks preserve motion learned from real footage. These public Studio Looks are **not guaranteed perfect**; their existing no-cost previews must be evaluated first. The documented provider paths do not guarantee cinematic standing, multi-avatar eye-lines, or genuine two-person conversation.

### Choices at casting gate

A. **Keep current exact faces:** no video-trained version of Liza found; do not buy additional photo/IV retakes. Requirement for a genuinely natural studio actor remains unresolved unless approved source video training/consent is possible.

B. **Approve replacement faces after free provider previews:** keep on-air *Nora* and *Marcus* (fictional labels), use consented, provider-licensed video-trained Studio looks and previously chosen Annie/Orson voices if compatible. **Only after explicit user approval**, run one short bounded dialogue audition. Recheck actual provider rates and 720p/1080p account entitlement. No paid test yet.

### Release gate

`pilot/stocks/motion-qa.mjs` provides exact failed-video status, candidates and an explicit `paidGenerationRelease()` guard. `pilot/stocks/preflight.mjs` includes a report of this gate.

- New paid clips: **0 authorized now**.
- All existing video generation under PR #31 must remain STOPPED, irrespective of successful CI.
- The user's reported $5 API top-up remains partially unverified because the HeyGen account connector exposes no direct API wallet read.
- No paid motion preview, Studio Avatar job, III rerun, IV rerun, recast or 4:20 master has been requested in this corrective phase.


## Update: eight-angle business-newsroom candidate assessment (read-only, 12 Oct 2026)

An additional, more relevant provider catalogue search located **two public filmed Studio Avatar identities with matching looks for four camera angles per person**. The existing provider preview clips were fetched via **GET only**, sampled visually and combined into a side-by-side motion review. **No HeyGen video-generation API requests or credits were consumed.**

| Persona | Sitting front | Sitting side | Standing front | Standing side | Shared group |
| --- | --- | --- | --- | --- | --- |
| Caroline (female) | `Caroline_Business_Sitting_Front_public` | `Caroline_Business_Sitting_Side_public` | `Caroline_Business_Standing_Front_public` | `Caroline_Business_Standing_Side_public` | `977b1ab85dba4eefb159a6072677effd` |
| Brandon (male) | `Brandon_Business_Sitting_Front_public` | `Brandon_Business_Sitting_Side_public` | `Brandon_Business_Standing_Front_public` | `Brandon_Business_Standing_Side_public` | `d08c85e6cff84d78b6dc41d83a2eccce` |

Each exact look was confirmed **completed**, of type `studio_avatar`, at native 1280x720 and supports provider engines `avatar_iii`, `avatar_iv`, and `avatar_v`. The public preview recordings are ~6.73s (Caroline) and ~6.13s (Brandon), with corresponding front/side/standing variants. They show a consistent person and wardrobe within each identity; the recorded motions in the free previews are more restrained than the rejected photo-avatar style, but **this does not establish actual new-script lip-sync quality**.

**Wardrobe gap:** Caroline's matching business shots show a collared light blouse rather than a blazer; Brandon has a dark suit jacket and open-collar shirt. The user must approve these exact real wardrobe appearances before any casting change.

**Set-composition gap:** These pre-existing looks have an office-window setting, not a purpose-shot Stocks newsroom. Composite/split-screen and camera transitions must be evaluated; studio previews cannot establish that either avatar will look convincingly seated behind a shared studio desk or looking at the other actor.

**Source/evidence:** [Read-only preview workflow success](https://github.com/waseem99/Money-24-7/actions/runs/38281653881) and [eight-look preview artifact](https://github.com/waseem99/Money-24-7/actions/runs/38281653881/artifacts/11760833429), containing one eight-angle contact sheet, side-by-side existing filmed preview and JSON QA report (`billedHeyGenJobs=0`). [Stocks automated tests](https://github.com/waseem99/Money-24-7/actions/runs/38281653765) passed, including cast-lock and no-paid-release checks.

### Release decision

- **Still STOPPED:** original rejected Liza/Nora Avatar IV, further original Photo Avatar rerenders, Marcus generation, and the 4:20 programme.
- Caroline/Brandon are **unapproved alternative faces**. This is not a silent recast of Liza/Lasse. On-air fictional names Nora/Marcus and selected Annie/Orson voices can be proposed for continuity, but compatibility and natural lip-sync must be tested only after casting approval.
- If user approves replacing original faces with Caroline/Brandon (including Caroline's blouse), the next step is **one short, budget-capped speaking test** using one seated front look, then a second short test only if the first is acceptable. The provider account credit visibility and expected charges remain an explicit preflight requirement.
- Existing eight-angle preview assets are non-billable and not broadcast footage; they are for casting approval only.
