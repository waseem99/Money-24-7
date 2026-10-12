// Paid operator: ONE hash-locked submission for an approved original presenter.
// No automatic retries, voice substitutions or full-programme generation.
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {LOCKED_CAST,PROOF,audit,EDITION} from './original-cast.mjs';

const role=process.env.STOCKS_ROLE;
const receipt={
  run:'R5-approved-original-cast',role:role||null,
  newVideoSubmissions:0,sourceDate:EDITION.date,oneAttemptOnly:true,
  actualProviderCostUSD:null,renderComplete:false
};
const receiptPath=process.env.STOCKS_RECEIPT_PATH||'stocks-r5-provider-receipt.json';
const persist=()=>writeFileSync(receiptPath,JSON.stringify(receipt,null,2));
try {
  const allowed=['NORA','MARCUS'];
  const review=audit();
  if(!review.pass||!allowed.includes(role))throw Error('Original-cast frozen editorial preflight failed');
  const person=LOCKED_CAST[role],script=PROOF.turns[role],key=process.env.HEYGEN_API_KEY,token=process.env.GH_TOKEN;
  if(!key||!token||!process.env.GITHUB_REPOSITORY||!process.env.GITHUB_SHA)throw Error('Private direct API credentials or repository scope missing');

  const lookResponse=await fetch('https://api.heygen.com/v3/avatars/looks/'+encodeURIComponent(person.avatarId),{
    method:'GET',headers:{'x-api-key':key},signal:AbortSignal.timeout(17000)});
  const lookRaw=await lookResponse.json().catch(()=>({}));
  const look=lookRaw.data??lookRaw;
  if(!lookResponse.ok||look.id!==person.avatarId||look.avatar_type!=='photo_avatar'||look.status!=='completed'||!look.supported_api_engines?.includes('avatar_iii'))
    throw Error('Exact Liza/Lasse original Photo Look cannot be verified by funded API key');
  receipt.lookConfirmed=true;
  // Voice catalogue verification is READ ONLY; video endpoint still has final say.
  const u=new URL('https://api.heygen.com/v3/voices');
  for(const [k,v] of Object.entries({engine:'starfish',type:'public',language:'English',
     gender:role==='NORA'?'female':'male',search_query:role==='NORA'?'Annie':'Orson',limit:50}))
     u.searchParams.set(k,String(v));
  const voicesResponse=await fetch(u.toString(),{method:'GET',headers:{'x-api-key':key},signal:AbortSignal.timeout(18000)});
  const voicesRaw=await voicesResponse.json().catch(()=>({}));
  const voices=voicesRaw.data??voicesRaw;
  const found=Array.isArray(voices.items)?voices.items:Array.isArray(voices.voices)?voices.voices:Array.isArray(voices)?voices:[];
  if(!voicesResponse.ok||!found.some(v=>v.voice_id===person.voiceId))throw Error('Exact original approved voice not found in funded API voice catalogue');
  receipt.catalogVoiceConfirmed=true;
  const payload={type:'avatar',avatar_id:person.avatarId,voice_id:person.voiceId,
    script,engine:{type:'avatar_iii'},resolution:'1080p',aspect_ratio:'16:9',
    output_format:'mp4',caption:{file_format:'srt'},
    title:'Stocks R5 original-cast '+role+' original voice - one measured take'};
  const digest=createHash('sha256').update(JSON.stringify({version:'R5',payload})).digest('hex');
  const tag='stocks-r5-'+role.toLowerCase()+'-'+digest.slice(0,22);
  receipt.payloadSHA256=digest;receipt.lockTag=tag;receipt.approvedLook=person.avatarId;receipt.approvedVoice=person.voiceId;
  receipt.engine='avatar_iii';receipt.resolution='1080p';receipt.estimatedMaxUSD=Math.ceil(PROOF.estimatedMaxPerTurnSeconds/60*100)/100;
  // The immutable tag MUST be created BEFORE the billable POST.
  const lock=await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+'/git/refs',{
    method:'POST',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json'},
    body:JSON.stringify({ref:'refs/tags/'+tag,sha:process.env.GITHUB_SHA}),signal:AbortSignal.timeout(18000)});
  if(lock.status===422){receipt.status='ALREADY_LOCKED_NO_NEW_PAID_JOB';persist();console.log('STOCKS_R5_RECEIPT='+JSON.stringify(receipt));process.exit(0)}
  if(!lock.ok)throw Error('Failed to obtain permanent one-shot tag; HTTP '+lock.status);
  receipt.status='LOCKED_NO_RETRY';persist();
  const response=await fetch('https://api.heygen.com/v3/videos',{
    method:'POST',headers:{'x-api-key':key,'Content-Type':'application/json'},
    body:JSON.stringify(payload),signal:AbortSignal.timeout(45000)});
  const body=await response.json().catch(()=>({}));
  receipt.newVideoSubmissions=1;receipt.submissionHttp=response.status;
  receipt.videoId=body.data?.video_id||body.video_id||null;
  receipt.providerCode=body.error_code||body.error?.code||null;
  receipt.providerReason=String(body.message||body.error?.message||'').slice(0,250);
  receipt.status=response.ok&&receipt.videoId?'ACCEPTED_PROCESSING':'REJECTED_OR_UNCERTAIN_NO_RETRY';
  persist();
  console.log('STOCKS_R5_RECEIPT='+JSON.stringify(receipt));
} catch(err) {
  receipt.status='BLOCKED_OR_UNCERTAIN_NO_RETRY';
  receipt.reason=String(err?.message||err).slice(0,200);
  persist();
  console.log('STOCKS_R5_RECEIPT='+JSON.stringify(receipt));
}
