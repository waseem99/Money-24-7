# Signal broadcast rollout

## Implemented
- Operator-controlled LiveAvatar preview with user-browser video/audio confirmation.
- Four-segment local programme: market bulletin, official economics headlines, price chart, educational context.
- Auto rundown checks every five seconds and advances after narration finishes, with at least ten seconds per segment; manual segment controls remain available. Turn Auto rundown off to repeat the selected segment.
- Headlines preserve source and publication date; feeds fetched over 15 minutes ago are not narrated.
- This is a programme in one viewer's browser, not a shared continuous broadcast.

## Professional presenter configuration
The Presenter setup dialog now offers Emily Serious as a professional preview. Selecting it and explicitly confirming credit use sends an authenticated request using fixed server-side assets, capped at 120 seconds. Wayne sandbox remains the default. The following environment settings are only needed if making Emily the deployment default; the new selector does not require those changes.

| Vercel Production variable | Professional test value |
|---|---|
| LIVEAVATAR_AVATAR_ID | 87dff365-543d-46a5-9f5a-524da44675ab |
| LIVEAVATAR_VOICE_ID | 5eb4d957-d822-476f-b542-1c536e836b06 |
| LIVEAVATAR_CONTEXT_ID | 2f730d65-34fd-4a2f-9df3-8c1cdcdf7f3b |
| LIVEAVATAR_SANDBOX | false |

Keep API key and studio access token server-side. Non-sandbox previews are currently capped at 120 seconds and consume provider credits. Emily asset compatibility and visual quality remain untested. Switching env settings requires redeployment. Sandbox rollback: Wayne avatar dd73ea75-1218-4ef3-92ce-606d5f7fbc0a and LIVEAVATAR_SANDBOX=true.

## Remaining acceptance gates
1. Record and review a non-sandbox presenter sample for lip sync, pronunciation, framing and voice suitability.
2. Configure FINNHUB_API_KEY with suitable display rights and verify stock quote timestamps. Never infer a live equity feed from configuration presence.
3. Provision a continuous producer outside the viewer browser: source collection, script validation, media generation, playout queue, HLS origin/CDN, monitoring and fallback programme. The current HLS player adapter alone does not provide this infrastructure.
4. Add persistent viewer identity/chat storage, moderation, rate limits and grounded Q&A before public interaction.
5. Certify sustained shared playback and recovery from upstream failure. The one-minute sandbox cannot establish 24/7 readiness.
