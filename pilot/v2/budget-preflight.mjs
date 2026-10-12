/**
 * Pure no-spend editorial/technical audit for the Jazz/Signal presenter pilot.
 * Running this file never requests provider media, purchases credits or loads API keys.
 * Catalog IDs are public HeyGen look/voice IDs (checked 2026-10-10), not permissions.
 */
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {exampleProgramme} from '../../src/broadcast/fixtures.js';
import {validateProgramme} from '../../src/broadcast/contracts.js';
import {slots} from '../../src/broadcast/timeline.js';

export const proposedPresenters=Object.freeze({
  ANCHOR:{id:'liza',name:'Liza',role:'Lead news anchor',lookName:'Liza Office 6 — formal grey blazer and white blouse',groupId:'3727ecd034ef4248afea2a3443f7d2b7',lookId:'5ee67ac453c34ffebd71e8eedb47b2fe',defaultVoiceId:'96a7560392c44869a4b66ac849be59a5',auditionVoiceId:'330290724a1b470fb63153f34d4c0183',auditionVoiceName:'Annie - Lifelike',avatarType:'photo_avatar',visualApprovalStatus:'approved',visualApprovalSource:'User explicitly locked Liza as the female anchor; existing Office 6 grey-blazer look was visually reviewed by production operator',performanceApprovalStatus:'pending',wardrobeApprovalStatus:'approved',wardrobeApprovalSource:'Existing recorded HeyGen public Office 6 look visibly contains a grey business blazer and white blouse; no generated outfit or unpermitted identity alteration',preferredAspectRatio:'16:9',supportedEngines:['avatar_iii','avatar_iv','avatar_v'],selection:'FINAL FACE Liza, voice Annie, formal existing Office 6; realistic motion acceptance still pending'},
  ANALYST:{id:'lasse',name:'Lasse',role:'Markets analyst',lookName:'Lasse Office 3 — formal grey blazer and blue collared shirt',groupId:'46782f6d3de64ed98cec7f47d3d21ae7',lookId:'de9f36c26bd841c891489a0c9d6174de',defaultVoiceId:'0828ce2c70c94787aee8d6745bcde7d7',auditionVoiceId:'00e3d285aba44b27a83c47c02c9c2d9c',auditionVoiceName:'Orson - Firm & Measured',avatarType:'photo_avatar',visualApprovalStatus:'approved',visualApprovalSource:'User explicitly locked Lasse as the male analyst; existing Office 3 formal business look visually reviewed by production operator',performanceApprovalStatus:'pending',wardrobeApprovalStatus:'approved',wardrobeApprovalSource:'Existing HeyGen public Office 3 shows an appropriate grey blazer and blue collared shirt, filmed-preview motion quality still pending',preferredAspectRatio:'16:9',supportedEngines:['avatar_iii','avatar_iv','avatar_v'],selection:'FINAL FACE Lasse, voice Orson, formal existing Office 3; realistic motion acceptance still pending'}
});

export function selectedProgramme(profile='sample'){
  if(!['sample','pilot'].includes(profile))throw new Error('Only sample and pilot profiles are audited');
  const p=exampleProgramme(profile);
  const ids={maya:'liza',daniel:'lasse'};
  p.id=`signal-liza-lasse-${profile}`;
  p.presenters=p.presenters.map(old=>{
    const sel=proposedPresenters[old.configRef];
    if(!sel)throw new Error('Unmapped presenter role');
    return {...old,id:sel.id,name:sel.name,role:sel.role,look:sel.lookName};
  });
  p.turns=p.turns.map(t=>({...t,speakerId:ids[t.speakerId],text:t.text.replace(/\bMaya\b/g,'Liza').replace(/\bDaniel\b/g,'Lasse')}));
  p.scenes=p.scenes.map(s=>({...s,presenterIds:s.presenterIds.map(id=>ids[id])}));
  p.cues=p.cues.map(c=>c.presenterId?{...c,presenterId:ids[c.presenterId]}:c);
  return validateProgramme(p);
}

const dollars=x=>Math.round((x+Number.EPSILON)*100)/100;
export function budgetPreflight(profile='sample'){
  const p=selectedProgramme(profile);
  const assignedSeconds=p.turns.reduce((sum,t)=>sum+t.durationMs/1000,0);
  const cellSeconds=p.scenes.reduce((sum,s)=>sum+slots(s).length*s.durationMs/1000,0);
  const offScreenSeconds=p.turns.reduce((sum,t)=>{
    const s=p.scenes.find(s=>s.turnIds.includes(t.id));
    return sum+(slots(s).some(x=>x.presenterId===t.speakerId)?0:t.durationMs/1000);
  },0);
  const alphaScenes=p.scenes.filter(s=>slots(s).some(slot=>slot.kind==='alpha')).map(s=>s.id);
  const providers={
    requiredByExistingWorker:['ElevenLabs timed speech','HeyGen external-audio avatar'],
    proposedMinimum:'HeyGen-native script/voice route implemented separately for the initial budgeted audition; full V2 still needs ElevenLabs for word-aligned speech',
    optionalForCuratedEpisode:['AI Gateway director','separate AI image generation']
  };
  const blockers=[
    'Full V2 speaking pipeline still requires ElevenLabs; independent HeyGen-only audition route is prepared and unspent',
    'Liza/Lasse public Photo Avatar office looks are visually formal but their generated facial motion and lip-sync with Annie/Orson are not yet accepted',
    'Standing alpha/matting compatibility and genuine non-speaking listener footage are unverified',
    'R2 full-scene listener, unequal split and standing quality gates are not satisfied by a simple single-speaker audition',
    'Editorial script, exact looks and source disclosures require approval before any provider render',
    'A user-approved maximum spend, API wallet status, and account-side recharge settings have not been verified'
  ];
  return {
    asOf:'2026-10-12',noExternalCalls:true,paidRelease:'BLOCKED',
    profile,programme:{id:p.id,durationSeconds:p.durationMs/1000,turns:p.turns.length,scenes:p.scenes.length,roles:p.presenters.map(({name,role,configRef,look})=>({name,role,configRef,look}))},
    publicCatalogLooks:Object.values(proposedPresenters),
    providerPricing:{source:'https://help.heygen.com/en/articles/10060327-heygen-api-pricing-explained',avatarIIIPhotoUsdPerMinute:1,avatarIVPhotoUsdPerMinute:3,apiWalletMinimumUsd:5,pricingIsIndicative:true,avatarVApiPriceNotVerified:true},
    plannedExposure:{
      speakingSlotUpperSeconds:assignedSeconds,
      avatarIIIForSpeakingSlotsUSD:dollars(assignedSeconds/60),
      avatarIVForSpeakingSlotsUSD:dollars(assignedSeconds/60*3),
      offScreenVoiceSecondsCurrentlySentThroughAvatar:offScreenSeconds,
      fullSceneVisiblePresenterCoverageSeconds:cellSeconds,
      extraListenerFootage:'not included in the above estimates; source/cost unverified',
      retriesAndExternalAudio:'not included; real provider duration/billing may differ'
    },
    alphaScenes,providers,blockers,
    guardrails:['No paid provider requests during preflight','No main-branch modifications or deployments','First paid authorization limited to the agreed short quality gate, not a five-minute batch','Review actual API wallet and disable unintended automatic recharge','No R2 sign-off without separate alpha/listener realism evidence']
  };
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [mode='sample',profile='sample']=process.argv.slice(2);
  if(mode==='--episode')console.log(JSON.stringify(selectedProgramme(profile),null,2));
  else console.log(JSON.stringify(budgetPreflight(mode),null,2));
}
