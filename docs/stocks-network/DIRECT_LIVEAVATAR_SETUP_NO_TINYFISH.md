# Stocks Stage 3 — Direct LiveAvatar setup, no TinyFish

Client requirement: no browser-automation fees or TinyFish top-up. This setup runs the official LiveAvatar API from the user's workstation, with a zero-network doctor, read-only credits/avatars checks, and explicit one-shot token creation.

## One-time LiveAvatar dashboard setup
1. Visit https://app.liveavatar.com/home with the existing signed-in account.
2. Navigate to Avatars → My Avatars → New/Create Avatar → From Image, if Nora does not already exist. Upload the APPROVED individual 1920×1080 Nora portrait, never the two-person composition.
3. Await provider validation/moderation and READY status. Fictional characters may require review; do not try to bypass consent. Free LiveAvatar accounts provide public avatars; custom avatar access is a separate PAID LiveAvatar subscription, unlike the TinyFish browser tool.
4. Copy Nora's NON-SECRET avatar ID (safe to share here), but do not share the LiveAvatar API key or bearer token.
5. From LiveAvatar Developers/API key, obtain the API key and save it locally in the Git-ignored file named .stocks-liveavatar.local.key in the Money-24-7 repository. No passwords or API keys belong in ChatGPT or public GitHub.

## Run on Windows with Node.js >=22
Open Windows PowerShell in your normal local workstation.

    git clone https://github.com/waseem99/Money-24-7.git
    cd Money-24-7
    git fetch origin feat/stocks-direct-liveavatar-no-browser-fee-20261014
    git checkout feat/stocks-direct-liveavatar-no-browser-fee-20261014
    npm ci

Copy the API key into the ignored local file .stocks-liveavatar.local.key (one key only). Then run:

    npm run stocks:liveavatar -- doctor
    npm run stocks:liveavatar -- credits
    npm run stocks:liveavatar -- avatars

Doctor makes ZERO network requests. Credits and avatars use GET requests to LiveAvatar only; they do not start a session or spend avatar minutes. If no READY custom Nora appears, return to provider's dashboard and finish enrollment.

## Free LiveAvatar sandbox test (not TinyFish)
A free public test avatar may work in sandbox. For the approved Nora character, the account must allow that avatar. Run with the ACTUAL ID obtained from the provider:

    npm run stocks:liveavatar -- sandbox-token --avatar-id YOUR_ACTUAL_ID --confirm-one-session

This mints exactly one LITE/is_sandbox=true session token, capped to 45 seconds, and prints it to the LOCAL terminal. It does NOT itself start video. Paste it only in the private operator lab; never into chat. The sandbox costs no streaming credits where the account is eligible, but creating a custom avatar can still require a paid LiveAvatar plan.

For a paid custom-avatar production proof, only after provider eligibility/rights and credits are confirmed locally:

    $env:STOCKS_APPROVE_ONE_LIVEAVATAR_PAID_TEST='YES'
    npm run stocks:liveavatar -- paid-token --avatar-id YOUR_ACTUAL_ID --confirm-one-session
    Remove-Item Env:STOCKS_APPROVE_ONE_LIVEAVATAR_PAID_TEST

No automatic retries or hidden subscriptions. Check the LiveAvatar dashboard after any uncertain token/session result before a second attempt.

## Record a real moving Nora speaking take
Run these commands locally:

    $env:STOCKS_BUILD_OPERATOR_LAB='true'
    npm run dev

The operator binds to 127.0.0.1 only, not your public network. Open http://localhost:3000/stocks-streaming-lab.html on this machine.

Load the approved clean blue studio image and the original logo locally; select Camera C (Nora). Enter your locally minted session token, confirm identity/provider test rights and session billing conditions, then connect Nora. After ACTUAL video arrives, load the previously generated 20.897959-second synthetic Nora WAV. Send one approved audio take, and record the actual speaking source for 30–45s.

The sender uses the LiveAvatar documented 24kHz mono signed PCM16, Base64-encoded in one-second packets. The prior raw-binary send path was a documented risk and is corrected in this branch. Provider event start/end, audio/lip synchronization and full motion must be inspected on REAL video; a successful token/media connection is not sufficient.

The browser download is a local WebM, not the final client-ready MP4. Do full FFmpeg decoding, compositing quality review and H.264/AAC conversion only after the speaking take has genuine usable footage.

## Source-of-truth and security notes
- No TinyFish/browser-bot usage or charges.
- No provider API key or bearer token copied into chat/GitHub.
- Original user-approved AI fictional identities and one clean blue studio only.
- No fake LIVE, no Pakistan markets, no illustrative stock numbers in broadcast.
- No source-video generation in GitHub CI.
- The operator app is local only when the private lab is enabled.
- This setup does not prove broadcast quality, commercial redistribution rights or custom-identity eligibility by itself.
- The demo budget is approved, but it does not equal prepaid LiveAvatar credits.

Official vendor documentation:
https://docs.liveavatar.com/api-reference/avatar/list-user-avatars
https://docs.liveavatar.com/api-reference/users/get-user-credits
https://docs.liveavatar.com/docs/sandbox-mode
https://docs.liveavatar.com/docs/lite-mode/configuration
https://docs.liveavatar.com/docs/lite-mode/events
https://help.heygen.com/en/articles/9612935-liveavatar-custom-liveavatar-creation-guide
