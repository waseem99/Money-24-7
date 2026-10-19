# Stocks access and integration audit — 19 October 2026

Scope: read-only provider requests, existing read-only workflow re-runs and repository inspection. No speech/video creation, session minting, purchases or credential extraction. Account amounts are reported privately to the project owner; credentials and signed asset URLs are not recorded here.

## Verified now

- Connected HeyGen account lookup succeeds. Connector reports a Free subscription and no wallet object. This is not the billing result from the separately configured repository API key; do not infer zero API funds or assume identical workspace scope.
- GitHub HEYGEN_API_KEY authenticated via GET /v3/users/me with HTTP 200 and a positive USD wallet. Evidence: run 38733571084, latest job 117985993176, 2026-10-19. Zero generation calls.
- Private avatar groups AND looks catalogs return exactly three completed photo-avatar looks: Stocks Nora Fictional TV News Anchor V1, Stocks Marcus Fictional TV News Analyst V1, Stocks Virtual Correspondent Alex - AI Original v1. One look each; landscape source 2752x1536; catalog reports avatar_v/avatar_iv/avatar_iii. All default_voice_id fields are null; preview_video_url fields are null. Catalog support is not a successful rendering/quality test.
- Both connected private voice catalogs return empty lists (no additional pages). This does not imply public voices are unavailable.
- Funded-key GET voice lookups return HTTP 200 for Amina - IA (female English; 47211675cf674b82aa4fdbe6a785c9b3) and Dexter - Professional (male English; 7a544b76e07648849ed54617f18ea280). Evidence: run 38733571261, latest job 117986098334. These match the older behind-move-lines.json bindings. No new speech rendered. Voice entries report support_interactive_avatar:false; previous pipeline supplied external audio, not a verified native interactive voice binding.
- Separate LiveAvatar key authenticated via credits lookup. Public catalog includes active Amina in Blue Suit and Dexter Lawyer plus additional variants. Evidence: run 38712976771, latest job 117986326980. No session started.
- PR #63 CI run 39227390511 completed successfully on its initial four-file commit. This is software verification, not media realism.

## Repository findings

1. main/pilot/providers.mjs speech() requires ELEVENLABS_API_KEY, model and per-speaker voice settings. Avatar generation requires per-speaker HEYGEN IDs. .env.example contains placeholders; examples do not establish deployed secret configuration. No authenticated ElevenLabs account check was available in this audit. Status UNVERIFIED, not absent.
2. The previously successful branch uses HeyGen speech plus separately captured LiveAvatar footage. It is a different path from main's ElevenLabs-first adapter. Preserve working voice IDs and converge adapters before new production.
3. Legacy catalog workflow sends unsupported search_query to /v3/avatars; both avatar searches return HTTP 400 even though the workflow reports success. Voice reads succeed. Replace this check with supported paginated looks/groups discovery and semantic failure checks in the next implementation step.
4. Main avatar adapter does not explicitly pin engine; current docs say omitted engine defaults to IV. Add an explicit tested engine to the future identity profile so cost/behaviour do not depend on defaults.
5. Transparent output requires matting support. Catalog engine lists alone do not prove that these specific photo avatars support it. Do not certify studio compositing until a real output is decoded and inspected.
6. Older ai-native-character-and-studio.example.json is explicitly planning-only: 3D asset hashes/voice IDs null and geometry unapproved. Its Unreal/body requirements and US-only assumptions are superseded by the current execution plan; it is not an existing studio asset inventory.

## What remains unverified

- RESOLVED: funded-key access to all three private looks passed exact-ID checks in run 39232885976, job 117994863786. All completed photo avatars report Avatar IV support. Both exact voice checks also passed; zero generation calls.
- Final Nora/Marcus voice bindings and suitability for the new reference target. Existing Amina/Dexter narration is an available candidate, not a newly approved character pairing.
- Other vendor's presenters, studio source files, voice assets and rights. They were not found in the three returned private character entries.
- Eight-person production cast, natural paired listening, entrances, matting and repeatability. None established by catalog completion.
- Current ElevenLabs and LLM production credentials, Tamasha contribution endpoints, YouTube ingest access and contracted redistribution rights. No claims of readiness.

## Next implementation

Completed: fixed identity candidate manifest, semantic read-only exact-ID workflow, and offline four-turn audition payload preparation with explicit HeyGen speech/Avatar IV bindings and duration/cost checks. See FIXED_CAST_AUDITION.md. Local suite: 88 tests passed. Alex remains disabled without a voice. Still pending: gated paid submission integrated with the job ledger, main adapter convergence, and real rendered performance/compositing review. No new subscription is justified by this audit alone.

Documentation checked: https://developers.heygen.com/generate-avatar-video and https://developers.heygen.com/transparent-background-videos . Default engine and transparency statements are capability documentation, not proof of the specific assets' output.
