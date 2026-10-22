# Direct HeyGen API screen tests

The project already renders avatar videos through API-key authentication in `providers.mjs`. This companion adds the **approved image + existing audio** route needed for Sara's screen test. It preserves the approved recording rather than generating new speech, and explicitly requests Avatar IV at 1080p. It does not convert or upscale an MCP video.

`HEYGEN_API_KEY` stays in the worker environment or GitHub Actions repository secret. The API account and its funding are independent of the connected MCP web plan. A successful account check does not prove resolution entitlement; only an accepted render and inspection of its output can do that.

## Read-only connection check

```bash
node pilot/heygen-api.mjs preflight pilot-runs/api-preflight/report.json 1
```

This makes one GET request and writes a private account report. Standard output contains authentication/funding status only. The $1 reserve is a conservative short-test gate, not a provider quote or a billing cap. Missing/unknown balances are not treated as zero. Unsupported billing models stop for account-specific budget configuration.

The `Tamasha direct API preflight` workflow runs this check from the named owner-controlled implementation branch when its workflow file changes, or by manual dispatch after registration on the default branch. It does not run on pull requests, create videos, change subscriptions or recharge the account. Its account report is a short-lived Actions artifact; do not copy it into this public repository.

## One approved screen test

Keep the real plan, reviewer reference, asset IDs and ledger under ignored `pilot-runs/` on persistent private storage. The plan has `id`, `expectedAccountId`, `durationSeconds` (maximum 30), `estimatedUSD`, `capUSD` and an exact `request`:

```json
{
  "type":"image",
  "image":{"type":"asset_id","asset_id":"VERIFIED_IMAGE_ASSET"},
  "audio_asset_id":"VERIFIED_APPROVED_AUDIO_ASSET",
  "title":"Presenter screen test",
  "engine":{"type":"avatar_iv"},
  "aspect_ratio":"16:9",
  "resolution":"1080p",
  "expressiveness":"low",
  "motion_prompt":"Calm presenter. Natural blinks and subtle head movement. Preserve the supplied face, clothes and background.",
  "fit":"cover",
  "remove_background":false,
  "output_format":"mp4"
}
```

Obtain a current cost estimate from the API dashboard. Use the measured audio duration. An estimated cap limits reservations in this local ledger; it is not a provider-enforced spending limit. After actual operator authorization, record `approval: {renderAuthorized: true, planHash: <hash output>, reference: <actual approval reference>}`. A generated hash is not itself approval.

```bash
node pilot/heygen-api.mjs hash pilot-runs/screen-plan.json
node pilot/heygen-api.mjs submit pilot-runs/screen-plan.json pilot-runs/screen-test --paid
node pilot/heygen-api.mjs collect pilot-runs/screen-test
```

Submission verifies the API account, available wallet funds and both approved assets before sending a single POST. Script/TTS substitutions are rejected. Collection only reads the saved video ID and writes `result.json`; run it when status is needed. A completed render still requires human voice, lip-sync and visual review. There is no automatic downgrade, retake, publication or email.

The persistent SQLite ledger and exclusive worker lock prevent duplicate submission on normal reruns or concurrency. An uncertain POST, failed render or interrupted worker requires reconciliation; never delete state and submit again. Restore the **entire** private run directory when moving workers. There is no assumption that a provider idempotency header is supported on this endpoint. Do not schedule this CLI on disposable CI runners without durable state restoration and serialization.

This screen-test adapter does not enable the daily script scheduler or change the separate programme editorial-approval gates.

References: [image + audio generation](https://developers.heygen.com/image-to-video), [account/balance](https://developers.heygen.com/user-profile), [Avatar IV motion controls](https://developers.heygen.com/avatar-iv).
