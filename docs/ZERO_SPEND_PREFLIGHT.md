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
- [ ] Once the exact programme and cap are explicitly approved, set `PILOT_PAID_RELEASE_EPISODE_HASH` to the immutable run's `manifest.episodeHash` and `PILOT_PAID_RELEASE_MAX_USD` to the approved limit. New V2 paid production refuses calls for a mismatched run or larger estimate; **do not prefill this release for the current unapproved sample**.
- [ ] Configure API key only on the persistent private worker (`.env.local` / secure secret storage), **never** public Vite, GitHub files, front-end variables or chat. Test a non-billable authentication/catalog read when the direct API key is available.
- [ ] Independent technical signoff of the no-cost integration/tests; then explicit stakeholder approval for the first bounded paid render.

## After first audition

1. Inspect each generated clip: facial realism, lip-sync, pauses, numerals, acronym/brand pronunciation, shot framing, artifacts, audible voice, actual duration and billed amount.
2. If accepted, implement or source licensed non-speaking reactions and a proven standing-transparent asset; otherwise record a creative alternative and its limitations. A presenter-cut proof **does not** close #24.
3. Only then estimate the full five-minute speaker seconds + *additional* listener/alpha/retake seconds. Budget by actual selected route; reject any unattended full-run paid batch without a separate all-in cap and editorial signoff.
4. Make the full five-minute R3 master, human-review/approve the hash-bound output. Shared playout/live Q&A remain later, separately budgeted work.

No paid render, payment, API-key generation, provider avatar creation, or real footage verification was performed by this preflight branch. Related open acceptance: #24 (45s quality gate), #26 (pipeline), #6 (five-minute stakeholder master).


## Concrete next step: HeyGen-native minimum viable audition (new in this draft PR)

The former *unimplemented* direct voice route now has a deliberately separate, bounded implementation. This is **not** the primary V2 \`produce\` path, which continues to use ElevenLabs for timed word alignments and coordinated studio scenes. The new path sends \`script\` + exact \`voice_id\` + \`avatar_id\` directly to HeyGen V3, with Avatar IV explicitly selected, no added TTS service, no matting, no paid illustration, no AI Gateway and no silent listener take.

**Frozen rehearsal text (illustrative, no current news):**

1. **Liza — opening:** "Welcome to Signal Market Watch. I'm Liza. These market figures are illustrative, not live quotes. Lasse, before we interpret the chart, what should viewers check first?"
2. **Lasse — response:** "Start with timeframe and source. A price may rise in one session yet fall across the week. Check the timestamp and comparison period before drawing conclusions."
3. **Liza — closing:** "That's the key. A chart shows what changed, not necessarily why. We'll connect our explanations to the evidence and make uncertainties visible. You're watching Signal Market Watch."

This is a short sequential **voice/lip-sync audition**, not a simultaneous standing analyst scene. The assembled sample contains one on-screen speaker at a time. Its final duration follows the provider-generated clips; do not trim speech or call it a 45-second acceptance film if it falls outside 30–45 seconds. Captions are one cue per full turn, not misrepresented as word-level alignments.

Run **before purchase** (no billable generation):

\`\`\`sh
npm ci
npm run audition -- audit
npm run audition -- init
# Keep returned RUN_ID and immutable planHash.
npm run audition -- status RUN_ID
npm test
npm run build
\`\`\`

The direct API key may be generated in HeyGen Settings > API. Store it in private worker secrets (\`.env.local\` with restrictive permissions). **Do not buy credits just to run source-code tests.** With an API key, the following are read-only/catalog calls and submit no render jobs:

\`\`\`sh
npm run audition -- look-check RUN_ID
\`\`\`

This checks the exact Liza and Lasse look IDs and their existing default voices against the direct API account. A successful check is not a guarantee of speech quality, product entitlement, available API wallet funds or commercial usage terms. If read-only checks are unavailable on the free account, keep purchase blocked until the provider confirms the relevant eligibility and costs.

**Only after stakeholder's separate budget and script approval**, configure the following release in the **private worker**:

\`\`\`dotenv
HEYGEN_API_KEY=...  # real private token, never committed
PILOT_MAX_ESTIMATED_USD=3
PILOT_PAID_RELEASE_EPISODE_HASH=...  # exact planHash printed by init/audit
PILOT_PAID_RELEASE_MAX_USD=3
\`\`\`

The planned reservation is **$1 per 20-second Avatar IV Photo turn, maximum $3 internal estimated reservations for three submissions**. Real clips are expected to be shorter, but charges depend on actual seconds generated and can differ. The existing \`PILOT_MAX_ESTIMATED_USD\` / release hash are **application-side estimates, not a HeyGen billing limit**. Confirm the provider wallet and auto-recharge settings; initial $5 API top-up is a separate explicit decision. Leave the release variables blank until that approval.

When payment is eventually approved, release **one turn at a time** and inspect it before moving to the next:

\`\`\`sh
npm run audition -- produce RUN_ID --turn liza-open --paid
npm run audition -- status RUN_ID
# Repeat the same command to poll an already submitted video; it must not create another.
# Only after reviewing Liza's actual result:
npm run audition -- produce RUN_ID --turn lasse-analysis --paid
# Only after reviewing Lasse:
npm run audition -- produce RUN_ID --turn liza-close --paid
npm run audition -- assemble RUN_ID
\`\`\`

If submission response is uncertain, **do not retry paid POST**. Reconcile it using an independently verified HeyGen dashboard video ID with \`npm run audition -- reconcile RUN_ID --turn TURN_ID --video-id ID\` then poll. The assembled \`output/audition-master.mp4\`, \`captions.vtt\` and \`qa.json\` stay on the private media worker. Technical checks do not certify human-level realism. The final combined video must be reviewed and priced against provider billing.

**Remaining gates before full five-minute production:** customer-selected/free-preview-approved voice/accent and wardrobe; actual direct API look/voice eligibility; reliable natural lip-sync; a separate financially approved solution for non-speaking moving reactions and standing analyst matting; real programme script timing; chart/source consistency; private worker operations; explicit approved all-in cost including possible retakes. The original #24/#6 acceptance remains open.
