import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {SHOTS,EDITION} from './episode.mjs';
const id='Brandon_Business_Sitting_Front_public';
const voice='00e3d285aba44b27a83c47c02c9c';
const text=SHOTS.find(s=>s.id===16&&s.speaker==='MARCUS')?.script;
const receipt={network:'Stocks',role:'Marcus Varden',lookId:id,engine:'avatar_iii',resolution:'1080p',oneShot:true,paidRequests:0};
const save=()=>writeFileSync('stocks-marcus-receipt.json',JSON.stringify(receipt,null,2));
try {
  if(EDITION.network!=='Stocks'||!text||text.trim().split(/\s+/).length>42)throw Error('Editorial gate failed');
  const key=process.env.HEYGEN_API_KEY, token=process.env.GH_TOKEN;
  if(!key||!token||!process.env.GITHUB_REPOSITORY||!process.env.GITHUB_SHA)throw Error('Credentials or repo context unavailable');
  const payload={type:'avatar',avatar_id:id,script:text,voice_id:voice,engine:{type:'avatar_iii'},
    resolution:'1080p',aspect_ratio:'16:9',output_format:'mp4',
    caption:{file_format:'srt'},title:'Stocks Marcus Orson studio anchor reply — one approved attempt'};
  const payloadHash=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const lockName='stocks-marcus-only-'+payloadHash.slice(0,20);
  receipt.payloadHash=payloadHash;receipt.lockName=lockName;
  const check=await fetch('https://api.heygen.com/v3/avatars/looks/'+id,{
    headers:{'x-api-key':key},signal:AbortSignal.timeout(15000)});
  const item=await check.json().catch(()=>({}));
  if(!check.ok||(item.data??item)?.id!==id||(item.data??item)?.avatar_type!=='studio_avatar')
    throw Error('Direct studio avatar check failed');
  const lock=await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+'/git/refs',{
    method:'POST',headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','Content-Type':'application/json'},
    body:JSON.stringify({ref:'refs/tags/'+lockName,sha:process.env.GITHUB_SHA}),signal:AbortSignal.timeout(18000)});
  if(lock.status===422){receipt.status='ALREADY_LOCKED_NO_RETRY';save();process.exit(0)}
  if(!lock.ok)throw Error('No lock: HTTP '+lock.status);
  receipt.status='LOCKED_BEFORE_POST';save();
  const res=await fetch('https://api.heygen.com/v3/videos',{
    method:'POST',headers:{'x-api-key':key,'Content-Type':'application/json'},
    body:JSON.stringify(payload),signal:AbortSignal.timeout(35000)});
  const result=await res.json().catch(()=>({}));
  receipt.paidRequests=1;receipt.http=res.status;
  receipt.videoId=result.data?.video_id||result.video_id||null;
  receipt.status=res.ok&&receipt.videoId?'SUBMITTED_ONCE':'REJECTED_OR_UNCERTAIN_DO_NOT_RETRY';
  receipt.providerCode=result.error_code||result.error?.code||null;
  receipt.providerReason=String(result.message||result.error?.message||result.error?.details||'').slice(0,240);
  save();console.log('STOCKS_MARCUS_RECEIPT='+JSON.stringify(receipt));
} catch(err) {
  receipt.status='STOP_NO_RETRY';
  receipt.reason=String(err.message||err).slice(0,180);
  save();console.log('STOCKS_MARCUS_RECEIPT='+JSON.stringify(receipt));
}
