const actions = new Set(['start', 'stop', 'keep-alive']);
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({message:'POST required'});
  const action = req.query?.action;
  if (!actions.has(action)) return res.status(404).json({message:'Unknown session action'});
  const authorization = req.headers.authorization;
  if (typeof authorization !== 'string' || !/^Bearer [^\s]+$/i.test(authorization)) return res.status(401).json({message:'Session authorization required'});
  const started=Date.now();
  try {
    const upstream = await fetch(`https://api.liveavatar.com/v1/sessions/${action}`, {
      method:'POST', headers:{Authorization:authorization,'Content-Type':'application/json'},
      signal:AbortSignal.timeout(25000),
    });
    const data = await upstream.json();
    console.info(JSON.stringify({event:'presenter-provider-response',action,status:upstream.status,accepted:upstream.ok&&data.code===1000,mediaConfigured:Boolean(data.data?.livekit_url&&data.data?.livekit_client_token),elapsedMs:Date.now()-started}));
    if (!upstream.ok || data.code !== 1000) {
      return res.status(upstream.ok ? 502 : upstream.status).json({
        code:500, message:`Presenter ${action} failed (provider HTTP ${upstream.status}).`,
      });
    }
    return res.status(200).json(data);
  } catch {
    console.warn(JSON.stringify({event:'presenter-provider-unavailable',action,elapsedMs:Date.now()-started}));
    return res.status(504).json({code:500,message:`Presenter ${action} timed out or was unavailable.`});
  }
}
