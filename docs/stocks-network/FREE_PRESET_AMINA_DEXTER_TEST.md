# Stocks — Free LiveAvatar Public Preset Pilot: Amina + Dexter
**Scope:** A zero-subscription-purchase technical pilot, using only existing *included* credits in the user's LiveAvatar Free account. The goal is to verify real speaking-avatar footage inside the Stocks blue newsroom. This is **not** a custom Nora/Marcus client-ready presentation.

## Verified Free-plan conditions from official sources
- Free plan: **10 included credits per month**, **one concurrent avatar session**, **maximum two minutes per session**, public preset avatars, LiveAvatar watermark retained.
- LITE mode: **one included credit per active streaming minute**; actual provider metering and session rounding must be checked in the account. Free plan does not mean unlimited zero-credit use.
- **Sandbox is different:** official sandbox is zero-credit but permits **Wayne only** (`dd73ea75-1218-4ef3-92ce-606d5f7fbc0a`), maximum approximately one minute. Do NOT send Amina/Dexter into is_sandbox=true.
- Public preset avatar IDs must be read from LiveAvatar's actual public list; never invent either ID.
- Temporary mapping: **Amina** operates the female/Nora *camera slot*, **Dexter** the male/Marcus *camera slot*. On-air test overlays explicitly identify them as Amina and Dexter, not the final fictional Nora and Marcus.
- The intended client's premium approved blue newsroom and custom fictional Nora/Marcus remain unchanged. Free's watermark and potentially preset backgrounds/occlusion are **valid quality test constraints**, not final network deliverables.

## Run in local terminal — no TinyFish, no subscription change

On the user-controlled workstation with Node.js 22+ and project checkout:

```powershell
git clone https://github.com/waseem99/Money-24-7.git
cd Money-24-7
git fetch origin feat/stocks-free-presets-amina-dexter-20261014
git checkout feat/stocks-free-presets-amina-dexter-20261014
npm ci
npm run stocks:liveavatar -- presets
```

The `presets` command performs a **public read-only API call** (no key, no streaming credits) and shows the actual provider IDs and names for Amina and Dexter where the account's public listing makes them available. Their presence in the user's dashboard is evidence of *possible* Free use, but provider-side session permission is authoritative.

Create local `.stocks-liveavatar.local.key` (Git-ignored) containing the LiveAvatar API key; **never paste the API key into ChatGPT or GitHub.** Check balance:

```powershell
npm run stocks:liveavatar -- doctor
npm run stocks:liveavatar -- credits
```

If credits remain and you approve ONE bounded included-credit streaming session:

```powershell
npm run stocks:liveavatar -- free-preset-token --avatar-id AMINA_ID_FROM_PRESETS --confirm-one-session --confirm-use-included-credits
```

This call first validates Amina's ID against LiveAvatar's **public-avatar directory**, verifies account credits are greater than zero, and only then requests **one** LITE token with `is_sandbox:false`, maximum **45 seconds**. The provider may start counting credits when issuing a session token, so create one only when ready to connect the studio immediately. The returned bearer token must remain **LOCAL/private**. It does NOT automatically start a paid/credit-consuming stream or publish video. Free plan credits may be consumed once the provider starts or accepts the session.

## One moving speaking Amina recording
1. From the repo in another terminal:
   ```powershell
   $env:STOCKS_BUILD_OPERATOR_LAB='true'
   npm run dev
   ```
2. Open `http://localhost:3000/stocks-streaming-lab.html`. It binds loopback-only when the private lab is enabled; do not deploy this operator page publicly.
3. Select **Use Amina / Dexter Free presets**, load the source-verified **empty blue Stocks room** and original authorized Tamasha T logo from the private asset bundle.
4. Select **Camera C / Nora internal slot**; UI shows **Amina · FREE WATERMARKED TEST**. The internal camera slot is historical implementation naming, not a representation of Nora's final facial identity.
5. Enter the *locally generated* one-session token, manually confirm private test conditions/included-credit use, then click **Connect Amina**.
6. When the **actual moving video track** arrives, load our approved **20.897959-second Nora narration WAV** and click the one-shot audio send. Note the script says "I'm Nora", so **this is a lip-sync / audio-protocol technical diagnostic only**, not client-ready character identity proof. A proper Amina-specific neutral script can replace it later once the provider audio is demonstrated.
7. Capture 25–35 seconds of actual moving Amina source (not static image) with local **Record real video source**. Download WebM; run full FFmpeg decode and inspect audible voice plus matching lip movement. Recording contains an explicit temporary preset overlay and must retain provider watermarks. If the audio send fails, check SDK events/provider docs before retrying; one session request is not automatically repeated.
8. Stop the Amina session; verify that it has fully closed in the dashboard BEFORE any Dexter session starts. Free allows **only one at a time**.
9. Repeat with the **Dexter** public preset ID in the male/Marcus camera slot, sequentially. Then edit the two accepted takes with professional B/C camera cuts, with verified source-driven US-market graphic panels and ticker. **Do not fake a simultaneous two-presenter shared desk on Free tier**.

## Prohibited claims
- No custom Nora/Marcus LiveAvatars have yet been trained/created by this temporary test.
- Free plan watermarks cannot be removed. Client presentation should be labelled a **watermarked technical prototype**, not the finalized premium branded AI broadcast.
- A 1080p output wrapper does NOT upgrade native avatar source resolution or guarantee plausible hair/hand/desk interaction.
- The full 2:45 approvable client demo and 3–4h/day network remain separate milestones; Free's credit/session limits are not sufficient for sustained daily broadcasting.

### Official provider source links
https://www.liveavatar.com/
https://help.heygen.com/en/articles/10035615-how-to-get-started-with-liveavatar
https://docs.liveavatar.com/docs/sandbox-mode
https://docs.liveavatar.com/docs/lite-mode/overview
https://docs.liveavatar.com/api-reference/avatar/list-public-avatars
