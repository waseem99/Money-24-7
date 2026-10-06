import {feeds,parseFeed} from '../lib/news.js';
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const results=await Promise.all(feeds.map(async source=>{
    try{
      const response=await fetch(source.url,{signal:AbortSignal.timeout(8000),headers:{Accept:'application/rss+xml, application/xml, text/xml'}});
      if(!response.ok)throw new Error('Feed unavailable');
      const reader=response.body.getReader();let size=0;const chunks=[];
      while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1000000){await reader.cancel();throw new Error('Feed too large');}chunks.push(value);}
      const items=parseFeed(Buffer.concat(chunks).toString('utf8'),source);
      return {id:source.id,name:source.name,status:items.length?'available':'unavailable',items};
    }catch{return {id:source.id,name:source.name,status:'unavailable',items:[]};}
  }));
  res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=60');
  return res.status(200).json({fetchedAt:new Date().toISOString(),sources:results.map(({items,...source})=>source),items:results.flatMap(s=>s.items).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).slice(0,18)});
}
