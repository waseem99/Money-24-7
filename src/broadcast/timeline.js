import {validateProgramme} from './contracts.js';
export function compileTimeline(programme, assets={}, {fixture=false}={}) {
  validateProgramme(programme);
  return programme.cues.map(c=>{
    const turn=programme.turns.find(t=>t.id===c.turnId),asset=assets[turn.id];let local;
    if(fixture)local=c.tokenStart/turn.text.trim().split(/\s+/).length*turn.durationMs;
    else {
      if(!asset?.alignment||!Array.isArray(asset.tokenOffsets))throw new Error('Measured alignment and editorial token map required');
      const index=asset.tokenOffsets[c.tokenStart];
      local=asset.alignment.character_start_times_seconds[index]*1000+(asset.offsetMs||0);
    }
    const atMs=turn.startMs+local+c.offsetMs;
    if(!Number.isFinite(atMs)||atMs<turn.startMs||atMs>=turn.startMs+turn.durationMs)throw new Error('Cue outside measured turn');
    return {...c,atMs,frame:Math.round(atMs*programme.fps/1000),audioSample:Math.round(atMs*48),timing:fixture?'estimated-fixture':'measured'};
  }).sort((a,b)=>a.atMs-b.atMs||a.id.localeCompare(b.id));
}
export function sceneState(programme,timeMs,timeline, {reducedMotion=false}={}) {
  const at=Math.max(0,Math.min(programme.durationMs-1,timeMs));
  let scene=programme.scenes.find(s=>at>=s.startMs&&at<s.startMs+s.durationMs);
  const turn=programme.turns.find(t=>at>=t.startMs&&at<t.startMs+t.durationMs);
  const cues=timeline.filter(c=>scene.turnIds.includes(c.turnId)&&c.atMs<=at);
  const latest=action=>cues.filter(c=>c.action===action).at(-1);
  const camera=latest('camera.cut');if(camera)scene={...scene,template:camera.template};
  return {at,scene,turn,speakerId:turn?.speakerId||null,localMs:at-scene.startMs,chartTarget:latest('chart.highlight')?.targetIndex,boardTarget:latest('board.highlight')?.targetIndex,headline:latest('headline.set')?.label||scene.headline,chartRange:latest('chart.range')?.targetIndex,chartVisible:!programme.cues.some(c=>scene.turnIds.includes(c.turnId)&&c.action==='chart.reveal')||!!latest('chart.reveal'),reaction:latest('listener.react'),camera:latest('camera.cut'),reveal:reducedMotion?1:Math.min(1,(at-scene.startMs)/350),tickerOffset:reducedMotion?0:(at/1000*65)%(programme.snapshots.length*640),cues};
}
export function slots(scene) {
  const ids=scene.presenterIds;
  switch(scene.template){
    case 'anchor-full':return [{presenterId:ids[0],x:60,y:165,w:1090,h:690,kind:'boxed'}];
    case 'discussion-two':return ids.slice(0,2).map((presenterId,i)=>({presenterId,x:60+i*920,y:165,w:880,h:690,kind:'boxed'}));
    case 'presenter-board':return [{presenterId:ids[1]||ids[0],x:60,y:165,w:900,h:690,kind:'boxed'}];
    case 'anchor-analyst-wall':return [{presenterId:ids[0],x:60,y:165,w:480,h:690,kind:'boxed'},{presenterId:ids[1],x:1390,y:238,w:455,h:617,kind:'alpha'}];
    case 'story-visual':return [{presenterId:ids[0],x:1355,y:165,w:505,h:690,kind:'boxed'}];
    default:return [];
  }
}
