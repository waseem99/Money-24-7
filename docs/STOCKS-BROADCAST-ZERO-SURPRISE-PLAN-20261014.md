# STOCKS — Zero-Surprise Broadcast Production Blueprint
**14 Oct 2026 | Planning-only branch | No paid provider call / no deployment**

## Non-negotiable goal
Deliver one editorially coherent **3–5 minute recorded** Tamasha/Stocks finance broadcast matching Bloomberg/TraderTV's *production grammar* (credible anchoring, spatially coherent cameras, accurate sourced graphics, natural sound and pacing) rather than falsely claiming human realism is automatic. Approval means **zero open release-blocking defects**, not just API success.

## Audit / upstream PR inventory
- `main`: Signal prototype and the deterministic 6-layout broadcast V2.
- PR #30 `prep/jazz-zero-spend-gate-20261010`: 2:27.774 dated Signal R4+ MP4 exists, not the requested 4:20 T+Stocks release.
- PR #31 `feat/stocks-quality-proof-20261012`: frozen **17-shot / 4:20 09:40 ET morning** storyboard, Stocks T bug and 2-voice locked script.
- PR #32 `feat/stocks-original-cast-pacing-r5-20261013`: the user-approved **Nora=Liza Office6 + Annie** and **Marcus=Lasse Office3 + Orson** reinstated; 17.774s source test technically decodes but still needs realism review.
- PR #33 `ops/stocks-one-hour-newsroom-salvage-20261013`: source reuse / emergency compositing experiments, no automatic approval.
- PR #34 `experiment/stocks-native-newsroom-producer-20261013`: W3 5s integrated AI room, W5/W6 WAV-referenced closeups, W7 8s Alex correspondent; **W3 synthetic faces differ from approved Liza/Lasse** and **18 WAV segments narrate Oct 12 closing results**, not morning.
- PR #35 `fix/stocks-studio-headroom-20261014`: a camera rehearsal and fit-not-crop recipe. This fix lives on an older PR #30 branch; explicitly port after comparison, do not merge whole branch blindly.
- Original Vercel `signal-financial-network-cod-3.vercel.app` returned 404. New Cod5 Vercel project creation returned 403. The studio is a preview/approval UI, not production video renderer.

### Verified generation observations (not provider price quotes)
- W3 integrated 5s cinematic: completed; reported direct-wallet 32.53 → 25.23 USD, ~$7.30. New fictional cast not approved.
- W5 7s reference-to-video exact prerecorded audio: completed; recorded debit ~0.21 USD, source ~768p; naturalness **not** certified.
- W6 contains 5 completed 6–8s shots in inspected historical run (05,09,14,16,18). Shot 20 produced report only, not confirmed accepted MP4; the multi-job CI success status is not an asset ledger.
- W7 fictional Alex reporter 8s completed, wallet 22.75 → 22.50 USD Oct 13; role performance is **not yet approved**.
- Latest observed wallet was $22.50 on Oct 13. Re-read before any new billable job.

## Corrected research conclusions
1. **Avatar Shots is not a solution to assume for our user-approved photo-based cast.** HeyGen says multi-avatar Seedance2 shots currently accept eligible video-based real-human looks; audio cannot be uploaded separately, ≤15s and each generation consumes large fixed credits. This method is optional B-roll / establishing at most.
2. **Existing Liza/Lasse Photo Avatar motion cannot be guaranteed broadcast-natural.** HeyGen says photo motion is synthesized; filmed Video Looks / Avatar V learn from consented source motion. Recast to a video-trained/filmed human requires **explicit user approval**.
3. **Never promote W3/W5/W6 new faces into BANK-A original approved cast** just because W3 set/lighting are good. Scene consistency and approved identity are separate gates.
4. **Morning and close finance stories cannot be silently merged.** Set one edition, snapshot, forecast status, text and voice manifest before compositing. Use original 09:40 ET storyboard *or* rewrite close-edition copy and approve it.
5. Source clip resolution controls perceived quality; 768p→1080p final is an export setting, not native HD face detail.
6. Live stock pricing / exchange redistribution, Reuters/other editorial footage and music rights require explicit clearance for Tamasha distribution. References are not a license to reuse Bloomberg/TraderTV video.

