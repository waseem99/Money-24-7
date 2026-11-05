# MarketWatch queue foundation

This continues PR #80. It is a queue implementation, not a deployed scheduler.

## Implemented

- PostgreSQL orchestration schema, unique stable job keys and atomic enqueue batches.
- Three calendar milestones per programme (36 jobs/day): draft preparation, review handoff and release check. These are orchestration jobs, not emails or video approvals.
- Concurrent claims with `FOR UPDATE SKIP LOCKED`; fencing tokens reject expired/stale completions.
- Safe-work lease recovery; uncertain external work becomes `UNKNOWN`, never blindly resubmitted. Retried safe work has a one-minute backoff and three-attempt limit.
- Deadline misses, starts more than a minute late, ambiguous work and failures create deduplicated incident records and notification-outbox rows. Outbox delivery is not implemented; these are not delivered alerts.
- Completion and its event/outbox row commit together.
- Injected-handler worker tick defaults to inspect-only. This repository wires no live handlers and starts no daemon.

`retry_safe` is an integration contract: mark it true only for local work or proven idempotent operations. The calendar does not mark scripting or email work retry-safe. Handlers must use the stable job key for provider reconciliation and stay within the lease; this foundation has no lease heartbeat or provider cancellation. A lost lease fences database writes, not an external network call already in flight.

## Local/operator commands

Use Node 24 and a dedicated private PostgreSQL database. Set `MW_DATABASE_URL` in the process secret environment, never in the repository or frontend.

```
npm ci
npm run marketwatch -- db-migrate
npm run marketwatch -- queue-plan --date 2026-11-06 --market-state trading --calendar-source https://example.org/fixture-calendar
npm run marketwatch -- queue-status
```

The example evidence URL is a fixture. Operators must check the actual exchange calendar before enqueueing a real date. Rerunning the same plan inserts zero duplicate jobs. Altering a calendar under the same keys fails the entire batch; explicit revision/cancellation tooling is still required.

`queue-plan` inserts work, but runs no scripts and sends nothing. `MW_WORKER_ENABLED` remains false and is reserved for a later qualified service; changing it currently starts nothing.

## Tests

```
npm test
```

Without `MW_TEST_DATABASE_URL`, the real PostgreSQL test is explicitly skipped. To exercise actual concurrent claims, rollback, schema restart, fencing, missed deadlines, ambiguous external work and outbox atomicity, set `MW_TEST_DATABASE_URL` to an expendable PostgreSQL database. The integration test creates and removes a unique schema. Never use a production database.

The PR workflow provisions an isolated PostgreSQL 17 service, sets that test variable and runs the full test suite and build. No production credentials or paid calls are used.

## Remaining before deployment

1. Port immutable scripts/review decisions/inbox checkpoints to PostgreSQL; SQLite ReviewStore is still development-only.
2. Implement Drive/Gmail/research adapters and dependency gates. A claimed milestone must not itself imply script approval or authorize publishing.
3. Add the hosted one-minute runner, graceful shutdown, health checks, external alert delivery and private media storage. No hosting resources are provisioned here.
4. Add cancellation/quarantine for revised scripts and late HOLD; the queue currently has no connected render jobs.
5. Prove timeout/reconciliation behavior for real email/API providers and add budget reservations before paid calls.
6. Cut over old ChatGPT schedules programme by programme only after a watched delivery test. Existing schedules are unchanged.

## Flow and API routes

Manual: approved script + scene pack → operator loads references in Google Flow → clips → Premiere.

Automated: approved script + downloaded reference files → supported Google video-model API → clips → Premiere.

The API route does not operate the Flow app or inherit its credit balance/project controls. Account capability, billing, reference inputs, native audio and voice consistency require a measured pilot. Keep route/model configurable. Current official documentation retires the older Gemini API Veo 3.1 preview IDs; do not copy those into production configuration.

Sources checked 5 November 2026:
- https://ai.google.dev/gemini-api/docs/video
- https://support.google.com/flow/answer/16526234
- https://www.postgresql.org/docs/current/sql-select.html
- https://node-postgres.com/features/transactions
