# STOCKS — Production Operator Runbook (Execution Phase, 14 October 2026)

**Canonical task board:** [GitHub Issue #37](https://github.com/waseem99/Money-24-7/issues/37) — fourteen steps E01–E14 in required order.  
**Authoritative shot contract:** [STOCKS 17-shot readiness manifest](../STOCKS-17-SHOT-READINESS-20261014.json).  
**No-spend recovery results:** [G0 verified inventory](G0-VERIFIED-VIDEO-INVENTORY-20261014.json).  
**Current status:** E01 partially executed; G0 **not approved**; no client-ready movie.

## Operator protocol — at every work session
1. Read **Issue #37**, latest branch / last approved commit and explicit owner decisions. Do not reopen an already charged one-shot generation.
2. Check whether source artifacts are at risk of expiration. Earliest known: **27 October 2026** (W3 5-second integrated room).
3. Never commit production audio/video or license-restricted source media into the public repository, and never write provider credentials to any source or VITE-prefixed setting.
4. Before editing, record current goal, base SHA, ticket E01–E14, rollback method, and whether network/API calls could cost money.
5. Use the approval contract in the master plan. No parent task is completed if a critical checklist item remains unresolved.
6. Post issue update with **exact commit + evidence + failed/remaining checks + next step**; update readiness manifest only after accepted evidence.

## Explicit safe Git hierarchy
- PR #36: production plan and 17-shot contract; **do not merge blind from unrelated branches**.
- This G0 branch: audited historical asset inventory + planned operator contract.
- PR #32: immutable source of truth for original on-air cast and original voices, to preserve.
- PR #34: **experimental alternative** scene/face bank, not an approved recast; selectively reference source media only.
- PR #35: selectively cherry-pick studio UI and fit/pad compositor into later integration branch; never clobber R5 face lock.
- Separate future integration branch built from approved R5 plan, behind no-paid-generation manual release gate.

## G0 source recovery (started)
Observed five recoverable GitHub Actions packages:

| Bank | Source | Artifact ID | Expires | Outcome |
|---|---|---:|---|---|
| R5 | Nora + Marcus original filmed-look source MP4s and 960x540 alpha mattes | 11777993913 | Nov 02 | 4 videos full decode PASS; source look approved, motion unapproved |
| W3 | Coherent 5-sec AI-native pair room | 11795874332 | **Oct 27** | 1280x720; has audio stream but not necessarily usable dialogue; cast NOT approved |
| W5 | 7-sec W3-derived native Nora speech | 11796304828 | Nov 03 | 1344x768; close-edition script; NOT original approved face |
| W6 | Five 6–8-sec W3-derived native speaking shots | 11798612792 | Nov 03 | 1344x768; 05/09/14/16/18 full decode PASS; **20 missing** |
| W7 | 8-sec fictional Alex correspondent | 11798493600 | Nov 03 | 1344x768, close-edition audio; remote creative/license approval pending |

**All 12 recovered videos full decode PASS.** Original five artifact ZIPs + full file SHA/FFprobe audit + contact sheet are assembled in a local conversation-backed operator package, not yet an offsite institutional backup. Do not mark E01 complete until copied to an approved durable private location and verified.

**No new HeyGen generation or provider spending during G0 recovery.**

## Required facts before moving to G1
- Nora Ellery remains **Liza Office 6 / Annie**; Marcus Varden remains **Lasse Office 3 / Orson**. Exact IDs live in [the readiness manifest](../STOCKS-17-SHOT-READINESS-20261014.json). Do not use W3's different woman/man as Nora/Marcus without explicit recast permission.
- Morning Oct 12 09:40 ET 4:20 narration and closing Oct 12 spoken clips refer to different market snapshots. One editorial edition must be chosen for the **same** first master. Pilot closing-edition preferred for asset economy, pending editorial decision and reconciled 17-shot rewrite. Until the decision, E03 is blocked.
- Confirm if Jazz/Tamasha has different ingest format / brand asset / clearances / legal reuse rights before final mix and delivery.
- Build only controlled native source plates; no fabricated historical finance series, LIVE status, fake data attribution or hardcoded current exchange quotes.

## Golden 60-second technical candidate (G3 after G2)
- 00–06: original T + Stocks ident, source-dated.
- 06–20: **actual approved** Nora source and desk cut, no incompatible video.
- 20–32: **actual approved** Marcus response.
- 32–45: fixed-source market graphic synced to *actual voiced claim* (no stretched/unmatched narration).
- 45–55: remote handoff and approved reporter voice/footage, else source graphic with approved remote sound.
- 55–60: return/closer with measured transition.
These are targets only; edit time may shift to fit actual spoken durations. Never falsely sync lips to a different recording or invent missing narration.

## Media and aesthetic acceptance (two independent mechanisms)
**Automation**: valid audio/video paths, correct aspect, original video frame rate, no corrupt decoding, loudness/black-frame checks, measured subtitle start/end, source IDs, renderer SHA, single T+Stocks bug, expected scene coverage, no duplicate paid requests.  
**Human**: natural facial acting, blink/speech realism, authentic hand and desk contact, clean full-motion edges, lighting and headroom, clothing stability, natural back-and-forth, coherent identities and room. Technical CI success never substitutes for human review.

## Workflow authorization
Original experimental PR #34 contains GitHub workflows on `pull_request` for billable HeyGen calls. Do **not** merge them into a production working branch. A release integration must use manually invoked, exact-payload, budget-approved, idempotent controlled generations. Avoid PR-triggered auto-paid runs. If an old paid job shows an uncertain state, **GET provider state before retry; do not blindly repeat.**

## Immediate next engineering steps (non-billable)
1. Archive/download and inventory all available source packages including old R4 editions; create immutable versioned private backup.
2. Run source face/body/voice review for native R5 vs W3 in side-by-side moving clips.
3. Create a provider-free production branch with approved original faces / source-locked story and bring #35 fit-and-pad framing selectively.
4. Build **actual** close-up + newsroom overlay visual audit and 60sec graphics/audio timeline with no fake voices. Record missing source audio in manifest, don't invent.
5. Request user approval only for an essential creative cast/edition/budget decision, not for normal preparation.
