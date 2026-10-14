# STOCKS / Camera-safe Broadcast Studio (14 October 2026)

Standalone visual rehearsal: open `studio/index.html` in a browser. No account, provider calls or paid inference are needed. Select the six camera families (A, B, C, D, R, F) and toggle **Show head-safe guides**.

This is **not** real presenter video. The figures are deliberate illustrated stand-ins used to check geometry. The programme and 17-shot source script live in the separate approved 12 October 2026 storyboard; this page shows the camera families, not a new replacement news script.

## Technical fixes included in the companion branch

The R4+ FFmpeg compositor previously used a fill-and-centre-crop recipe for every presenter source: `scale=772:405:force_original_aspect_ratio=increase,crop=772:405`. It now uses fit-and-pad at the same output size, preserving the whole source instead of cropping hair or face. A matte fills any difference in aspect ratio. This can **prevent new cropping introduced during composition**; it cannot recover portions already absent from the underlying HeyGen recording.

## Production gates

1. Confirm Nora / Marcus on-air roles against approved real cast and voices. The previous R4+ source-footage labels were Liza and Lasse; avoid inadvertently mixing an earlier cast with the 4:20 Nora/Marcus storyboard.
2. Review real full-HD media against all six camera guides, inspecting headroom at each frame rather than approving from placeholders.
3. Require a genuine native two-person plate or an explicitly remote split; do not manufacture shared-desk people using incompatible separate HeyGen backgrounds.
4. Cast/license the remote correspondent before replacing the placeholder. A standing analyst scene also remains conditional on compatible provider footage.
5. Publish a labelled recorded edition only: no fake LIVE badge or invented charts.
6. Keep the delivered 2:27.774 R4+ master unchanged until the edited pipeline is rerendered and human QA signs off.

## Deployment

The old Cod 3 Vercel studio domain currently returns 404. The new connected Cod 5 scope reported forbidden when trying to create the `stocks-newsroom-studio` Vercel project (14 Oct 2026). Connect authorized Vercel access before deploying; the static `studio/` directory can be deployed as a Vercel static project or via GitHub integration. Do not silently route it to the old Cod 3 team.

No paid HeyGen video calls were made in this change.
