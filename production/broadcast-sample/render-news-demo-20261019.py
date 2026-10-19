from pathlib import Path
import subprocess,importlib.util,sys
from PIL import Image,ImageDraw,ImageFont
R=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parent; O=R/'render'; O.mkdir(exist_ok=True)
ROOT=Path(__file__).resolve().parent if (Path(__file__).resolve().parent/'brand.mjs').exists() else R.parent/'stocks-execution/production/broadcast-sample'
sys.argv.append(str(O))
spec=importlib.util.spec_from_file_location('orbit',ROOT/'stocks-orbit.py');g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
INK='#101e30';TEAL='#226b72';GOLD='#bfa36b';WHITE='#faf8f2'
def font(n,b=False):return ImageFont.truetype('/usr/share/fonts/opentype/urw-base35/NimbusSans-'+('Bold' if b else 'Regular')+'.otf',n)
def text(d,xy,s,n,c=WHITE,b=False):d.text(xy,s,font=font(n,b),fill=c)
def run(a):subprocess.run(['ffmpeg','-v','error','-y',*map(str,a)],check=True)
headlines=['Tech rebounds. Earnings face the test.','Technology leads the opening rebound','The question: can growth justify the spending?','Opening bell: a divided market','Three things to watch in company results','Lower oil prices ease the backdrop','The rebound starts the conversation']
tags=['THE BUSINESS BRIEF','NORA / MARCUS','MARCUS | MARKETS','THE OPENING PICTURE','EARNINGS WATCH','THE BIGGER PICTURE','STOCKS | THE TAKEAWAY']
topics=['19 OCT 2026  /  U.S. MARKET EDITION','AI-RELATED SHARES RECOVER AFTER LAST WEEK’S SELLOFF','REVENUE  /  MARGINS  /  CASH FLOW','NASDAQ: HIGHER    •    S&P 500: HIGHER    •    DOW: LOWER','DEMAND  /  SPENDING  /  OUTLOOK','EARLY-SESSION REPORTING  /  COMPANY RESULTS IN FOCUS','WATCH THE RESULTS. THEN THE OUTLOOK.']
ticker='OCT 19 OPENING SNAPSHOT   •   Nasdaq and S&P 500 opened higher; Dow edged lower   •   Technology rebounded after last week’s selloff   •   Oil eased in early trading   •   Sources: Reuters / MarketWatch, 19 Oct 2026   •   Recorded edition — AI presenters   •   '
(O/'ticker.txt').write_text(ticker)
def overlay(i):
 im=Image.new('RGBA',(1920,1080));d=ImageDraw.Draw(im)
 if i==4:
  # Replace generated fictional market numbers with an editorial checklist.
  d.rectangle((976,0,1920,1080),fill=INK)
  d.rectangle((976,0,985,1080),fill=GOLD)
  text(d,(1040,170),'THE EARNINGS TEST',42,GOLD,True)
  for j,(title,detail) in enumerate([('DEMAND','Is the business growing?'),('SPENDING','What does that growth cost?'),('OUTLOOK','What comes next?')]):
   y=290+j*155;text(d,(1040,y),f'0{j+1}',30,GOLD,True)
   text(d,(1110,y-5),title,42,WHITE,True);text(d,(1110,y+56),detail,29,WHITE)
   d.line((1040,y+110,1840,y+110),fill=TEAL,width=2)
 d.rectangle((1620,36,1878,115),fill=INK);logo=g.logo.resize((45,57),Image.Resampling.LANCZOS);im.alpha_composite(logo,(1638,46));text(d,(1698,54),'Stocks',45,b=True)
 d.rectangle((50,40,460,78),fill=INK);text(d,(65,48),'19 OCT 2026  /  RECORDED EDITION',20)
 # Graphic stack stays below the presenters' faces and gestures.
 d.rectangle((52,823,1020,871),fill=GOLD);text(d,(78,836),tags[i],25,INK,True)
 d.rectangle((52,871,1868,957),fill=WHITE);text(d,(78,890),headlines[i],47,INK,True)
 d.rectangle((52,957,1868,1004),fill=TEAL);text(d,(78,971),topics[i],24)
 d.rectangle((0,1010,1920,1080),fill=INK)
 if i==3:
  d.rectangle((748,180,1174,490),fill=(16,30,48,230))
  text(d,(775,203),'OPENING SNAPSHOT',24,GOLD,True)
  for j,(label,value,col) in enumerate([('NASDAQ','HIGHER','#7fd8c0'),('S&P 500','HIGHER','#7fd8c0'),('DOW','LOWER','#efb2a5')]):
   y=265+j*67; text(d,(775,y),label,27,WHITE,True);text(d,(975,y),value,25,col,True)
   d.line((775,y+48,1145,y+48),fill=TEAL,width=1)
 im.save(O/f'overlay-{i}.png')
def studio(i,start):
 overlay(i);src=R/'sources'/f'{i:02d}.mp4';dur=10 if i==0 else 15
 filt=f"[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=24[v];[v][1:v]overlay=0:0,drawtext=fontfile=/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf:textfile={O/'ticker.txt'}:fontsize=30:fontcolor=white:x=250-mod((t+{start})*135\\,tw):y=1031,drawtext=fontfile=/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf:textfile={O/'ticker.txt'}:fontsize=30:fontcolor=white:x=250+tw-mod((t+{start})*135\\,tw):y=1031,drawbox=x=0:y=1010:w=250:h=70:color=0x226b72:t=fill,drawtext=fontfile=/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf:text='STOCKS / BRIEF':fontsize=25:fontcolor=white:x=24:y=1033[out]"
 run(['-threads','2','-i',src,'-i',O/f'overlay-{i}.png','-filter_complex_threads','1','-filter_complex',filt,'-map','[out]','-map','0:a','-t',dur,'-c:v','libx264','-threads','2','-preset','fast','-crf','19','-pix_fmt','yuv420p','-af','loudnorm=I=-16:TP=-1.5:LRA=9','-ar','48000','-ac','2','-c:a','aac','-b:a','192k',O/f'scene-{i}.mp4'])
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
 sting('open',2.5);sting('end',4,True)
 for i in [0,1,2,3,5,6]:studio(i,0 if i==0 else 12.5+([1,2,3,5,6].index(i))*15)
 order=['scene-0','open']+[f'scene-{i}' for i in [1,2,3,5,6]]+['end']
 (O/'concat.txt').write_text(''.join(f"file '{s}.mp4'\n" for s in order))
 run(['-f','concat','-safe','0','-i',O/'concat.txt','-c','copy','-movflags','+faststart',O/'Stocks-19-Oct-2026-REVIEW-DRAFT.mp4'])
