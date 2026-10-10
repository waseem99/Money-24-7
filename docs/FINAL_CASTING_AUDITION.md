# Final casting and zero-spend production gate — Jazz AI Channel

Date: 10 October 2026
Status: one authorized Araj API render was submitted and **failed voice validation**. No further paid attempts are authorized, no successful real presenter video exists, and this casting PR remains draft. See [first-attempt diagnosis](HEYGEN_ARAJ_VOICE_DIAGNOSIS.md).

## Selected public video-trained presenters

Araj — female lead anchor, HeyGen digital-twin look 425825d6465b4ba4bd261d334d530430, look-assigned default voice 5769809d7ddd445e8173b3d08c509ae1 **failed TTS validation**, so the audition now selects the API-catalog-verified **Annie — Lifelike** (330290724a1b470fb63153f34d4c0183) as the **user-approved Araj voice**. Yuki's preview was rejected as too synthetic; Georgia was considered, but Annie was explicitly selected. Voice selection does **not** authorize a second paid video. Source is portrait 720 by 1280. Preserve a 9:16 image inside a professional 16:9 portrait panel, without horizontally stretching or cropping the face.

Kevin — male markets analyst, HeyGen digital-twin look c8f428c549ea448488fdb2214dbcad57, look-assigned default voice 5141743c956d4a1298b7126c9639d416, with **Orson — Firm & Measured** (00e3d285aba44b27a83c47c02c9c2d9c) explicitly chosen for the forthcoming audition. Source is landscape 1280 by 720, suited to the wider analysis and chart panel.

Free public previews:
- Araj: https://resource2.heygen.ai/avatar/v3/425825d6465b4ba4bd261d334d530430/half/2.2/preview_video_target.mp4
- Kevin: https://resource2.heygen.ai/avatar/v3/c8f428c549ea448488fdb2214dbcad57/half/2.2/preview_video_target.mp4

Both completed public looks advertise Avatar III and IV engine support in the connected account. Age, ethnicity, American accent and practical visual realism cannot be confirmed from catalog metadata; the actual scripted paid audition must be assessed before broadcast acceptance. Public avatars are not exclusive presenters.

Araj: composed, warm female anchor with a distinct personal presence, natural pauses and subtle expressions; no synthetic perpetual smile or excessive gestures. Voice selected: **Annie — Lifelike** (330290724a1b470fb63153f34d4c0183), explicitly approved by the stakeholder after listening. Kevin's **Orson** voice is also approved. Georgia remains an unselected alternative. Free voice samples: [Georgia](https://resource2.heygen.ai/text_to_speech/21e28514b7994f46b907b74914a3ca6e/596d780fd5874d7983847b6a0e0c49e6/id=c74ae0d6-5e5f-4594-a18d-8c3940cdb13a.wav) and [Annie](https://resource2.heygen.ai/text_to_speech/561ac7e163fa4d42a9115b5db9beeaf6/330290724a1b470fb63153f34d4c0183/id=8a40de08-a60e-4d1a-8d03-066c135ebb93&locale=en-US.wav). Both voice IDs were verified via the same direct API in [read-only run #38075930139](https://github.com/waseem99/Money-24-7/actions/runs/38075930139). Kevin: measured male analyst with a mature, credible presentation style and a visibly distinct framing near charts. Avoid elaborate motions or false listener reactions. Use the existing Signal navy/teal studio.

## Published provider cost, limited project budget

Official HeyGen pay-as-you-go API page https://help.heygen.com/en/articles/10060327-heygen-api-pricing-explained lists 1080p digital twins at USD 1 per generated minute on Avatar III and USD 4 per generated minute on Avatar IV. The API wallet starts at USD 5 according to https://www.heygen.com/api-pricing and requires no Creator, Pro or Business monthly upgrade.

