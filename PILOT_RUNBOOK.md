# Signal five-minute production worker

This implements the prepared pilot path from `FIVE_MINUTE_NEWSROOM_PLAN.md`. The browser channel remains intact. `/pilot.html` is a separate production/review screen. The worker runs on a machine with a durable private disk; it is **not** a Vercel function. No API subscription is needed for the complete silent fixture render.

The included 671-word episode is an original, prepared financial explainer with two fictional presenters and explicitly hypothetical figures. It has 15 directed shots, seven editorial sequences and a 300-second timeline. It is not current market reporting. Replace the evidence snapshot and script together for a dated news edition, then create a new run.

## Quick start without keys

Requirements: Node 24 LTS recommended (SQLite built-in), FFmpeg/ffprobe with libx264, and DejaVu Sans installed. On Debian/Ubuntu: `apt-get install ffmpeg fonts-dejavu-core`. Supported worker: one Linux host, one worker per run, persistent private volume. Do not share SQLite over network storage.

```bash
npm ci
npm test
npm run build
npm run pilot -- doctor
npm run pilot -- init --fixture
# Copy the returned run ID; it includes the episode content hash.
npm run pilot -- render RUN_ID
npm run pilot:review
```

Open `http://127.0.0.1:4310/pilot`. Read the local `pilot-runs/review-token` file and enter its value in the review form. Keep it private. Select the fixture run. Review the five-minute MP4, timeline, transcript and numeric cards. The MP4 is a **silent technical rehearsal with labelled presenter placeholders**, not the requested final realistic demo. The approval gate rejects it. A public Vercel `/pilot.html` shows the storyboard; it cannot read private local footage or keys.

`PILOT_DATA_DIR` can point to an absolute private durable directory. Exclude it from public hosting and source control. Back up the entire run directory together (episode, manifest, SQLite and WAL, assets, output, approvals). Output hashes are used to detect accidental changes. For remote review use an authenticated SSH tunnel to the loopback worker; do not expose this HTTP service publicly. Review sessions last eight hours, use HttpOnly/SameSite cookies and expire on restart.

## Connect providers after auditions

Copy `.env.example` to `.env.local`. The worker loads that file explicitly. Dummy settings fail before network calls. All zero cost estimates also fail closed. No secret uses the `VITE_` prefix.

| Capability | Private settings | Purpose |
|---|---|---|
| Script director (optional for curated script) | `AI_GATEWAY_API_KEY`, `AI_GATEWAY_MODEL` | Structured AI dialogue and illustration prompts |
| Voice | `ELEVENLABS_API_KEY`, `ELEVENLABS_MODEL_ID`, `ELEVENLABS_ANCHOR_VOICE_ID`, `ELEVENLABS_ANALYST_VOICE_ID` | Speech with measured character timing |
| Presenter | `HEYGEN_API_KEY`, `HEYGEN_ANCHOR_AVATAR_ID`, `HEYGEN_ANALYST_AVATAR_ID` | Async 1080p-target audio-to-avatar renders |
| Opening illustration (optional) | `AI_IMAGE_MODEL`, gateway key | Original editorial opening art; never numerical charts |
| Spend reservations | `PILOT_MAX_ESTIMATED_USD`, `PILOT_SPEECH_ESTIMATE_USD`, `PILOT_AVATAR_ESTIMATE_USD`, optional director/image estimates | Positive operator-supplied per-call estimates and per-run cap |

Select model IDs from the provider's current catalog and compatible API model family. The worker does not guess paid model choices or prices. Verify account/plan/engine support before buying. Gateway image generation uses an image-model API; choose a model that supports it, not a text-only endpoint.

The HeyGen adapter uses `POST /v3/assets`, `POST /v3/videos` with `audio_asset_id`, and `GET /v3/videos/{id}`. The voice adapter uses ElevenLabs `/with-timestamps`. External audio ties the avatar lip sync to the generated voice. Actual resolution is probed independently of the requested resolution. Neither provider turnaround nor output quality is guaranteed by this implementation.

