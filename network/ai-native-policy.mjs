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
  characterMethod:'ORIGINAL_RIGGED_3D',
  renderingScene:'ONE_SHARED_UNREAL_LEVEL',
  audioToFaceMethod:'META_HUMAN_AUDIO_DRIVEN',
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
  if(manifest.humanOnAir===true)errors.push('Human representatives/actors cannot appear on-air');
  if(manifest.approvedConcept?.purpose!==AI_MANDATE.visualReferencePurpose)
    errors.push('Generated image is reference only, not a character rig or source footage');
  if(manifest.approvedConcept?.referenceIsCreativeOnly!==true)
    errors.push('Illustrative figures/characters in concept art cannot be used as finished broadcast data or frames');
  if(manifest.graphicSystem?.bugCount!==1||
     manifest.graphicSystem?.bugPosition!=='TOP_LEFT_ONLY'||
     manifest.graphicSystem?.marketValuesGeneratedByImageModel===true)
     errors.push('Stocks broadcast graphics system does not meet brand/data lock');
  const set=manifest.studio||{};
  if(set.engine!=='UNREAL_ENGINE'||set.sceneMode!==AI_MANDATE.renderingScene)
    errors.push('Newsroom must be one shared Unreal 3D Level');
  if(set.hasBakedPresenters||set.hasBakedMarketFigures||set.hasRepeatedBackWallLogo)
    errors.push('Room contains unapproved 2D baked characters, numbers or duplicate bug');
  if(!nonempty(set.levelId))errors.push('No stable Unreal newsroom Level identifier');
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
       c.assetSource!=='ORIGINAL_RIGGED_3D'||c.isHumanLikenessClone!==false)
      errors.push(role+' must be an owned/approved original fictional 3D character');
    if(c.voice?.kind!=='SYNTHETIC_TTS')errors.push(role+' missing synthetic licensed voice profile');
    if(AI_MANDATE.forbiddenSources.includes(c.assetSource))errors.push(role+' uses forbidden source class');
    if(release){
      for(const field of ['meshSha256','groomSha256','wardrobeSha256','rigSha256'])
        if(!validHash(c[field]))errors.push(role+' missing immutable versioned '+field);
      if(!nonempty(c.voice?.voiceId)||!c.voice?.broadcastUsageApproved)
        errors.push(role+' missing synthetic voice ID/commercial usage approval');
      if(c.visualIdentityApproved!==true)errors.push(role+' fictional appearance not artist/client approved');
    }
  }
  if(release){
    if(!validHash(set.levelSha256)||set.geometryApproved!==true)
      errors.push('Studio Unreal Level and desk geometry not approved');
    if(!validHash(manifest.approvedConcept?.referenceSha256))
      errors.push('Exact approved design still lacks source checksum');
    if(!manifest.performanceProof||!validHash(manifest.performanceProof.renderSha256)||
       manifest.performanceProof.durationSeconds<90||
       !manifest.performanceProof.twoSpeakerTurnsApproved||
       !manifest.performanceProof.listeningReactionApproved||
       !manifest.performanceProof.deskAndHandContactApproved||
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
