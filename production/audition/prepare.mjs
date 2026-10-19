import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const cast=JSON.parse(readFileSync(new URL('../cast/fixed-cast.json',import.meta.url)));
export const lines = [
  {id:'01',speaker:'nora',text:'Welcome to Stocks. Revenue is rising, but profit is falling. Marcus, what should investors examine first?'},
  {id:'02',speaker:'marcus',text:'Start with margins. Higher sales can conceal rising costs. Then compare operating cash flow with reported earnings.'},
  {id:'03',speaker:'nora',text:'So a strong headline alone does not tell us whether the business is improving?'},
  {id:'04',speaker:'marcus',text:'Exactly. Read the results together, and separate a temporary expense from a lasting change in the business.'}
];
export function speechRequests(){
  return lines.map(line=>({id:line.id,speaker:line.speaker,endpoint:'/v3/voices/speech',body:{text:line.text,voice_id:cast.characters[line.speaker].voiceId,engine:cast.speechEngine,speed:1,language:'en'}}));
}
// Pure preparation only. No credentials, HTTP client, submission or automatic retry.
export function prepareVideos(audio,{usdPerMinute,estimateLimitUsd=3}={}){
  if(!Number.isFinite(usdPerMinute)||usdPerMinute<=0||!Number.isFinite(estimateLimitUsd)||estimateLimitUsd<=0)throw Error('Positive finite rate and estimate limit required');
  if(!Array.isArray(audio)||audio.length!==lines.length)throw Error('Exactly four measured audio records required');
  const requests=lines.map(line=>{
    const matches=audio.filter(a=>a.id===line.id);
    if(matches.length!==1)throw Error('Missing or duplicate audio ID');
    const a=matches[0];const c=cast.characters[line.speaker];
    if(!c.enabled||!c.voiceId||a.voiceId!==c.voiceId||a.text!==line.text)throw Error('Audio identity or script mismatch');
    if(typeof a.assetId!=='string'||!a.assetId.trim()||!Number.isFinite(a.seconds)||a.seconds<=0||a.seconds>15||!/^([a-f0-9]{64})$/.test(a.sha256??''))throw Error('Measured duration, asset ID and audio hash required');
    return {id:line.id,audioSha256:a.sha256,seconds:a.seconds,endpoint:'/v3/videos',body:{type:'avatar',avatar_id:c.lookId,audio_asset_id:a.assetId,engine:{type:cast.videoEngine},resolution:'1080p',aspect_ratio:'16:9',fit:'contain',expressiveness:'low',title:`Stocks identity audition ${line.id}`,callback_id:`stocks-audition-${line.id}-${a.sha256.slice(0,16)}`}};
  });
  const totalSeconds=requests.reduce((n,r)=>n+r.seconds,0);
  if(totalSeconds>40)throw Error('40-second total generation limit exceeded');
  const estimatedVideoUsd=Math.ceil(totalSeconds/60*usdPerMinute*100)/100;
  if(estimatedVideoUsd>estimateLimitUsd)throw Error('Video estimate exceeds limit');
  const requestHash=createHash('sha256').update(JSON.stringify(requests)).digest('hex');
  return {mode:'offline-preparation-only',requestHash,totalSeconds,estimatedVideoUsd,excludes:['speech','billing rounding','failed jobs','retries','compositing','storage'],requests};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const [file,rate]=process.argv.slice(2);
  console.log(JSON.stringify(file?prepareVideos(JSON.parse(readFileSync(file)),{usdPerMinute:Number(rate)}):{mode:'offline-preparation-only',speechRequests:speechRequests()},null,2));
}
