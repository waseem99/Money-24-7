# Recast completed — 12 October 2026

**This is a historical visual-casting incident report.** The user subsequently selected and locked **Rumi** (look `efa5d7cf738a4efd84b1dac501d9aef8`) paired with the existing approved **Annie — Lifelike** voice, keeping **Kevin + Orson**. The [first Rumi audition](https://app.heygen.com/videos/12186d2986911a13710d9298344c7ab5) completed technically (10.8408 seconds) and remains pending human visual acceptance. [See current three-minute programme plan](THREE_MINUTE_MASTER_EXECUTION.md). The rejected Araj face must never be used again.

---

# Jazz AI Channel — Visual-casting failure and female anchor replacement

Status: **visual cast rejected, all new paid HeyGen submissions blocked, no replacement selected**
Updated: 2026-10-12

## Incident confirmed

The user viewed the successfully generated 10.1878-second Araj + Annie clip and reported the visible person looked **male**, while the voice was **female**. That does not meet the requested woman-presenting lead anchor. The look metadata classifies Araj as female, but the actual on-screen presentation was unacceptable to the user. No further expense is justified with this look.

- The successful but rejected video: [HeyGen](https://app.heygen.com/videos/1ca79771eb2b2cdab739dd3d41e1edfe), video ID `1ca79771eb2b2cdab739dd3d41e1edfe`; GitHub Actions [one-time paid job](https://github.com/waseem99/Money-24-7/actions/runs/38076661387).
- Exact rendered scene (confirmed by HeyGen): avatar `425825d6465b4ba4bd261d334d530430` (**Araj**) plus Annie voice `330290724a1b470fb63153f34d4c0183`. No Kevin was in that video, so it was **not** a swapped Kevin avatar.
- Previous failed test `33f132ced33b48d9083b6d7d1c70af50` was a **different** failure caused by Araj's unavailable default voice. Don't confuse it with this visual rejection.
- Voice selection is **still valid**: user-approved Annie — Lifelike for the female anchor; Kevin — Orson (Firm & Measured) for the male analyst. The rejected item is **Araj's face/look**.
- No newly generated footage is accepted or cleared for a 5-minute show. Actual API wallet balance/billed costs must be checked before any future paid job.

## Non-billable replacement shortlist

These are exact public **video-trained digital-twin** looks available in the connected HeyGen catalog, each `status=completed`, `gender=female` (provider metadata), native 720×1280 portrait, with Avatar III/IV/V support. Metadata alone is **not visual validation**. The user must play and visually inspect each real recorded preview, because the earlier look's metadata was misleading. Do not infer nationality, age or ethnicity from avatar names.

| Candidate | Exact look ID | Free HeyGen recorded preview |
| --- | --- | --- |
| **Jayla** | `e17d58cf1ccb41ebb7ab21bc2f0bdef3` | [View actual preview](https://resource2.heygen.ai/avatar/v3/e17d58cf1ccb41ebb7ab21bc2f0bdef3/half/2.2/preview_video_target.mp4) |
| **Rumi** | `efa5d7cf738a4efd84b1dac501d9aef8` | [View actual preview](https://resource2.heygen.ai/avatar/v3/efa5d7cf738a4efd84b1dac501d9aef8/half/2.2/preview_video_target.mp4) |
| **Stephanie** | `7ff6a5e83a864eb9a2560bc967ef2876` | [View actual preview](https://resource2.heygen.ai/avatar/v3/7ff6a5e83a864eb9a2560bc967ef2876/half/2.2/preview_video_target.mp4) |

The anchor casting brief: a visibly **woman-presenting**, professional, convincing financial-news anchor with an appearance that complements Kevin and meets the user's preference for diversity; natural expression, believable newsroom attire, realistic gestures. Use only actual prerecorded free HeyGen videos for visual sign-off, not names, catalog gender or still photos.

## Hard-stop engineering change

- `proposedPresenters.ANCHOR.visualApprovalStatus='rejected'` for Araj. Kevin's visual quality status remains `pending`. These are human-review statuses, **not** HeyGen gender fields.
- `pilot/v2/native-audition.mjs` must reject **every paid turn** unless **all** roles have explicit visual approval; previous plans/keys cannot override this check. Tests assert zero paid POST even with valid key, voice catalog, budget and hash.
- Existing GitHub Actions one-time tags for previous jobs must remain intact; no deleting/reusing tags.
- Public previews and API catalog look checks can proceed with **zero** newly generated footage.
- After the user chooses a correctly woman-presenting replacement, update **look ID, group ID, presenter name, source aspect ratio, scripts and tests**, then rerun read-only API access and media tests.
- Even after the free preview is approved, obtain separate permission for **one** short paid replacement video; verify the generated person's face, Annie voice, sync, and charged duration before moving to Kevin or the longer episode.

**Current state: NO-GO for paid video.** PR remains in draft; do not merge / deploy an unapproved anchor.
