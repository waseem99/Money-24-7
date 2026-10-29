# Tamasha channel M1 (Node)

Implements [docs/tamasha-channel](../../docs/tamasha-channel/) Stage‑1 M1 proof in Node (same stack as the rest of this repo).

## Flow

two distinct 5‑min editions → email CHANGES → new version → APPROVE → fixture Flow/voice → master → release  
with exact hashes and fixture‑metered cost logs.

## Commands

```bash
npm run tmw -- demo-m1
npm run test:tmw
```

Or:

```bash
node pilot/tamasha-channel/cli.mjs demo-m1
node --test tests/tamasha-channel*.test.mjs
```

Data lands in `.data/tamasha-channel/` (gitignored).
