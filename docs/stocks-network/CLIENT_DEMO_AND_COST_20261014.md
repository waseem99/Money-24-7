# Stocks — Client Approval Demo and 2–4 Avatar Broadcast Costs
**2026-10-14 | VERSIONED MARKET/VENDOR ESTIMATES, NOT A QUOTATION OR SPENDING AUTHORIZATION**

## Why we're building this
User wants a **real client-approvable 2–3 minute moving US-financial-news broadcast demo**, with 2–4 fictional AI presenters, verified financial segments, moderated interaction, and then 3–4 hours of scheduled programming per day. Stills, fake lip-sync slides, TV-image hallucinated prices and past office-background videos are categorically excluded as client final.

## Current provider pricing — official pages as of 14 October 2026

| Vendor | Public option | Included monthly speech-to-video minutes | Custom characters included | Approx. extra usage |
|---|---|---:|---:|---|
| LiveAvatar | Business **$475/mo**, **6000 LITE credits** / max 60 min sessions | 6000 LITE avatar-min | 1 × 1080p custom | **$0.09/min** after package; 2+ characters need extra slots |
| LiveAvatar avatar add-on | **$49/month per extra LiveAvatar slot** advertised by HeyGen | N/A | 1 slot | 1080p extra slot eligibility and TV rights must be confirmed |
| BeyondPresence | Scale **€349/mo**, 4000 speech-to-video min | 4000 min | Up to 10 custom, **image-to-avatar** supported | **€0.0875/min** |
| Tavus | Growth **$397/mo** | 1250 conversational video min | Up to 7 image-to-replica characters | Overage and broadcast terms require written quote |

References:
- https://www.liveavatar.com/
- https://help.heygen.com/en/articles/10035615-how-to-get-started-with-liveavatar
- https://help.heygen.com/en/articles/15125761-heygen-credit-based-pricing-plans-subscriptions-explained
- https://www.beyondpresence.ai/pricing
- https://www.tavus.io/pricing

**Account caution:** connected HeyGen Free is NOT an independently authenticated LiveAvatar paid workspace. First obtain a LiveAvatar account, vendor-issued fictional-image acceptance, written commercial **TV broadcast + recording + redistribution** permission, number of custom 1080p slots, exact actual subscription billing, watermark removal and session/reconnect terms. Never spend on ordinary HeyGen image-to-video credits to solve this channel problem.

### LiveAvatar planning example (US Dollars)
Assumes 1 included custom slot + **$49/mo for each additional custom slot**, Business 6000 LITE-minutes at $475 and 9¢ for excess; the $49 slot listing does not guarantee extra 1080p rights. LITE speech synthesis is an additional separate expense.

- **Two personas:** $475 + $49 = **$524/mo**, before TTS, audio, graphics, storage, editorial staff and market licensing.
- **Four personas:** $475 + 3×$49 = **$622/mo** before extras.
- **3.5 hours/day × 30 days × 40% avatar-on-screen × 1.2 effective simultaneous sources:** 3024 billable avatar-minutes, within 6000.
- **4 hours/day × 30 days × 100% × two simultaneous sources:** 14,400 billable avatar-minutes; 8400 overage × $0.09 = $756, or $1,378/mo including four avatar slots and Business base, excluding all other costs. **Avoid paying for two always-on avatars** unless actual programme grammar warrants it.