```bash
npm run pilot -- init
npm run pilot -- estimate REAL_RUN_ID
# Optional: generate a revised draft, then inspect it and initialize a NEW run:
npm run pilot -- direct REAL_RUN_ID --paid
npm run pilot -- init --episode pilot-runs/REAL_RUN_ID/director-draft.json

# Review text, evidence, figures and planned visual claims before media production:
npm run pilot -- editorial REAL_RUN_ID --reviewer 'Reviewer name'
# Start with one take per presenter to audition:
npm run pilot -- produce REAL_RUN_ID --shot overview-a --paid --watch
npm run pilot -- produce REAL_RUN_ID --shot overview-b --paid --watch
# Run again after provider completion to collect the exact same jobs.
# When happy with identity/voice/pacing, produce all remaining shots:
npm run pilot -- produce REAL_RUN_ID --paid --watch
# Optional opening art:
npm run pilot -- illustration REAL_RUN_ID --paid
npm run pilot -- render REAL_RUN_ID
```

Audition checklist: voice pronunciation/pace/percentages, natural blinks and mouth, consistent lighting/wardrobe/eyeline, crop and hand gestures, supported commercial usage. Names Maya/Daniel are production labels, not claims of exclusive stock-avatar ownership. Choose/own the actual identities and voice permissions before approval. No API keys have been tested against paid providers in this implementation; request/response boundaries are mocked in tests.

## Timing and manual fallback

The planned slots are exact. Real voice/clip duration must be between `slot - 3s` and `slot - 0.15s`, allowing a short natural tail. Oversized or excessively short takes stop before further avatar spending. Revise the affected script and create a new run, or import a better-paced take. The compositor does not trim words or speed up speech. Measured timing drives captions. Graphic cues can bind to a phrase in the measured speech alignment, with explicit shot-relative fallback timing for manual clips and fixtures. Inspect their timing before approval. Full-screen explainer shots use the same presenter voice; the face is deliberately off screen for those graphics.

Manual provider rendering is supported and does not require worker API keys:

```bash
npm run pilot -- import REAL_RUN_ID --shot welcome --file /private/takes/welcome.mp4 --provenance 'Provider, avatar/voice identity, render reference, commercial rights checked' --alignment /private/takes/welcome-timing.json
```

Repeat for the 14 speaking shots. The timing JSON is optional and uses ElevenLabs' `characters`, `character_start_times_seconds`, `character_end_times_seconds` arrays. Without measured timings, manual clips have no word-level captions; the script remains visible. Clips must contain audible speech and at least 1280×720 video. MP4/H.264/AAC sources are recommended. Imported sources are copied privately and hashed; replacing a take invalidates the previous render approval.

The ident uses a restrained original procedural music bed. The rest of the programme uses a very quiet version under dialogue. It is not a licensed recording. Final voice/music balance still requires listening. A generated optional opening image is labelled by the programme's prepared/AI disclosure and never treated as evidence. Numerical graphics are deterministic SVG/FFmpeg compositions with exact text, not generated image lettering.

## Recovery and spend

- `status RUN_ID` shows the manifest; the SQLite ledger records jobs and reserved estimated spend.
- `produce --watch` polls every 15 seconds for up to 30 minutes; state is saved if the window ends. Re-running `produce` polls already-submitted avatar jobs and skips completed clips. It never automatically retries a potentially charged POST after a crash/network ambiguity. A failed response may already have cost money.
- If an avatar submission was accepted but its response was lost, find its `callback_id`/title in the provider dashboard, then run `reconcile RUN_ID --job avatar-HASH --video-id PROVIDER_ID`. Other uncertain jobs use recovered/imported output. There is no blind reset-and-rebill command.
- These are conservative cost **estimates**, not actual invoice accounting or a provider spending ceiling. Set account-level limits. Reservations include uncertain calls. Each new run has a separate ledger; budget across revisions at the account level.
- FFmpeg segment renders have hashes and can resume without repeating valid segments. A changed renderer, shot, source or artwork invalidates the cache. Encoding is local, never a paid API request.
- A worker lock prevents overlapping operations for a run. After an interrupted worker exits, `unlock RUN_ID` checks the process is gone before removing its lock. In containers, reconcile stale locks on the original worker host/namespace; do not delete another live worker's lock.
- Never edit a run's episode in place. Its immutable content hash protects the dependency graph. Initialize a new run for a script/source change. Reimport still-valid takes deliberately after checking their dialogue.

## Export and approval

