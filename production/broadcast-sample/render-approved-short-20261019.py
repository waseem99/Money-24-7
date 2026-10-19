from pathlib import Path
import subprocess,importlib.util,sys,json
from PIL import Image,ImageDraw,ImageFont
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parent; O=R/'render'; O.mkdir(exist_ok=True)
ROOT=Path(__file__).resolve().parent if (Path(__file__).resolve().parent/'brand.mjs').exists() else R.parent/'stocks-execution/production/broadcast-sample'
sys.argv.append(str(O))
spec=importlib.util.spec_from_file_location('orbit',ROOT/'stocks-orbit.py');g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
INK='#101e30';TEAL='#226b72';GOLD='#bfa36b';WHITE='#faf8f2'
def font(n,b=False):return ImageFont.truetype('/usr/share/fonts/opentype/urw-base35/NimbusSans-'+('Bold' if b else 'Regular')+'.otf',n)
def text(d,xy,s,n,c=WHITE,b=False):d.text(xy,s,font=font(n,b),fill=c)
def run(a):subprocess.run(['ffmpeg','-v','error','-y',*map(str,a)],check=True)
headlines=['Tech rebounds. Can earnings deliver?','AI spending faces the earnings test','Look beyond the headline','The numbers. The outlook. The story.']
tags=['NORA | THE BUSINESS BRIEF','MARCUS | MARKETS','NORA | THE TAKEAWAY','STOCKS | THE BUSINESS BRIEF']
topics=['19 OCTOBER 2026  /  U.S. MARKET UPDATE','REVENUE  /  MARGINS  /  CASH FLOW','THE HEADLINE IS ONLY THE START','RECORDED EDITION  /  AI PRESENTERS']
ticker='19 OCT 2026   •   Technology shares rebound after last week’s selloff   •   Earnings and company outlooks in focus   •   Lower oil prices support sentiment   •   Source: Reuters, 19 Oct 2026   •   Recorded edition — AI presenters   •   '
(O/'ticker.txt').write_text(ticker)
def overlay(i):
 im=Image.new('RGBA',(1920,1080));d=ImageDraw.Draw(im)
 d.rectangle((1620,36,1878,115),fill=INK);logo=g.logo.resize((45,57),Image.Resampling.LANCZOS);im.alpha_composite(logo,(1638,46));text(d,(1698,54),'Stocks',45,b=True)
 d.rectangle((50,40,460,78),fill=INK);text(d,(65,48),'19 OCT 2026  /  RECORDED EDITION',20)
 # Graphic stack stays below the presenters' faces and gestures.
 d.rectangle((52,861,1020,904),fill=GOLD);text(d,(78,873),tags[i],25,INK,True)
 d.rectangle((52,904,1868,974),fill=WHITE);text(d,(78,919),headlines[i],40,INK,True)
 d.rectangle((52,974,1868,1009),fill=TEAL);text(d,(78,985),topics[i],18)
 d.rectangle((0,1010,1920,1080),fill=INK)
 im.save(O/f'overlay-{i}.png')
def studio(i,start):
 overlay(i);src=R/'sources'/f'{i:02d}.mp4';trim=2.95 if i==0 else 0;dur=float(json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-of','json',str(src)]))['format']['duration'])-trim
 filt=f"[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=24[v];[v][1:v]overlay=0:0,drawtext=fontfile=/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf:textfile={O/'ticker.txt'}:fontsize=30:fontcolor=white:x=250-mod((t+{start})*135\\,tw):y=1031,drawtext=fontfile=/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf:textfile={O/'ticker.txt'}:fontsize=30:fontcolor=white:x=250+tw-mod((t+{start})*135\\,tw):y=1031,drawbox=x=0:y=1010:w=250:h=70:color=0x226b72:t=fill,drawtext=fontfile=/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf:text='STOCKS / BRIEF':fontsize=25:fontcolor=white:x=24:y=1033[out]"
 run(['-threads','2','-ss',trim,'-i',src,'-i',O/f'overlay-{i}.png','-filter_complex_threads','1','-filter_complex',filt,'-map','[out]','-map','0:a','-t',dur,'-c:v','libx264','-threads','2','-preset','fast','-crf','19','-pix_fmt','yuv420p','-af','loudnorm=I=-16:TP=-1.5:LRA=9','-ar','48000','-ac','2','-c:a','aac','-b:a','192k',O/f'scene-{i}.mp4'])
 print('Composited',i,flush=True)
def sting(name,dur,end=False):
 p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1280x720','-r','24','-i','-','-vf','scale=1920:1080','-an','-c:v','libx264','-threads','2','-preset','fast','-crf','19','-pix_fmt','yuv420p',str(O/f'{name}-silent.mp4')],stdin=subprocess.PIPE)
 for n in range(round(dur*24)):
  im=g.globe_identity(n/24+.5);d=ImageDraw.Draw(im)
  d.rectangle((638,210,1279,650),fill='#f0eee8')
  g.txt(d,(650,222),'19 OCTOBER 2026',22,TEAL,True)
  g.txt(d,(645,279),'STOCKS',74,INK,True)
  g.txt(d,(650,373),'THE BUSINESS BRIEF',28,TEAL,True)
  d.rectangle((650,436,1160,440),fill=GOLD)
  g.txt(d,(650,478),'Thanks for watching.' if end else 'The rebound. The earnings test.',25,INK)
  g.txt(d,(650,601),'RECORDED EDITION  /  AI PRESENTERS',17,TEAL)
  if end:
   g.txt(d,(650,552),'News and analysis. Not investment advice.',17,INK)
  p.stdin.write(im.convert('RGB').tobytes())
 p.stdin.close();assert p.wait()==0
 run(['-i',O/f'{name}-silent.mp4','-i',R.parent/'program-package/sting.wav','-map','0:v','-map','1:a','-t',dur,'-c:v','copy','-af',f'apad,afade=t=out:st={dur-.6}:d=0.6,volume=0.4','-ar','48000','-ac','2','-c:a','aac',O/f'{name}.mp4'])
if __name__=='__main__':
 sting('open',1.5);sting('end',2.5,True)
 start=1.5
 for i in range(4):
  studio(i,start)
  start+=float(json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-of','json',str(O/f'scene-{i}.mp4')]))['format']['duration'])
 order=['open','scene-0','scene-1','scene-2','scene-3','end']
 (O/'concat.txt').write_text(''.join(f"file '{s}.mp4'\n" for s in order))
 run(['-f','concat','-safe','0','-i',O/'concat.txt','-c','copy','-movflags','+faststart',O/'Stocks-19-Oct-2026-Complete-Sample.mp4'])
