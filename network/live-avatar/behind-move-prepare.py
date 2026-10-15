import json,wave,subprocess
from pathlib import Path
p=Path('pilot-runs/behind-move');lines=json.loads((p/'speech.json').read_text());timing={}
for speaker in ['Amina','Dexter','Correspondent']:
 frames=[];offset=2.0;timing[speaker]=[]
 frames.append(bytes(24000*2*2))
 for l in sorted([x for x in lines if x['speaker']==speaker and x['http']==200],key=lambda x:x['id']):
  raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(p/(l['id']+'.wav')),'-f','s16le','-ac','1','-ar','24000','-'])
  timing[speaker].append({'id':l['id'],'start':offset,'duration':len(raw)/48000})
  frames.extend([raw,bytes(48000)]);offset+=len(raw)/48000+1
 frames.append(bytes(48000*3))
 with wave.open(str(p/(speaker+'.wav')),'wb') as w:w.setparams((1,2,24000,0,'NONE','not compressed'));w.writeframes(b''.join(frames))
 timing[speaker+'Duration']=offset+3
(p/'timing.json').write_text(json.dumps(timing,indent=2))
print(json.dumps(timing))
