export function economicsBulletin(feed,now=Date.now()){
  const fetched=Date.parse(feed?.fetchedAt);
  if(!Number.isFinite(fetched)||now-fetched>900000||fetched>now+300000)return 'This is the Signal economics desk. The official releases feed could not be refreshed. We will return to verified headlines when the source is available.';
  const items=(feed.items||[]).filter(item=>{const date=Date.parse(item.publishedAt);return Number.isFinite(date)&&date<=now&&typeof item.title==='string'&&item.title.trim()&&typeof item.source==='string';}).slice(0,3);
  if(!items.length)return 'This is the Signal economics desk. No verified official releases are currently available.';
  return 'This is the Signal economics desk. These are recent official releases, not a breaking news bulletin. '+items.map(item=>`${item.source}, published ${new Date(item.publishedAt).toLocaleDateString('en-US',{timeZone:'UTC',month:'long',day:'numeric',year:'numeric'})}: ${item.title}.`).join(' ')+' Original source links are available in the economics desk below. These headlines alone do not establish the direction of markets.';
}
export const programOrder=[0,3,1,2];
export function nextSegment(current){return programOrder[(programOrder.indexOf(current)+1)%programOrder.length];}
