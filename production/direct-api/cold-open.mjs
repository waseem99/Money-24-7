// One-shot direct API worker. Default: read-only. Never logs credentials or signed URLs.
import {mkdirSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const key=process.env.HEYGEN_API_KEY;
if(!key)throw Error('HEYGEN_API_KEY missing');
const mode=process.argv[2]??'check';
if(!['check','submit','status'].includes(mode))throw Error('Use check, submit or status');
const dir=process.env.STOCKS_OUTPUT_DIR??'stocks-api-output';
mkdirSync(dir,{recursive:true});
const ledgerFile=dir+'/cold-open-ledger.json';
async function api(path,body,idempotency){
 const response=await fetch('https://api.heygen.com'+path,{
  method:body?'POST':'GET',redirect:'error',signal:AbortSignal.timeout(90000),
  headers:{'X-Api-Key':key,...(body?{'Content-Type':'application/json','Idempotency-Key':idempotency}:{})},
  body:body?JSON.stringify(body):undefined
 });
 if(!response.ok)throw Error('HeyGen HTTP '+response.status+'; do not resubmit an uncertain outcome');
 const data=await response.json();return data.data??data;
}
const account=await api('/v3/users/me');
const balance=account.wallet?.remaining_balance;
console.log(JSON.stringify({billing_type:account.billing_type,currency:account.wallet?.currency,remaining_balance:balance}));
if(mode==='check')process.exit(0);
if(mode==='status'){
 if(!existsSync(ledgerFile))throw Error('Restore the existing ledger before status lookup');
 const ledger=JSON.parse(readFileSync(ledgerFile));
 if(!ledger.videoId)throw Error('Submission outcome uncertain: reconcile provider history first');
 const result=await api('/v3/models/videos/'+encodeURIComponent(ledger.videoId));
 ledger.state=result.status;writeFileSync(ledgerFile,JSON.stringify(ledger,null,2));
 console.log(JSON.stringify({videoId:ledger.videoId,status:result.status}));
 if(result.status==='completed'&&result.video_url){
  const response=await fetch(result.video_url,{signal:AbortSignal.timeout(90000)});
  if(!response.ok)throw Error('Video download failed; existing job retained');
  writeFileSync(dir+'/cold-open.mp4',Buffer.from(await response.arrayBuffer()));
 }
 process.exit(0);
}
if(process.env.STOCKS_AUTHORIZE_ONE_SHOT!=='yes')throw Error('One-shot authorization flag required');
const maximum=Number(process.env.STOCKS_MAX_SHOT_USD);
const verifiedRate=Number(process.env.STOCKS_VERIFIED_USD_PER_SECOND);
if(!Number.isFinite(maximum)||maximum<=0||!Number.isFinite(verifiedRate)||verifiedRate<=0)throw Error('Supply verified model rate and per-shot ceiling');
const seconds=10;const estimate=seconds*verifiedRate;
if(estimate>maximum||account.billing_type!=='wallet'||account.wallet?.currency!=='usd'||typeof balance!=='number'||balance<maximum)throw Error('Wallet or estimated-cost gate failed');
if(existsSync(ledgerFile))throw Error('Existing attempt: recover status; never submit again automatically');
const reference=await api('/v3/videos/5600a865f6b14d0c87143f00c40a8626');
if(reference.status!=='completed'||!reference.video_url)throw Error('Approved studio reference unavailable');
const prompt='Ten-second Stocks newsroom cold open. Preserve Nora at left and Marcus at right, their faces, clothing, respective voices and complete newsroom from <Video 1>. Medium-wide two-shot, unobstructed faces. Nora says only: "Tech stocks are bouncing back. Can company earnings keep the rebound going?" Marcus listens silently. Start speech immediately, finish naturally by eight seconds. Precise lip sync, restrained non-repeating gestures. No music, captions, logos, graphics or extra words. Leave lower fifth for separately composited broadcast graphics.';
const body={model:'heygen-video-1',mode:'reference_to_video',prompt,duration:seconds,resolution:'1080p',aspect_ratio:'16:9',prompt_enhancement:'disabled',reference_videos:[{type:'url',url:reference.video_url}]};
const idempotency='stocks-cold-open-20261019-'+createHash('sha256').update(prompt).digest('hex').slice(0,24);
const ledger={idempotency,estimatedUsd:estimate,maximumUsd:maximum,state:'submitting',submittedAt:new Date().toISOString()};
writeFileSync(ledgerFile,JSON.stringify(ledger,null,2));
const result=await api('/v3/models/videos',body,idempotency);
if(!result.video_id)throw Error('No job ID: reconcile before retry');
Object.assign(ledger,{videoId:result.video_id,state:result.status??'pending'});
writeFileSync(ledgerFile,JSON.stringify(ledger,null,2));
console.log(JSON.stringify({videoId:ledger.videoId,state:ledger.state,estimatedUsd:estimate}));
