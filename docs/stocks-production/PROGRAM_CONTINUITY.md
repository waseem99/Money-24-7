# Program continuity package

## Implemented preview
The Business Brief opener → approved studio sample → Marcus voiceover closing and introducing Earnings Explained → two-second Stocks junction → Earnings Explained opener → explicitly labeled reused margins excerpt → preview end.

The two program titles have separate amber and teal accents within a shared Stocks motion system. Motion graphics and a synthesized original audio sting are generated locally; no external music licensing is assumed. Three new exact-script voiceovers use the bound Nora/Marcus voice IDs. No presenter video regeneration was requested. Provider speech run: https://github.com/waseem99/Money-24-7/actions/runs/39246277962 .

The studio excerpt in the second show is intentionally reused to demonstrate continuity, not a newly produced episode. The existing studio lip-sync/script caveats remain. This package is not a live channel deployment.

## Episode contract
Each episode needs program ID, episode ID, editorial title, approved script, fixed speaker IDs, source timestamps, measured media duration, graphics cues, next-program ID/title, opener/closer versions and review status. The next-program card must be derived from the actual next approved item, not generated independently by the narration model.

## Next implementation gates
1. Exact-script speech for all studio turns; verify against transcript before rendering.
2. Apply audio-driven lip-sync, then inspect both visible presenters and source-audio continuity.
3. Assemble a fresh second episode, preserving the approved studio and graphics templates.
4. Introduce a playout queue that preloads and probes the next approved asset, plays it once, records actual start/end and falls back to a reusable holding loop if the next asset is missing. Do not loop anchors to hide missing content.
5. Keep ticker time continuous across studio segments; suppress it deliberately during program idents and restore current data at the next studio shot.
6. Validate a local continuous transmission rehearsal before obtaining platform-specific ingest settings and publishing to YouTube or Tamasha.

Duration is read from media, not rounded provider metadata. The sample's four studio clips are 12.25 seconds each, totaling 49 seconds before packaging.