## Architecture (one source of truth)
`edition.json` (edition/timezone/timestamp), `cast.json` (approved immutable look/voice/rights IDs), `claims.json` (value/unit/source/as-of), `shots.json` (17 slots, camera, footage, backup), `assets.json` (model/media SHA, frame dims, alpha, audio SHA, acceptance), `approvals.json` (signed decision+hash/timecode) → **review studio** (Vercel after authorization; local preview now) → **paid asset operator** (one manually released request at a time) → **deterministic FFmpeg/native SVG compositor** (not Vercel serverless) → MP4/VTT/QA/source package.

No VITE public provider keys. No repeated paid request after a timeout: check provider ID/status first. No PR-triggered or cron billable GitHub workflows on the production branch. Preserve old source assets & immutable SHA.

## Video policy: less risky shot grammar
- **Wide A:** genuine physically coherent room. If two talking avatars cannot behave naturally together, show 1–3s *silent* establishing and cut to validated speaking close-ups. No fake two-person talking/receiving.
- **Close B/C:** actual approved, lip-synced single-person footage; crop by safe **fit-and-pad**, source-dependent matte, room-grade.
- **Chart D/E:** presenter native PIP plus deterministic date-labelled Reuters/AP/BLS/IR graphics.
- **Standing F:** only if a true standing performance passes. Else seated Marcus + board, no floating cutout.
- **Remote R:** distinct editorial remote location; original recorded voice must match cast and script. Alex W7 is an unapproved alternate.

## Gated delivery contract
| Gate | Work | Hard acceptance | Stop action |
|---|---|---|---|
| G0 | recover all artifacts, signed casting, edition, branding, commercial rights, quote, CI cost locks | 0 conflicting face/voice/edition; balance verified; all historic artefacts archived | NO GENERATION |
| G1 | six camera family compositions with real/source stills | spatially consistent; no head/shoulder crop; one T+Stocks bug | fix geometry |
| G2 | real-motion high-risk tests: Nora/M, paired wide or silent fallback, remote | lip/voice/screen/identity and natural acting accepted on **moving real film** | fallback/recast approval |
| G3 | single 45–65 sec complete connected golden film with actual dated sourced charts and mix | ZERO P0/P1 defects, human + client approval on exact video SHA | isolate/edit shot, do not generate full |
| G4 | fill 17 slots from ACCEPTED footage and signed fallbacks | 100% coverage, source+cast+rights+audio audit | use fallback or paid bounded request |
| G5 | final 3–5m master, full video and audio QA | full encode/decode, fixed frame count, proper source cards, measured captions, clean sound, full human review | defect/timecode-only rerender |
| G6 | delivery, backups, approval | final MP4, VTT, contact sheet, fact ledger, rights and signed approval | review-only label |

### Immediate golden 60s plan
Use a single dated story and actual correct script. Proposed beats: 0–5s ident/silent coherent desk; 5–18s Nora native close; 18–30s Marcus native close; 30–43s sourced time-stamped index/oil data reveal; 43–55s remote handoff/report; 55–60s return/coda. These timestamps are editorial *targets*, not permission to stretch or mismap existing TTS. This proof MUST contain moving face frames, the handoff, and real audio. If two-person wide fails: do not spend attempting an unbounded multi-avatar solution.

