/**
 * Formal wardrobe acceptance gate for the final Jazz AI Channel film.
 *
 * HeyGen public digital twins supplied only casual video looks when checked.
 * Do NOT confuse an approved face or public-avatar gender with a suitable
 * professional outfit, permission to remix a public identity or an approved
 * new talking-avatar source.
 *
 * This module is PURE: no provider requests and no spending.
 */
import {proposedPresenters} from './budget-preflight.mjs';

export const formalWardrobeBrief=Object.freeze({
  status:'HOLD_FORMAL_VIDEO_LOOKS_NOT_AVAILABLE',
  requiredForFinalMaster:true,
  existingCasualLooksForbidden:true,
  cast:Object.freeze({
    ANCHOR:Object.freeze({
      actor:'Rumi',
      voice:'Annie - Lifelike',
      groupId:proposedPresenters.ANCHOR.groupId,
      originalCasualLookId:proposedPresenters.ANCHOR.lookId,
      voiceId:proposedPresenters.ANCHOR.auditionVoiceId,
      desired:'Premium female financial news anchor. Tailored navy or charcoal business blazer, crisp off-white blouse, neat collar, sophisticated minimal styling, modest professional fit. Seated or waist-up, squared shoulders, direct camera eye line, hands resting naturally. Do not modify face, hair, age or skin tone. Remove home interior: neutral studio/chroma/matting if actually supported.',
      lookPackTheme:'Presenter / Modern Corporate',
      metadataNotProof:'A new outfit must be seen in a real public/private Look preview. A prompt or look name is not visual approval.'
    }),
    ANALYST:Object.freeze({
      actor:'Kevin',
      voice:'Orson - Firm & Measured',
      groupId:proposedPresenters.ANALYST.groupId,
      originalCasualLookId:proposedPresenters.ANALYST.lookId,
      voiceId:proposedPresenters.ANALYST.auditionVoiceId,
      desired:'Seasoned male US financial market analyst. Tailored charcoal or deep navy suit jacket, clean pale-blue or white collared shirt, understated tie optional. No hoodie, T-shirt, polo or open casual collar. Waist-up and landscape shot with measured on-air posture. Do not modify face, hair, age or complexion. Clean neutral studio/chroma if genuine removal is supported.',
      lookPackTheme:'Presenter / Modern Corporate',
      metadataNotProof:'A new outfit must be seen in a real public/private Look preview. A prompt or look name is not visual approval.'
    })
  }),
  warnings:Object.freeze([
    'Public avatar look groups are not owned custom identities; do not attempt to mutate them via an undocumented paid POST.',
    'No formal video-trained Look for these public identities was found in the authenticated catalog.',
    'A Photo Look or prompt-generated look, if permitted, may render less natural motion than the original recorded video look.',
    'One generated Photo Look uses a separate premium-credit allocation (not the prepaid HeyGen API video wallet). Actual account entitlement must be checked before purchase.',
    'Overlaid newsroom graphics cannot change clothing or erase the original home background behind a moving person.',
    'No new paid HeyGen rendering may start until formal wardrobe is visually approved for BOTH presenters.'
  ])
});

const clean=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{8,128}$/.test(x);
export function auditFormalWardrobe(looks={}, {strict=false}={}){
  const failures=[],roles={};
  for(const role of ['ANCHOR','ANALYST']){
    const brief=formalWardrobeBrief.cast[role],v=looks?.[role];
    const blockers=[];
    if(!v||!clean(v.lookId))blockers.push(role+': missing an exact NEW professional outfit look ID');
    else if(v.lookId===brief.originalCasualLookId)blockers.push(role+': original casual public video look is forbidden for final master');
    else if(v.lookId==='425825d6465b4ba4bd261d334d530430')blockers.push(role+': previously visually rejected Araj look is forbidden');
    if(!v||v.groupId!==brief.groupId)blockers.push(role+': same approved identity group not verified');
    if(!v||!['video_avatar','digital_twin','photo_avatar'].includes(v.avatarType))
      blockers.push(role+': new provider look type not verified');
    if(!v||v.completed!==true)blockers.push(role+': provider look status not verified completed');
    if(!v||v.actualOutfitReviewed!==true)blockers.push(role+': actual formal outfit image/video not signed off');
    if(!v||v.faceMatchedExistingActor!==true)blockers.push(role+': face identity continuity not signed off');
    if(!v||typeof v.approvedBy!=='string'||v.approvedBy.length<2)
      blockers.push(role+': visual reviewer signoff missing');
    if(!v||!/^https:\/\//.test(v.previewUrl||''))
      blockers.push(role+': formal look preview evidence URL missing');
    if(!v||v.actorName!==brief.actor||v.voiceId!==brief.voiceId)
      blockers.push(role+': locked face/voice role mismatch');
    if(v?.avatarType==='photo_avatar'&&v.motionQualityApproved!==true)
      blockers.push(role+': new photo look has NOT passed real speaking-video motion/lip-sync QA');
    roles[role]={actor:brief.actor,voice:brief.voice,ready:blockers.length===0,blockers};
    failures.push(...blockers);
  }
  const status=failures.length?'HOLD_FORMAL_WARDROBE':'READY_FOR_SEPARATE_PAID_MASTER_APPROVAL';
  if(strict&&failures.length)throw new Error(status+': '+failures.join('; '));
  return {status,ready:failures.length===0,roles,blockers:failures,
    paidVideoAuthorized:false,
    note:'A wardrobe-ready state is NOT a provider wallet ceiling, a paid-generation command, or an editorial approval.'};
}

if(process.argv[1]?.endsWith('formal-wardrobe.mjs'))
  console.log(JSON.stringify(auditFormalWardrobe(),null,2));
