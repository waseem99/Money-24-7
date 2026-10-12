# Araj first API audition — voice-validation failure and safe recovery

Date: 2026-10-10
Paid-retry authorization: **NOT GRANTED**. Budget-constrained project. No new clip should be submitted without explicit user approval.

## Current user-approved pairing — no additional spend authorized

**Araj = Annie — Lifelike** (public Starfish English female voice `330290724a1b470fb63153f34d4c0183`). **Kevin = Orson — Firm & Measured** (`00e3d285aba44b27a83c47c02c9c2d9c`). The user listened to Annie's free sample and explicitly selected it over Georgia; Yuki remains rejected. This supersedes intermediate voice-casting proposals recorded later in this incident history. Annie was present in the same authorized read-only Starfish API catalog, as verified by [the no-cost diagnostic run](https://github.com/waseem99/Money-24-7/actions/runs/38075930139). The corrected draft audition references Annie dynamically and will not use Araj's original failed default voice. **Do not issue another paid video POST merely because voice selection is approved**: first determine whether the failed job consumed credit and obtain separate one-clip paid authorization.

## Verified attempt

- First and only billable POST through the user's private GitHub Actions secret: [GitHub Action](https://github.com/waseem99/Money-24-7/actions/runs/38075101779).
- Provider video ID: `33f132ced33b48d9083b6d7d1c70af50`.
- Provider accepted one video submission, then returned `failed`.
- Authoritative HeyGen video result: `TTS_VOICE_UNAVAILABLE_ERR` — "Voice validation failed for 1 voice(s)".
- Digital twin: **Araj**, `425825d6465b4ba4bd261d334d530430`; Avatar III, 1080p 9:16.
- Failed TTS voice: `5769809d7ddd445e8173b3d08c509ae1` (the look's assigned **default** voice). The look API advertised this default ID but did **not** prove that it was currently synthesizable.
- Permanent GitHub idempotency tag: `refs/tags/signal-araj-avatar-iii-first-paid-attempt-20261010`. An automatic rerun cannot send a second billable POST; do not delete the tag merely to retry.
- **Actual billed amount / wallet balance remain unverified.** Neither a failed video nor a submitted job should be treated as a confirmed charge or refund.

## Read-only investigation

- [Female Starfish catalogue check](https://github.com/waseem99/Money-24-7/actions/runs/38075217922): found multiple public English female voices accessible through the **same** direct API key. Female presenter alternative selected: **Yuki — Conversational & Easygoing** (`0989cd9eec9e485da0d7945fe142dfb9`).
  - Free voice preview: https://resource2.heygen.ai/text_to_speech/public-voice-curation/0989cd9eec9e485da0d7945fe142dfb9/id=5c8f94b7-644c-4473-846a-773f5587e72e.wav
- [Male Starfish catalogue check](https://github.com/waseem99/Money-24-7/actions/runs/38075273174): English male voices accessible using the same key. Kevin's proposed alternative: **Orson — Firm & Measured** (`00e3d285aba44b27a83c47c02c9c2d9c`).
  - Free voice preview: https://resource2.heygen.ai/text_to_speech/public-voice-curation/00e3d285aba44b27a83c47c02c9c2d9c/id=e930219d-5bd4-4b91-8085-99d66219b0c8.wav

Public voice names / audio samples do not establish an American accent or successful lip-sync. Those must be evaluated in playback. **No TTS synthesis POST and no additional video render were attempted during diagnosis.**

## Engineering fix in draft PR #30

1. Preserve the actual HeyGen look's `defaultVoiceId` as catalog metadata, separate from `auditionVoiceId` used for generation.
2. The initial correction proposed Yuki and Orson. The provisional Georgia proposal was superseded by the user's final choice of **Annie — Lifelike**. **Orson remains locked** for Kevin; neither voice has been tested in a completed generated video.
3. Replace the earlier, inadequate look-default-only readiness check. A read-only GET to `/v3/voices?engine=starfish&type=public&language=English&gender=...` must independently find the selected `auditionVoiceId` and language/gender; otherwise **fail closed before any paid render**.
4. Maintain same-key and recent-account verification, conservative plan-hash spending reservations and single-turn mode.
5. Change cost estimator to $1/min for Avatar III digital-twin footage and $4/min for Avatar IV digital twin, per the current HeyGen API pricing.
6. CI includes a regression that an absent voice in the Starfish catalog blocks approval.
7. Keep full V2 and production site unchanged; no automatic paid retry.

## New voice-quality feedback and read-only alternative check — 10 October 2026

The stakeholder accepted **Kevin + Orson** as natural. **Araj + Yuki was rejected as sounding AI-generated** without producing any second paid video. This rejection supersedes the earlier proposed Yuki selection above. The [read-only natural female voice search #38075930139](https://github.com/waseem99/Money-24-7/actions/runs/38075930139) confirmed both of the following IDs in the same authenticated API catalog, with zero provider generation requests:

- **Georgia — Lifelike, Broadcaster** (preferred *provisional* option): `596d780fd5874d7983847b6a0e0c49e6`; [free listening sample](https://resource2.heygen.ai/text_to_speech/21e28514b7994f46b907b74914a3ca6e/596d780fd5874d7983847b6a0e0c49e6/id=c74ae0d6-5e5f-4594-a18d-8c3940cdb13a.wav).
- **Annie — Lifelike** (alternative for a softer, less newsreader-sounding cadence): `330290724a1b470fb63153f34d4c0183`; [free listening sample](https://resource2.heygen.ai/text_to_speech/561ac7e163fa4d42a9115b5db9beeaf6/330290724a1b470fb63153f34d4c0183/id=8a40de08-a60e-4d1a-8d03-066c135ebb93&locale=en-US.wav).

A catalog entry, including a label of "Lifelike", **does not guarantee that the user will perceive the generated voice as realistic** or that the script will render successfully. Have the stakeholder review free samples and confirm the choice before authorizing another video POST. Orson is unchanged. The test runner now uses **Annie**, the user-approved choice, and Kevin remains on **Orson**. All payment gates remain blocked.

## Before a second paid attempt

- [x] Stakeholder selected **Annie — Lifelike** after hearing the free samples; Yuki rejected, Georgia not selected. This is **voice approval only**, not paid-video approval.
- Check the HeyGen API billing/usage page for actual charge and remaining wallet, and auto-reload status; the read-only API did not expose enough billing metadata.
- Complete CI tests on the corrected PR.
- Re-run read-only account/voice checks with the same GitHub secret, from trusted code.
- Obtain **fresh explicit authorization** for one new billed Araj audition attempt. The previous authorization was limited to one clip, which HeyGen accepted then failed.
- Use a **new specifically approved attempt ID**, never repurpose/remove the original tag. No retries on network uncertainty.

This is a failed first paid audition, not a completed accepted video. The next steps must not be represented as production-ready or visually approved.
