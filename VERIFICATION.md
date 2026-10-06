# Verified prototype — 6 October 2026

## Deployment

- Team: Cod 3 (`team_8Om6wGMzT3d7AEKqNBQ0Nrva`).
- Project: signal-financial-network (`prj_DBNTDw0K4VfOC4ogsN7s59mxBPgs`).
- Production deployment: `dpl_63eAEo22JcUqTiAJh1hRAzYXvvPY`, READY.
- Verified viewer URL: https://signal-financial-network-cod-3.vercel.app/
- Framework: Vite, Node 24, Vercel Node API functions.
- Build duration: approximately 11 seconds.
- Source uploaded directly; no GitHub repository is connected.

## Evidence

| Boundary | Result |
| --- | --- |
| Client build | Passed after final code changes |
| Data trust checks | 3 tests passed: valid trade normalization, invalid prices, rolling-return calculation, stale/snapshot rejection, future timestamps, factual narration |
| Configuration API | HTTP 200, `avatarReady:false`, `stocksReady:false` |
| Market snapshot API | HTTP 200, three Coinbase quotes, source labels, snapshot mode, retrieval timestamps |
| Browser live feed | BTC, ETH, SOL prices updated via the Coinbase WebSocket; trade timestamps and live status observed |
| Charts | Actual observed-trade history drawn; Ethereum selection and chart segment verified |
| Segment switching | Main bulletin and live chart segment verified |
| Captions | Toggle verified; long captions constrained to three visible lines; full script available in transcript |
| Presenter setup | Correctly shows configuration missing; token endpoint rejects unconfigured POST with HTTP 503 |
| Error scan | No error/fatal runtime logs found for the final deployment in the 15-minute inspection window |

## Unverified or unfinished

- Browser speech synthesis returned an unavailable-voice error in the cloud browser; the app displays that limitation. It may work with installed voices in other browsers, but audible playback is not certified.
- LiveAvatar: no credentials or actual animated session. Lip sync, identity, voice quality, avatar layout, sandbox behavior and disconnect/cleanup must be tested with the account.
- Shared HLS broadcast: adapter exists, no feed URL or producer. No 24/7 broadcast, YouTube simulcast, or rendered video sample exists.
- Stocks: optional Finnhub adapter is unconfigured and unverified. Data-display rights are not established.
- Business news and LLM analysis: no external provider or model is connected. Scripts use deterministic factual templates.
- Mobile CSS is implemented; actual mobile browser testing remains unverified. Desktop cloud-browser inspection was completed.
- Full-screen control is implemented; full-screen entry is not certified in this cloud browser.
- No monitoring drains or persistent newsroom/producer infrastructure were provisioned.

The anchor photograph is a clearly labeled generated still. It must not be represented as a speaking avatar or live video.
