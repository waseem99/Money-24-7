# Stocks Broadcast OS — Engineering foundation

**Client casting lock (14 Oct 2026): No human presenters/representatives on air.** The channel must use two original fictional AI anchors, first tested as eligible licensed real-time streaming avatars against our owned broadcast studio. Unreal Engine and proprietary rigs are a fallback if commercial streaming performance fails. See [AI-NATIVE_MANDATE.md](../docs/stocks-network/AI_NATIVE_MANDATE.md) and [AI cast/room example contract](../docs/stocks-network/ai-native-character-and-studio.example.json). Existing Liza/Lasse office footage is historical evidence only, not approved cast source for new episodes. The architecture is a plan; no Unreal project/rig/video is delivered by these validators.

This directory is a **zero-cost/offline control-plane skeleton** for a future 3–4 hour/day linear U.S. financial television network. It does not stream, source quotes, produce an avatar, encode a broadcast, or accept money. The architecture and operational implementation backlog are in [the network blueprint](../docs/stocks-network/NETWORK_BLUEPRINT.md).

## Run from the repository root

```bash
npm ci
npm run stocks:doctor
npm run stocks:rundown
node network/cli.mjs validate docs/stocks-network/daily-rundown.example.json --release
npm test
```

The **doctor** should pass draft geometry (210-minute schedule) and explicitly report that the channel is NOT provisioned and CANNOT be released. The `--release` example is expected to fail with exit code 2: there are no signed presenter/market-data rights, media hashes, editorial approvals or Tamasha ingest tests yet. Do not change the fixture to artificially pass the policy.

## First architecture deliverables

- `network/rundown-policy.mjs`: offline fail-closed source/license/live/identity/playout validator. This only validates supplied signed metadata, it does **not verify the truth of the source itself**; separate independent quote/rights/media verification is required.
- `network/cli.mjs`: deterministic doctor/rundown checker. No network, provider, encoder or publishing calls.
- `docs/stocks-network/daily-rundown.example.json`: a 210-minute **planning** playlist, no purchased media or asserted market prices. Never substitute it for an actual on-air rundown.
- `tests/stocks-network-rundown.test.mjs`: proves false-LIVE, unlicensed prices, cross-market content, unsourced actors and unprovisioned feed are blocked.

## Not yet implemented

- Source-data warehouse and rights records
- Durable LLM + journalist editorial approval CMS
- Clean physical/3D room with compatible licensed presenters
- Recording/editing and deterministic 1080p package renders
- vMix/CasparCG on persistent machines
- SRT/RTMP feed, Tamasha ingest agreement, watchdog/standby
- Any daily network feed, commercial licence, purchase, approval or staffing

## Nonnegotiable production contract

Market coverage **US only**. One small Tamasha symbol + Stocks / MARKETS BUSINESS PEOPLE in the upper-left, no duplicated logo. No baked-in prices or arbitrary model-generated actors in the studio scene. Source-timestamped ticker and separate deterministic graphics. Recorded and replay programmes clearly labeled. Human editorial and rights approval needed for every released fact and episode. Paid API generation disabled until independently authorised and logged.
