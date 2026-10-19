# Nora lip-sync correction — prepared, not submitted

The 48-second Business Brief and its studio direction are approved by the user. Nora's mouth synchronization needs correction.

## First bounded test
Use the existing 12-second opening scene, video ID 744502c4fd844a4c8967e9787410f448. Extract its own audio without changing words, speed, or voice. Submit that video plus the extracted audio to POST /v3/lipsyncs with mode precision, enable_dynamic_duration false, enable_speech_enhancement false, keep_the_same_format true, fps_mode passthrough. Do not regenerate the studio or narration.

The request has NOT been submitted. Automatic approval review rejected uploading the derived audio to HeyGen because explicit permission for this export was missing. Do not substitute another upload mechanism or run a GitHub workflow to bypass the rejection. Await explicit authorization for sending Nora's derived audio to HeyGen for lip-sync correction.

## Validation
The documented API does not expose a speaker-selection parameter. Both presenters are visible. Test only the opening first; reject the result if Marcus's mouth is animated to Nora's speech, or either face/scene is materially altered.
Compare original and processed footage against identical source audio, focusing on consonant closures, speech onset/offset and pauses. Check duration, frame count and audio alignment. Do not call frame inspection alone proof of lip-sync accuracy.
If accepted, repeat on Nora's cash-flow scene (0586bcddb3294f1f8e60722a5b6e737c), then replace only those two scene inputs and rerun the existing finishing pass. Retain the approved original and deliver a separate revised export.
No automatic paid retries. Record returned job IDs immediately and recover existing jobs after interruptions.

Documentation: https://developers.heygen.com/lipsync-precision