Use runnable \`network/demo/cost-model.mjs\` for sensitivity scenarios; projected concurrent factor is a model input, not a guarantee of provider invoice (billed session time may include preparation/idle).

### Other spending before the client demo
- **Real moving provider test:** under LiveAvatar Business, first-month subscription $475, extra 1080p slot(s) if permitted; avoid purchase until source images accepted and provider rights confirmed. BeyondPresence Scale €349 may be more economical for 4 image-based fictional characters; benchmark their live-source recording and quality first.
- **TTS:** budget depends on exact vendor/voice minutes and commercial reuse. Need a current written quote. Do not pay per minute to animate presenters while source charts/interstitials are on screen.
- **Studio/graphics:** Codistan internal creative and technical engineering effort, not included above. For demo reserve ~12–25 person-days across studio/compositor, avatar/vendor integration, scripts/editorial/visual QA (planning estimate, not a supplier invoice).
- **Production storage/media/encoder:** demo can run local or on a controlled workstation; production 3–4 hour shared channel requires a persistent playout worker and redundant monitored feed. Quote after Tamasha ingest spec.
- **US market data broadcast rights:** not quoted by source providers; exchange redistribution/data-live rights can dominate SaaS spend. Demo should rely on original source-verified evergreen educational commentary **without fabricated live prices** until commercial licensing is arranged.
- **Tamasha distribution/CDN:** if Tamasha accepts a single encoded SRT/RTMP feed and handles its own viewers, we do not need to buy viewer CDN minutes. If Stocks distributes, total viewer-minute cost is separate.

## Client demo: exactly 155 seconds (2:35), approved only when real footage exists
Source of truth: [client-demo-155s.manifest.json](client-demo-155s.manifest.json).

| Time | Visual/source | Persona | Acceptance |
|---|---|---|---|
| 00:00–00:06 | original Tamasha × Stocks animated opening | none | exact logo only, not second back-wall logo |
| 00:06–00:29 | actual speaking AI stream composited into client-approved blue newsroom | Nora | real synced AI lips and proprietary fictional face |
| 00:29–00:53 | real streaming avatar medium close | Marcus | expression/headroom/voice stable |
| 00:53–01:08 | timestamped market chart source-board, no false numbers | VO | audio with no mismatched on-screen talking face |
| 01:08–01:30 | earnings update via separate fictional avatar | Avery (approval pending) | continuous performer motion |
| 01:30–01:52 | macro explainer, fourth fictional avatar | Jordan (approval pending) | independent identity/voice |
| 01:52–02:19 | **recorded, pre-approved viewer question demonstration** | Marcus | editorially safe, no false claim of real live response |
| 02:19–02:28 | real AI Nora close | Nora | same facial identity and newsroom |
| 02:28–02:35 | original closing ident | none | mastered audio/tail |
| **Total** | **2:35** | **Four fictional roles** | **Not client ready until real matched audio/video for each speaker exists** |

**Mandatory demo film standards:** 1920×1080 16:9 30fps (or source 25/29.97 per contract), natural lip-sync and gestures, speaker-to-speaker camera continuity, no pasted offices, source-driven background and independent sharp graphics, one original small brand bug, dated narration, full sound/caption/fact/rights review, no false LIVE. External clients receive only an **approved moving MP4**, not the operator rehearsal app or green-screen artifact.

## MVP segment architecture for 3–4h/day
**Four synthetic on-air editorial roles (working names; final casting approval pending):**
- Nora — prime desk, headlines, handoffs
- Marcus — markets, sectors, macro analysis, viewer Q&A
- Avery — technology and earnings
- Jordan — economic data, Fed, educational explanations

**Programme grid:** Morning Prep / Opening Bell / Sector & Mega Cap Watch / Earnings Desk / Macro & Fed / Interactive Market Clinic / Closing Outlook / source-labelled education & replay blocks. Separate LIVE discussion source from RECORDED/REPLAY, with automatic downgrade to neutral recorded slate if provider disconnects.

**Interaction pipeline:** viewer question ingestion → PII + harmful/trading-advice screening → evidence retrieval → reviewed candidate answer → editorial approval/signature → TTS → exact lip-synced avatar stream → segment switcher. Any pending/unsupported answer gets safe fallback, not AI stock speculation. Human editor can supervise invisibly.

**Broadcast infrastructure:** live RTC avatar feeds and TTS → secured media switcher → compositor/chroma keyed individual windows over owned studio → market ticker and charts from licensed source → approved scene playback & captions → one 1080p SRT/RTMP feed to Tamasha with standby/reconnect/health monitoring. Independent admin UI on Vercel, no paid source per viewer.

## Hard release blockers and what is implemented
Implemented on draft branch: 4-role demo manuscript, 155sec shot contract, cost model with sensitivity, provider source safety, moderated Q&A gate, deterministic 2–4 source program switcher and tests.

**Still not complete:** paid custom avatar creation or provider test; 2 high-res *native quality* single-subject portraits + 2 additional original cast looks; model/source video stream in our approved blue studio; 155sec professionally voiced MP4; LiveAvatar/Tavus account commercial rights; Tamasha ingest/US data licences; production persistent worker. Client demo pending. The current technical screenshot/HTML rehearsal cannot substitute for that film.

## Recommended commercial decision
**Procure only after:** vendor approves image-trained original fictional characters and confirms commercial broadcasting; demo budget signed. Start with a short 1-character provider test, compare against alternatives at real moving frames and costs; only then approve four-character 155sec full prototype. No unrestricted auto-overage or parallel billable generations.
