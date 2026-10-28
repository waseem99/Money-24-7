# Cost control and procurement
These are planning models, not vendor quotations. No purchase authorized by this document.

## Biggest saving
Produce90 fresh editorial minutes/day using voiced presenters, sourced charts and edited scenes. Generate only selected B-roll with Flow; never generate every broadcast minute or every repeat. Reuse approved studios/stings and valid scene assets; never relabel old editorial footage as new.

Flow working estimate for8s clips and50% extra generations:
|Usable new B-roll/day|30-day accepted clips|With1.5× generation allowance|At5 credits/gen|At10 credits/gen|
|---|---:|---:|---:|---:|
|5min|1125|1688 rounded|8440|16880|
|10min|2250|3375|16875|33750|
|15min|3375|5063 rounded|25315|50630|
|90min|20250|30375|151875|303750|
Use actual supported duration/credits; unused tail time, multiple outputs/request and rejected clips can raise totals. Start with5–10min/day then measure accepted cost/minute. Low-priority free generations cannot be relied on for deadlines. Subscription credits do not pay API bills.
Google help checked28Oct lists Ultra variants with10k/$100 and25k/$200 monthly credits and model-dependent generation costs; region/checkout/taxes/availability still require confirmation. Do not use an assumed $10/1000 top-up rate as a quotation.

## Monthly budget worksheet
30-day scenario:2700 fresh editorial min; assumed60 presenter min/day=1800 avatar min;30min/day graphics/VO segments; selected Flow B-roll overlaps these visuals rather than adding to90.
Voice = actual billable characters or minutes × contracted rate (bilingual text can change counts).
Avatar = submitted minutes including retakes × plan/API rate; confirm whether external audio and1080p are included.
API B-roll = submitted seconds × verified current model price, separate from Flow.
Infra provisional allowance $100–250/month for control/playout, storage, backups and monitoring; GPU, render compute, standby, CDN and egress overage may exceed this. Not a provider price or capacity guarantee.
Research/model cost = input/output tokens and source subscriptions; feed/broadcast rights are QUOTE REQUIRED.
Human editorial/review/Flow operator/edit-QA hours = measured hours/day × agreed rate × days.
Total = voice + avatars + Flow/API + research + rights + compute/storage/egress + labour + approved contingency + applicable taxes. Do not double-count plan allowances.

## Traffic/storage calculation
A single6Mbps output for30d =6×1e6/8×86400×30 =1.944TB decimal, before audio/protocol overhead;4Mbps=1.296TB. Two independent outputs roughly double it.100 concurrent viewers directly at6Mbps imply194.4TB/month at constant concurrency: do not serve a public audience from an unbudgeted VM.
90min/day at6Mbps ≈4.05GB/day;30d ≈121.5GB finished video before audio/extra versions. Intermediates/retakes can multiply storage. Streaming24h does not require rendering24h new files.
Bandwidth procurement must specify included transfer, overage, region, peak throughput and CDN responsibility.

## Controls
Reserve budget atomically before every chargeable call. Daily and monthly account-wide caps span ALL episodes/revisions. Alerts at70%/90%; block new work at100%, no automatic top-up. Max two paid attempts per scene initially; additional retakes need producer override with reason. Pending/unknown jobs keep reservations.
Cache by script/audio/reference/model/render-config hashes. Script revision rerenders only affected scenes after new approval; changed identity/rights invalidates dependencies.
Track estimated/reserved/actual invoiced separately, provider receipts and manual Flow usage. Report dollars/credits per accepted fresh minute, rejected percentage, operator minutes, p50/p95 latency.
Procurement gate: account capability proof + accepted60–90s sample + measured cost sheet, then one5min episode, then full-day pilot. Vendor/API rate must be refreshed at implementation time.

## Official references checked28Oct2026
- https://support.google.com/flow/answer/16526234 (Flow credits and limits)
- https://support.google.com/flow/answer/16352836 (supported Flow features)
- https://ai.google.dev/gemini-api/docs/video (current programmatic video routes)
- https://ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview (retirement warning)
- https://ai.google.dev/gemini-api/docs/pricing (pricing; verify against live model availability)
- https://mediamtx.org/docs/kickoff/introduction
- https://mediamtx.org/docs/features/authentication
- https://mediamtx.org/docs/references/configuration-file
Current Google documentation warns Veo3.1 preview Gemini API models were shut down22Oct2026. Do not hardcode retired preview IDs from earlier project notes; select a supported route with verified account entitlement. Flow app availability and API model lifecycle are separate.
