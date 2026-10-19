# Presenter quality gate — issue #64

The October 19 demo has an open visual defect: unnatural facial proportions and skin/clothing highlights. It is not visually approved. Keep issue #64 open until a corrected moving sample is accepted.

The news-demo renderer now exports REVIEW-DRAFT, never Final. Promotion uses production/broadcast-sample/release-reviewed-demo.py DRAFT REVIEW_JSON NEW_OUTPUT. This validates explicit review evidence; it is not an automatic visual defect detector, an account-wide provider restriction, or a guarantee of identity consistency. It applies to this demo release path, not every legacy renderer.

Review JSON fields:
- draft_sha256: SHA256 of the exact composited draft being reviewed.
- reviewed_by, reviewed_at, notes: nonempty reviewer identification, date and observations.
- moving_video_reviewed: true only after watching the actual moving footage; frame inspection alone is insufficient.
- open_blockers: empty list only when none remain.
- approved_references: nonempty list of path, sha256, approval_record for original approved anchor masters. Paths must be available to the release process. Do not approve drifted renders as substitute masters.
- checks: each of facial_proportions, body_proportions, skin_highlights, clothing_highlights, temporal_consistency, lip_sync, voice_identity, graphics_accuracy, face_clearance must contain status=pass and specific evidence (shot/timestamp observations).

Do not manufacture pass records from a successful render or from these field requirements. If a tool cannot inspect audio or motion adequately, leave that check unresolved. A changed master appearance needs user visual acceptance; routine checks against an already approved master need not repeatedly interrupt the user.

Production procedure:
1. Reuse original approved identity references and voice bindings.
2. Test a short same-script comparison of fixed-reference generation versus dedicated avatar generation before another full episode.
3. Use soft neutral lighting and matte wardrobe references; avoid sharpening/beauty treatments that exaggerate skin or cheek structure.
4. Inspect first/middle/last frames and full moving footage for all checks.
5. Reject fabricated charts/text, facial thinning, waxy highlights, flicker and occlusion. Colour grading is only a glare mitigation, not a facial geometry repair.
6. Correct failed shots, review the recomposited draft and record its new hash before release.

Gate validation performed with synthetic fixtures: missing review, missing checks, unwatched footage, open blockers, stale draft hash and changed master reference all rejected; complete fixture accepted. These tests do not constitute visual approval of the actual demo.

Changes are on feat/stocks-production-roadmap-20261019 / PR #63. No new generation credits were spent for this guardrail.
