export function spokenText(text,rules=[]) {
  if(!Array.isArray(rules)||rules.length>100)throw new Error('Invalid pronunciation dictionary');
  let result=text;
  for(const rule of [...rules].sort((a,b)=>String(b.term).length-String(a.term).length)){
    if(typeof rule.term!=='string'||typeof rule.say!=='string'||!rule.term.trim()||!rule.say.trim()||rule.term.length>80||rule.say.length>120||/[<>\r\n]/.test(rule.term+rule.say))throw new Error('Invalid pronunciation override');
    if((rule.term.match(/\d+/g)||[]).join()!==(rule.say.match(/\d+/g)||[]).join())throw new Error('Pronunciation override changes numerical claims');
    const escaped=rule.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    result=result.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`,'giu'),()=>rule.say);
  }
  return result;
}
