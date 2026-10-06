export const products=['BTC-USD','ETH-USD','SOL-USD'];
export function normalizeTicker(d) {
  const price=Number(d.price),open=Number(d.open_24h),time=Date.parse(d.time);
  if(d.type!=='ticker'||!products.includes(d.product_id)||!Number.isFinite(price)||price<=0||!Number.isFinite(open)||open<=0||!Number.isFinite(time)) return null;
  return {symbol:d.product_id,price,change:(price/open-1)*100,high:Number(d.high_24h),low:Number(d.low_24h),volume:Number(d.volume_24h),asOf:d.time,receivedAt:new Date().toISOString(),source:'Coinbase Exchange',mode:'stream'};
}
export function isFresh(q, now=Date.now()) {return Boolean(q?.mode==='stream'&&Number.isFinite(Date.parse(q.asOf))&&now-Date.parse(q.asOf)>=-5000&&now-Date.parse(q.asOf)<20000);}
export function bulletin(quotes, now=Date.now()) {
  const fresh=quotes.filter(q=>isFresh(q,now));
  if(!fresh.length) return 'The live market feed is currently unavailable. Any prices shown are the last received snapshots. We will resume the market bulletin when fresh data arrives.';
  return `This is Signal's digital assets update. As of ${new Date(now).toLocaleTimeString('en-US',{timeZone:'UTC',hour:'2-digit',minute:'2-digit'})} UTC, ${fresh.map(q=>`${q.symbol.split('-')[0]} is trading at ${q.price.toLocaleString('en-US',{maximumFractionDigits:2})} US dollars, ${q.change>=0?'up':'down'} ${Math.abs(q.change).toFixed(2)} percent compared with its price twenty four hours ago`).join('. ')}. These are Coinbase Exchange prices. This bulletin describes observed prices; it does not identify the causes of market moves or provide investment advice.`;
}
