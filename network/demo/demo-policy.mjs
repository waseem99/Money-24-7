/**
 * Deterministic preproduction + delivery contract for the 2m35s client demo.
 * No render, generative API, payment or model inference occurs in this module.
 */
const ROLES=new Set(['NORA','MARCUS','AVERY','JORDAN']);
const KINDS=new Set(['IDENT','ANCHOR','GRAPHIC','INTERACTION','OUTRO']);
const SHA=/^[0-9a-f]{64}$/i;
const has=(s)=>typeof s==='string'&&s.trim().length>0;
export function validateClientDemo(d,{release=false}={}){
 const failures=[];
 if(!d||typeof d!=='object')return {pass:false,ready:false,failures:['Missing demo']};
 if(d.marketScope!=='US_ONLY'||d.network!=='Stocks')failures.push('Network must be US Stocks only');
 if(d.programmeType!=='RECORDED_CLIENT_PILOT'||d.liveClaimsAllowed!==false)
   failures.push('Demo cannot claim unverified LIVE');
 if(d.fictionalAiOnly!==true||d.noRealPeopleOnScreen!==true)failures.push('Human presenter sources prohibited');
 if(d.currentMarketQuotesIncluded!==false)failures.push('No generated current prices in concept graphics');
 if(d.frame?.width!==1920||d.frame?.height!==1080||d.frame?.fps!==30)failures.push('1080p 30fps required');
 if(!Array.isArray(d.avatars)||d.avatars.length<2||d.avatars.length>4)
   failures.push('Must support two to four personas');
 const a=new Map((d.avatars||[]).map(x=>[x.id,x]));
 if(a.size!==(d.avatars||[]).length)failures.push('Duplicate persona IDs');
 for(const id of ['NORA','MARCUS'])if(!a.has(id))failures.push(id+' main anchor missing');
 for(const p of d.avatars||[]){
   if(!ROLES.has(p.id)||!has(p.role)||!has(p.name))failures.push('Unknown or blank persona');
   if(release && (p.commercialRight!==true||p.videoQA!==true||
      !has(p.avatarProviderId)||!has(p.voiceProviderId)||!SHA.test(p.portraitSha256||'')))
     failures.push(p.id+' has no licensed, visually verified moving avatar and voice');
 }
 if(!Array.isArray(d.shots)||!d.shots.length)failures.push('No scenes');
 let cursor=0,spoken=0;
 for(const shot of d.shots||[]){
   if(!has(shot.id)||!KINDS.has(shot.kind))failures.push('Invalid shot kind/ID');
   if(!Number.isInteger(shot.startSec)||shot.startSec!==cursor)
     failures.push('Shot time gap/overlap: '+(shot.id||'?'));
   if(!Number.isInteger(shot.durationSec)||shot.durationSec<1)
     failures.push('Invalid duration');
   if(!['IDENT'].includes(shot.kind)&&!a.has(shot.speakerId))
     failures.push('Speaker not in approved cast');
   if(shot.kind==='ANCHOR'||shot.kind==='INTERACTION'||shot.kind==='OUTRO'){
     spoken++;
     if(!has(shot.script))failures.push('Blank speaker script');
     if(shot.onAirLabel==='LIVE')failures.push('Demo mislabelled LIVE');
   }
   if(shot.kind==='GRAPHIC'&&shot.avatarVideoAssetId)
     failures.push('Chart narration must not show a fake moving speaking face');
   if(shot.verifiedMarketClaims.length>0 && d.currentMarketQuotesIncluded===false)
     failures.push('Unexpected market numbers in evergreen client demo');
   if(release){
     if(shot.editorialApproved!==true||shot.visualApproved!==true)
       failures.push('Human editorial + visual signoff missing for '+shot.id);
     if(!SHA.test(shot.renderedVideoSha256||''))
       failures.push('No verified moving frame checksum for '+shot.id);
     if(['ANCHOR','INTERACTION','OUTRO'].includes(shot.kind) &&
       (!has(shot.voiceAudioAssetId)||!has(shot.avatarVideoAssetId)||shot.voiceReady!==true))
       failures.push('No matched authentic recorded AI lips/voice '+shot.id);
   }
   cursor += Number.isInteger(shot.durationSec)?shot.durationSec:0;
 }
 if(spoken<4)failures.push('Too little real AI-presenter speaking content');
 if(d.durationSec!==cursor)failures.push('Published duration does not match scenes');
 if(release && (d.releaseReady!==true||d.costApproved!==true))
   failures.push('Client-review release and explicit spend status unapproved');
 return {pass:failures.length===0,ready:release&&failures.length===0,
   failures,durationSeconds:cursor,avatarCount:a.size,
   newBillableGenerationAuthorized:false};
}
