# STOCKS — G1 native framing QA and original-cast production baseline
**14 Oct 2026** · **Issue #37 E02/E05** · **Release G1: PARTIAL / not approved**

## Scope
The user approved **Nora = Liza Office 6 / Annie** and **Marcus = Lasse Office 3 / Orson**. Their R5 early-session originals remain the source of truth. Never silently substitute the W3/W5/W6 alternative fictional faces for either presenter.

The G0 source archive provides native R5 videos:
- Nora `NORA.mp4` — 7.340 seconds, 1920×1080, original lip-synced voice and wood/white office;
- Marcus `MARCUS.mp4` — 12.600 seconds, 1920×1080, original lip-synced voice and grey/dark office;
- Source `NORA-matte.webm` / `MARCUS-matte.webm`: 960×540 alpha mattes for testing **only**. Do not assume edges/body occlusion are accepted.

## Implemented in this integration branch
1. Ported six-camera `studio/index.html` plus companion README and framing regression from PR #35 without changing the agreed character identities.
2. Fixed legacy FFmpeg center-crop recipe: `scale=772:405:force_original_aspect_ratio=decrease,pad=772:405:(ow-iw)/2:(oh-ih)/2:color=0x113255`. Preserves complete input; cannot repair cropping already present in source.
3. Disabled **all four inherited paid HeyGen R5/original-shot workflows** in the production integration branch by changing triggers to `workflow_dispatch` and adding literal always-false job guards. No PR/push trigger can start a paid video job from those files. Keep them disabled until a separate user-authorized budgeted change is reviewed.
4. Added `tests/stocks-g1-paid-guard.test.mjs` to reject any accidental reintroduction of auto-billable triggers.

## Actual 19.97s G1 source QA video
The locally generated source-first framing review `STOCKS-G1-ORIGINAL-CAST-HEADROOM-PROOF.mp4`:
- First original Nora sequence, then original Marcus sequence, both at full native speed; unaltered original audio, no stand-in faces or newly generated voice.
- 1920×1080 H.264/30fps + AAC 48kHz, full decode **PASS**, SHA-256 **`ff109885a063b44cb0af8cea088ec0552a56dc670f3caf526deb14afe2450f80`**.
- Uses **fit-and-pad**, 1170×658 visible source viewports within a controlled broadcasting technical plate; neither source is destructive-cropped.
- Right-side source data use exactly the **Reuters Oct 12 09:40 ET** dataset from the earlier original-cast script (Dow +0.21%, S&P +0.08%, Nasdaq −0.04%). It is explicitly **REVIEW ONLY**, not live or a finished show.
- This footage resides in a conversation-delivered QA file; source originals are not checked into GitHub. The local reproducible Python+Pillow/FFmpeg operator script is part of the private session handoff, not a GitHub build dependency.

## What this DOES NOT prove
- Matting clean enough for a photoreal physically integrated shared desk.
- Consistent physical studio across R5 original source rooms.
- Perfect head/eye/hand realism, listener reactions, equivalent camera angles and lip sync QA across 260 seconds.
- A 45–65-second golden sample, remote handoff or any final deliverable.
- Permission to recast or combine close-edition W3/W6 voice tracks with the early-session R5 script.

## Editorial recommendation (requires explicit user choice before expensive production)
**Preserve 12 Oct early-session storyboard for the first premium QA**, because this is the ONLY edition with the user-approved original-cast talking source. Earlier idea to reuse Oct 12 close recordings is incompatible with the current cast, unless the user explicitly approves a replacement or new matching recordings. Do not mix editions for economy.

## Safe production decisions
- Best low-risk shot: separate source-respecting Nora and Marcus closeups + dated market graphics; no unrealistic shared desk.
- Two-person wide: one SHORT coherent silent establishing view *only if face identities remain unchanged*, or original split-screen interview with their real source rooms. No fake 3D shared desk.
- Analyst standing: skip if video does not have a valid standing persona or feet/body segmentation.
- Remote: ALEX W7 is an experimental separate cast and close-edition script; cannot be silently imported.
- **Next** after CI green: client reviews native 19.97s camera proof; source-based camera plates should then be locked and the 45–65s complete pilot edited with *source-matched* audio and assets.

## Remaining blockers
- Live Vercel review studio still reports 403 forbidden for the new Cod5 scope; do not alter old Cod3 team.
- Private durable backup for recovered clips; bank face approval and rights clearance.
- No natural simultaneous listening performance established.
- Golden 60s requires more correct scripted audio/filmed sequences than the currently recovered 19.97s sources. Continue non-billable editing only; no unauthorized purchases.
