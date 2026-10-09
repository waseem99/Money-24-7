# Prepared pilot implementation and verification

Verified locally on 8 October 2026. This is implementation evidence, **not** approval of realistic presenter footage. No paid provider calls were made. Production deployment and stakeholder approval are not claimed.

## Changes from the existing architecture

| Existing behaviour | Added implementation |
|---|---|
| Browser owns one live avatar session | Separate asynchronous two-presenter production worker; existing preview retained |
| Fixed browser narration | Immutable episode contract, automatic structured director prompts, grounded numerical constraints and editorial gate |
| Browser state only | Per-run SQLite jobs/spend reservations, durable manifests, source hashes, locking and recovery |
| Browser voice / provider voice | ElevenLabs timed audio; HeyGen external-audio video adapter; manual take intake |
| Independent UI graphics | One 300-second shot timeline, deterministic charts, speech-anchored graphic cues and measured captions |
| Canvas browser recording | FFmpeg server-side clip composition, PCM edit intermediates, H.264/AAC export, measured loudness |
| Informal viewing | Authenticated local review, byte-range playback, source snapshots and approval tied to exact master hash |

Worker modules are under `pilot/`. The review entry point is `pilot.html` and `src/pilot.js`. `PILOT_RUNBOOK.md` contains setup, commands, provider settings, audition, recovery and delivery instructions. The worker is intentionally outside Vercel request functions and uses a durable private disk.

## Verification results

- `npm test`: **62 passed**, including the 48 existing tests and 14 new pilot tests.
- `npm run build`: both existing channel and production studio build successfully.
- Actual full fixture render: **300.000 seconds**, **1920×1080**, **30/1 fps**, **H.264 video**, **AAC stereo, 48 kHz**.
- Fixture run: `signal-pilot-001-970918ca8e-fixture`.
- Fixture MP4 SHA-256: `28d4824c3a3cfbd38e006ef0bc1b311e181a91fb7493d15321688cea545a51ce` (6,441,612 bytes).
- Final fixture includes the zero-based illustrative recovery chart and timed cue strip. Presenter panels remain clearly labelled placeholders. Audio is deliberately silent. Real-presenter/loudness acceptance gates remain false.
- Browser check at 1440px and 390px widths: private login, run selection, MP4 decode, 170-second seek, 300-second duration, 1080p video metadata, no JavaScript errors, no mobile horizontal overflow, fixture approval form hidden.
- Visual inspection: desktop/mobile review screen, presenter graphic template and full-screen chart.
- `npm run verify:media`: moving synthetic test-pattern take and audible tone exercise the **real input code path**, clip overlay, music mixing, export and two-pass loudness handling. Result: −16.82 LUFS, −11.92 dBTP on the short synthetic test. Silent source rejected. Deliberately short programme rejected by final duration gate. This is not a voice/lip-sync quality test.
- Paid request tests: completed-job reuse after SQLite reopen, budget limit enforcement, ambiguous-response replay prevention, dummy-key rejection before network, correct external-audio avatar request, preserved speech timestamps and sanitized upstream errors.
- Private review tests: authentication, same-origin mutation, DNS-rebinding Host rejection, secret-path denial, valid/invalid media ranges and fixture approval denial.
- `git diff --check`: clean.

The full fixture exposed AAC timestamp overlap at cuts during implementation. The compositor now uses PCM intermediate audio, validates each shot, fails on corrupt input, and performs one final AAC encode. Final export gates verify duration, codecs, canvas and frame rate before the run becomes reviewable. Valid intermediate segments are hash-cached for resumption.

## Remaining acceptance work

1. Configure and audition actual presenter/voice identities; confirm usage rights and provider/engine support.
2. Exercise paid Gateway, ElevenLabs and HeyGen responses with those accounts. The API boundaries are implemented and mocked; subscription behaviour, quality and turnaround have not been verified live.
3. Review generated dialogue and adjust any real take that does not fit its slot naturally. Manual provider renders/imports are supported.
4. Render the actual five-minute programme, listen/watch end to end, correct voice, face, lip-sync and visual issues, then record stakeholder approval.

Issue #6 stays open. #8/#10/#12/#13 cannot be completed by fixture evidence. #7/#9/#11 have implemented code/content but still require editorial/provider/visual acceptance as applicable. #14 (continuous live operation) remains the separately planned post-approval phase. The prepared audience question does not demonstrate fresh real-time generation.

## 9 October implementation follow-through

Added pronunciation dictionaries, single-shot retakes with archived prior takes/approved masters, two-presenter split composition with silent moving listener footage, measured usage/latency, source black/freeze/silence and A/V checks, and the integrated resumable `pipeline` command. The welcome scene now uses the split-screen contract. Existing provider access is still absent; all tests use explicit fixtures or synthetic integration media.

The extended moving-media smoke check passed split-screen composition, real audio routing, loudness processing, black/frozen-source detection, silence rejection and short-master rejection. Neither synthetic footage nor the fixture is presented as an audition or approval film.

- Extended unit/contract suite: **70 passing tests**; Vite build passes.
- Integrated `pipeline` fixture completed in **107.752 seconds** on the test worker, with zero provider jobs/spend. This local encoding time is not a claim about AI generation latency.
- New fixture master SHA-256: `5883bb6e3b30387ef42be8ab268026c9539af8a457a2c64a59cb20f4d3b7bfd2`.
- Fixture final approval correctly remains false. Provider keys, voice IDs and avatar IDs are all unconfigured on the worker.