`output/master.mp4`: 300±2s, 1920×1080, 30fps, H.264/AAC, fast-start MP4. Actual source resolution and SHA-256 per take are recorded in `output/qa.json`. PCM intermediates avoid cumulative AAC cut timing errors. The real programme is measured and normalized to approximately −16 LUFS, with a ≤−1 dBTP verification ceiling. Silent/unacceptably quiet presenter sources are rejected before they can be hidden under music.

The output folder also has `episode.json`, `captions.vtt`, QA report and graphic frames. Keep the manifest/evidence/approval with the master when delivering it. The reviewer must watch/listen to the entire actual master, check every listed quality item, and name themselves. Approval is tied to the exact episode and master hashes. A fixture, changed media or failed technical gate cannot be approved.

No code can certify that viewers cannot distinguish AI from humans. Identity quality, voice naturalness and lip sync must be judged on actual paid or imported takes. The final five-minute approval recording, presenter selection and stakeholder sign-off remain open until that happens.

## Deliberate pilot boundary

The script director, TTS, avatar jobs, templates, edit/export and review workflow are implemented. Source refresh/current-news ingestion, spontaneous audience-answer production with measured 60–120s latency, full-body two-person desk interaction, continuous playout/CDN, 24/7 scheduling and production-scale billing/monitoring remain the post-approval system (#14). Prepared handovers in this pilot do not prove live interaction. The existing browser LiveAvatar preview remains a separate audition path.

Provider references (checked 8 October 2026):
- https://developers.heygen.com/audio-to-video
- https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- https://vercel.com/docs/ai-gateway
- Installed AI SDK source/README is pinned by `package-lock.json`.

## Production finishing controls (9 October 2026)

The full sequence after script approval now has one resumable command:

```bash
npm run pilot -- pipeline RUN_ID --paid
# Optional: append --artwork to generate the opening illustration too.
# Fixture run: same command without --paid; providers are never called.
```

The command waits/polls up to 30 minutes, collects generated clips, checks listener dependencies, composes the master, runs QA and writes `output/production-report.json`. It never grants editorial or stakeholder approval itself. A curated/manual-media run does not need LLM access. If generation is still pending, rerun the same command; saved jobs are reused.

**Pronunciation:** add `pronunciations: [{"term":"NASDAQ","say":"Naz-dak"}]` to the episode or presenter. Overrides use word boundaries, preserve numeric claims and are included in the immutable episode revision. Spoken text is recorded with the generated take. Validate the actual voice; a phonetic spelling alone does not guarantee correct pronunciation.

**Targeted retakes:** `npm run pilot -- retake RUN_ID --shot welcome --reason 'Correct cadence'`, then run `pipeline RUN_ID --paid`. This increments only that shot's attempt, archives its prior metadata, preserves its original media file and leaves other clips ready. No credits are spent by the retake command. Pending or ambiguous paid jobs must be collected/reconciled first. Previously approved masters and their approvals are copied to `archive/<master-hash>/` before replacement. Script changes still require a new immutable run and editorial review.

**Split-screen:** the welcome shot now pairs the speaker with a separately supplied moving listener. Import a licensed/approved natural listening take covering the full slot:

```bash
npm run pilot -- import-listener RUN_ID --shot welcome --file /private/daniel-listening.mp4 --provenance 'Identity, source/render reference and usage permission'
```

Listener audio is never mixed into the programme. The worker does not loop a short reaction or turn a still image into fake listening footage. The real render stops if a required listener is missing. For a simpler single-presenter edit, change the shot layout to `presenter`, remove `listener`, and initialize/review that episode revision.

**Media checks:** actual presenter sources are scanned for ≥0.25s black frames, ≥2s frozen frames and ≥2s silence. A trailing pause up to 3s is allowed; unexpected internal/leading silence is flagged. A/V track duration difference over 150ms or start offset over 120ms is rejected. Source scan failures produce `output/source-qa.json`. Master black-frame checks run too; intentionally static graphics are exempt from master freeze detection. These are technical defect checks, not an automated judge of natural facial performance or lip sync.

**Measurements:** the ledger/report records request response time, measured speech duration, submitted character count, provider-ready time and any returned usage metadata. Estimated spend and `actualBilledUSD: null` are deliberately distinct. Actual invoiced costs require provider billing evidence; the worker does not fabricate prices from duration. Private review and persistent worker deployment remain as documented above.
