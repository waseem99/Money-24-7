// Pure broadcast-provider contract. No vendor API calls, tokens, billing or network.
export const PROVIDER_CONTRACT=Object.freeze({market:'US',talent:'FICTIONAL_AI_ONLY',sharedOutput:true,perViewerSessions:false,minWidth:1920,minHeight:1080,requiredRoles:['NORA','MARCUS'],stage:'PREFLIGHT_NO_PAID_SESSIONS'});
export function validatePresenterSource(x){
 const errors=[];
 if(!x||typeof x!=='object')return ['Presenter source missing'];
 if(!PROVIDER_CONTRACT.requiredRoles.includes(x.role))errors.push('Unapproved role');
 if(x.origin!=='FICTIONAL_AI'||x.realPersonLikeness===true)errors.push('Human likeness/source not allowed');
 if(x.imageIdentityApproved!==true||typeof x.portraitHash!=='string'||!/^[a-f0-9]{64}$/.test(x.portraitHash))errors.push('Portrait/identity not approved');
 if(x.singleFace!==true||x.straightOn!==true||x.neutralMouth!==true)errors.push('Single neutral portrait required');
 if((x.width||0)<1920||(x.height||0)<1080)errors.push('Portrait resolution too low');
 if(x.avatarAssetApproved!==true)errors.push('LiveAvatar provider approval outstanding');
 if(x.broadcastRightsApproved!==true)errors.push('Commercial broadcast rights unverified');
 return errors;
}
export function validateLiveSession(req,{paidEnabled=false}={}){
 const errors=[];
 if(!req||typeof req!=='object')return ['Session missing'];
 if(!paidEnabled)errors.push('Paid LiveAvatar generation DISABLED');
 if(req.mode!=='LITE')errors.push('Only reviewed LITE mode allowed');
 if(req.sharedChannel!==true||req.oneSessionPerViewer===true)errors.push('Must stream to one shared program feed');
 if(!['NORA','MARCUS'].includes(req.role))errors.push('Unknown character');
 if(req.durationSeconds<10||req.durationSeconds>120)errors.push('Proof must be bounded 10–120s');
 if(!req.scriptApproved||!req.voiceApproved||!req.costCeilingApproved)errors.push('Missing editorial/voice/budget approval');
 if(!req.providerRightsApproved||!req.customAvatarApproved)errors.push('Missing provider eligibility/commercial rights');
 if(!req.sessionIdempotencyKey||!req.sessionIdempotencyKey.match(/^[a-f0-9]{64}$/))errors.push('No source request hash');
 return errors;
}
export function auditStudioFrame(f){
 const errors=[];
 if(!f||typeof f!=='object')return ['Frame missing'];
 if(f.usOnly!==true)errors.push('US market only');
 if(f.bugCount!==1||f.bugLocation!=='TOP_LEFT')errors.push('Single compact Stocks bug');
 if(f.hasBakedLiveLabel||f.hasImaginedPrices||f.hasDuplicateWallLogo)errors.push('Unsafe art/backdrop');
 if(f.presenterVisible && !['NORA','MARCUS'].includes(f.presenterRole))errors.push('Unapproved presenter');
 if(f.presenterVisible && f.sourceFrameLipAudioMatched!==true)errors.push('Presenter lip/audio mismatch');
 if(f.providerGreenscreenEnabled && f.chromaKeyReviewPassed!==true)errors.push('Unreviewed chroma key');
 if(f.recorded && f.onAirStatus==='LIVE')errors.push('Recorded source cannot claim LIVE');
 return errors;
}
