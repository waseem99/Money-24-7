// Pure calculations shared by preview, director validation and exported media.
export function candles(rows) {
  if (!Array.isArray(rows) || !rows.length) throw new Error('OHLC history required');
  let previous = -Infinity;
  return rows.map(r => {
    if (![r.time,r.open,r.high,r.low,r.close,r.volume].every(Number.isFinite) || r.time <= previous || r.low > Math.min(r.open,r.close) || r.high < Math.max(r.open,r.close) || r.high < r.low || r.low <= 0 || r.volume < 0) throw new Error('Invalid or unordered OHLCV');
    previous = r.time; return {...r};
  });
}
export function sma(values, period) {
  check(values,period); return values.map((_,i)=>i<period-1?null:values.slice(i-period+1,i+1).reduce((a,b)=>a+b,0)/period);
}
function check(values,period) { if (!Number.isInteger(period)||period<1||!values.every(Number.isFinite)) throw new Error('Invalid indicator inputs'); }
export function ema(values,period) {
  check(values,period); let value=null; const k=2/(period+1);
  return values.map((v,i)=>{if(i<period-1)return null;value=value===null?values.slice(0,period).reduce((a,b)=>a+b,0)/period:v*k+value*(1-k);return value;});
}
export function rsi(values,period=14) {
  check(values,period); let gain=0,loss=0;
  return values.map((v,i)=>{if(!i)return null;const delta=v-values[i-1];if(i<=period){gain+=Math.max(0,delta)/period;loss+=Math.max(0,-delta)/period;}else{gain=(gain*(period-1)+Math.max(0,delta))/period;loss=(loss*(period-1)+Math.max(0,-delta))/period;}return i<period?null:loss===0?(gain===0?50:100):100-100/(1+gain/loss);});
}
export function macd(values,fast=12,slow=26,signal=9) {
  if(fast>=slow)throw new Error('MACD fast period must precede slow');
  const a=ema(values,fast),b=ema(values,slow),line=a.map((v,i)=>v===null||b[i]===null?null:v-b[i]);
  const valid=line.filter(v=>v!==null),smoothed=ema(valid,signal);let j=0;
  const sig=line.map(v=>v===null?null:smoothed[j++]);return {line,signal:sig,histogram:line.map((v,i)=>v===null||sig[i]===null?null:v-sig[i])};
}
export function metrics(snapshot) {
  const rows=candles(snapshot.rows),values=rows.map(r=>r.close),last=values.at(-1),prior=snapshot.priorClose;
  if(!Number.isFinite(prior)||prior<=0)throw new Error('Positive prior close required');
  return {close:last,change:last-prior,changePct:(last-prior)/prior*100,sma:sma(values,20),ema:ema(values,20),rsi:rsi(values),macd:macd(values)};
}
export function validateSnapshot(s) {
  if(!s||!['synthetic','historical','current'].includes(s.kind)||!s.id||!s.source||!s.instrument||!s.venue||!s.instrumentType||!s.currency||!s.unit||!s.interval||!s.timezone||!s.adjustment||!Number.isFinite(Date.parse(s.asOf))||!Number.isFinite(Date.parse(s.capturedAt)))throw new Error('Source identity, units and timestamps required');
  if(s.kind!=='synthetic'&&(!s.sourceUrl||!s.entitlementRef))throw new Error('Real data needs source URL and entitlement reference');
  if(Date.parse(s.capturedAt)<Date.parse(s.asOf)||s.rows.at(-1).time*1000>Date.parse(s.asOf))throw new Error('Snapshot timestamps disagree');
  if(s.kind==='current'&&(!Number.isFinite(Date.parse(s.expiresAt))||Date.parse(s.expiresAt)<=Date.parse(s.asOf)))throw new Error('Current data needs an expiry after its event time');
  candles(s.rows);metrics(s);return s;
}
export const formatted=(n,digits=2)=>Number.isFinite(n)?n.toLocaleString('en-US',{minimumFractionDigits:digits,maximumFractionDigits:digits}):'—';
