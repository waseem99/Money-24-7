import {metrics} from './data.js';
export const theme={version:1,background:'#07162a',surface:'#102944',accent:'#41e0d0',blue:'#0967bd',ink:'#f4f7fa',muted:'#94acc2',up:'#5aebae',down:'#ff7c87',font:'DejaVu Sans, Arial, sans-serif'};
export function exampleProgramme(profile='sample') {
  const snapshots=['SIGNAL 500','TECH 100','INDUSTRIAL 30','SMALL CAP'].map((instrument,k)=>{
    let prior=100+k*40;const rows=Array.from({length:90},(_,i)=>{const open=prior,close=Math.round((open+Math.sin(i*.57+k)*.52+.12)*100)/100;prior=close;return {time:1767225600+i*300,open,close,high:Math.max(open,close)+.4,low:Math.min(open,close)-.35,volume:1200+Math.round((Math.sin(i*.7)+1)*800)};});
    return {id:`source-${k}`,kind:'synthetic',source:'Deterministic design fixture',instrument,venue:'SIMULATED',instrumentType:'illustrative-index',currency:'USD',unit:'index-points',interval:'5m',timezone:'UTC',adjustment:'unadjusted',priorClose:100+k*40,asOf:'2026-01-01T07:25:00Z',capturedAt:'2026-01-01T07:25:00Z',rows};
  });
  const claims=snapshots.map(s=>({id:`claim-${s.id}`,snapshotId:s.id,subject:s.instrument,metric:'changePct',value:metrics(s).changePct,unit:'percent',asOf:s.asOf}));
  const sampleDurations=[6,7,8,9,8,7];
  const durations=profile==='pilot'?[15,25,45,30,30,30,40,35,30,20]:sampleDurations;
  const layouts=['anchor-full','discussion-two','presenter-board','anchor-analyst-wall','chart-full','story-visual'];
  const lines=[
    'Welcome to Signal. We bring the market story into focus.',
    'Daniel, what should viewers look for before interpreting this move?',
    'Start with the comparison period. The board keeps each instrument and its change together.',
    'Notice this section of the chart. Price and volume answer different parts of the question.',
    'The highlighted candle marks our discussion point. An indicator adds context, without guaranteeing what comes next.',
    'And that is the key distinction: describe the evidence, then explain the uncertainty.'
  ];
  const expansions=[
    'This is a prepared demonstration using illustrative data. We will move from the broad market picture to a closer look at the chart, keeping the evidence visible as we go.',
    'A move can look very different depending on where you begin the comparison. The useful question is whether the price, trading activity and wider context tell a consistent story. Let us work through that together.',
    'The direction of a move is only the starting point. Each row should be read with its timestamp, currency and comparison basis. Similar colours do not mean that different instruments have behaved in the same way. A broad index and a sector measure can tell different stories. We keep the source snapshot fixed during this explanation so the display matches the words you hear. Newer prices belong in a separately labelled update. That distinction keeps the analysis clear.',
    'This is where the full chart helps. A single candle is one observation in a longer sequence. We can compare the closing price with the range of the candle and the activity underneath. The highlight follows the part being discussed, while the rest of the history stays visible. That gives viewers a reference point rather than an isolated number.',
    'The lower panels add context. Volume describes trading activity. A moving average smooths the price history using a defined period. Momentum indicators summarize another aspect of that same history. They are calculations with assumptions and warm-up requirements, rather than independent facts about the future. We show missing history as unavailable instead of filling it with invented values.',
    'Here is the broader interpretation. When different measures appear to support the same reading, that can make an explanation more useful. But a pattern is still a pattern. It does not establish what will happen next or prove the cause of a market move. The explanation should make that uncertainty visible, alongside the evidence being used.',
    'Maya, the distinction matters because market commentary can sound more certain than the evidence allows. Our job is to connect a clear observation to an understandable explanation. The displayed chart should use the same snapshot as the spoken analysis. If new information changes the picture, we should introduce it as an update. We should not silently change the numbers behind a sentence already being spoken. That is how the programme can remain coherent even when the underlying data changes.',
    'For this prepared audience question, a viewer asks how to read a sharp move. Start by checking the instrument and timeframe. Then compare activity and the broader history. Ask whether the available evidence supports the explanation being offered. Several explanations may remain possible. A careful answer can describe those limits without pretending that the chart alone settles the question.',
    'Exactly. A useful newsroom exchange gives the viewer a way to understand the information. One presenter can ask the question, the other can work through the evidence, and the graphic can reveal the relevant detail at the right moment. The final programme should feel like one coordinated explanation, with natural handovers and enough breathing room to follow the chart.',
    'That is our brief: clear sources, consistent timing and context alongside the figures. This demonstration uses AI presenters and illustrative data. Thank you for watching Signal. We will return with the next story and the evidence behind it.'
  ];
  let start=0;
  const scenes=durations.map((duration,i)=>{const s={id:`scene-${i}`,template:layouts[i%6],startMs:start,durationMs:duration*1000,snapshotId:'source-0',presenterIds:['maya','daniel'],turnIds:[`turn-${i}`],headline:['THE BIGGER PICTURE','TWO VOICES. ONE CLEAR STORY.','MARKETS AT A GLANCE','LOOK BEYOND THE HEADLINE','THE CHART IN CONTEXT','WHAT THE EVIDENCE TELLS US'][i%6],description:'Illustrative market walkthrough'};start+=s.durationMs;return s;});
  const turns=scenes.map((s,i)=>({id:`turn-${i}`,speakerId:i%6===0||i%6===1||i%6===5?'maya':'daniel',startMs:s.startMs+250,durationMs:s.durationMs-500,text:profile==='pilot'?expansions[i]:lines[i],claimIds:[]}));
  const cues=turns.map((t,i)=>({id:`cue-${i}`,turnId:t.id,action:i%6===2?'board.highlight':'chart.highlight',tokenStart:Math.min(3,t.text.split(' ').length-1),tokenEnd:Math.min(5,t.text.split(' ').length),targetIndex:i%6===2?0:65,offsetMs:0}));
  return {schemaVersion:2,id:`signal-v2-${profile}`,revision:1,profile,title:'The bigger picture',disclosure:'AI presenters · Illustrative data · Prepared demonstration',width:1920,height:1080,fps:30,durationMs:start,theme:structuredClone(theme),presenters:[{id:'maya',name:'Maya',role:'Anchor',look:'navy-desk',configRef:'ANCHOR',pronunciations:[]},{id:'daniel',name:'Daniel',role:'Markets analyst',look:'standing-navy',configRef:'ANALYST',pronunciations:[]}],snapshots,claims,turns,scenes,cues};
}