- Planned 45-second speaking-avatar output: USD 0.75 on Avatar III, or USD 3 on Avatar IV, excluding other work.
- Three individual test turns, conservatively reserving up to 20 seconds per turn: USD 0.34 each on Avatar III, USD 1.02 total application-side reservation.
- Full five minutes of speaking-video generation alone: USD 5 Avatar III or USD 20 Avatar IV, not a quote for a finished programme.

These are estimates. Real provider charges, output durations, failures, retakes, licensed data, standing or listener assets, hosting and any other model charges are not included. Application reservations are not wallet hard limits. Auto-recharge behavior and API balance require checking. Avatar V is not included: its direct API pay-as-you-go entitlement and price have not been confirmed.

## Final short audition script — Araj, Kevin, Araj

Araj: “Good evening, and welcome to Signal. I'm Araj. Markets can move quickly, but one headline rarely tells the whole story. Kevin, what should viewers check first?”

Kevin: “I start with the timeframe and trading volume. A sharp move across one session can look very different over a week. It's important to check the source and avoid jumping to conclusions.”

Araj: “Exactly. We'll show the chart and timestamp together, and explain what the numbers can and cannot tell us. This is an AI-presented demonstration using illustrative information. Thanks for watching Signal.”

No current market claims are being made. The run is a natural-speech/face audition, not the separately scoped two-person standing/alpha studio acceptance, five-minute film or live stream.

## Free execution first

1. In the existing GitHub draft branch, run npm ci, npm test, npm run build and node pilot/v2/verify-native.mjs. This last step generates only synthetic portrait/landscape test videos and validates 1080p30 FFmpeg composition without provider calls.
2. Run npm run audition -- audit, followed by npm run audition -- init; preserve its private immutable run name and plan hash.
3. Generate a HeyGen API key through HeyGen Settings > API if allowed. Store it in the private media worker only; never paste it into chat or put it into GitHub or Vite frontend settings.
4. Run npm run audition -- look-check RUN_ID. This performs read-only look GET requests with the direct API key and verifies the exact identities, their linked default voices, the **separate chosen Starfish voices in the authenticated voice catalog**, and Avatar III eligibility. The private results, plan hash, checked time and a key hash are retained; the raw API key is not saved. A billed request using a different key or an expired check is blocked.

Account access and look eligibility are not equivalent to natural voice and lip-sync approval. With no key, do not attempt payment.

## Second paid release is explicitly not authorized

A $5 API wallet top-up was reported by the stakeholder. The first authorized Araj clip was submitted once by GitHub Actions and failed with `TTS_VOICE_UNAVAILABLE_ERR`; the actual charge/refund is not known. **No second paid request is authorized.** Annie's audio-preview selection is complete. Obtain **separate authorization** for a single replacement paid clip, an updated wallet/billing check, and the intended loss ceiling, an updated wallet/billing check, and an explicit loss ceiling. Do not reuse/delete the existing first-attempt GitHub tag. A new payment authorization requires a new single-attempt record. Configure the immutable release hash and conservative internal amount in private worker settings only after approval.

If separately approved for a new attempt, initialize a new immutable run, verify the selected Starfish voice via GET, and execute one clip at a time, beginning with npm run audition -- produce RUN_ID --turn araj-open --paid. Inspect the resulting face/voice and actual invoice usage, then request approval before kevin-analysis and araj-close. After both performances pass, use npm run audition -- assemble RUN_ID. Repeated produce calls resume the same provider job instead of rebilling; uncertain submissions require manual reconciliation, never automatic retries.

## Still outside scope

The main V2 full programme still requires ElevenLabs for word-timed alignment; this short HeyGen-only audition does not remove that dependency from the full five-minute programme. A moving silent listener, standing matting/alpha, verified source footage, chart sync, real all-in costing, human full-length review, and shared broadcasting remain open. See GitHub issues 24 and 6.

Exactly **one paid-capable API submission** occurred, followed by a failed video status; billed cost is unknown. No successful new presenter film exists. The GitHub PR remains draft and additional spending is blocked pending user approval.
