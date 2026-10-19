# Fixed cast verification and bounded audition

## Verified 19 October 2026

Funded repository credential: all five exact-ID GET checks passed in [run 39232885976](https://github.com/waseem99/Money-24-7/actions/runs/39232885976), job 117994863786. Nora, Marcus and Alex are completed photo-avatar looks supporting Avatar IV. Default voice assignments are null. Amina and Dexter English voice records are accessible. Zero generation calls. This resolves the cross-connection look-access uncertainty in ACCESS_AUDIT_20261019.md.

The versioned source of truth is production/cast/fixed-cast.json. Nora uses Amina - IA; Marcus uses Dexter - Professional. These preserve available narration choices as candidate pairings, not a new client approval. Alex is deliberately disabled pending a distinct voice audition. Five further cast members have not been created. HeyGen speech engine heygen_voice preserves the prior working speech route; Avatar IV is explicit. Engine availability is not proof of successful new speech/rendering or transparent output.

## Runnable preparation

Run `node production/audition/prepare.mjs` to print four speech request bodies. This command is offline and cannot spend credits. It uses no ElevenLabs credential and does not change the existing main production adapter.

The four-turn evergreen exchange is in prepare.mjs. Target approximately 30–40 seconds: Nora opens and asks about revenue versus profit; Marcus explains margins; Nora follows up; Marcus explains how to read results together. It contains no invented market prices or claim to be live news.

After an explicitly bounded generation step produces speech, archive each original audio file and measure its actual duration. Upload the approved audio, then supply a JSON array of records with: id, exact text, voiceId, assetId, seconds and SHA-256 sha256. Run `node production/audition/prepare.mjs audio-records.json 2.31` to prepare video payloads using an explicitly supplied rate. This is still offline; do not treat caller-supplied measurements as independently verified media evidence. A future submission worker must calculate duration and hash from the actual archived files.

Four clips maximum, each at most 15 seconds, total at most 40 seconds. Explicit 1080p, Avatar IV, contain framing, no automatic retries. Illustrative video-only cost at $2.31/minute: 32 seconds $1.24; 40 seconds $1.54. Verify the account's current rate before submitting. Default local estimate limit is $3; this is not a provider billing cap. Speech, rounding, failures, storage and compositing are excluded. Request hashes support review provenance, not provider-side idempotency. Do not retry an ambiguous submission without reconciling its provider job ID.

## What the first audition must prove

Review original, unlooped speaking clips: correct identity/voice, lip synchronization, pronunciation, face geometry, natural motion, clean framing and no clipping. Listen before paying for video. Retain provider job IDs, actual wallet deltas, source audio hashes and output hashes. Failed outputs remain failed evidence; no silent replacements.

Only after individual performance passes, test genuine transparent output and shared-studio composition. Paired listening, walking and turn-taking require their own continuous-shot proof; four separate speaking clips cannot establish them. Do not manufacture listening with repeating idle footage. The first identity audition preserves source framing; it is not the final studio sample.

Next implementation is a gated submission worker integrated with the existing job ledger, then the media/paired-performance review. Main's ElevenLabs-first adapter is not yet migrated. No new paid jobs, subscription, publishing or LiveAvatar sessions were started by this verification/preparation change.

API payload reference: https://developers.heygen.com/audio-to-video (checked 19 October 2026).
