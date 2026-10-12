# Broadcast V2 operator runbook

The V2 worker extends the existing Node 24 / FFmpeg / private SQLite pipeline. The original V1 commands and review stay available. Public layout preview: `/broadcast-preview.html`. Private production review: the same path on the local worker.

## What works without subscriptions

Six shared browser/export layouts; two-presenter compositions; a roster of up to six identities across scenes; fixed source snapshots; OHLCV candles, volume, SMA 20, EMA 20, Wilder RSI 14 and MACD 12/26/9; timed highlights, chart reveal/range, board selection, headline changes, camera-template cuts and reaction selection. The two-person layouts display two people; a simultaneous three-person panel is not implemented.

The supplied sample and five-minute programmes use illustrative data. Fixture exports are silent layout rehearsals with visible placeholders. They cannot receive production approval. Historical/current OHLC histories must be supplied as normalized source snapshots; the worker does not invent historical candles from quote-only feeds. Current snapshots require expiry and real sources require an entitlement reference.

The renderer is native SVG shared by the browser and Sharp, with FFmpeg encoding. No browser runtime or commercial renderer is needed on the media worker. All charts and overlays derive from programme time; seeking reconstructs state. Figures remain bound to the snapshot discussed. This is prepared rendering, not a claim that avatar generation meets a live latency target.

## Start and render

```sh
npm ci
npm test
npm run build
npm run broadcast -- init --fixture --profile sample
# Copy the returned run ID, then:
npm run broadcast -- render RUN_ID
npm run broadcast -- init --fixture --profile pilot
npm run broadcast -- render FIVE_MINUTE_RUN_ID
npm run pilot:review
```

Requires Node 24, FFmpeg/ffprobe with libx264, libvpx-vp9, libopus and DejaVu Sans fonts. The Docker worker already installs FFmpeg/fonts. Read the private `pilot-runs/review-token` file locally and sign in at `http://127.0.0.1:4310/broadcast-preview.html`. Use an SSH tunnel for remote review. Never put the review token or provider credentials in public frontend settings.

Outputs: `output/master.mp4`, `captions.vtt`, `episode.json`, `timeline.json`, `qa.json`, `production-report.json` and actual-master scene PNGs. The master is 1920×1080, H.264, 30 fps, AAC stereo at 48 kHz. Real media targets -16 LUFS integrated and at most -1 dBTP. Run data and media stay outside Git. Preserve that directory on a durable private volume.

## AI direction and real media

1. Initialize a real run with `init --profile sample` or `init --episode programme.json`. The JSON is the complete source/scene/turn plan; optional `migrate` takes explicit new source bindings for V1.
2. Optionally run `direct RUN --paid`. The Gateway director rewrites the coordinated dialogue, chooses allowed templates and token cues, with one attempt and at most two repairs. It saves a draft; it never overwrites the approved input. Review and initialize the draft as a new run.
3. Run `editorial RUN --reviewer NAME` after checking script, entities, units, timestamps, sources, interpretation, permitted assets and planned visuals. Automated claim checks cannot certify every semantic assertion.
4. Run `estimate RUN`, set positive operator estimates and a cap, then `produce RUN --paid`. Run again to poll existing jobs. `pipeline` produces/polls once and renders when every required layer is ready. It reports missing layers otherwise; it is not a background daemon.
5. Import accepted listening performances for every visible presenter in each scene. Neutral footage must cover the whole scene without loops. Optional nod/attentive cues require the matching full-scene reaction take. The editor chooses acceptable non-speaking footage; the current speech-avatar adapter does not automatically generate reliable silent reactions.
6. Run `render RUN`, inspect the exact output in private review, record timed turn defects, retake only affected turns and rerender. A whole-programme script/source change initializes a new revision. Turn retakes reuse unrelated media; cross-run deduplication is deliberately conservative.
7. Record all human checks to approve the exact real master. The final five-minute acceptance remains a stakeholder decision.

Settings in `.env.local` (see `.env.example`; placeholders never start paid calls):

