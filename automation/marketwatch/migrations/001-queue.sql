-- Run only against a dedicated private MarketWatch database.
CREATE TABLE IF NOT EXISTS mw_jobs (
  key text PRIMARY KEY,
  kind text NOT NULL,
  payload jsonb NOT NULL,
  due_at timestamptz NOT NULL,
  deadline_at timestamptz NOT NULL CHECK (deadline_at > due_at),
  retry_safe boolean NOT NULL DEFAULT false,
  state text NOT NULL DEFAULT 'PENDING' CHECK (state IN ('PENDING','RUNNING','DONE','FAILED','MISSED','UNKNOWN')),
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3 CHECK (max_attempts BETWEEN 1 AND 10),
  available_at timestamptz NOT NULL,
  lease_token uuid,
  lease_until timestamptz,
  result jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mw_jobs_due ON mw_jobs (available_at, due_at) WHERE state = 'PENDING';
CREATE TABLE IF NOT EXISTS mw_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_key text NOT NULL REFERENCES mw_jobs(key),
  kind text NOT NULL,
  at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_key, kind)
);
-- Transactional notifications: transport must reconcile uncertain delivery before retry.
CREATE TABLE IF NOT EXISTS mw_outbox (
  key text PRIMARY KEY,
  topic text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz
);
