export const stockSymbols=['AAPL','MSFT','NVDA','SPY'];
export function normalizeStock(symbol,data,now=Date.now()){
  if(!stockSymbols.includes(symbol)||typeof data.c!=='number'||!Number.isFinite(data.c)||data.c<=0||typeof data.t!=='number'||!Number.isFinite(data.t)||data.t<=0||data.t*1000>now+300000)return null;
  return {symbol,price:data.c,change:typeof data.dp==='number'&&Number.isFinite(data.dp)?data.dp:null,asOf:new Date(data.t*1000).toISOString(),source:'Finnhub',mode:'snapshot'};
}
export function stockBulletin(rows=[],now=Date.now()){
  const usable=rows.filter(row=>{const time=Date.parse(row.asOf);return stockSymbols.includes(row.symbol)&&Number.isFinite(row.price)&&row.price>0&&Number.isFinite(time)&&time<=now+5000&&now-time<86400000;});
  if(!usable.length)return 'This is the Signal US equities desk. Current verified stock snapshots are unavailable. We will resume this bulletin when the data feed is connected and recent source timestamps are available.';
  return 'This is the Signal US equities desk. These are Finnhub quote snapshots, not a streaming stock feed. '+usable.map(row=>`${row.symbol}: ${row.price.toLocaleString('en-US',{maximumFractionDigits:2})} US dollars${Number.isFinite(row.change)?`, ${row.change>=0?'up':'down'} ${Math.abs(row.change).toFixed(2)} percent against the provider’s previous close`:''}. Source time ${new Date(row.asOf).toLocaleString('en-GB',{timeZone:'UTC'})} UTC.`).join(' ')+' Snapshot age may reflect a closed market or delayed data. This feed does not establish exchange trading status.';
}
