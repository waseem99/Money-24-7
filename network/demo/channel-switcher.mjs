/**
 * Deterministic 2–4 source TV switcher control plane.
 * Sources are external real moving WebRTC/recorded media handles; this module
 * does not invent presenter frames or perform network requests.
 */
export class ChannelSwitcher {
 constructor({clock=()=>Date.now(),timeoutMs=5000}={}){
  this.clock=clock;this.timeoutMs=timeoutMs;this.sources=new Map();this.active={type:'SLATE',reason:'NOT_ON_AIR'};
  this.events=[];this.recorded=false;this.publisherConnected=false;
 }
 log(type,data={}){this.events.push(Object.freeze({time:this.clock(),type,...data}));}
 registerSource(role,source){
  if(!['NORA','MARCUS','AVERY','JORDAN'].includes(role))throw new Error('Unregistered Stocks AI persona');
  if(!source||source.origin!=='FICTIONAL_AI'||source.approved!==true||
    source.broadcastRights!==true||source.lipsyncApproved!==true)
    throw new Error('Original moving AI footage/rights/matched audio not certified');
  if(!['WEBRTC','APPROVED_FILE'].includes(source.transport))throw new Error('Invalid media transport');
  if(!Number.isInteger(source.width)||source.width<1280||source.height<720)
    throw new Error('Insufficient media resolution');
  this.sources.set(role,{...source,lastSeen:this.clock(),streamReady:true});
  this.log('SOURCE_REGISTERED',{role});
 }
 heartbeat(role,frameTimeMs=this.clock()){
  const src=this.sources.get(role);
  if(!src)return false;
  if(!Number.isFinite(frameTimeMs)||Math.abs(this.clock()-frameTimeMs)>this.timeoutMs)return false;
  src.lastSeen=frameTimeMs;src.streamReady=true;return true;
 }
 healthy(role){
  const src=this.sources.get(role);
  return Boolean(src?.streamReady && this.clock()-src.lastSeen<=this.timeoutMs);
 }
 take(role,{mode='RECORDED',headline='US MARKETS',editionDate=null,producerApproved=false}={}){
  if(!this.healthy(role)){
    this.toStandby('NO_VERIFIED_AVATAR_STREAM');
    return {accepted:false,reason:'NO_VERIFIED_AVATAR_STREAM'};
  }
  if(mode==='LIVE'&&!producerApproved){
    this.toStandby('NO_LIVE_PRODUCER_APPROVAL');
    return {accepted:false,reason:'NO_LIVE_PRODUCER_APPROVAL'};
  }
  if(mode!=='LIVE'&&(!editionDate||!/^\d{4}-\d{2}-\d{2}$/.test(editionDate))){
    this.toStandby('RECORDED_DATE_REQUIRED');
    return {accepted:false,reason:'RECORDED_DATE_REQUIRED'};
  }
  this.active={type:'PRESENTER',role,headline,mode,editionDate,oneFace:true};
  this.log('TAKE_PRESENTER',{role,mode});
  return {accepted:true};
 }
 takeDual(roleA,roleB,{interactionApproved=false,editionDate=null}={}){
  if(!interactionApproved||roleA===roleB||!this.healthy(roleA)||!this.healthy(roleB)){
    return {accepted:false,reason:'MULTI_ACTOR_GEOMETRY_OR_STREAM_NOT_CERTIFIED'};
  }
  if(!/^\d{4}-\d{2}-\d{2}$/.test(editionDate||''))return {accepted:false,reason:'RECORDED_DATE_REQUIRED'};
  this.active={type:'TWO_UP',roles:[roleA,roleB],mode:'RECORDED',editionDate};
  this.log('TAKE_TWO_UP',{roles:[roleA,roleB]});
  return {accepted:true};
 }
 takeGraphics({headline,verifiedSources=[],mode='RECORDED',editionDate=null,readiness=false}={}){
  if(!readiness||typeof headline!=='string'||!headline.trim()||
     !['RECORDED','REPLAY','EVERGREEN'].includes(mode)||
     !/^\d{4}-\d{2}-\d{2}$/.test(editionDate||'')){
     this.toStandby('GRAPHIC_NOT_EDITORIALLY_READY');
     return {accepted:false,reason:'GRAPHIC_NOT_EDITORIALLY_READY'};
  }
  if(!Array.isArray(verifiedSources))return {accepted:false,reason:'INVALID_SOURCES'};
  this.active={type:'GRAPHIC',headline,mode,editionDate,verifiedSources};
  this.log('TAKE_GRAPHIC',{headline});
  return {accepted:true};
 }
 toStandby(reason='OPERATOR_HOLD'){
  this.active={type:'SLATE',reason,mode:'RECORDED'};
  this.log('STANDBY',{reason});
 }
 healthCheck(){
  if(this.active.type==='PRESENTER'&&!this.healthy(this.active.role))
     this.toStandby('PRESENTER_STREAM_EXPIRED');
  if(this.active.type==='TWO_UP'&&this.active.roles.some(role=>!this.healthy(role)))
     this.toStandby('TWO_UP_STREAM_EXPIRED');
  return this.active;
 }
 snapshot(){return {active:structuredClone(this.active),sourceRoles:[...this.sources.keys()],
  eventsCount:this.events.length,broadcastAuthorized:false,publisherConnected:this.publisherConnected};}
}
