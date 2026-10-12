/**
 * SIGNAL MARKET WATCH — R4+ bright newsroom actual 1080p bulletin.
 * Source-authenticated current affairs; no unverified live market data.
 * The voice actor/look pairs are frozen; R4 audio requires a separately authorized new generation.
 */
export const CAST=Object.freeze({
  LIZA:Object.freeze({name:'Liza',role:'ANCHOR',lookId:'5ee67ac453c34ffebd71e8eedb47b2fe',voiceId:'330290724a1b470fb63153f34d4c0183',voiceName:'Annie — Lifelike'}),
  LASSE:Object.freeze({name:'Lasse',role:'MARKETS CORRESPONDENT',lookId:'de9f36c26bd841c891489a0c9d6174de',voiceId:'00e3d285aba44b27a83c47c02c9c2d9c',voiceName:'Orson — Firm & Measured'})
});
export const SOURCES=Object.freeze({
  GLOBAL:{label:'GLOBAL MARKET REACTION',value:'Futures edge higher',date:'12 OCT 2026',status:'REPORTED',source:'REUTERS',url:'https://www.reuters.com/world/china/global-markets-wrapup-1-2026-10-12/'},
  BRENT:{label:'BRENT CRUDE',value:'$104.37 / BBL',date:'12 OCT 2026',status:'REPORTED SNAPSHOT',source:'REUTERS',url:'https://www.reuters.com/world/china/global-markets-wrapup-1-2026-10-12/'},
  BANKS:{label:'MAJOR US BANK EARNINGS',value:'THIS WEEK',date:'WEEK OF 12 OCT',status:'SCHEDULED / EXPECTED',source:'REUTERS',url:'https://www.reuters.com/business/wall-st-week-ahead-bank-earnings-cpi-headline-busy-markets-week-sp-500-hovers-2026-10-09/'},
  FED:{label:'FED TARGET RANGE',value:'3.75–4.00%',date:'16 SEP 2026',status:'OFFICIAL DECISION',source:'FEDERAL RESERVE',url:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm'},
  YIELD:{label:'US 10-YEAR YIELD',value:'~5.24%',date:'REPORTED 9 OCT',status:'REPORTED SNAPSHOT',source:'REUTERS',url:'https://www.reuters.com/business/wall-st-week-ahead-bank-earnings-cpi-headline-busy-markets-week-sp-500-hovers-2026-10-09/'},
  CPI:{label:'SEPTEMBER US CPI',value:'WED 14 OCT',date:'8:30 AM ET',status:'UPCOMING RELEASE',source:'US BLS',url:'https://www.bls.gov/schedule/2026/10_sched_list.htm'},
  CPIFORECAST:{label:'HEADLINE CPI ESTIMATE',value:'3.7% Y/Y',date:'FORECAST — NOT RELEASED',status:'FORECAST ONLY',source:'REUTERS',url:'https://www.reuters.com/business/wall-st-week-ahead-bank-earnings-cpi-headline-busy-markets-week-sp-500-hovers-2026-10-09/'},
  IMF:{label:'WORLD ECONOMIC OUTLOOK',value:'TUE 13 OCT',date:'UPCOMING PUBLICATION',status:'SCHEDULED',source:'IMF',url:'https://data.imf.org/en/Release-Calendar'}
});

export const SHOW=Object.freeze({
 id:'signal-market-watch-oct12-r4plus',edition:'12 OCT 2026',showName:'SIGNAL MARKET WATCH',
 format:'news-bulletin',durationTarget:180,aspect:'16:9',resolution:'1920×1080',fps:30,
 teaser:'Oil slips, banks report, CPI approaches — where markets stand.',
 captionRule:'Subtitles confined to a dedicated high-contrast region; no overlap with presenter lower-thirds or ticker.',
 speakingMediaStatus:'SIX_NEW_THREE_REUSED_CONTROLLED_TAKES',
 pacingPolicy:{preferredSpeakingWordsPerSecond:2.5,maxSilenceBetweenPresentersSeconds:0.20,pitchCorrectionOnTimeStretch:true,continuousFaceShotMaximumSeconds:3.5},
 newPaidVideoAuthorized:false,
 visualDesignVersion:'R4+ COBALT/CYAN/WHITE/AMBER',
 timelineMode:'ACTUAL_SOURCE_SPEAKING_DURATIONS_NO_PADDING',
 scenes:[
  {id:'ident',kind:'ident',duration:4.0,layout:'opening',title:'SIGNAL MARKET WATCH',eyebrow:'MONDAY 12 OCTOBER 2026',headline:'THE DAY IN MARKETS',sub:'OIL   ·   BANKS   ·   INFLATION',accent:'gold'},
  {id:'top_stories',kind:'speaker',role:'LIZA',duration:17.2,layout:'top-story',eyebrow:'TOP STORIES',headline:'A HIGH-STAKES WEEK BEGINS',sub:'OIL EASES  ·  BANKS REPORT  ·  CPI WEDNESDAY',sourceIds:['GLOBAL','BANKS','CPI'],accent:'gold',
   script:"Good morning. Welcome to Signal Market Watch. I'm Liza. A volatile start to the week: oil has pulled back, stocks are cautiously higher, and investors are bracing for major U.S. bank earnings and Wednesday's inflation report. We begin with what moved overnight."},
  {id:'global_market',kind:'speaker',role:'LASSE',duration:18.0,layout:'market-moves',eyebrow:'GLOBAL MARKETS',headline:'CAUTIOUS GAINS; OIL STILL HIGH',sub:'MONDAY MORNING MARKET SNAPSHOT',sourceIds:['GLOBAL','BRENT'],accent:'mint',
   script:"Asian shares were mixed on Monday, while U.S. stock-index futures edged higher. Reuters reported Brent crude near one hundred four dollars a barrel after retreating from recent highs. That is still an expensive energy backdrop, and markets remain sensitive to every new geopolitical headline."},
  {id:'earnings',kind:'speaker',role:'LIZA',duration:18.0,layout:'earnings',eyebrow:'WALL STREET',headline:'BIG BANKS FACE THE TEST',sub:'Q3 EARNINGS SEASON BEGINS THIS WEEK',sourceIds:['BANKS'],accent:'purple',
   script:"Now to Wall Street. Major U.S. banks begin third-quarter reporting this week. Analysts expect a strong earnings season, but the question is not simply profits. Investors will scrutinize credit losses, loan demand and management guidance for signs that higher costs are beginning to bite."},
  {id:'rates',kind:'speaker',role:'LASSE',existingVideoId:'ffd161164f25d09e26193f0edc81b343',duration:21.2,layout:'rates',eyebrow:'RATES WATCH',headline:'BOND YIELDS SEND A WARNING',sub:'POLICY RATE 3.75 TO 4.00 PERCENT',sourceIds:['FED','YIELD'],accent:'amber',
   script:"Two powerful forces are colliding. Big technology profits look promising. Yet borrowing is costly. In September the Federal Reserve raised its policy range to three and three quarters through four percent. Treasury yields have climbed to multi-decade highs. That's a serious valuation test, even for companies delivering good results."},
  {id:'energy',kind:'speaker',role:'LIZA',existingVideoId:'17b699ebce13c4ca1d890931a5385bea',duration:20.0,layout:'energy',eyebrow:'ENERGY',headline:'OIL RELIEF — BUT LITTLE COMFORT',sub:'HIGH FUEL AND SHIPPING COSTS REMAIN A RISK',sourceIds:['BRENT'],accent:'coral',
   script:"And now energy is complicating the picture. Brent crude has been above one hundred dollars, according to Monday's market reports. That can raise shipping and manufacturing costs. If profits look strong but households and businesses face higher bills, where do you look for the warning signs?"},
  {id:'inflation',kind:'speaker',role:'LASSE',existingVideoId:'c75a2070c0b2bc08edd380b64ae6bd52',duration:21.6,layout:'inflation',eyebrow:'COMING WEDNESDAY',headline:'INFLATION COULD RESET EXPECTATIONS',sub:'CPI · OCT 14 · 8:30 AM EASTERN',sourceIds:['CPI','CPIFORECAST'],accent:'mint',
   script:"Start with the major banks. Watch loan demand, credit losses, and what executives say about customers. Then Wednesday's consumer inflation report. A hotter reading could keep pressure on bond yields and highly valued shares. A cooler one could ease it. Neither outcome is certain. That's why this week matters."},
  {id:'world_outlook',kind:'speaker',role:'LIZA',duration:18.8,layout:'calendar',eyebrow:'WORLD ECONOMY',headline:'IMF OUTLOOK DUE TUESDAY',sub:'GLOBAL GROWTH, DEBT AND ENERGY RISKS',sourceIds:['IMF'],accent:'purple',
   script:"Beyond the United States, the IMF's World Economic Outlook is scheduled for Tuesday. Investors will be watching its assessment of global growth, debt and trade risks. With energy prices elevated and financing costs high, there is opportunity on one side and mounting pressure on the other."},
  {id:'watchlist',kind:'speaker',role:'LASSE',duration:19.6,layout:'watchlist',eyebrow:'WHAT WE’RE WATCHING',headline:'THREE TESTS IN THE NEXT 48 HOURS',sub:'CREDIT  ·  INFLATION  ·  OIL',sourceIds:['BANKS','CPI','BRENT'],accent:'gold',
   script:"Here are the three signals I'm watching: banks' credit-loss provisions, Wednesday's inflation reading compared with forecasts, and whether oil stays elevated. Strong earnings could lift confidence. Hotter inflation or weaker company guidance could reverse it. None of those outcomes is assured, and we will separate results from expectations."},
  {id:'signoff',kind:'speaker',role:'LIZA',duration:18.0,layout:'signoff',eyebrow:'SIGNAL MARKET WATCH',headline:'THE HEADLINES. THE CONTEXT. THE NEXT MOVE.',sub:'MONDAY 12 OCTOBER 2026',sourceIds:[],accent:'gold',
   script:"That is the Market Watch briefing for Monday, October twelfth. The next moves depend on data still to come, not only the headlines already on our screens. I'm Liza, with Lasse. Thanks for watching Signal Market Watch. We'll see you at the next update."},
  {id:'end',kind:'end',duration:4,layout:'end',eyebrow:'SIGNAL',headline:'MARKET WATCH',sub:'SEE YOU AT THE NEXT UPDATE',accent:'gold'}
 ]
});
export function auditShow(s=SHOW){
 if(s.showName!=='SIGNAL MARKET WATCH'||s.edition!=='12 OCT 2026'||s.newPaidVideoAuthorized!==false)throw new Error('Programme identity or payment state changed');
 if(s.scenes[1]?.script?.indexOf('Welcome to Signal Market Watch')<0||s.scenes.at(-2)?.script?.indexOf('Thanks for watching')<0)throw new Error('On-air welcome/signoff missing');
 if(s.scenes.filter(x=>x.kind==='speaker').length!==9)throw new Error('Expected 9 on-air reported news segments');
 const sourceKeys=new Set(Object.keys(SOURCES)),ids=new Set();let duration=0;
 const reused=s.scenes.filter(x=>x.kind==='speaker'&&x.existingVideoId);
 if(reused.length!==3)throw Error('Exactly three original dated-news recordings must be reused');
 for(const sc of s.scenes){
  if(!sc.id||ids.has(sc.id)||!['ident','speaker','end'].includes(sc.kind)||!sc.headline)throw new Error('Invalid news scene');ids.add(sc.id);
  if(sc.kind==='speaker'&&(!CAST[sc.role]||!sc.script||sc.script.split(/\s+/).length>55))throw new Error('Unapproved speaker or lengthy script');
  if(sc.sourceIds&&!sc.sourceIds.every(id=>sourceKeys.has(id)))throw new Error('Unsupported market claim');
  duration+=sc.duration;
 }
 if(duration<175||duration>185)throw new Error('Outside tight 3-minute news bulletin range');
 for(const [key,source] of Object.entries(SOURCES)){
  if(!source.url?.startsWith('https://')||!source.source||!source.date||!source.status)throw new Error('Missing source proof '+key);
  if(key==='CPI'&&source.status!=='UPCOMING RELEASE')throw new Error('CPI release misreported as already available');
  if(key==='CPIFORECAST'&&source.status!=='FORECAST ONLY')throw new Error('CPI forecast misrepresented as actual');
 }
 return {show:s.showName,date:s.edition,scenes:s.scenes.length,speakerSegments:s.scenes.filter(x=>x.kind==='speaker').length,targetSeconds:duration,wordCount:s.scenes.reduce((a,c)=>a+(c.script?.trim().split(/\s+/).length||0),0),billablePermission:false};
}
if(process.argv[1]?.endsWith('newsroom-r4-plan.mjs'))console.log(JSON.stringify(auditShow(),null,2));