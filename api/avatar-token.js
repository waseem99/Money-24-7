import {timingSafeEqual} from 'node:crypto';
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST') return res.status(405).json({error:'POST required'});
  const required=['LIVEAVATAR_API_KEY','LIVEAVATAR_AVATAR_ID','LIVEAVATAR_VOICE_ID','LIVEAVATAR_CONTEXT_ID','STUDIO_ACCESS_TOKEN'];
  if(required.some(k=>!process.env[k])) return res.status(503).json({error:'The presenter account has not been configured yet.'});
  const authorization=req.headers.authorization;
  const match=typeof authorization==='string'?/^Bearer ([^\s]+)$/i.exec(authorization):null;
  if(!match) return res.status(401).json({error:'Studio access code is incorrect.'});
  const supplied=Buffer.from(match[1]);
  const expected=Buffer.from(process.env.STUDIO_ACCESS_TOKEN);
  if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected)) return res.status(401).json({error:'Studio access code is incorrect.'});
  try {
    const response=await fetch('https://api.liveavatar.com/v1/sessions/token',{method:'POST',headers:{'X-API-KEY':process.env.LIVEAVATAR_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({mode:'FULL',avatar_id:process.env.LIVEAVATAR_AVATAR_ID,is_sandbox:process.env.LIVEAVATAR_SANDBOX!=='false',max_session_duration:process.env.LIVEAVATAR_SANDBOX!=='false'?60:120,video_settings:{quality:'high',encoding:'H264'},avatar_persona:{voice_id:process.env.LIVEAVATAR_VOICE_ID,context_id:process.env.LIVEAVATAR_CONTEXT_ID,language:'en'}}),signal:AbortSignal.timeout(20000)});
    const payload=await response.json();
    if(!response.ok||!payload.data?.session_token) {
      const detail=JSON.stringify(payload).toLowerCase();
      const reason=response.status===401?'API key rejected':response.status===403?'Account or asset permission denied':response.status===429?'Rate or concurrent-session limit reached':/sandbox/.test(detail)?'Sandbox configuration rejected':/credit|balance/.test(detail)?'Insufficient account credits':/duration/.test(detail)?'Session duration rejected':/voice/.test(detail)?'Voice configuration rejected':/context/.test(detail)?'Context configuration rejected':/avatar/.test(detail)?'Avatar configuration rejected':response.status===422?'Request validation failed':'Provider request failed';
      return res.status(502).json({error:`${reason} (provider HTTP ${response.status}).`,providerStatus:response.status});
    }
    res.json({sessionToken:payload.data.session_token});
  } catch {res.status(502).json({error:'Presenter service is unavailable. Please try again.'});}
}
