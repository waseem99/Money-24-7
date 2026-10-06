import {isFresh} from './market.js';
const aliases=[['BTC-USD',/\b(bitcoin|btc)\b/i],['ETH-USD',/\b(ethereum|ether|eth)\b/i],['SOL-USD',/\b(solana|sol)\b/i],['AAPL',/\b(apple|aapl)\b/i],['MSFT',/\b(microsoft|msft)\b/i],['NVDA',/\b(nvidia|nvda)\b/i],['SPY',/\b(spy|s&p)\b/i]];
export function answerDesk(question,{quotes=[],stocks=[],news}={},now=Date.now()){
  const q=question.trim();const result=(text,sources=[])=>({text,sources,answeredAt:new Date(now).toISOString()});
  if(!q||q.length>300)return result('Please enter a question of 1–300 characters.');
  if(/\b(buy|sell|invest|recommend|prediction|predict|forecast|target price|should i)\b/i.test(q))return result('This desk can report sourced prices and explain market terms. It cannot recommend trades or predict returns. Ask for a price, official headline, or an explanation of the 24-hour change.');
  if(/\b(why|cause|caused|reason)\b/i.test(q))return result('A price change alone does not establish its cause. The connected feeds do not provide verified causal analysis. You can ask for the observed price or official releases.');
  if(/\b(24.?hour|rolling|percentage change|percent change)\b/i.test(q)&&/\b(what|mean|explain|how)\b/i.test(q))return result('A rolling 24-hour change compares the latest price with its price 24 hours earlier: (latest ÷ earlier − 1) × 100. It is different from a stock’s return during a trading session.');
  const asset=aliases.find(([,pattern])=>pattern.test(q))?.[0];
  if(asset){
    const row=[...quotes,...stocks].find(x=>x.symbol===asset);
    if(!row||!Number.isFinite(row.price)||row.price<=0)return result(`No verified ${asset} quote is available in this viewing session. ${asset.includes('-')?'Wait for the market feed to connect.':'The stock data account may be unconfigured or unavailable.'}`);
    const timestamp=row.asOf||row.receivedAt;const time=Date.parse(timestamp);
    if(!Number.isFinite(time)||time>now+5000||now-time>86400000)return result(`The available ${asset} quote has an absent or old timestamp. I cannot provide it as a current quote.`);
    const live=isFresh(row,now),label=live?'Live trade':'Snapshot';
    const change=Number.isFinite(row.change)?` ${row.change>=0?'Up':'Down'} ${Math.abs(row.change).toFixed(2)}% ${asset.includes('-')?'over the rolling 24-hour comparison':'against the provider’s previous close'}.`:'';
    return result(`${asset}: ${row.price.toLocaleString('en-US',{style:'currency',currency:'USD'})}. ${label} from ${row.source}.${change} ${row.asOf?'Source time':'Fetched at'}: ${new Date(time).toISOString()}.${live?'':' This is not a live quote; the source may cache snapshots.'}`);
  }
  if(/\b(inflation|cpi|unemployment|employment|interest rate|fed rate|gdp)\b/i.test(q)&&/\b(latest|current|rate|number|today|how much)\b/i.test(q))return result('Verified numeric economic indicators are not connected yet. The economics desk contains dated release headlines, which are not enough to establish the latest inflation, jobs or interest-rate figure. Ask “Show official headlines” to inspect the source releases.');
  if(/\b(news|headline|headlines|release|releases|federal reserve|economics)\b/i.test(q)){
    const fetched=Date.parse(news?.fetchedAt);
    if(!Number.isFinite(fetched)||now-fetched>900000||fetched>now+300000)return result('The official release feed has not refreshed recently. Please try again after the economics desk refreshes.');
    const items=(news.items||[]).filter(x=>{const d=Date.parse(x.publishedAt);return Number.isFinite(d)&&d<=now;}).slice(0,3);
    if(!items.length)return result('No verified official headlines are available right now.');
    return result('Recent official releases—not a breaking news feed:\n\n'+items.map(x=>`${x.source} · ${new Date(x.publishedAt).toISOString().slice(0,10)}\n${x.title}`).join('\n\n'),items.map(x=>({title:x.source+' — '+x.title,url:x.url})));
  }
  return result('This source-based desk currently supports BTC, ETH, SOL, configured AAPL/MSFT/NVDA/SPY quotes, official headlines, and explanations of the 24-hour change. It does not yet provide general AI chat or answers beyond those sources.');
}
