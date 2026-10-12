/**
 * Liza Office 6 + Lasse Office 3: existing provider photo looks, formally dressed.
 * Wardrobe photographs ARE verified; genuine photo-avatar motion is NOT.
 * No provider reads, writes, video generation or credit expense in this module.
 */
import {proposedPresenters} from './budget-preflight.mjs';

const examples=Object.freeze({
  ANCHOR:Object.freeze({
    actor:'Liza',
    groupId:'3727ecd034ef4248afea2a3443f7d2b7',
    selectedFormalLookId:'5ee67ac453c34ffebd71e8eedb47b2fe',
    look:'Liza Office 6 — grey business blazer with formal white blouse',
    voice:'Annie - Lifelike',
    voiceId:'330290724a1b470fb63153f34d4c0183',
    visualSource:'https://resource2.heygen.ai/public-avatars/Liza/paos/angles/office83_p3_a1.jpg',
    videoPreview:'https://resource2.heygen.ai/public-avatars/Liza/image_videos/office83_p3_a1.mp4',
    approvedWardrobeColors:['grey','white']
  }),
  ANALYST:Object.freeze({
    actor:'Lasse',
    groupId:'46782f6d3de64ed98cec7f47d3d21ae7',
    selectedFormalLookId:'de9f36c26bd841c891489a0c9d6174de',
    look:'Lasse Office 3 — formal grey business blazer with collared blue shirt',
    voice:'Orson - Firm & Measured',
    voiceId:'00e3d285aba44b27a83c47c02c9c2d9c',
    visualSource:'https://resource2.heygen.ai/public-avatars/Lasse/paos/angles/office120_p3_a1.jpg',
    videoPreview:'https://resource2.heygen.ai/public-avatars/Lasse/image_videos/office120_p3_a1.mp4',
    approvedWardrobeColors:['grey','blue']
  })
});

export const formalWardrobeBrief=Object.freeze({
  cast:examples,
  status:'FORMAL_STILL_LOOKS_SELECTED_MOTION_PENDING',
  wardrobeApproved:true,
  cinematicMotionApproved:false,
  originalRejectedLookIds:['425825d6465b4ba4bd261d334d530430','efa5d7cf738a4efd84b1dac501d9aef8','c8f428c549ea448488fdb2214dbcad57'],
  warnings:Object.freeze([
    'The user LOCKED the Liza and Lasse identities. The operator selected and visually inspected formal existing Office looks, rather than generating new unlicensed derivatives.',
    'These are public Photo Avatar looks, not video-trained digital twins; the supplied image_videos previews do not certify the output mouth, eyes, gestures or natural quality.',
    'Final three-minute master must not release until a REAL generated clip for each actor has been watched and accepted by a human.',
    'API Photo Avatar III and IV costs may differ; account wallet usage and any retake charges remain unknown until provider verification.',
    'Preserve genuine presenter faces, Annie and Orson voices, and existing SIGNAL V2 newsroom/header/ticker/chart system.'
  ])
});

export function auditFormalWardrobe(looks=null,{strict=false}={}){
  const result={};
  const failures=[];
  for(const role of ['ANCHOR','ANALYST']){
    const spec=formalWardrobeBrief.cast[role];
    const p=proposedPresenters[role];
    const look=looks?.[role]||{
      actorName:p.name,lookId:p.lookId,groupId:p.groupId,voiceId:p.auditionVoiceId,
      avatarType:p.avatarType,completed:true,formalOutfitReviewed:p.wardrobeApprovalStatus==='approved',
      previewUrl:spec.visualSource,motionQualityApproved:p.performanceApprovalStatus==='approved'
    };
    const issues=[];
    if(look.actorName!==spec.actor||look.lookId!==spec.selectedFormalLookId||look.groupId!==spec.groupId)
      issues.push(role+': unapproved face, group, or formal look');
    if(look.voiceId!==spec.voiceId)issues.push(role+': voice changed');
    if(look.avatarType!=='photo_avatar'||look.completed!==true)
      issues.push(role+': the exact HeyGen public Photo Look must be completed');
    if(!look.formalOutfitReviewed||!/^https:\/\//.test(look.previewUrl||''))
      issues.push(role+': business-formal appearance requires actual image evidence');
    if(look.motionQualityApproved!==true)
      issues.push(role+': actual avatar speech/eyes/lip-sync motion still requires human QA');
    failures.push(...issues);
    result[role]={identity:spec.actor,voice:spec.voice,wardrobeVerified:issues.every(x=>!x.includes('face')&&!x.includes('formal')&&!x.includes('voice')&&!x.includes('appearance')),finalPerformanceApproved:issues.length===0,issues};
  }
  const ready=failures.length===0;
  const status=ready?'READY_FOR_SEPARATE_PAID_MASTER_APPROVAL':'HOLD_PHOTO_AVATAR_MOTION_QA';
  if(strict&&!ready)throw new Error(status+': '+failures.join('; '));
  return {status,ready,wardrobeReady:result.ANCHOR.wardrobeVerified&&result.ANALYST.wardrobeVerified,
    photoMotionApproved:ready,roles:result,blockers:failures,paidVideoAuthorized:false,
    note:'Suit/blazer looks are real and selected; user review of actual generated movement and a separate budget release are still mandatory.'};
}
if(process.argv[1]?.endsWith('formal-wardrobe.mjs'))console.log(JSON.stringify(auditFormalWardrobe(),null,2));
