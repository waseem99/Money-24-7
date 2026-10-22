import path from 'node:path';
import {mkdir, open, unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {hash, atomicJSON, readJSON, id, realSetting} from './contracts.mjs';
import {Store, chargedJob} from './store.mjs';

// This client always uses the API key's billing account, never the MCP OAuth token.
export class HeyGenAPI {
  constructor(env=process.env, fetcher=fetch) { this.env=env; this.fetcher=fetcher; }
  async request(route, body) {
    if(!realSetting(this.env.HEYGEN_API_KEY)) throw new Error('Configure HEYGEN_API_KEY in the worker secret store');
    const response=await this.fetcher('https://api.heygen.com'+route, {
      method:body?'POST':'GET', redirect:'error', signal:AbortSignal.timeout(60000),
      headers:{'X-Api-Key':this.env.HEYGEN_API_KEY, Accept:'application/json', ...(body?{'Content-Type':'application/json'}:{})},
      ...(body?{body:JSON.stringify(body)}:{})
    });
    const payload=await response.json().catch(()=>null);
    if(!response.ok || payload?.error) {
      // Provider text can echo inputs. Persist only a bounded machine code, never headers or raw bodies.
      const code=/^[a-z_]{1,80}$/.test(payload?.error?.code)?payload.error.code:'provider_error';
      throw new Error(`HeyGen HTTP ${response.status}: ${code}`);
    }
    if(!payload || typeof payload!=='object') throw new Error('Invalid HeyGen response');
    return payload.data??payload;
  }
  account() { return this.request('/v3/users/me'); }
  asset(assetId) { return this.request('/v3/assets/'+encodeURIComponent(id(assetId))); }
  create(request) { return this.request('/v3/videos',request); }
  status(videoId) { return this.request('/v3/videos/'+encodeURIComponent(id(videoId))); }
}

export function fundingStatus(account, reserveUSD) {
  if(!Number.isFinite(reserveUSD)||reserveUSD<=0) throw new Error('Positive test reserve required');
  const wallet=account.wallet;
  if(account.billing_type!=='wallet'||wallet?.currency!=='usd'||!Number.isFinite(wallet.remaining_balance))
    return 'funding_not_verified'; // Unknown is not zero; other billing models need a separate budget check.
  if(wallet.remaining_balance<reserveUSD) return 'insufficient_balance';
  if(wallet.auto_reload?.enabled===true) return 'auto_reload_requires_review';
  return 'funded';
}

export async function preflight(client=new HeyGenAPI(), reserveUSD=1) {
  const account=await client.account();
  if(typeof account.username!=='string'||!account.username) throw new Error('Account identity missing');
  return {
    checkedAt:new Date().toISOString(), authenticated:true, billingType:account.billing_type??null,
    wallet:account.wallet?{currency:account.wallet.currency??null,remainingBalance:account.wallet.remaining_balance??null}:null,
    reserveUSD, funding:fundingStatus(account,reserveUSD), generationRequested:false,
    resolutionAccess:'not_tested', accountId:account.username
  };
}

function validatedPlan(plan) {
  id(plan.id);
  const r=plan.request;
  const fields=['type','image','audio_asset_id','title','resolution','aspect_ratio','engine','motion_prompt','expressiveness','fit','remove_background','output_format'];
  if(!r||Object.keys(r).some(k=>!fields.includes(k))||r.type!=='image'||
     r.image?.type!=='asset_id'||Object.keys(r.image).some(k=>!['type','asset_id'].includes(k))||
     r.engine?.type!=='avatar_iv'||Object.keys(r.engine).length!==1||
     !['1080p','720p'].includes(r.resolution)||r.aspect_ratio!=='16:9'||r.expressiveness!=='low'||
     r.fit!=='cover'||r.remove_background!==false||r.output_format!=='mp4'||
     typeof r.title!=='string'||!r.title.trim()||r.title.length>200||
     typeof r.motion_prompt!=='string'||!r.motion_prompt.trim()||r.motion_prompt.length>2000)
    throw new Error('Expected an explicit image + approved audio screen-test request');
  id(r.image.asset_id);id(r.audio_asset_id);id(plan.expectedAccountId);
  if(!Number.isFinite(plan.durationSeconds)||plan.durationSeconds<=0||plan.durationSeconds>30)
    throw new Error('Screen test must be at most 30 seconds');
  if(!Number.isFinite(plan.estimatedUSD)||plan.estimatedUSD<=0||!Number.isFinite(plan.capUSD)||plan.capUSD<plan.estimatedUSD)
    throw new Error('Positive cost estimate within an explicit cap required');
  return {id:plan.id,request:r,expectedAccountId:plan.expectedAccountId,durationSeconds:plan.durationSeconds,estimatedUSD:plan.estimatedUSD,capUSD:plan.capUSD};
}
export const screenTestHash=plan=>hash(validatedPlan(plan));

async function lock(root,fn) {
  await mkdir(root,{recursive:true,mode:0o700});
  const lockfile=path.join(root,'screen-test.lock');
  let handle;
  try {handle=await open(lockfile,'wx',0o600);} catch {throw new Error('Screen-test worker locked; reconcile an interrupted worker before unlocking');}
  try {return await fn();} finally {await handle.close();await unlink(lockfile);}
}

export async function submitScreenTest(root,plan,{paid=false,client=new HeyGenAPI()}={}) {
  const fingerprint=screenTestHash(plan);
  if(!paid||plan.approval?.renderAuthorized!==true||plan.approval?.planHash!==fingerprint||
     typeof plan.approval?.reference!=='string'||!plan.approval.reference.trim())
    throw new Error('Exact-version render authorization and --paid required');
  return lock(root,async()=>{
    const db=new Store(root),key='screen-'+plan.id;
    try {
      let saved;
      try {saved=await readJSON(path.join(root,'plan.json'));} catch(e) {if(e.code!=='ENOENT') throw e;}
      if(saved&&screenTestHash(saved)!==fingerprint) throw new Error('Screen-test plan changed; use a new private run directory for a newly approved test');
      const previous=db.get(key);
      if(previous) {
        if(!saved) throw new Error('Saved plan missing; reconcile the existing submission');
        if(previous.state!=='complete') throw new Error('Reconcile existing submission; automatic paid retry is disabled');
        return {...previous.data,reused:true};
      }
      const account=await client.account();
      if(account.username!==plan.expectedAccountId) throw new Error('API key belongs to a different account');
      if(fundingStatus(account,plan.capUSD)!=='funded') throw new Error('API test blocked: '+fundingStatus(account,plan.capUSD));
      for(const assetId of [plan.request.image.asset_id,plan.request.audio_asset_id]) {
        const asset=await client.asset(assetId);
        if((asset.id??asset.asset_id)!==assetId) throw new Error('Approved asset unavailable to this API account');
      }
      await atomicJSON(path.join(root,'plan.json'),plan);
      return await chargedJob(db,key,{amount:plan.estimatedUSD,cap:plan.capUSD,category:'heygen-screen-test',units:{seconds:plan.durationSeconds}},async()=>{
        const created=await client.create(plan.request);
        const videoId=created.video_id??created.id;id(videoId);
        return {videoId,planHash:fingerprint,state:'submitted',submittedAt:new Date().toISOString()};
      });
    } finally {db.close();}
  });
}

// A read-only collection call can be repeated; it never submits or retries a render.
export async function collectScreenTest(root,client=new HeyGenAPI()) {
  return lock(root,async()=>{
    const plan=await readJSON(path.join(root,'plan.json')),db=new Store(root);
    try {
      const job=db.get('screen-'+plan.id);
      if(job?.state!=='complete'||!job.data.videoId) throw new Error('No confirmed provider ID; reconcile the existing submission');
      if(screenTestHash(plan)!==job.data.planHash) throw new Error('Saved plan changed; reconcile before collecting');
      const video=await client.status(job.data.videoId);
      if(!['pending','waiting','processing','completed','failed','cancelled','canceled'].includes(video.status)) throw new Error('Unrecognized provider status');
      const output={videoId:job.data.videoId,planHash:job.data.planHash,status:video.status,checkedAt:new Date().toISOString(),humanReview:'pending'};
      if(video.status==='completed'&&video.video_url) {
        const u=new URL(video.video_url);
        if(u.protocol!=='https:'||u.username||u.password) throw new Error('Unsafe provider result URL');
        output.videoUrl=video.video_url;
      }
      await atomicJSON(path.join(root,'result.json'),output);
      return output;
    } finally {db.close();}
  });
}

async function cli(args) {
  const [command,first,second,...flags]=args;
  if(command==='preflight') {
    const report=await preflight(new HeyGenAPI(),second===undefined?1:Number(second));
    if(first) await atomicJSON(first,report);
    console.log(JSON.stringify({authenticated:report.authenticated,funding:report.funding,generationRequested:false,resolutionAccess:report.resolutionAccess}));
  } else if(command==='hash') console.log(screenTestHash(await readJSON(first)));
  else if(command==='submit') console.log(JSON.stringify(await submitScreenTest(second,await readJSON(first),{paid:flags.includes('--paid')})));
  else if(command==='collect') {
    const result=await collectScreenTest(first);
    console.log(JSON.stringify({videoId:result.videoId,status:result.status,humanReview:result.humanReview}));
  } else throw new Error('Usage: heygen-api.mjs preflight [private-report.json] [reserveUSD] | hash PLAN | submit PLAN RUN_DIRECTORY --paid | collect RUN_DIRECTORY');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) cli(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
