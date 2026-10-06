const products=['BTC-USD','ETH-USD','SOL-USD'];
export default async function handler(req,res) {
  if(req.method!=='GET') return res.status(405).json({error:'GET required'});
  res.setHeader('Cache-Control','public, s-maxage=30, stale-while-revalidate=30');
  const rows=await Promise.all(products.map(async symbol=>{
    try {
      const r=await fetch(`https://api.exchange.coinbase.com/products/${symbol}/stats`,{signal:AbortSignal.timeout(8000)});
      if(!r.ok) return null;
      const d=await r.json(); const price=Number(d.last),open=Number(d.open);
      if(!Number.isFinite(price)||price<=0||!Number.isFinite(open)||open<=0) return null;
      return {symbol,price,change:(price/open-1)*100,high:Number(d.high),low:Number(d.low),volume:Number(d.volume),asOf:null,receivedAt:new Date().toISOString(),source:'Coinbase Exchange',mode:'snapshot'};
    } catch {return null;}
  }));
  let stocks=[];
  if(process.env.FINNHUB_API_KEY) stocks=(await Promise.all(['AAPL','MSFT','NVDA','SPY'].map(async symbol=>{
    try {const r=await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${encodeURIComponent(process.env.FINNHUB_API_KEY)}`,{signal:AbortSignal.timeout(8000)});if(!r.ok)return null;const d=await r.json();if(!(d.c>0&&d.t>0))return null;return {symbol,price:d.c,change:d.dp,high:d.h,low:d.l,asOf:new Date(d.t*1000).toISOString(),source:'Finnhub',mode:'snapshot'};}catch{return null;}
  }))).filter(Boolean);
  res.json({quotes:rows.filter(Boolean),stocks,receivedAt:new Date().toISOString(),notice:'REST snapshots may be cached by the source. The WebSocket trade timestamp determines live status.'});
}