### Mandatory program quality thresholds
- Cast consistent to approved IDs, wardrobe/skin/hair/voice across each visible shot.
- No facial morphs, frozen 'listener', detached hands, desk intersection, halo or cropped hair. Manually inspect cuts/joins and 2–3s samples at full HD; automated detection just flags.
- Intended spoken line / phonemes clearly sync to video; engineering target ≤100ms where measurable, human sign-off definitive.
- Graphics sourced, dated and complete. Never fake LIVE or decorative stock paths.
- Actual branded original **T + Stocks once in upper-left**; no `Signal`, `Stocks GPT` or repeated back-wall T.
- Closed-caption content aligns to *actual audio*, not equalized text buckets.
- Master baseline 1920×1080, 16:9 30p H.264, BT.709 SDR, AAC stereo 48kHz, no dead frames, clean full decode, SHA256; get Tamasha ingest spec before fixing loudness (e.g. EBU R128 −23 LUFS is broadcasting guidance, not universal OTT).
- Every exact output signed by editorial lead, production lead, audio + independent creative reviewer; **zero P0/P1** unresolved.

### Safer billable request governance
Zero paid calls for initial source recovery & camera rehearsal. Suggest an *optional* $5 maximum additional GOLDEN-TEST reserve **only upon user authorization** and only if inventory is insufficient. Never extrapolate W3's five-second price to cheap 4m cinema; use closeups, charts and existing audio. New full-series budget is quoted **after G3**, by exact seconds/engine/job and a contingency with explicit user approval. Keep concurrency=1 on new paid calls for clear wallet debits.

### Production fallback decision
If accepted original Liza/Lasse source footage is natural enough → lock BANK A + closeups, maximize accurate B-roll and charts.
If original faces are recognizably synthetic → reduce on-camera seconds and re-audition one short original take only with approval.
If still visually rejected → **STOP** and propose consented professionally filmed human presenters or filmed/video-trained Digital Twins; an explicit recast decision is unavoidable. Do not silently promote W3 synthetic cast into BANK A.
If no compatible 2-shot → the programme remains achievable using silent room establishment + controlled closeups.
If remote shot fails → use dated graphics and original exact correspondent audio as a remote package (role and use approved).
If Vercel still unauthorized → use local HTML + private GitHub/video proofs without halting media production.

## Implementation PR order (no blind merges)
1. New production baseline from PR #32 R5 original-cast branch.
2. Port JUST source-safe camera fix and `studio/` preview from PR #35, tests.
3. Import PR #31 17-shot grammar and its source/branding claims.
4. Inventory PR #34 artifacts **as experimental bank**; only accept an asset if cast, narration and rights match approved edition.
5. Introduce typed manifests and fail-closed validator; add manual approval gate before any paid workflow.
6. Make a local first 60s moving render with recovered source; upload to private review.
7. Human 60s GO; then fill final 17 slots; finish and certify.
Do **not** merge PR #34 or its automated billable workflows into production merely to access media.

## Delivery calendar (after dependencies)
D0–1 baseline/asset archive; D1–2 studio+framing; D2–4 high-risk motion; D3–5 60s golden sample; D5–10 17-slot completion; D10–12 audio + full quality review and handover. These are planning estimates, not a quality/availability guarantee.

## References
- Source repository / PRs: https://github.com/waseem99/Money-24-7/pulls
- HeyGen Avatar Shots eligibility and cost: https://help.heygen.com/en/articles/14448006-avatar-shots-powered-by-seedance2
- HeyGen Photo Avatar variability: https://help.heygen.com/en/articles/10034438-how-to-get-started-with-photo-avatars
- HeyGen Avatar V filmed look: https://help.heygen.com/en/articles/14602974-avatar-v-is-now-available-on-heygen
- Studio audio/video specs: https://support.google.com/youtube/answer/1722171
- Broadcaster loudness: https://tech.ebu.ch/publications/r128
- Safe-zone design: https://helpx.adobe.com/uk/premiere/desktop/get-started/source-and-program-monitor-adjustments/view-safe-zones-in-the-monitors.html
- Reuters October 12 closing: https://www.reuters.com/business/us-stock-futures-muted-oil-stays-above-100-ahead-earnings-2026-10-12/
- BLS CPI release calendar: https://www.bls.gov/schedule/2026/10_sched_list.htm
- NYSE rights: https://www.nyse.com/connectivity/documents
