# STOCKS — LiveAvatar Technical Production Runbook
**Engineering handover: October 14, 2026.** This is an isolated vendor-source integration, not a client-ready show or operating broadcast.

## What is physically prepared
- Three newly created candidate **1920x1080** assets: `STOCKS-NORA-PORTRAIT-1920x1080-CANDIDATE.png`, `STOCKS-MARCUS-PORTRAIT-1920x1080-CANDIDATE.png`, `STOCKS-EMPTY-NEWSROOM-1920x1080-CANDIDATE.png`. They reside in the user's **private Google Drive creative folder**, not public GitHub.
- Original concept-still source hash and the candidates' exact checksums, creative/eligibility status are documented at [DEMO_CANDIDATE_ASSETS_20261014.json](DEMO_CANDIDATE_ASSETS_20261014.json).
- Separate generated portraits are NOT guaranteed to be exact reproductions of the approved concept faces. Both need a visual identity signoff. The empty room is a generated **set plate**, not the last approved complete two-person frame; client art-direction approval remains open.
- The user has approved a demo budget envelope previously estimated at **$1,500–$4,000 USD**. This does not create a credit balance or account permissions. No direct provider purchase or cost incurred in this implementation.

## Architecture — streaming source / channel compositor
```text
two approved fictional portraits + commercial provider training (separate)
            |
      LiveAvatar LITE webRTC video+audio       one approved synthetic voice and
          |                          ←          editorially frozen audio
   Nora source     Marcus source
          \            /
     Stocks licensed background / one original tiny bug
      → program camera A/B/C/D + lower thirds/ticker
      → browser QA recorder 1080p WebM (private test only)
      → FFmpeg QC+encoding & encrypted asset registry
      → 2:45 scripted signed demo / client approval
      → persistent shared broadcast playout / Tamasha later
```

### Immediate engineering implementation (IN PR)
- The existing **private** Stocks operator lab at `stocks-streaming-lab.html` is opt-in at build by setting `STOCKS_BUILD_OPERATOR_LAB=true`. It is not included in normal public Vite builds.
- `network/streaming/operator.js` already attaches actual LITE WebRTC sessions using SDK, maintains camera A/B/C/D and tests green-background keying. Existing token starts/connection may spend credits.
- `network/streaming/program-capture.mjs` now turns actual provider video tracks and WebGL-keyed canvases into a deterministically overlaid **1920x1080/30p MediaRecorder output** with the original T PNG loaded privately, date-safe US placeholder (no fake tickers), matching audio stream and controlled camera cuts.
- A physical 10+ keyed-frame and connected video track gate blocks trying to record one of our still mockups as a "successful avatar video." Recording demands real decoded source video **and actual source audio tracks**. A browser-native `MediaRecorder` returns a local WebM; no provider API bill is triggered by the recorder itself.
- The UI has a visual-capture panel with Stop and a cap **5–90 seconds**. It does not automatically publish or start a billable session. Full moving creative review and separate copy/brand rights validation are still mandatory.
- Tests in `tests/stocks-program-capture.test.mjs` protect the capture/provenance checks.
- **GAP:** app still accepts only previously issued, authenticated **LITE session tokens**; an automated secure budget-authorized token issuance service backed by a durable per-minute cost ledger remains unbuilt. Do not paste private provider keys or real session tokens into GitHub or ChatGPT.
- **GAP:** LiveAvatar requires its own connected account and custom-avatar plan, separate from standard HeyGen. The existing HeyGen plugin account cannot authorize this session. Provider moderation, voice and broadcast recording/redistribution rights must be established in the LiveAvatar account.

