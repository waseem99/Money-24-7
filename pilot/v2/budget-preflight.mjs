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
  ANCHOR:{id:'rumi',name:'Rumi',role:'Lead news anchor',lookName:'Rumi Digital Twin (portrait)',groupId:'74384d3dd9894ffb83cca47473eb6829',lookId:'efa5d7cf738a4efd84b1dac501d9aef8',defaultVoiceId:'61034173a9344488b55466d745315173',auditionVoiceId:'330290724a1b470fb63153f34d4c0183',auditionVoiceName:'Annie - Lifelike',avatarType:'digital_twin',visualApprovalStatus:'approved',visualApprovalSource:'User explicitly reviewed public video preview and locked Rumi as female lead; generated output still requires human QA',performanceApprovalStatus:'pending',wardrobeApprovalStatus:'blocked-public-casual',preferredAspectRatio:'9:16',supportedEngines:['avatar_iii','avatar_iv','avatar_v'],selection:'LOCKED: user-approved Rumi look and Annie voice; first Rumi footage quality not yet approved'},
  ANALYST:{id:'kevin',name:'Kevin',role:'Markets analyst',lookName:'Kevin Digital Twin (landscape)',groupId:'ce741649eb8c4ca38cd34164881a2ef5',lookId:'c8f428c549ea448488fdb2214dbcad57',defaultVoiceId:'5141743c956d4a1298b7126c9639d416',auditionVoiceId:'00e3d285aba44b27a83c47c02c9c2d9c',auditionVoiceName:'Orson - Firm & Measured',avatarType:'digital_twin',visualApprovalStatus:'approved',visualApprovalSource:'User explicitly locked Kevin for male analyst after public video preview',performanceApprovalStatus:'pending',wardrobeApprovalStatus:'blocked-public-casual',preferredAspectRatio:'16:9',supportedEngines:['avatar_iii','avatar_iv','avatar_v'],selection:'LOCKED: user-approved Kevin look and Orson voice; generated output still requires performance QA'}
});

export function selectedProgramme(profile='sample'){
  if(!['sample','pilot'].includes(profile))throw new Error('Only sample and pilot profiles are audited');
  const p=exampleProgramme(profile);
  const ids={maya:'rumi',daniel:'kevin'};
  p.id=`signal-rumi-kevin-${profile}`;
  p.presenters=p.presenters.map(old=>{
    const sel=proposedPresenters[old.configRef];
    if(!sel)throw new Error('Unmapped presenter role');
    return {...old,id:sel.id,name:sel.name,role:sel.role,look:sel.lookName};
  });
  p.turns=p.turns.map(t=>({...t,speakerId:ids[t.speakerId],text:t.text.replace(/\bMaya\b/g,'Rumi').replace(/\bDaniel\b/g,'Kevin')}));
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
    'Selected public looks and default voices have not passed an actual pronunciation/lip-sync audition',
    'Standing alpha/matting compatibility and genuine non-speaking listener footage are unverified',
    'R2 full-scene listener, unequal split and standing quality gates are not satisfied by a simple single-speaker audition',
    'Editorial script, exact looks and source disclosures require approval before any provider render',
    'A user-approved maximum spend, API wallet status, and account-side recharge settings have not been verified'
  ];
  return {
    asOf:'2026-10-10',noExternalCalls:true,paidRelease:'BLOCKED',
    profile,programme:{id:p.id,durationSeconds:p.durationMs/1000,turns:p.turns.length,scenes:p.scenes.length,roles:p.presenters.map(({name,role,configRef,look})=>({name,role,configRef,look}))},
    publicCatalogLooks:Object.values(proposedPresenters),
    providerPricing:{source:'https://help.heygen.com/en/articles/10060327-heygen-api-pricing-explained',avatarIIIDigitalTwinUsdPerMinute:1,avatarIVDigitalTwinUsdPerMinute:4,apiWalletMinimumUsd:5,pricingIsIndicative:true,avatarVApiPriceNotVerified:true},
    plannedExposure:{
      speakingSlotUpperSeconds:assignedSeconds,
      avatarIIIForSpeakingSlotsUSD:dollars(assignedSeconds/60),
      avatarIVForSpeakingSlotsUSD:dollars(assignedSeconds/60*4),
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