- `AI_GATEWAY_API_KEY`, `AI_GATEWAY_MODEL` for the optional director.
- `ELEVENLABS_API_KEY`, `ELEVENLABS_MODEL_ID` and `ELEVENLABS_<CONFIG_REF>_VOICE_ID` for each identity.
- `HEYGEN_API_KEY`, `HEYGEN_<CONFIG_REF>_AVATAR_ID`; the standing identity also needs `HEYGEN_<CONFIG_REF>_MATTING=true` after verifying actual compatible assets.
- `PILOT_SPEECH_ESTIMATE_USD`, `PILOT_AVATAR_ESTIMATE_USD`, `PILOT_DIRECTOR_ESTIMATE_USD` and `PILOT_MAX_ESTIMATED_USD`. These are operator budget estimates, not provider quotes. Actual billed cost remains unknown until reconciled with the provider. Listener creation costs are separate.
- `PILOT_PAID_RELEASE_EPISODE_HASH` (exact hash from that run's manifest) and `PILOT_PAID_RELEASE_MAX_USD` (approved positive limit). **New mandatory V2 release lock:** paid `produce`/`pipeline` will refuse to start unless both are set and `PILOT_MAX_ESTIMATED_USD` is within the approved limit. A new episode revision requires a new release; this does not enforce the provider's actual invoice or API wallet limit. Run the zero-cost audit in [`ZERO_SPEND_PREFLIGHT.md`](ZERO_SPEND_PREFLIGHT.md) first.

Default references are `ANCHOR` and `ANALYST`. No identities are inferred from names. Select consistent, permitted looks/voices and suitable standing framing. A matting flag is capability configuration; decoded alpha and human visual review are still required.

```sh
npm run broadcast -- import RUN --turn turn-0 --file accepted.mp4 --alignment timing.json --provenance 'Provider job / rights / reason for manual fallback'
npm run broadcast -- import RUN --scene scene-1 --presenter maya --reaction neutral --file listener.mp4 --provenance 'Accepted moving listener, licensed source'
npm run broadcast -- retake RUN --turn turn-0 --reason 'Pronunciation correction'
npm run broadcast -- reconcile RUN --job SAVED_AVATAR_KEY --video-id PROVIDER_VIDEO_ID
```

Speaker timing JSON contains `alignment` (characters, character start/end seconds) and optional `offsetMs`. It must match exact speech after pronunciation substitutions. Editorial token indices survive repeated phrases and alias expansion; normalized-but-different text fails rather than guessing. Speakers must fit their assigned slots with no speech trimming/stretching and at most three seconds of breathing room. The compositor cuts to genuine listener motion after a take ends. Only the active speaker's audio enters the mix.

Transparent sources currently use VP9 WebM decoded with libvpx-vp9. The standing layout rejects opaque video. Other alpha codecs are not advertised as supported. The provider request follows the [official audio-to-video output controls](https://developers.heygen.com/audio-to-video), checked 10 October 2026. The full source must have a short side of at least 720 pixels and a long side of at least 1280 pixels; portrait standing takes are supported. Transparent provider requests use 9:16 with containment to preserve the body; export resolution does not imply source resolution. Alpha edges, body framing, lighting, eyelines, hands and lip sync require human review.

`import --synthetic` marks moving test patterns or other non-performance test media. Synthetic imports can exercise the complete composition pipeline but remain unapprovable. Do not label test patterns as real performances.

Paid POSTs are durably reserved and cached. An uncertain request cannot be automatically retried. Reconcile an avatar submission with its known provider video ID, or import recovered media. Uncertain speech output requires recovery/import or explicit operator investigation. Jobs run sequentially in this pilot adapter; graphics rasterization uses bounded batches. Concurrency does not bypass the budget or manifest lock.

## Review, revisions and recovery

The private review supports real video/captions, active transcript, dated source records, timestamped turn feedback and exact-master approval. Preview graphics are always labelled rehearsal; rendered-media playback is separate. Never upload private media or job databases to Vercel.

An imported take or retake invalidates QA/approval; approved masters are archived before replacement. File hashes detect changed assets. Renderer/cache identity includes source code and runtime/dependency information. A worker lock prevents concurrent manifest edits. On interruption, check the original worker has stopped, then use `unlock RUN`; locks from other hosts/namespaces must be reconciled on their owner.

V1 migration requires `--episode V1.json --bindings bindings.json --output V2.json`. Bindings contain normalized `snapshots`, validated `claims`, per-shot `{snapshotId,claimIds}`, and explicit token `cues`. V1 bar-card data is not converted into invented OHLC. Existing runs/media remain unchanged, and migrated drafts require fresh editorial approval.

## Remaining external gates

- Real 45-second audition with at least three speaking turns, accepted voices/faces, a standing analyst and moving listener takes. Requires compatible assets and provider access or supplied rendered clips.
- Real five-minute film and full human/stakeholder approval. No mock can establish human-level realism.
- `movement RUN` creates the three-route experiment brief. Chart-to-screen-to-world mapping is implemented, but no actual cinematic walk or Unreal/MetaHuman rig has been executed. Exact pointing/walking remains R&D.
- The durable `ReadyQueue` is preparation for a later shared encoder. It tests expiry, supersession and at-most-once claims. It is not an HLS/RTMP producer. A claimed item after restart requires reconciliation; it is not silently replayed. The approved-evergreen fallback and shared delivery adapter require hosted infrastructure and the post-film trial.
- Fresh audience Q&A currently enters a selection ledger only; there is no autonomous live answer/broadcast loop. The plan's 30-minute / 20-sample latency trial and later 24/7 operation remain open.

## Verification

```sh
npm test
npm run build
npm run verify:media
npm run verify:broadcast
```

The V2 integration command creates isolated, clearly synthetic moving patterns and tones, imports three turns and full-scene listener clips including alpha, composes a nine-second studio scene, checks its actual encoding/loudness/timing and verifies that production approval is rejected. It calls no paid providers. Rendering a sample/pilot fixture separately verifies exact 45/300-second profiles and all six templates.
