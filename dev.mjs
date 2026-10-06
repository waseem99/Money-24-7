import http from 'node:http';
import {createServer} from 'vite';
const vite = await createServer({server:{middlewareMode:true}, appType:'spa'});
http.createServer(async(req,res)=>{
  const path = req.url.split('?')[0];
  const sessionAction=/^\/api\/liveavatar\/v1\/sessions\/(start|stop|keep-alive)$/.exec(path);
  if(sessionAction||['/api/config','/api/avatar-token','/api/markets','/api/news'].includes(path)) {
    res.status = n => {res.statusCode=n;return res;};
    res.json = body => {res.setHeader('Content-Type','application/json');res.end(JSON.stringify(body));};
    try {req.query=sessionAction?{action:sessionAction[1]}:Object.fromEntries(new URL(req.url,'http://localhost').searchParams);const {default:handler}=await import(sessionAction?'./api/liveavatar/v1/sessions/[action].js':`.${path}.js`); await handler(req,res);} catch {res.status(500).json({error:'Request failed'});}
  } else vite.middlewares(req,res);
}).listen(3000,'0.0.0.0',()=>console.log('Signal ready at http://localhost:3000'));
