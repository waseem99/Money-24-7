/**
 * Guarded LiveAvatar LITE Web SDK integration boundary.
 * No API credential, vendor network call, session or payment on import.
 * A real SDK session and token provider are injected at runtime only after
 * explicit operator/commercial signoff; test mocks never consume credits.
 */
import {validateLiveSession} from './provider-contract.mjs';

export class LiteAvatarSource {
 constructor({role,sessionFactory,tokenRequest,clock=()=>Date.now()}={}){
  if(!['NORA','MARCUS','AVERY','JORDAN'].includes(role))throw new Error('Unsupported original AI identity');
  if(typeof sessionFactory!=='function'||typeof tokenRequest!=='function')
    throw new Error('Requires injected authorized session provider/SDK');
  this.role=role;this.sessionFactory=sessionFactory;this.tokenRequest=tokenRequest;
  this.clock=clock;this.session=null;this.state='DISCONNECTED';this.startedAt=null;
  this.events=[];
 }
 event(name,details={}){this.events.push({time:this.clock(),name,...details});}
 async connect(authorization){
  if(this.state!=='DISCONNECTED')throw new Error('Session already started or uncertain state; GET provider status first');
  const req={...authorization,role:this.role,mode:'LITE',sharedChannel:true,oneSessionPerViewer:false};
  const errors=validateLiveSession(req,{paidEnabled:authorization?.explicitlyApprovedPaidSession===true});
  if(errors.length)throw new Error('Live session blocked: '+errors.join('; '));
  if(req.durationSeconds>60)throw new Error('Limited first demo to maximum 60 seconds');
  if(!req.billingApprovalId||!req.operatorId)throw new Error('Missing signed operator and billable approval IDs');
  this.state='TOKEN_REQUESTED';
  try{
   const {sessionToken,sessionId}=await this.tokenRequest({
     role:this.role,mode:'LITE',durationSeconds:req.durationSeconds,
     sessionIdempotencyKey:req.sessionIdempotencyKey,
     billingApprovalId:req.billingApprovalId,
     operatorId:req.operatorId
   });
   if(typeof sessionToken!=='string'||sessionToken.length<10)throw new Error('Invalid provider session token');
   if(!sessionId)throw new Error('Provider session ID not returned');
   this.state='CONNECTING';
   this.session=this.sessionFactory(sessionToken,{voiceChat:{defaultMuted:true},autoKeepAlive:true});
   await this.session.start();
   this.state='CONNECTED';this.startedAt=this.clock();
   this.event('CONNECTED',{sessionId});
   return {status:this.state,role:this.role,providerSessionId:sessionId};
  }catch(error){
   this.state='UNCERTAIN_OUTCOME';
   this.event('UNKNOWN_PROVIDER_OUTCOME',{reason:String(error.message||error)});
   throw new Error('Provider outcome uncertain: inspect status before retrying. '+String(error.message||error));
  }
 }
 attach(videoElement){
  if(this.state!=='CONNECTED'||!videoElement)throw new Error('Session not connected or no media stage');
  if(typeof this.session.attach!=='function')throw new Error('SDK cannot attach remote video/audio');
  this.session.attach(videoElement);
  this.event('MEDIA_ATTACHED');
 }
 speakPcm24k(base64Pcm,approvedAudioId){
  if(this.state!=='CONNECTED')throw new Error('Streaming session unavailable');
  if(!approvedAudioId||typeof base64Pcm!=='string'||base64Pcm.length<160||
     !/^[a-zA-Z0-9+/=]+$/.test(base64Pcm))throw new Error('Audio must be approved and PCM24k-base64 encoded');
  if(typeof this.session.repeatAudio!=='function')throw new Error('Provider does not support LITE audio');
  const taskId=this.session.repeatAudio(base64Pcm);
  this.event('SPEAK_QUEUED',{approvedAudioId,taskId});
  return taskId;
 }
 async stop(){
  if(this.state==='DISCONNECTED')return;
  if(!this.session){this.state='UNCERTAIN_OUTCOME';throw new Error('Token minted but no session client; reconcile with provider');}
  this.state='STOPPING';
  try{await this.session.stop();this.state='DISCONNECTED';this.session=null;this.event('STOPPED');}
  catch(error){this.state='UNCERTAIN_OUTCOME';throw new Error('Stop outcome uncertain; verify before retry: '+String(error.message||error));}
 }
}
