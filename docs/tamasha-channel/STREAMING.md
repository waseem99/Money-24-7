# Stage 2: playout, ticker and Tamasha delivery

## Selected architecture and server decision
Recommended software: FFmpeg continuous output + MediaMTX origin with TLS proxy and restricted administration. Linux long-running VM; separate render worker so paid jobs cannot starve playout. MediaMTX routes/packages streams; it is not a playlist scheduler or transcoder.
Start benchmark with dedicated/reserved 8vCPU,16GB RAM,100–200GB local media cache and SSD. This is a sizing hypothesis, not a certified capacity. Confirm CPU encoding capacity at required resolution/frame rate/bitrate with overlays in a 72h soak; upgrade or hardware-encode if it fails.
Hosting shortlist: existing reliable cloud account or a transfer-inclusive VM provider such as Hetzner, subject to region latency, account availability, transfer allowance, SLA and support review. Do not purchase before Tamasha protocol and transfer responsibilities are agreed. If uptime target cannot tolerate one host, use separate standby with mirrored released assets and independent health monitor. Warm standby is not seamless without a tested origin-switch design.
The supplied PC architecture is an alternative: main + backup playout PC, UPS sized from measured load/runtime, two independent ISPs and failover router. UPS switching tolerance must be tested with actual PC; do not assume all offline UPS units restart PCs or that a stabilizer is always required. Both Internet paths need adequate sustained upload; 3× bitrate is the source proposal's planning margin.

## Channel clock and output
Compile approved versioned 24h playlist: fresh premieres90m + valid dated repeats + licensed filler + continuity. Exactly account for wall-clock stings, ad slots and transition time; fresh editorial and total wall-clock duration are separate.
Normalize masters offline to the same timebase, codecs, dimensions and audio rate. Use a supervised continuous decode/composite/encode output; validate timestamps and A/V sync across boundaries. A playlist file alone is not a gapless service.
Keep next24h assets cached locally with checksum verification; at least2h playable runway at all times. Maintain a separately approved emergency slate/evergreen loop. Missing/expired/corrupt item routes to fallback and incident record. Fallback does not count as fresh output.
Persist current programme and elapsed position; restart policy resumes safely at segment/episode boundary and records discontinuity. Never rewind endlessly or emit duplicate fresh-air counts.
Programme-specific graphics burned into masters; live channel bug/ticker/clock composed once at output to avoid duplicate logos. Set safe areas, keep captions above ticker; prove Urdu shaping and scrolling at actual 1080p.

## Ticker
Acquire a licensed broadcast/redistribution feed before showing market quotes. Public web access does not grant ticker rights. Separate PSX, global indices, FX, commodities and crypto sources/session rules.
Schema: instrument, venue, last, change, change_pct, currency, unit, source, source_time, received_time, session, delay_seconds, valid_until, entitlement_id.
Validate symbol mapping, timestamps, unit/currency, outliers, duplicate/out-of-order updates and trading calendar. Never invent missing values.
Render source timestamp and REALTIME/DELAYED/CLOSED status according to contractual source; measured delay is not promised 10–15 seconds without vendor evidence.
Proposed policy: during open market mark stale after max(3× contracted update interval,60s); suppress numeric quotes after5m without valid refresh. Delayed/end-of-day feeds use their declared schedule, not the realtime TTL. These thresholds require editorial sign-off.
On outage show “Market data temporarily unavailable” or approved non-numeric headlines; do not leave a frozen price looking current. Closed session may display dated official close under a CLOSED label.
Keep current ticker independent of recorded programme charts; replay programmes labelled with edition/date so historical discussion cannot masquerade as live news. Headline ticker items also require review and expiry.
Sanitize input and render as text, never executable HTML/commands. Atomic snapshot swap; no restart of stream on normal updates.

## Delivery contract to obtain from Tamasha
- Push ingest (RTMPS/SRT) OR pull playback (HTTPS HLS .m3u8); primary/backup endpoints.
- H.264 profile/level,1080p or720p,25/30fps,bitrate/VBV,GOP/keyframe interval, audio codec/rate/channels/loudness.
- HLS segment/playlist length, codecs/ABR ownership, latency target, reconnect expectations.
- Who owns CDN/viewer bandwidth, TLS/domain, geo restrictions/auth, transcoding, monitoring and SLA?
- EPG format/timezone, logo/poster IDs, ad breaks/SCTE-35 requirements, blackout and emergency procedures.
- Test window, escalation contacts and acceptance evidence.
Do not provide RTMP ingest URL as if it were a public playback link. Example only: https://stream.example.com/marketwatch/index.m3u8. A real endpoint is issued after deployment, TLS/auth and Tamasha ingest validation.
Prefer Tamasha pulling one origin feed or accepting one push and distributing through their CDN. If we serve viewers directly, budget CDN per viewer, token authentication, cache policy and load testing separately.

## Operations and security
systemd/container restart policies; pinned versions; private DB/object storage; secret manager; separate publish/read credentials, IP restrictions where supported. Never put stream keys in logs/GitHub/Drive. TLS termination and credential rotation; restricted origin access prevents CDN bypass.
Monitor from a different host: advancing HLS sequence/timestamps, segment age, decode health, silence/black/freeze, audio peaks, ticker age, buffer runway, CPU/disk, certificate expiry and outbound traffic.
Starting targets: detect loss in30s, page operator in60s, recover/fallback within120s; prove through drills, not claims. On-screen-static content needs exemptions from freeze alarms.
Keep as-run logs with actual start/end/master SHA, playlist version, reasons for substitution and interrupted duration. Daily report: fresh aired minutes, missing premieres, repeats, latency, spend and incidents.
Back up DB daily with point-in-time recovery if available; immutable master/approval storage; test restore monthly. Suggested retention: intermediate takes30d, masters90d, rights/release/as-run1y subject to client contract. Proposed RPO≤24h for configuration backup, near-zero release loss via durable object store/outbox; RTO≤2h for full rebuild, separate from short standby failover.
