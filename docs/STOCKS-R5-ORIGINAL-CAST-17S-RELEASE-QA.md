# Stocks R5 — original-approved cast restored / 17.77s spoken newsroom cut

**Status:** COMPLETED TECHNICAL QUALITY TEST; HUMAN REALISM / PERFORMANCE SIGN-OFF STILL REQUIRED.
**Edition:** Monday 12 October 2026; **Reuters observation:** 09:40 ET, not a live data feed.

## Why R5 exists
The stakeholder rejected the intervening Caroline/Brandon cast and their slow/artificial delivery, preferred the earlier approved Liza/Lasse faces, and asked for a careful correction. R5 restores them **without another recast**, removes long silences and increases editing pace rather than trying to synthesize new faces or conceal the problems with static images.

### Exact successfully generated PAID sources (each submitted once, immutable GitHub tag)
| On-air | User-approved HeyGen public Photo Avatar | Original voice | Completed provider ID | Native duration |
| --- | --- | --- | --- | --- |
| Nora Ellery | Liza Office 6, `5ee67ac453c34ffebd71e8eedb47b2fe` | Annie – Lifelike, `330290724a1b470fb63153f34d4c0183` | `f0a2771ab6e9cfdd82306b9c4aff5e33` | 7.34041s |
| Marcus Varden | Lasse Office 3, `de9f36c26bd841c891489a0c9d6174de` | **Orson – Firm & Measured**, `00e3d285aba44b27a83c47c02c9c2d9c` | `d8808e9850b76dd38d550d5b5f0ccaf7` | 12.591s |

The previous Orson incompatibility arose with the **Brandon** studio avatar, not the originally approved Lasse look; the original Lasse/Orson pairing has now been verified by a successful actual 1080p generation.

### Finished quality-test film
- Filename: `STOCKS-R5-Original-Liza-Lasse-Newsroom-Approval-1080p.mp4` (conversation artifact supplied to stakeholder).
- **17.774 seconds**, 1920×1080, 30fps, H.264 video + AAC stereo 48kHz.
- SHA-256: `3c3369472e10fb094779b632a78d40e6dc5ef0a6c0648bc548c56d0c937c640d`.
- Full video/audio decode: **PASS**; no extended black frames; mean audio −21.4 dBFS, peak −4.2 dBFS. Audio is genuine from the two voice/face-matched paid sources, NOT separately dubbed.
- Sources were recovered through [GET-only/matting run #38318878319](https://github.com/waseem99/Money-24-7/actions/runs/38318878319); no extra HeyGen requests were made during compositing.
- Original provider voices and mouth performance were aligned through video timebase and audio `atempo=1.08`; two source-silence intervals (6.80–7.03s and 9.05–9.52s on the pretrim edit) were shortened *with video and audio simultaneously*, reducing the runtime without removing spoken words.
- Video-trained Caroline/Brandon trial is archived in the previous PR, **not** the R5 source; all active presenter pixels are from the two restored Liza/Lasse Photo Avatar clips.
- Newsdesk glass foreground uses an opaque desk-occlusion transition rather than ghosted partial body transparencies.
- A single small original T + **Stocks** icon is present as a top-left broadcast bug; there is **no** big background logo, no GPT, no repeated logo or artificial LIVE.
- Frames cut between each *real moving speaking face* and a two-bar Reuters sector comparison. No separately frozen listening-person still is used. Do not claim this proves real listener reactions or spontaneous interactive eye contact.

### Verified historical editorial information
[Reuters 12 Oct 2026, 09:40 ET](https://www.reuters.com/business/us-stock-futures-muted-oil-stays-above-100-ahead-earnings-2026-10-12/)
- Dow 51,761.98 (+0.21%)
- S&P 500 7,817.68 (+0.08%)
- Nasdaq composite 27,355.94 (−0.04%)
- Energy +1.8%, technology −0.2%
- Large US banks' earnings scheduled Tuesday 13 October; September CPI scheduled Wednesday 14 October.

No fictional candle series, dummy headlines or time-scrubbed market quotes in R5.

### Runtime quality-gate result
**Technically passed; commercially unapproved.** The original public Photo Avatars can still look synthetic because RVM foreground isolation, faster edits and a larger newsroom cannot change their underlying facial-acting engine. Human assessment of mouth/eye expressions, body language, voice naturalness, camera composition and perceived pacing remains required.

The current 17-shot **4:20 film, remote correspondent, standing charts, and realistic simultaneous reaction takes are NOT produced**. Review this exact R5 cut before approving costly full-show generation; do not silently regenerate presenters or extend the show on account credits.

### Reproduction handoff
The stakeholder ZIP delivered with the test includes the exact local `render_r5.py` compositor, QA JSON, review-sheet JPG and MP4. Continue from the original provider take IDs, original voices and Reuters snapshot; do not reuse newer Caroline/Brandon as released actors.
