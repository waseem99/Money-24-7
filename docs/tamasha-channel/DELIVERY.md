# Delivery plan and developer starting point
## Implement in this order
- [ ] [TMW-01: Reconcile launch configuration and integrate script-desk pilot](https://github.com/waseem99/Money-24-7/issues/66) — depends on launch inputs
- [ ] [TMW-02: Implement daily programme calendar and freshness ledger](https://github.com/waseem99/Money-24-7/issues/67) — depends on #66
- [ ] [TMW-03: Build sourced script packs and editorial validation](https://github.com/waseem99/Money-24-7/issues/68) — depends on #66, #67
- [ ] [TMW-04: Implement authenticated Gmail review and approval outbox](https://github.com/waseem99/Money-24-7/issues/69) — depends on #68
- [ ] [TMW-05: Implement production queue, budget reservations and provider reconciliation](https://github.com/waseem99/Money-24-7/issues/70) — depends on #66, #69
- [ ] [TMW-06: Build Flow operator queue and qualify supported video API adapter](https://github.com/waseem99/Money-24-7/issues/71) — depends on #70
- [ ] [TMW-07: Qualify bilingual voices, avatar looks and daily wardrobe](https://github.com/waseem99/Money-24-7/issues/72) — depends on #70
- [ ] [TMW-08: Build final edit templates, subtitles and exact-master release gate](https://github.com/waseem99/Money-24-7/issues/73) — depends on #71, #72
- [ ] [TMW-09: Implement licensed ticker and channel output compositor](https://github.com/waseem99/Money-24-7/issues/74) — depends on #66, #73
- [ ] [TMW-10: Deploy supervised playout and MediaMTX origin with Tamasha test handoff](https://github.com/waseem99/Money-24-7/issues/75) — depends on #73, #74
- [ ] [TMW-11: Implement monitoring, recovery and seven-day launch rehearsal](https://github.com/waseem99/Money-24-7/issues/76) — depends on #75

## Ownership
Lead developer: architecture, integration, state, review UI and provider adapters.
Editorial owner + backup: facts, tone, schedule, deadline decisions, corrections and script approval.
Production operator: Flow queue, voice listening, avatar/wardrobe checks, retakes and full-master QA.
Broadcast/DevOps owner: origin, ticker, playout, receiving-platform tests, monitoring and incident response.
Commercial/rights owner: data/video/audio entitlements, paid subscriptions, cost caps and CDN responsibility.
Actual names remain to be assigned; do not assume the commercial contact is the editor.

## Delivery sequence / estimates
Planning estimate for one experienced backend/media developer with editorial/operator and part-time DevOps support: integration and inputs2–3 working days; scheduler/review5–7; provider/edit integration5–8; playout/ticker/delivery4–6; seven calendar days supervised rehearsal. Approximately4–6 weeks with overlap; vendor access, feed rights, avatar quality and client turnaround can extend it. These are not committed deadlines.
- M0: reconcile existing PRs, secrets/access/rights and requirements; run baseline tests.
- M1: two DISTINCT5min editions, email changes→new version→approval→Flow/voice→master→release, exact hashes and real cost logs.
- M2: full90min fresh day and non-trading simulation; demonstrate deadline/freshness gates.
- M3: private origin + Tamasha receiver test, continuous72h soak and failover drills.
- M4: seven days supervised operation, full daily fresh-minute/as-run reports and budget acceptance.
- M5: named editorial and Tamasha technical sign-off; production launch decision.

## First-day checklist
1. Read this folder and audit PR #65 against main; do not silently merge historic prototype branches.
2. Collect reviewer/backup identities, confirmed airtimes, approved voice/avatar/look IDs and provider accounts via secret manager.
3. Obtain licensed market-data sample and entitlements; ask Tamasha for the STREAMING.md delivery contract.
4. Run existing test/build commands on the integration branch and record failures before changing code.
5. Implement #66 then #67–#70; start with fixture/no-spend jobs.
6. Agree a bounded paid proof budget and operator responsibility before rendering.
7. Track every decision and open risk in the linked issues.

## Launch acceptance
- All active programme slots assigned, no overlaps, calendar/DST fixtures pass.
- Real90min/day new editorial content; replay/filler/social not miscounted; no invented “aired” records.
- Exact script approval and exact final-master release bound to authenticated people.
- No unlicensed feed/assets or unapproved identities/voices.
- Urgent corrections revoke future plays; live operator switches output if needed.
- Full-motion and listening review resolves #64 defects; structural tests alone cannot.
- Tamasha validates stream format, audio, ticker, latency, EPG and both primary/fallback behaviour.
- Invoice-based accepted-minute cost and p95 latency fit signed limits.
- Restore/failure drills, named on-call coverage and written launch authorization.

## Change policy
Facts, date, spoken words, source expiry or master bytes changing require new corresponding approval. Non-editorial retries may reuse unchanged approved inputs but release always binds final master. Scheduled repeats preserve original date/look and pass expiry checks.
The current handoff is documentation/backlog only. It does not activate Gmail automation, provision hosting, generate media, or issue a working live stream.
