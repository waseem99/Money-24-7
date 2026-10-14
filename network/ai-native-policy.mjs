/**
 * STOCKS AI-NATIVE ONLY creative source contract.
 * Fictional rigged digital humans in one Unreal room; never on-air real actors.
 * Pure deterministic policy: no GPU, video/TTS API, camera capture or playout.
 */
const HEX64=/^[a-f0-9]{64}$/i;
const REQUIRED_ROLES=['NORA','MARCUS'];
const REQUIRED_CAMERAS=['A_WIDE','B_MARCUS','C_NORA','D_GRAPHICS'];
export const AI_MANDATE=Object.freeze({
  channel:'Stocks',
  coverage:'US_MARKETS_ONLY',
  casting:'FICTIONAL_AI_CHARACTERS_ONLY',
  forbiddenSources:Object.freeze(['HUMAN_FILMED_ACTOR','PHOTO_AVATAR_OFFICE_CLIP','HUMAN_DIGITAL_TWIN','REAL_PERSON_CLONE','GENERATIVE_UNTRACKED_FACE']),
  visualReferencePurpose:'CREATIVE_DIRECTION_ONLY',
  characterMethod:'APPROVED_VENDOR_STREAM_OR_ORIGINAL_RIGGED_3D',
  renderingScenes:Object.freeze(['ONE_COMPOSITED_STUDIO','ONE_SHARED_UNREAL_LEVEL']),
  allowedSources:Object.freeze(['CUSTOM_FICTIONAL_STREAMING_AVATAR','ORIGINAL_RIGGED_3D']),
  audioToFaceMethod:'LICENSED_REALTIME_AVATAR_OR_META_HUMAN',
  dataGraphicsMode:'DETERMINISTIC_SOURCE_DRIVEN',
  onAirHumansPermitted:false,
  paidAiGenerationAuthorized:false,
  ready:false
});
const validHash=s=>typeof s==='string'&&HEX64.test(s);
const nonempty=s=>typeof s==='string'&&s.trim().length>0;
export function auditAICast(manifest,{release=false}={}){
  const errors=[];
  if(!manifest||typeof manifest!=='object')return {pass:false,releaseReady:false,errors:['Manifest missing']};
  if(manifest.channel!==AI_MANDATE.channel||manifest.marketScope!=='US_MARKETS')
    errors.push('Non-US or wrong programme');
  if(manifest.castingPolicy!==AI_MANDATE.casting)errors.push('Not explicitly AI-only original fictional talent');
  if(manifest.humanOnAir!==false||manifest.noHumanRepresentativesVisible!==true)
    errors.push('Human representatives/actors cannot appear on-air');
  if(manifest.automaticPaidProviderJobsEnabled!==false)
    errors.push('Automatic billable AI video/voice generation is not authorized');
  if(manifest.approvedConcept?.purpose!==AI_MANDATE.visualReferencePurpose)
    errors.push('Generated image is reference only, not a character rig or source footage');
  if(manifest.approvedConcept?.referenceIsCreativeOnly!==true)
    errors.push('Illustrative figures/characters in concept art cannot be used as finished broadcast data or frames');
  if(manifest.graphicSystem?.bugCount!==1||
     manifest.graphicSystem?.bugPosition!=='TOP_LEFT_ONLY'||
     manifest.graphicSystem?.marketValuesGeneratedByImageModel===true)
     errors.push('Stocks broadcast graphics system does not meet brand/data lock');
  const set=manifest.studio||{};
  const studioOK=(set.engine==='UNREAL_ENGINE'&&set.sceneMode==='ONE_SHARED_UNREAL_LEVEL')||
    (set.engine==='WEBRTC_COMPOSITOR'&&set.sceneMode==='ONE_COMPOSITED_STUDIO');
  if(!studioOK)
    errors.push('Newsroom must be one owned WebRTC compositor or one shared Unreal 3D Level');
  if(set.hasBakedPresenters||set.hasBakedMarketFigures||set.hasRepeatedBackWallLogo)
    errors.push('Room contains unapproved 2D baked characters, numbers or duplicate bug');
  if(!nonempty(set.levelId))errors.push('No stable newsroom scene identifier');
  const cameras=Array.isArray(set.cameras)?set.cameras:[];
  if(new Set(cameras.map(c=>c.id)).size!==cameras.length)errors.push('Duplicate camera');
  for(const id of REQUIRED_CAMERAS){
    const c=cameras.find(x=>x.id===id);
    if(!c||c.levelId!==set.levelId)errors.push('Camera '+id+' is absent or from different Level');
    if(release&&(!validHash(c?.renderTestSha256)||c?.lightingContinuityApproved!==true))
      errors.push('Camera '+id+' missing matched-view visual proof');
  }
  const chars=manifest.characters||{};
  for(const role of REQUIRED_ROLES){
    const c=chars[role]||{};
    if(!nonempty(c.characterId)||c.identityType!=='FICTIONAL_ORIGINAL'||
       !AI_MANDATE.allowedSources.includes(c.assetSource)||c.isHumanLikenessClone!==false)
      errors.push(role+' must be an approved original fictional digital character');
    if(c.voice?.kind!=='SYNTHETIC_TTS')errors.push(role+' missing synthetic licensed voice profile');
    if(AI_MANDATE.forbiddenSources.includes(c.assetSource))errors.push(role+' uses forbidden source class');
    if(release){
      if(c.assetSource==='ORIGINAL_RIGGED_3D'){
        for(const field of ['meshSha256','groomSha256','wardrobeSha256','rigSha256'])
          if(!validHash(c[field]))errors.push(role+' missing immutable versioned '+field);
      } else if(c.assetSource==='CUSTOM_FICTIONAL_STREAMING_AVATAR'){
        if(!nonempty(c.vendor?.name)||!nonempty(c.vendor?.avatarId)||
           !validHash(c.vendor?.identityReferenceSha256)||c.vendor?.fictionalImageEligibilityApproved!==true||
           c.vendor?.realMotionQualityApproved!==true||c.vendor?.broadcastRightsApproved!==true)
          errors.push(role+' custom streaming avatar identity, motion, licence and account are not approved');
      }
      if(!nonempty(c.voice?.voiceId)||!c.voice?.broadcastUsageApproved)
        errors.push(role+' missing synthetic voice ID/commercial usage approval');
      if(c.visualIdentityApproved!==true)errors.push(role+' fictional appearance not artist/client approved');
    }
  }
  if(release){
    if(manifest.broadcastProvisioned!==true)errors.push('A real video/broadcast worker is not provisioned');
    if(!validHash(set.levelSha256)||set.geometryApproved!==true)
      errors.push('Studio Level/compositor design and broadcast geometry not approved');
    if(!validHash(manifest.approvedConcept?.referenceSha256))
      errors.push('Exact approved design still lacks source checksum');
    if(!manifest.performanceProof||!validHash(manifest.performanceProof.renderSha256)||
       manifest.performanceProof.durationSeconds<90||
       !manifest.performanceProof.twoSpeakerTurnsApproved||
       !manifest.performanceProof.listeningReactionApproved||
       !(manifest.performanceProof.deskAndHandContactApproved===true||
         (manifest.performanceProof.sharedDeskNotClaimed===true&&manifest.performanceProof.professionalSoloCutsApproved===true))||
       !manifest.performanceProof.lipsyncApproved||
       !manifest.performanceProof.humanCreativeQAApproved)
      errors.push('No genuine signed 90-second fully digital two-person motion proof');
    if(!manifest.productionRights?.characterAssets||
       !manifest.productionRights?.broadcastUse||
       !manifest.productionRights?.studioAssets)
      errors.push('Missing digital character/studio on-air usage rights');
    if(manifest.releaseApproved!==true)
      errors.push('Human producer has not approved release');
  }
  return {pass:errors.length===0,
    releaseReady:release && errors.length===0 && manifest.broadcastProvisioned===true,
    errors,
    aiOnly:true,
    onAirHumansPermitted:false,
    newPaidGenerationAuthorized:false};
}
