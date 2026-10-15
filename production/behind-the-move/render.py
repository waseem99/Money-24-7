from pathlib import Path
import subprocess,json,numpy as np
from scipy.signal import correlate
p=Path(__file__).resolve().parent;r=p.parent;s=p/'sources';(p/'clips').mkdir(exist_ok=True)
lines=sorted([x for x in json.loads((s/'speech.json').read_text()) if x['http']==200],key=lambda x:x['id']);timing=json.loads((s/'timing.json').read_text())
def run(cmd):subprocess.run(cmd,check=True)
def dur(f):return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(f)]))
def pcm(f):return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(f),'-ac','1','-ar','2000','-f','f32le','-']),dtype='float32')
shifts={};lens={}
for sp in ['Amina','Dexter']:
 a=pcm(s/sp/'source.webm');b=pcm(s/(sp+'.wav'));corr=correlate(a,b,method='fft');idx=np.argmax(corr);shifts[sp]=(idx-len(b)+1)/2000;lens[sp]=dur(s/sp/'source.webm');print(sp,'audio sync offset',shifts[sp],flush=True)
(p/'sync.json').write_text(json.dumps(shifts,indent=2))
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';bold=font.replace('.ttf','-Bold.ttf')
ticker=f"drawtext=fontfile={font}:textfile={p/'ticker.txt'}:fontsize=21:fontcolor=0x10253b:x=35-t*75:y=1039,drawbox=x=1580:y=1016:w=340:h=64:color=0xb71f2d:t=fill,drawtext=fontfile={bold}:text='MARKETS':fontsize=21:fontcolor=white:x=1613:y=1028,drawtext=fontfile={bold}:text='MOVE PEOPLE':fontsize=15:fontcolor=white:x=1613:y=1053"
segments=[];subtitles=[];clock=3
for line in lines:
 n=int(line['id']);sp=line['speaker'];entry=next(t for t in timing[sp] if t['id']==line['id']);length=entry['duration']+.35;start=max(0,entry['start']+shifts.get(sp,0));j=0 if n<=3 else 1 if n<=5 else 3 if n<=9 else 4 if n<=11 else 5
 clip=p/'clips'/(line['id']+'.mp4');cmd=['ffmpeg','-v','error','-y']
 if n==4:
  # Presenter-led animated value-chain explainer.
  cmd+=['-loop','1','-i',str(p/'value-chain.png'),'-i',str(s/(line['id']+'.wav'))]
  filt="[0:v]scale=1980:1114,crop=1920:1080:x='30+12*sin(t*.35)':y=17,format=yuv420p[v]";amap='1:a'
 else:
  for who in ['Amina','Dexter']:
   st=start if who==sp else max(0,lens[who]-2.4)
   cmd+=['-stream_loop','-1','-ss',str(st),'-i',str(s/who/'matte.mp4')]
  cmd+=['-loop','1','-i',str(r/'studio-reference/background.png'),'-loop','1','-i',str(r/'studio-reference/foreground.png'),'-loop','1','-i',str(p/f'overlay-{j}-{sp.upper()}.png'),'-i',str(s/(line['id']+'.wav'))]
  filt="[0:v]format=rgba,colorkey=0x00ff00:0.22:0.08,despill=green,scale=860:484[a];[1:v]format=rgba,colorkey=0x00ff00:0.22:0.08,despill=green,scale=860:484[d];[2:v][a]overlay=120:205[aa];[aa][d]overlay=770:205[dd];[dd][3:v]overlay=0:0[desk];"
  if sp=='Correspondent':
   cmd+=['-loop','1','-i',str(p/'call-panel.png')]
   filt+="[6:v]scale=780:439[remote];[desk]drawbox=x=780:y=180:w=815:h=494:color=0x10253b:t=fill[box];[box][remote]overlay=797:207[call];[5:a]showwaves=s=700x90:mode=line:colors=0x40d2e3:rate=25[wave];[call][wave]overlay=835:365[cam];"
  elif n in [2,3,7,9,10,11,12]:
   x=0 if sp=='Amina' else 390
   filt+=f"[desk]crop=1480:832:{x}:0,scale=1920:1080[cam];"
  else:filt+='[desk]null[cam];'
  filt+=f"[cam][4:v]overlay=0:0,{ticker},format=yuv420p[v]";amap='5:a'
 cmd+=['-filter_complex',filt,'-map','[v]','-map',amap,'-t',str(length),'-r','25','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-af','apad','-movflags','+faststart',str(clip)]
 run(cmd);segments.append(clip);subtitles.append({'start':clock,'end':clock+entry['duration'],'speaker':sp,'text':line['text']});clock+=length
 if n==5:
  # The unavailable narration is replaced by a clearly sourced visual interlude.
  clip=p/'clips'/'06-chart.mp4';run(['ffmpeg','-v','error','-y','-loop','1','-i',str(p/'power-chart.png'),'-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-vf',"zoompan=z='1+0.00012*on':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1920x1080:fps=25,fade=t=in:st=0:d=0.4,fade=t=out:st=10.6:d=0.4",'-t','11','-r','25','-c:v','libx264','-preset','fast','-crf','18','-c:a','aac',str(clip)]);segments.append(clip);clock+=11
print('segments ready',clock,flush=True)
(p/'captions.json').write_text(json.dumps(subtitles,indent=2))
# Intro/tail cards retain the approved identity.
for name,seconds in [('intro',3),('outro',4)]:
 im=r/'studio-v2'/(name+'.png');out=p/'clips'/(name+'.mp4');run(['ffmpeg','-v','error','-y','-loop','1','-i',str(im),'-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-vf','scale=1920:1080,format=yuv420p','-t',str(seconds),'-r','25','-c:v','libx264','-preset','fast','-crf','18','-c:a','aac',str(out)])
segments=[p/'clips/intro.mp4']+segments+[p/'clips/outro.mp4'];(p/'concat.txt').write_text(''.join("file '"+str(f)+"'\n" for f in segments))
run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(p/'concat.txt'),'-c','copy','-movflags','+faststart',str(p/'assembled.mp4')])
# Original quiet electronic bed. No external music licensing dependency.
run(['ffmpeg','-v','error','-y','-i',str(p/'assembled.mp4'),'-f','lavfi','-i','aevalsrc=0.008*sin(2*PI*110*t)+0.005*sin(2*PI*164.81*t)+0.004*sin(2*PI*220*t):s=48000','-filter_complex','[0:a]loudnorm=I=-16:TP=-1.5:LRA=9[voice];[1:a]afade=t=in:d=2,afade=t=out:st='+str(clock+1)+':d=3[bed];[voice][bed]amix=inputs=2:duration=first:normalize=0[a]','-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart',str(p/'STOCKS_BEHIND_THE_MOVE_COMPLETE_SAMPLE.mp4')])
print('COMPLETE',dur(p/'STOCKS_BEHIND_THE_MOVE_COMPLETE_SAMPLE.mp4'),flush=True)
