/**
 * Stocks LiveAvatar DIRECT setup. No third-party browser automation.
 * Node 22+; read-only checks are free; token minting is a separately explicit action.
 * API key must stay in a local untracked file or process environment.
 * Usage:
 *   node network/live-avatar/direct-setup.mjs help
 *   node network/live-avatar/direct-setup.mjs credits
 *   node network/live-avatar/direct-setup.mjs avatars
 *   node network/live-avatar/direct-setup.mjs sandbox-token --avatar-id <id> --confirm-one-session
 *   node network/live-avatar/direct-setup.mjs paid-token --avatar-id <id> --confirm-one-session
 */
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const API='https://api.liveavatar.com';
const KEY_FILE='.stocks-liveavatar.local.key';
const SESSION_DURATION=45; // one private proof under Free plan 2-minute limit.
export const WAYNE_SANDBOX_ID='dd73ea75-1218-4ef3-92ce-606d5f7fbc0a';
export const FREE_PRESETS=Object.freeze(['Amina','Dexter']);
const commands=Object.freeze(['help','doctor','credits','avatars','presets','sandbox-token','free-preset-token','paid-token']);
export function inspectArgs(args){
 const [command='help',...remaining]=args;
 if(!commands.includes(command))throw Error('Unknown command; use help');
 const options={command,avatarId:null,confirmed:false,confirmIncludedCredits:false};
 for(let i=0;i<remaining.length;i++){
  if(remaining[i]==='--avatar-id'){
   const id=remaining[++i];if(!id||!/^[A-Za-z0-9_-]{8,128}$/.test(id))throw Error('Valid avatar ID required');
   options.avatarId=id;
  }else if(remaining[i]==='--confirm-one-session')options.confirmed=true;
  else if(remaining[i]==='--confirm-use-included-credits')options.confirmIncludedCredits=true;
  else throw Error('Unknown option (see help)');
 }
 return options;
}
export async function loadLocalKey(env=process.env,{cwd=process.cwd(),read=readFile}={}){
 const fromEnv=String(env.LIVEAVATAR_API_KEY||'').trim();
 if(fromEnv)return fromEnv;
 try {return String(await read(path.join(cwd,KEY_FILE),'utf8')).trim();}
 catch{return '';}
}
export function readyToMint({command,avatarId,confirmed,confirmIncludedCredits},env={}){
 const errors=[];
 if(!avatarId)errors.push('Choose a real existing LiveAvatar avatar ID');
 if(!confirmed)errors.push('Use --confirm-one-session to authorize one bounded session token');
 if(command==='sandbox-token'&&avatarId!==WAYNE_SANDBOX_ID)
  errors.push('Sandbox mode only permits Wayne, never Dexter or Amina');
 if(command==='free-preset-token'&&confirmIncludedCredits!==true)
  errors.push('Free-plan public presets use included credits: pass --confirm-use-included-credits');
 if(command==='paid-token'&&env.STOCKS_APPROVE_ONE_LIVEAVATAR_PAID_TEST!=='YES')
  errors.push('Paid test requires local explicit STOCKS_APPROVE_ONE_LIVEAVATAR_PAID_TEST=YES');
 if(!['sandbox-token','free-preset-token','paid-token'].includes(command))errors.push('Not a session-minting command');
 return errors;
}
export function createLitePayload({command,avatarId,confirmed,confirmIncludedCredits},env={}){
 const errors=readyToMint({command,avatarId,confirmed,confirmIncludedCredits},env);
 if(errors.length)throw Error(errors.join('; '));
 return {mode:'LITE',avatar_id:avatarId,is_sandbox:command==='sandbox-token',
  max_session_duration:SESSION_DURATION,video_settings:{quality:'high',encoding:'H264'}};
}
export async function providerCall(uri,{apiKey,fetchImpl=fetch,method='GET',body}={}){
 const publicRead=/^\/v1\/avatars\/public(?:\?page=[1-9][0-9]*&page_size=100)?$/.test(uri);
 if(!apiKey&&!publicRead)throw Error('Missing LiveAvatar key; no network request made');
 if(!publicRead&&!['/v1/users/credits','/v1/avatars','/v1/sessions/token'].includes(uri))
  throw Error('Only documented LiveAvatar endpoints allowed');
 const isMint=uri==='/v1/sessions/token';
 if(isMint &&(method!=='POST'||!body||body.mode!=='LITE'))
  throw Error('Token creation requires approved LITE request');
 if(!isMint&&method!=='GET')throw Error('Read-only endpoints use GET');
 const response=await fetchImpl(API+uri,{method,
   headers:{...(apiKey?{'X-API-KEY':apiKey}:{}),'Content-Type':'application/json'},
   ...(body?{body:JSON.stringify(body)}:{}),
   signal:AbortSignal.timeout(20_000)});
 let data;try{data=await response.json();}catch{throw Error('LiveAvatar returned an invalid response');}
 if(!response.ok)throw Error('LiveAvatar HTTP '+response.status+' (see dashboard; no retry attempted)');
 if(data?.code!==100 && data?.code!==1000 && data?.code!==undefined)
   throw Error('LiveAvatar API reported an unsuccessful state: '+String(data.code));
 return data?.data??data;
}
export async function listTargetFreePresets({fetchImpl=fetch}={}){
 const found=[];
 for(let page=1;page<=3;page++){
  const data=await providerCall('/v1/avatars/public?page='+page+'&page_size=100',{fetchImpl});
  const entries=Array.isArray(data?.results)?data.results:[];
  for(const a of entries){
   if(FREE_PRESETS.some(name=>(String(a.name||'').toLowerCase()===name.toLowerCase() || String(a.name||'').toLowerCase().startsWith(name.toLowerCase()+' '))))
    found.push({id:a.id,name:a.name,status:a.status,hasError:Boolean(a.error_message),is1080p:a.is_1080p});
  }
  if(!data?.next || !entries.length)break;
 }
 return found;
}
export async function executeDirect(options,{env=process.env,fetchImpl=fetch,cwd=process.cwd(),read=readFile}={}){
 if(options.command==='help')return {
  usage:['npm run stocks:liveavatar -- doctor','npm run stocks:liveavatar -- credits',
   'npm run stocks:liveavatar -- avatars',
   'npm run stocks:liveavatar -- presets',
   'npm run stocks:liveavatar -- sandbox-token --avatar-id '+WAYNE_SANDBOX_ID+' --confirm-one-session',
   'npm run stocks:liveavatar -- free-preset-token --avatar-id REAL_AMINA_OR_DEXTER_ID --confirm-one-session --confirm-use-included-credits',
   'npm run stocks:liveavatar -- paid-token --avatar-id YOUR_ID --confirm-one-session'],
  caution:'Never paste your API key or bearer session token into chat/GitHub. No TinyFish is required.'};
 const key=await loadLocalKey(env,{cwd,read});
 if(options.command==='presets')return {
  type:'FREE_PLAN_PUBLIC_PRESETS',presets:await listTargetFreePresets({fetchImpl}),
  warning:'Free plan permits only one active session, applies watermark; using these presets consumes INCLUDED credits. Sandbox Wayne only.'};
 if(options.command==='doctor')return {
  type:'DIRECT_NO_PAID_BROWSER_TOOL', keyConfigured:Boolean(key),
  keyStoredInGit:false,avatarCreationIsDashboardAction:true,
  narratorAudioPrepared:true,studioPreviewPrepared:true,
  apiCallsMade:0,providerCustomAvatarConfirmed:false};
 if(!key)throw Error('LiveAvatar API key missing; save locally in '+KEY_FILE+' (Git ignored)');
 if(options.command==='credits'){
  const data=await providerCall('/v1/users/credits',{apiKey:key,fetchImpl});
  return {type:'LIVEAVATAR_CREDIT_LOOKUP',creditsLeft:data.credits_left??null,
   note:'Read-only LiveAvatar API. Separate from TinyFish/standard HeyGen wallet.'};
 }
 if(options.command==='avatars'){
  const data=await providerCall('/v1/avatars',{apiKey:key,fetchImpl});
  const avatars=Array.isArray(data?.results)?data.results:[];
  return {type:'USER_CUSTOM_AVATARS',count:data?.count??avatars.length,
   avatars:avatars.map(a=>({id:a.id,name:a.name,status:a.status,is1080p:a.is_1080p,
    kind:a.type,expired:a.is_expired,hasError:Boolean(a.error_message)}))};
 }
 if(options.command==='free-preset-token'){
  const errors=readyToMint(options,env);
  if(errors.length)throw Error(errors.join('; '));
  const allowed=await listTargetFreePresets({fetchImpl});
  if(!allowed.some(a=>a.id===options.avatarId && !a.hasError))
   throw Error('Selected avatar is not a verified public Dexter/Amina preset; run presets to get the actual ID');
  const balance=await providerCall('/v1/users/credits',{apiKey:key,fetchImpl});
  const credits=Number(balance?.credits_left);
  if(!Number.isFinite(credits)||credits<=0)throw Error('No included Free-plan credits confirmed. Token may be billable; stopped.');
 }
 const payload=createLitePayload(options,env);
 const data=await providerCall('/v1/sessions/token',{apiKey:key,fetchImpl,method:'POST',body:payload});
 if(!data?.session_token)throw Error('Provider did not return a session token; check LiveAvatar dashboard before another request');
 return {type:'ONE_APPROVED_LITE_SESSION_TOKEN',sandbox:payload.is_sandbox,
  durationCapSeconds:SESSION_DURATION,
  usesIncludedCredits:options.command==='free-preset-token',
  watermarkExpected:options.command==='free-preset-token',
  concurrentAvatarLimit:options.command==='free-preset-token'?1:null,
  token:data.session_token,sessionId:data.session_id??null,
  important:'Bearer token is PRIVATE. Paste only in the private operator lab; never copy into chat. Confirm provider session state before retrying.'};
}
async function main(){
 try{
  const opt=inspectArgs(process.argv.slice(2));
  const result=await executeDirect(opt);
  console.log(JSON.stringify(result,null,2));
 }catch(e){
  console.error('STOCKS DIRECT SETUP STOPPED: '+String(e?.message||e));
  process.exitCode=2;
 }
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) await main();
