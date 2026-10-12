// Stocks R5 quality-first return to the user-approved original presenters.
// Fresh October 12, 2026 reported snapshot — NOT a live stream.
export const EDITION = Object.freeze({
  title:'Stocks | October 12 | What Is Moving Markets',
  date:'2026-10-12', brand:'Stocks', falseLive:true,
  allLogoPlacements:['top-left broadcast bug only'],
  noWallLogo:true,noRepeatProps:true,
  validatedDataAsOf:'2026-10-12T09:40:00-04:00',
  marketSource:'Reuters, October 12, 2026, 09:40 ET',
  indexes:[
    {name:'Dow Jones',value:51761.98,changePercent:0.21},
    {name:'S&P 500',value:7817.68,changePercent:0.08},
    {name:'Nasdaq Composite',value:27355.94,changePercent:-0.04}
  ],
  sectors:[{name:'Energy',percent:1.8},{name:'Technology',percent:-0.2}],
  calendar:[{title:'Major U.S. bank earnings',date:'2026-10-13'},{title:'September CPI report',date:'2026-10-14',localTime:'08:30 ET'}]
});
export const LOCKED_CAST = Object.freeze({
  NORA:{onAirName:'Nora Ellery',providerName:'Liza Office 6',
    avatarId:'5ee67ac453c34ffebd71e8eedb47b2fe',
    voiceId:'330290724a1b470fb63153f34d4c0183',
    voiceName:'Annie - Lifelike',engine:'avatar_iii',
    originalVideoId:'9180a425a289d33d75c4ef82178ce9a8'},
  MARCUS:{onAirName:'Marcus Varden',providerName:'Lasse Office 3',
    avatarId:'de9f36c26bd841c891489a0c9d6174de',
    voiceId:'00e3d285aba44b27a83c47c02c9c2d9c',
    voiceName:'Orson - Firm & Measured',engine:'avatar_iii',
    originalVideoId:'d69f9b79b86a04dec1dee7473e9cf9db'}
});
export const PROOF = Object.freeze({
  version:'R5-original-cast-speech', format:'16:9',nativeResolution:'1080p',
  targetMaximumSeconds:26, estimatedMaxPerTurnSeconds:16,
  engine:'avatar_iii',
  editingPlaybackRate:1.08,
  scriptOrder:['NORA','MARCUS'],
  turns:{
    NORA:"Welcome to Stocks. Monday's market is split: energy is rising, technology is slipping. Marcus, what's behind it?",
    MARCUS:"Oil is the pressure point, Nora. At nine-forty Eastern, Reuters had energy up one point eight percent and technology down zero point two. Bank earnings and Wednesday's inflation report are next."
  }
});
export function audit(){
 const errors=[];
 if(EDITION.brand!=='Stocks'||EDITION.noWallLogo!==true||EDITION.allLogoPlacements.length!==1)errors.push('Brand lock failed');
 if(!EDITION.falseLive||EDITION.validatedDataAsOf!=='2026-10-12T09:40:00-04:00')errors.push('Source time lock failed');
 const words=[];
 for(const role of PROOF.scriptOrder){
  const s=PROOF.turns[role],person=LOCKED_CAST[role];
  if(!s||!person||person.engine!=='avatar_iii')errors.push('Unrecognized cast or engine: '+role);
  else{
   const n=s.split(/\s+/).length;
   if(n<13||n>40)errors.push('Unbounded speech: '+role);
   if(/\b(liza|lasse|signal|stalks|stocks gpt|demo data|live stream)\b/i.test(s))errors.push('Old identities or unsupported claims: '+role);
   words.push({role,words:n,avatarId:person?.avatarId,voiceId:person?.voiceId});
  }
 }
 if(PROOF.targetMaximumSeconds>28||PROOF.estimatedMaxPerTurnSeconds>16)errors.push('Cost-bounded test exceeds estimated time');
 return {pass:errors.length===0,errors,format:PROOF.format,engine:PROOF.engine,originalCast:true,sourceDate:EDITION.date,
  speakers:words,expectedAudioVideoPlaybackRate:PROOF.editingPlaybackRate,
  estimatedMaximumBothUSD:Math.ceil(PROOF.estimatedMaxPerTurnSeconds*2/60*100)/100,
  paidVideoPostsMadeByAudit:0,fullMasterAuthorized:false};
}
