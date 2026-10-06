import {normalizeStock,stockSymbols} from '../src/stock-data.js';
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
  let stocks=[];const stockErrors=[];
  if(process.env.FINNHUB_API_KEY) stocks=(await Promise.all(stockSymbols.map(async symbol=>{
    try {const r=await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}`,{headers:{'X-Finnhub-Token':process.env.FINNHUB_API_KEY},signal:AbortSignal.timeout(8000)});if(!r.ok){stockErrors.push({symbol,reason:r.status===401?'credentials_rejected':r.status===403?'access_denied':r.status===429?'rate_limited':'provider_unavailable'});return null;}const row=normalizeStock(symbol,await r.json());if(!row)stockErrors.push({symbol,reason:'invalid_quote'});return row;}catch{stockErrors.push({symbol,reason:'provider_unavailable'});return null;}
  }))).filter(Boolean);
  res.json({quotes:rows.filter(Boolean),stocks,stockStatus:!process.env.FINNHUB_API_KEY?'not_configured':stocks.length===stockSymbols.length?'available':stocks.length?'partial':'unavailable',stockErrors,receivedAt:new Date().toISOString(),notice:'REST snapshots may be cached by the source. The WebSocket trade timestamp determines live status.'});
}
