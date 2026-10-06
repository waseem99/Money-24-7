# Speaking anchor acceptance run

Status: preparation complete; real provider session and recording pending account configuration.

## Setup

1. Connect Money-24-7/main to the existing Cod 3 Vercel project signal-financial-network. Preserve its domains.
2. In Vercel, configure LIVEAVATAR_API_KEY, LIVEAVATAR_AVATAR_ID, LIVEAVATAR_VOICE_ID, LIVEAVATAR_CONTEXT_ID, STUDIO_ACCESS_TOKEN and LIVEAVATAR_SANDBOX=true. Use the provider dashboard to verify compatible assets and sandbox eligibility. Do not put values in this document or GitHub.
3. Redeploy, check /api/config, then enter the studio access code in Presenter setup. Configuration readiness is not session verification.
4. Run a short connection/speech test first. Account/sandbox duration may be shorter than the application's requested 300-second maximum. Confirm enough session time before recording. Do not turn sandbox off without checking account credits and cost.

## Reproducible sample script

Target: approximately 60 seconds, adjusted after measuring the actual selected voice. These are explicitly illustrative figures, not current market quotes. Keep SAMPLE DATA visible for the recording.

> Welcome to Signal Market Watch. I am your AI presenter. This is a recorded presentation test using illustrative market data, not a live market report.
>
> In our sample snapshot, Bitcoin is priced at sixty thousand dollars, with a twenty four hour increase of two percent. Ethereum is priced at three thousand dollars, with a decline of one percent over the same comparison period. These numbers are examples chosen to test pronunciation and on screen presentation.
>
> A rolling twenty four hour change compares two points in time. It does not explain why a price moved, and it can differ across trading venues. Our finished channel will display the source and timestamp alongside each observation.
>
> We are checking speech clarity, natural pauses, facial movement and synchronization. This concludes the Signal speaking anchor test. Thank you for watching.

Use this script only in an operator-controlled test path supplying repeat(text); the current public Start bulletin control continues to generate its market script. Do not paste the sample into factual market data fields.

## Session tests

- Missing configuration: 503, no provider call.
- Configured endpoint, missing/wrong/malformed Authorization: 401, no provider call.
- Authorized request: token returned, no API key in response; provider failure returns a sanitized error.
- Connect once, start speech, pause, switch segment, stop, reconnect. Check for duplicated audio and unintended additional sessions.
- Check disconnect, failed startup, connection loss and provider session expiry; confirm resource cleanup in the provider dashboard.
- Capture desktop and mobile playback, audible audio and captions. Record time to first video/audio and any stalls.

## Evidence template

| Field | Result |
| --- | --- |
| Deployed commit / URL | Pending |
| Avatar / voice / context non-secret names | Pending |
| Sandbox or paid mode / observed session limit | Pending |
| Device / browser / date | Pending |
| Recording URL / actual duration | Pending |
| Lip sync / facial artifacts / identity stability | Pending |
| Voice clarity / pacing / unintended speech | Pending |
| Start / pause / stop / reconnect / expiry | Pending |
| Session cleanup confirmed | Pending |
| User visual-quality acceptance | Pending |

Record defects with video timestamps. Do not publish tokens, studio codes, API keys, authentication screens or private account details with evidence. Close issues only after their real-world acceptance criteria pass.

## Automated evidence

14 local tests passed on 6 October 2026 UTC, including 11 token-endpoint tests with mocked provider responses. Production build passed. These tests establish request handling only; they do not prove provider compatibility, video quality, audio playback or cleanup of a real session.

Observed deployment /api/config returned avatarReady:false. Vercel Git settings required browser sign-in. No animated sample has been recorded.
