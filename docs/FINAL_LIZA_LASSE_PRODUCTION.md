# SIGNAL Financial News — FINAL locked actors, voices and production plan

**Authoritative as of 12 October 2026.** User expressly selected **Liza and Lasse**, superseding provisional Rumi/Kevin and rejected Araj casting. Do not reopen presenter selection without user instruction.

## Identity, formal outfit and voice locks

| On-air role | Exact existing formal provider look | Voice (separate from provider default) | Provider record |
| --- | --- | --- | --- |
| Liza — lead female anchor | **Liza Office 6**, grey business blazer, formal white blouse, source 1920x1080 | **Annie — Lifelike**, Starfish voice \`330290724a1b470fb63153f34d4c0183\` | photo_avatar look \`5ee67ac453c34ffebd71e8eedb47b2fe\`, group \`3727ecd034ef4248afea2a3443f7d2b7\` |
| Lasse — male markets analyst | **Lasse Office 3**, grey blazer, collared pale-blue business shirt, source 1920x1080 | **Orson — Firm & Measured**, Starfish voice \`00e3d285aba44b27a83c47c02c9c2d9c\` | photo_avatar look \`de9f36c26bd841c891489a0c9d6174de\`, group \`46782f6d3de64ed98cec7f47d3d21ae7\` |

Existing no-spend appearance preview sources:
- [Liza Office 6 — exact still](https://resource2.heygen.ai/public-avatars/Liza/paos/angles/office83_p3_a1.jpg); [existing moving preview](https://resource2.heygen.ai/public-avatars/Liza/image_videos/office83_p3_a1.mp4)
- [Lasse Office 3 — exact still](https://resource2.heygen.ai/public-avatars/Lasse/paos/angles/office120_p3_a1.jpg); [existing moving preview](https://resource2.heygen.ai/public-avatars/Lasse/image_videos/office120_p3_a1.mp4)
- [Full side-by-side reference gallery (nine Liza office looks, twelve Lasse office looks)](https://github.com/waseem99/Money-24-7/actions/runs/38211400890/artifacts/11729416398)

**Wardrobe is solved without editing identities:** both selected looks already visibly wear business blazers/shirts; no paid Look Pack, monthly HeyGen plan or unauthorized public-identity clone is needed. HeyGen GET verified both selected looks are complete and supported on \`avatar_iii\` and \`avatar_iv\`. A separate read-only encrypted API test confirmed both exact look IDs and Annie/Orson voice IDs in the direct API account: [GitHub run #38212362518](https://github.com/waseem99/Money-24-7/actions/runs/38212362518).

**Critical realism tradeoff:** These are PUBLIC **Photo Avatars**, not video-trained digital twins. Existing preview images prove attire, but real generated human-like eye/mouth/hands and matched Annie/Orson voices must pass a short real API audition. Do not label synthetic sample media as authentic footage or promise real-film naturalness until reviewed. All previous Araj and Rumi/Kevin source clips are discarded from new film.

## Approved newsroom design reused — not recreated

Use the exact existing source system in \`src/broadcast/render.js\`, \`src/broadcast/timeline.js\`, \`pilot/v2/render.mjs\`: deep navy **#07162a**, teal **#41e0d0** identity, SIGNAL header, 16:9 1920x1080/30fps, professional headliner/lower-third, presenter titles, synthetic or properly licensed financial ticker, simulated data time/source disclosures, well-timed board and chart cutaways (OHLCV, volume, SMA/EMA/RSI/MACD). Use \`pilot/v2/three-minute-plan.mjs\` for the 11-beat 180-second editorial roadmap. The 3-minute real compositing pipeline still requires a separately tested source-binding/FFmpeg workflow — a shotlist is not a finished film.

For the first master, avoid impossible two-person listener/reaction loops and alpha standing body shots unless actual source footage supports them. Instead alternate verified **single speaking presenter** shot with full-screen chart/board cutaways while their real generated audio continues. Use genuine broadcaster roles, accurate subtitles, calm pacing, realistic cuts, short branded intro/outro and no unsupported claims of breaking/live financial data.

## Cost-sensitive engine strategy (API pay-as-you-go)

Official [HeyGen API pricing](https://help.heygen.com/en/articles/10060327-heygen-api-pricing-explained) lists **Photo Avatar III $1 / generated minute** and **Photo Avatar IV $3 / generated minute** at 1080p (billed on actual seconds). Current short audition default: **Avatar III**, one 10–20 second clip per selected presenter. Test the real video before choosing whether a higher-quality Avatar IV trial is justified.

The target **180-second, 11-shot** film has nine scripted speaking beats and 171 seconds of speaking footage in the editorial plan: about **$2.85 at Avatar III**, or **$8.55 at Avatar IV**, excluding rounding, retakes, audience graphics, setup, local processing and existing test usage. The $3.30 estimated III reservation includes three seconds of cushion per speaking scene but is not a provider hard wallet limit. Account balance, invoices, recharge settings and endpoint rates must be reviewed before the full-film release. **Do not launch 9 paid clips as one blind batch**.

## Release gates

1. Cast/voice look and formal attire: **selected and verified by free catalog + preview review**.
2. Exact direct API identity/voice access: **verified via authenticated GET**.
3. GitHub unit, build and synthetic 1080p media validation: **must be green** for the current cast commit.
4. Generate **one short Liza+Annie** and **one short Lasse+Orson** paid sample at most, each with a unique single-use GitHub tag created BEFORE its provider POST; never retry a network-uncertain request without reconciling the provider job.
5. Inspect each real output: face correct, natural lips/eyes/teeth, plausible movements, no clothing/voice mismatch, clean formal background/framing. If Photo Avatar III quality is weak, do not spend three minutes at that quality; choose whether a short IV trial or an approved alternative is warranted.
6. After the two samples pass stakeholder-quality review and the payment budget is agreed, generate 180-second speaking takes **one by one**, then combine the moving Signal newsroom graphics, lower-third/headline straps, ticker, accurate chart cue timing and captions into a downloadable final master.
7. Full human film QA; only then seek permission for 5-minute expansion or 24/7 stream.

**Current real footage: no Liza/Lasse user-reviewed speaking performance yet. The previous completed Rumi/Annie and Araj tests are historical and NOT source footage for this final pair. Full master remains unrendered.**
