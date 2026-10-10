# Jazz / Signal — zero-spend prepayment gate

**Status (10 October 2026): NO-GO for paid generation.** This is an engineering/preproduction checkpoint, not approval to purchase HeyGen credits or produce footage. The connected HeyGen account is on the free web plan; API wallet balance has not been verified. OAuth/ChatGPT web credits and direct API wallet credits are separate.

## Project and locked decisions

- Existing source: `waseem99/Money-24-7`; original channel/player and V1/V2 pipelines must remain intact.
- Presenter *people* selected by stakeholder: **Liza** (lead anchor) and **Lasse** (market analyst). Recommended, **not yet approved**, public looks are **Liza Office 1** (`2753c42eb648421e9463df15aeee723a`) and **Lasse Office 3** (`de9f36c26bd841c891489a0c9d6174de`).
- They are completed public **photo** looks, 1920x1080 landscape sources, with catalog support for Avatar III, IV and V and listed default voices. Their 10 October catalog availability does not verify look usage under a separately purchased API key, lip sync, motion, permitted overlay/matting or voice suitability.
- Use the original navy/teal **Signal** treatment and openly labelled illustrative financial figures until licensed current data is sourced. Do not treat this as live market reporting.
- The first paid milestone is a minimal **three-turn Liza–Lasse–Liza speaker audition**, **not** the full five-minute programme, not a paid Video Agent job and not a standing/split-screen certification.

## Zero-spend commands (never call an API)

```sh
node pilot/v2/budget-preflight.mjs sample
node pilot/v2/budget-preflight.mjs pilot
node pilot/v2/budget-preflight.mjs --episode sample > /private/liza-lasse-sample.json
node pilot/v2/budget-preflight.mjs --episode pilot > /private/liza-lasse-pilot.json
npm test
npm run build
npm run verify:broadcast
```

The proposed programme generator changes the on-screen identities and spoken name references to Liza/Lasse without altering factual snapshots or approved schema; it does **not** write secrets or make API calls. It keeps the existing V2 templates, so the normal V2 compositor's listener and alpha dependencies remain unresolved.

## Official API unit rates checked on 10 October

HeyGen detailed API table: https://help.heygen.com/en/articles/10060327-heygen-api-pricing-explained

| API path (photo look, 1080p) | Displayed unit rate | 45s upper run-length | Full 300s upper run-length |
| --- | ---: | ---: | ---: |
| Avatar III | $1/min | $0.75 | $5.00 |
| Avatar IV | $3/min | $2.25 | $15.00 |

Actual speech slots in the unchanged V2 fixture total **42s** of the 45s sample and **295s** of the 300s programme, corresponding to **$0.70/$2.10** and **$4.92/$14.75** at III/IV respectively, **for speaking-avatar footage alone**. Actual provider metering follows the rendered output seconds; generated clip lengths, failed/retaken clips and costs may differ. These are *not* all-in quotes or guaranteed spending ceilings.

Additional source/motion requirements are **not included**: full-scene non-speaking listener takes (53 total visible-presenter seconds in the unchanged 45s sample), alpha/standing footage, extra retakes, any external speech, director/model calls, server/CDN and any provider charges not covered by the avatar rate. The old V2 worker currently pays for full-screen-chart speaker turns even when the face is offscreen.

The minimum HeyGen API wallet top-up is **$5** (not a $20 subscription). Do not buy even $5 until the gates below pass. A $5 wallet may cover one controlled 45s avatar audition on IV under the listed rates, but must not be portrayed as funding the full approval film and all its additional assets. Disable/verify auto top-ups on the provider side where available.

## Must complete before any paid call

- [ ] Confirm exact look choice and spoken English accents using provider **free preview footage**: [Liza preview](https://resource2.heygen.ai/public-avatars/Liza/image_videos/office80_p2_a1.mp4) and [Lasse preview](https://resource2.heygen.ai/public-avatars/Lasse/image_videos/office120_p3_a1.mp4). Preview is not a script-specific audition.
- [ ] Decide and mock-test a **HeyGen-only** `script` + selected/default `voice_id` production adapter for the short audition (or explicitly approve the current ElevenLabs timed-audio path and its costs). The existing `produceV2()` **requires ELEVENLABS_API_KEY / MODEL_ID / voice IDs** and cannot perform a HeyGen-only production today. Voice/caption word-level timing needs a tested handling path.
- [ ] Freeze an actual 45s **three-speaking-turn** script with durations based on the selected voice pacing, not AI-generated live/unsupported figures. Verify look IDs and engine compatibility against the direct API account with non-billable reads.
- [ ] Build a no-cost local/deterministic rehearsal of the exact intended speaker-cut/edit path. **Do not make the first voice/lip-sync spend depend on unverified standing alpha or extra listener footage.** Still keep #24's standing/unequal-split/listener acceptance open until separately tested.
- [ ] Confirm optional services are unnecessary for this short test (no AI Gateway model, no ElevenLabs paid tier, no stock-data subscription, no LiveAvatar session).
- [ ] Agree one total **paid audition cap**, maximum allowed retakes and provider engine. Verify API wallet amount, whether unsuccessful jobs are charged, and automatic-recharge setting. Internal `PILOT_MAX_ESTIMATED_USD` is only a *reservation estimate*; not an account billing lock. Never equate estimated spend with charged spend.
- [ ] Configure API key only on the persistent private worker (`.env.local` / secure secret storage), **never** public Vite, GitHub files, front-end variables or chat. Test a non-billable authentication/catalog read when the direct API key is available.
- [ ] Independent technical signoff of the no-cost integration/tests; then explicit stakeholder approval for the first bounded paid render.

## After first audition

1. Inspect each generated clip: facial realism, lip-sync, pauses, numerals, acronym/brand pronunciation, shot framing, artifacts, audible voice, actual duration and billed amount.
2. If accepted, implement or source licensed non-speaking reactions and a proven standing-transparent asset; otherwise record a creative alternative and its limitations. A presenter-cut proof **does not** close #24.
3. Only then estimate the full five-minute speaker seconds + *additional* listener/alpha/retake seconds. Budget by actual selected route; reject any unattended full-run paid batch without a separate all-in cap and editorial signoff.
4. Make the full five-minute R3 master, human-review/approve the hash-bound output. Shared playout/live Q&A remain later, separately budgeted work.

No paid render, payment, API-key generation, provider avatar creation, or real footage verification was performed by this preflight branch. Related open acceptance: #24 (45s quality gate), #26 (pipeline), #6 (five-minute stakeholder master).
