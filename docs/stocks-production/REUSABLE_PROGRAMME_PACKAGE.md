# Stocks reusable programme package

The refined navy/ivory/champagne/teal design is applied to a 63.875-second educational programme preview. This is a continuity sample, not live news or a complete channel.

## Rundown

| Start | Duration | Segment |
| --- | --- | --- |
| 0 | 5 | The Business Brief opener |
| 5 | 8 | Nora and Marcus: beyond revenue |
| 13 | 12.25 | Marcus: operating margin |
| 25.25 | 12.25 | Nora: cash generation |
| 37.5 | 12.25 | Marcus: earnings checklist |
| 49.75 | 8.875 | Spoken close / coming up |
| 58.625 | 5.25 | Earnings Explained opener |

Presenter footage and voices are reused from existing approved project assets. No new paid avatar jobs were submitted. Earlier source-scene lip-sync limitations remain; this change addresses graphic consistency and programme continuity.

## Repeatable rendering

`python3 production/broadcast-sample/render-programme.py OUTPUT_DIR MEDIA_ROOT production/broadcast-sample/programme-rundown.json`

Dependencies: Python, Pillow, NumPy, ffmpeg/ffprobe and Nimbus Sans fonts (as used by stocks-orbit.py). Existing media must be supplied under MEDIA_ROOT according to the JSON paths. These media are not embedded in the repository.

Edit the JSON to change headlines, presenter labels, topic bands, ticker text, clip order and durations. The graphics import the shared globe, identity, palette and typography from stocks-orbit.py. The renderer checks media existence, source duration, voice truncation and label width before encoding. It writes the output MP4 and a timed rundown alongside segment intermediates.

The ticker is generated continuously from the rundown's educational copy; there is no live market-feed connection. Operating margin is a formula overlay over moving studio footage. No unverified current prices are shown. The next-show opener demonstrates handoff only; a full second programme is not included.

## Scope remaining

Production scheduling, verified news/data ingestion, new episode scripts and voice generation, final lip-sync correction, 1080p masters, transmission monitoring and Tamasha/YouTube delivery remain separate stages. The palette is carried forward; this does not claim those stages are complete.
