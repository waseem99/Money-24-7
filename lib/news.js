import {XMLParser} from 'fast-xml-parser';
export const feeds=[
  {id:'fed',name:'Federal Reserve',url:'https://www.federalreserve.gov/feeds/press_all.xml',host:'federalreserve.gov'},
  {id:'jobs',name:'BLS · Employment',url:'https://www.bls.gov/feed/empsit.rss',host:'bls.gov'},
  {id:'inflation',name:'BLS · Inflation',url:'https://www.bls.gov/feed/cpi.rss',host:'bls.gov'}
];
const array=x=>x?(Array.isArray(x)?x:[x]):[];
export function parseFeed(xml,source,now=Date.now()){
  if(xml.length>1000000||/<!DOCTYPE|<!ENTITY/i.test(xml))throw new Error('Invalid feed');
  const parsed=new XMLParser({ignoreAttributes:false,removeNSPrefix:true,parseTagValue:false,processEntities:false}).parse(xml);
  const items=parsed.rss?.channel?.item||parsed.feed?.entry;
  return array(items).flatMap(item=>{
    const title=typeof item.title==='string'?item.title:item.title?.['#text'];
    const link=typeof item.link==='string'?item.link:array(item.link).find(l=>!l['@_rel']||l['@_rel']==='alternate')?.['@_href'];
    const date=Date.parse(item.pubDate||item.published||item.updated||'');
    let url;try{url=new URL(link);}catch{return [];}
    if(!title||url.protocol!=='https:'||url.username||url.password||!(url.hostname===source.host||url.hostname.endsWith('.'+source.host))||!Number.isFinite(date)||date>now+300000)return [];
    return [{title:title.replace(/<[^>]*>/g,'').trim().slice(0,400),url:url.href,publishedAt:new Date(date).toISOString(),source:source.name}];
  }).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).slice(0,8);
}
