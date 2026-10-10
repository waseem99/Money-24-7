# Signal Financial Network

A Vercel-ready financial broadcast prototype. Original Signal branding and an AI-generated anchor concept, Coinbase Exchange trade streaming, factual scripted narration, and a LiveAvatar session integration.

## What runs now

- Responsive broadcast player, full screen, ticker, captions, three selectable segments, and observed-trade charts.
- Public Coinbase Exchange WebSocket: BTC-USD, ETH-USD, SOL-USD. Each price carries a trade timestamp; stale prices cease to qualify as live after 20 seconds.
- REST snapshots when streaming is unavailable. Snapshots are visibly labeled and never narrated as live.
- Browser speech synthesis on explicit Start. This is a functional voice preview; quality depends on the user's installed voices.
- A photorealistic original studio/anchor **still**, clearly labeled. It has no animated lips or facial movement.
- Server-only LiveAvatar token minting and the official browser SDK. The paid presenter session is protected by a studio access code.
- Optional timestamped Finnhub stock snapshots and HLS program-feed playback.

## What is not complete

The default deployment is a channel prototype, not a shared 24/7 television stream. The operator LiveAvatar preview has account/session history in issues #2–#4; configuration presence does not certify professional footage or lip sync. The separate prepared-pilot worker implements AI-assisted script revision, timed speech/avatar adapters, FFmpeg composition and private review, as documented below. The actual premium five-minute film and real-provider certification remain pending. No continuous shared broadcast, hosted persistent production worker or live-feed redistribution entitlement is certified. Generated imagery does not create or license a custom LiveAvatar digital twin automatically.

## Local development

Use Node 24 (minimum Node 22.12). Run `npm ci`, `npm test`, then `npm run dev`. Open http://localhost:3000. `npm run build` produces `dist/`.

## GitHub and Vercel

Source repository: https://github.com/waseem99/Money-24-7 (main branch).

The prototype is already deployed in the Cod 3 Vercel project `signal-financial-network`. Framework: Vite. Build: `npm run build`. Output: `dist`. The `api/` functions deploy separately through Vercel. Never commit real `.env` files or add API keys to VITE-prefixed variables.

Git-linked automatic deployments were verified through PR #16 and production commit `da9758bfa025b7e59256c0c9ed65892728e2206c`. Preserve the existing Cod 3 project, domains and private environment settings.

## Activate the realistic presenter

Configure these values in Vercel's encrypted environment settings:

| Variable | Purpose |
| --- | --- |
| LIVEAVATAR_API_KEY | Account API key, held server-side |
| LIVEAVATAR_AVATAR_ID | Approved public avatar or licensed custom avatar |
| LIVEAVATAR_VOICE_ID | Selected voice |
| LIVEAVATAR_CONTEXT_ID | Context configured without spontaneous greetings or financial speculation |
| STUDIO_ACCESS_TOKEN | A strong random operator access code |
| LIVEAVATAR_SANDBOX | `true` initially; use `false` for production sessions with credits |

Redeploy after changes. Click Presenter setup, enter the **studio access code**, connect, then Start bulletin. The session reads supplied text with SDK `repeat()`; it does not ask the avatar LLM to invent financial analysis. The five-minute session timeout is deliberate. Sandbox eligibility and account-level behavior must be verified with the actual account.

For a custom anchor, record a consenting presenter and create the avatar using the provider's supported digital-twin workflow. Select the resulting ID. The concept photograph alone does not guarantee identical animated identity or studio composition.

## Shared live channel

Use one broadcast producer to combine the avatar feed, voice, graphics, and source-timestamped overlays, then publish a single HLS output (optionally simulcast RTMP to YouTube). Run the continuous compositor on managed media infrastructure or a persistent worker, separate from request-bound Vercel functions. Set `VITE_CHANNEL_HLS_URL` to the credential-free viewer URL, with cross-origin playback allowed, and redeploy. Do not start a paid avatar session for every public viewer.

The HLS player branch is implemented but has not been verified with a real program-feed URL. Public paid-session issuance must move from the operator preview to a centrally controlled producer with durable quotas and authentication before launch. No continuous-stream service has been provisioned by this prototype.

## Expand to stocks and business

1. Confirm display and redistribution terms with the data provider/exchanges. API access alone does not establish broadcast permission.
2. Configure FINNHUB_API_KEY for the implemented stock snapshot adapter; it currently covers AAPL, MSFT, NVDA, SPY. Respect account rate limits and timestamps.
3. Add a licensed news provider, structured source records, fact extraction and numeric validation. Produce original scripts with evidence for every factual claim.
4. Add approval and correction workflows, durable story queues, rendering jobs, storage, and channel publishing.

## Verification

`npm test` checks valid price normalization, rolling return calculation, stale/snapshot rejection, future timestamp rejection, and factual narration. `npm run build` checks client bundling. See the included verification notes for actual deployment/browser checks and limitations.

## Source references

- https://docs.cdp.coinbase.com/exchange/websocket-feed/channels
- https://docs.liveavatar.com/api-reference/sessions/create-session-token
- https://docs.liveavatar.com/docs/full-mode/events
- https://github.com/heygen-com/liveavatar-web-sdk
- https://vercel.com/docs/functions

## Anchor image provenance

Created with the built-in image-generation tool for this project. Prompt: "An extremely realistic photographic original fictional female financial news anchor aged 32, natural medium skin tone and dark brown hair, tailored navy blazer and ivory blouse, seated at a charcoal glass desk; front-facing, natural hands, direct eye contact. Defocused midnight navy broadcast LED studio, subtle lime and ice-blue highlights, realistic optics, softbox lighting, natural skin texture. Widescreen. No readable text, logos, fake financial numbers, watermark, or celebrity likeness. Photograph, not illustration or 3D render."

The project stores the image at `public/anchor-studio.png`.
# Five-minute production pilot

The prepared two-presenter pilot worker and private review studio are documented in [PILOT_RUNBOOK.md](PILOT_RUNBOOK.md). Start with `npm run pilot -- doctor`, then `npm run pilot -- init --fixture`. `/pilot.html` previews the production rundown. Fixture output is explicitly not the final realistic recording; actual provider footage and human quality review are still required.

## Next execution plan: animated multi-presenter broadcast

The [AI-first V2 plan](docs/AI_FIRST_BROADCAST_V2_PLAN.md) and [linked execution backlog](docs/BROADCAST_V2_BACKLOG.json) specify six animated layouts, financial charts, a seated-anchor/standing-analyst scene, coordinated dialogue/listening reactions, a 45-second real-media gate, and the five-minute approval film. Precise movement is a separate experiment; buffered shared output follows film approval. These V2 capabilities are planned, not implemented. Begin with NR-01, then the no-paid-API graphics prototype.
