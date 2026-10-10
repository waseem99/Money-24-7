// Preserve editorial token identity through pronunciation substitutions.
export function speechMap(text,rules=[]) {
  if(!Array.isArray(rules)||rules.length>100)throw new Error('Invalid pronunciation rules');
  const tokens=[...text.matchAll(/\S+/g)];
  const ordered=[...rules].sort((a,b)=>b.term.length-a.term.length);
  for(const r of ordered)if(typeof r.term!=='string'||typeof r.say!=='string'||!r.term.trim()||!r.say.trim()||/[<>\r\n]/.test(r.term+r.say)||r.term.length>80||r.say.length>120||(r.term.match(/\d+/g)||[]).join()!==(r.say.match(/\d+/g)||[]).join())throw new Error('Invalid pronunciation rule');
  let spoken='',i=0;const offsets=new Map();
  while(i<text.length){
    const rule=ordered.find(r=>text.slice(i,i+r.term.length).toLowerCase()===r.term.toLowerCase()&&!/[\p{L}\p{N}]/u.test(text[i-1]||' ')&&!/[\p{L}\p{N}]/u.test(text[i+r.term.length]||' '));
    const length=rule?rule.term.length:1;
    for(let n=0;n<length;n++)offsets.set(i+n,spoken.length);
    spoken+=rule?rule.say:text[i];i+=length;
  }
  return {spokenText:spoken,tokenOffsets:tokens.map(t=>offsets.get(t.index))};
}
export function bindAlignment(text,rules,alignment){
  const mapped=speechMap(text,rules);
  if(!alignment||alignment.characters?.join('')!==mapped.spokenText||alignment.characters.length!==alignment.character_start_times_seconds?.length||alignment.characters.length!==alignment.character_end_times_seconds?.length)throw new Error('Alignment must match the exact spoken text; normalized text cannot be guessed');
  let last=0;
  for(let i=0;i<alignment.characters.length;i++){const a=alignment.character_start_times_seconds[i],b=alignment.character_end_times_seconds[i];if(!Number.isFinite(a)||!Number.isFinite(b)||a<last||b<a)throw new Error('Invalid alignment timestamps');last=a;}
  return {...mapped,alignment};
}