### Preflight and operator procedure
1. Visually compare the two private portraits against the original approved frame, particularly Nora's jaw/eyes/hair and Marcus's eyewear/face. Confirm approval BEFORE training credits are consumed.
2. Owner accesses [LiveAvatar dashboard](https://app.liveavatar.com/home) directly, signs in, confirms separate billing. Test public LITE Free with preset only if possible. For real custom source, verify plans and **two** custom full-HD slots with vendor (Business public plan typically includes one, so second is not automatically free).
3. Upload each approved **single-person** portrait in the provider's Custom LiveAvatar creator; separately track Nora/MARCUS avatar IDs and the completed training status. Fictional AI character eligibility may require provider review. Check consent and broadcaster rights. Don't upload the combined two-anchor master.
4. Request operator production credentials via a secure credential store (Vercel env/managed secret) rather than chat. User should not post passwords or API secrets in discussion.
5. At an authorized private workstation, clone repo to this branch, `npm ci`, then set `STOCKS_BUILD_OPERATOR_LAB=true` and run the existing Vite build; serve privately/authenticated only. Load licensed `STOCKS-EMPTY-NEWSROOM...` and the **original user-supplied Tamasha icon PNG** using local file selectors. The room should have no people, labels, logos or numeric data.
6. Create exactly ONE bounded authorized **LITE token/session** from server-side LiveAvatar API for Nora, initially with at most 30–60 seconds, and paste only into the local private lab. Confirm eligibility and one-time spend externally. The browser does **not** mint token sessions.
7. Verify real video source, 10+ keyed frames, sound and no blur/face/eyewear drift. Use Camera C and **Record real video source** to capture 15–30s. The test automatically stops at selected cap and downloads `STOCKS-ACTUAL-LIVEAVATAR-RECORDING-REVIEW.webm`.
8. Verify with `ffprobe` and full FFmpeg decode. Example conversion:
   ```sh
   ffmpeg -y -i STOCKS-ACTUAL-LIVEAVATAR-RECORDING-REVIEW.webm \
     -vf 'scale=1920:1080:flags=lanczos,format=yuv420p' -r 30 \
     -c:v libx264 -preset medium -crf 18 -c:a aac -ar 48000 -b:a 192k \
     -movflags +faststart STOCKS-NORA-REAL-STREAM-REVIEW.mp4
   ```
   If no audio or few motion frames, FAIL. Never fabricate lip movement or use still video loops as completed sample.
9. Repeat the test for Marcus after eligibility/charge authorization; Camera A/Wide with independent providers is only acceptable if actual listener movement/shared desk looks credible, otherwise use editorial single-anchor camera cuts. 1080p by itself does not prove realism.
10. Only then assemble the **165-second recorded client demo** from 10 locked editorial blocks in `docs/stocks-network/client-demo-165sec-rundown.json`. The question-and-answer segment must be clearly staged/verified if it is not genuinely interactive. Finance editorial approves all sourced claims and broadcast-use rights.
11. After approved demo, provision actual server-side authenticated LITE session broker with transactional cost ledger, private media registry, shared persistent compositor/encoder and 30–60minute failover tests, before 3–4 hours of programming/day.

## Provider references and cost gates
- [LiveAvatar image guide](https://help.heygen.com/en/articles/9612935-liveavatar-custom-liveavatar-creation-guide) requires 1 person, neutral closed mouth, 1080p 16:9/9:16; cropping or upscaling a small face does not create missing detail.
- [Official LiveAvatar source SDK](https://github.com/heygen-com/liveavatar-web-sdk) — external LITE token in browser, LiveKit streaming; SDK video+audio attach events.
- [LiveAvatar pricing](https://www.liveavatar.com/): custom avatars, credit sessions and broadcaster usage must be confirmed before signup. Beware conflicting older cached plan credit numbers.
- If fictional source training fails vendor moderation or likeness drifts, compare [Beyond Presence Scale](https://www.beyondpresence.ai/pricing) for real 1080p image-based custom avatars; do not re-run paid generation blindly.
- [GitHub demos](https://github.com/waseem99/Money-24-7/issues/57) and historical R3/R7 samples are not new streaming avatars and are explicitly excluded as substitutes.

## Objective go/no-go review (30–60sec)
**Technical:** actual provider video, 1080p30 output, audio present and matched to speech, full decode, minimal dropped frames, no crash, clean key, correct small bug and safe graphic zones.
**Creative:** approved exact fictional faces, believable eyes/mouth/jaw, hair/glasses not bleeding green; professional studio integration, consistent scale and camera. No disembodied bodies, fake listener, frozen pictures or cupboards.
**Editorial:** US market only; licensed original market data, dated source-as-of, 2:45 client demo labelled recorded, no fabricated LIVE or illustrated quotations.
**Finance & rights:** vendor permits creating our fictional characters, ongoing commercial use and recorded TV redistribution; session-minute spend reports match ledger; producer signoff for next spending.
The real performance gate remains **PENDING** until an actual custom LiveAvatar account and authenticated streaming session are available. Do not mark this PR as client-ready demo.
