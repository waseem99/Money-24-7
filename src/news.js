export function mountNews(onUpdate=()=>{}){
  const section=document.createElement('section');section.className='news-desk';
  section.innerHTML='<div class="rundown-top"><h2>Economics desk</h2><small>OFFICIAL RELEASES</small></div><p class="source-note">Federal Reserve policy, US employment and inflation. Publication dates are shown; these releases are not a continuous newswire.</p><p id="news-status" role="status">Connecting to official sources…</p><div class="news-grid"></div>';
  document.querySelector('.transcript').before(section);
  const status=section.querySelector('#news-status'),grid=section.querySelector('.news-grid');
  async function refresh(){try{
    const response=await fetch('/api/news',{signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error();const data=await response.json();onUpdate(data);
    grid.replaceChildren();
    for(const item of data.items){const card=document.createElement('article'),meta=document.createElement('p'),link=document.createElement('a');meta.className='source-note';meta.textContent=`${item.source} · ${new Date(item.publishedAt).toLocaleString('en-GB',{timeZone:'UTC'})} UTC`;link.textContent=item.title;link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';card.append(meta,link);grid.append(card);}
    const unavailable=data.sources.filter(s=>s.status!=='available').map(s=>s.name);
    status.textContent=`${data.items.length} releases · Checked ${new Date(data.fetchedAt).toLocaleTimeString('en-GB',{timeZone:'UTC'})} UTC${unavailable.length?' · Unavailable: '+unavailable.join(', '):''}`;
  }catch{status.textContent='Official sources could not be refreshed. Any displayed releases are from the previous fetch.';}}
  refresh();const timer=setInterval(refresh,300000);window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
}
