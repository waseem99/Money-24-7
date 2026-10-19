from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import subprocess,json,math,sys,io,re,base64,wave,struct
ROOT=Path(__file__).resolve().parent
P=Path(sys.argv[1]);P.mkdir(parents=True,exist_ok=True)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';BOLD=FONT.replace('.ttf','-Bold.ttf')
fonts={s:ImageFont.truetype(BOLD,s) for s in [18,24,28,32,44,68,92]}
logo=Image.open(io.BytesIO(base64.b64decode(re.search('base64,([^\x27]+)',(ROOT/'brand.mjs').read_text()).group(1)))).convert('RGBA');logo.thumbnail((64,70))
def run(args):subprocess.run(['ffmpeg','-v','error','-y',*args],check=True)
def duration(path):return float(json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(path)]))['format']['duration'])
def sting(path,seconds):
 rate=48000
 with wave.open(str(path),'wb') as w:
  w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate)
  samples=bytearray()
  for i in range(int(rate*seconds)):
   t=i/rate;v=0
   for onset,freq in [(0,220),(.18,329.63),(.36,440),(.54,659.25)]:
    u=t-onset
    if u>=0:v+=math.sin(2*math.pi*freq*u)*math.exp(-u*4)*min(1,u*100)*.13
   samples.extend(struct.pack('<h',int(max(-1,min(1,v))*32767)))
  w.writeframes(samples)
def card(name,eyebrow,title,sub,accent,voice=None,minimum=5):
 seconds=max(minimum,duration(P/voice)+1.1 if voice else minimum);seconds=math.ceil(seconds*24)/24
 raw=P/(name+'-silent.mp4');proc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1920x1080','-r','24','-i','-','-an','-c:v','libx264','-preset','ultrafast','-crf','20','-pix_fmt','yuv420p',str(raw)],stdin=subprocess.PIPE)
 for frame in range(round(seconds*24)):
  t=frame/24;im=Image.new('RGB',(1920,1080),'#09131f');d=ImageDraw.Draw(im)
  for i in range(18):
   x=int(i*150-((t*42)%150));d.polygon([(x,0),(x+60,0),(x+530,1080),(x+470,1080)],fill=(13+i%3*2,27+i%3*3,40+i%3*3))
  for i in range(4):
   x=int((t*160+i*540)%2350)-400;d.line((x,900,x+500,0),fill='#1d4053',width=2)
  d.rectangle((0,0,1920,12),fill=accent);im.paste(logo,(110,95),logo);d.text((196,109),'Stocks',font=fonts[44],fill='white')
  shift=int(65*max(0,1-t/.7)**3)
  d.text((116+shift,330),eyebrow,font=fonts[28],fill=accent)
  y=395
  for line in title.split('|'):d.text((110+shift,y),line,font=fonts[92],fill='white');y+=112
  d.rectangle((116,y+27,116+int(430*min(1,t/.9)),y+33),fill=accent)
  d.text((116,y+74),sub,font=fonts[28],fill='#c5d2dd')
  d.text((116,985),'GLOBAL BUSINESS  /  MARKETS  /  ECONOMY',font=fonts[18],fill='#8499aa')
  d.text((1510,985),'PROGRAM PREVIEW',font=fonts[18],fill='#8499aa')
  for j in range(5):
   h=int(65+55*(1+math.sin(t*.65+j*.8)));x=1460+j*65;d.rectangle((x,780-h,x+30,780),fill=accent if j==4 else '#254050')
  proc.stdin.write(im.tobytes())
 proc.stdin.close()
 if proc.wait():raise RuntimeError('Card render failed')
 sting(P/'sting.wav',seconds)
 args=['-i',str(raw),'-i',str(P/'sting.wav')]
 if voice:
  args+=['-i',str(P/voice),'-filter_complex','[1:a]volume=0.28[m];[2:a]adelay=350|350,apad[v];[m][v]amix=inputs=2:duration=longest:normalize=0[a]','-map','0:v','-map','[a]']
 else:args+=['-map','0:v','-map','1:a']
 run([*args,'-t',str(seconds),'-c:v','copy','-c:a','aac','-ar','48000','-ac','2',str(P/(name+'.mp4'))]);return seconds
items=[]
def add(file,kind,seconds):items.append({'file':file,'kind':kind,'duration':seconds})
add('01-open.mp4','Business Brief opener',card('01-open','STOCKS ORIGINAL PROGRAMMING','THE BUSINESS|BRIEF','The stories behind the numbers.','#d6ab65','open.mp3',6))
run(['-i',str(P/'body.mp4'),'-vf','fps=24,setsar=1','-c:v','libx264','-preset','ultrafast','-crf','20','-c:a','aac','-ar','48000','-ac','2',str(P/'02-body.mp4')]);add('02-body.mp4','Approved studio sample',duration(P/'02-body.mp4'))
add('03-handoff.mp4','Spoken close and up-next',card('03-handoff','UP NEXT','EARNINGS|EXPLAINED','What margins reveal about a business.','#d6ab65','handoff.mp3',7))
add('04-junction.mp4','Channel junction',card('04-junction','STOCKS','STAY|INFORMED','Your next perspective starts here.','#58c5ce',minimum=2))
add('05-next-open.mp4','Earnings Explained opener',card('05-next-open','STOCKS ORIGINAL PROGRAMMING','EARNINGS|EXPLAINED','Beyond the headline. Inside the business.','#58c5ce','next.mp3',5))
run(['-ss','12.25','-i',str(P/'body.mp4'),'-t','12.25','-vf','fps=24,setsar=1','-c:v','libx264','-preset','ultrafast','-crf','20','-c:a','aac','-ar','48000','-ac','2',str(P/'06-excerpt.mp4')]);add('06-excerpt.mp4','Reused studio excerpt: transition preview',duration(P/'06-excerpt.mp4'))
add('07-end.mp4','Preview close',card('07-end','END OF PROGRAMMING PREVIEW','Stocks','The Business Brief  /  Earnings Explained','#58c5ce',minimum=3))
(P/'concat.txt').write_text(''.join("file '"+x['file']+"'\n" for x in items))
run(['-f','concat','-safe','0','-i',str(P/'concat.txt'),'-c:v','libx264','-preset','fast','-crf','20','-c:a','aac','-b:a','192k','-movflags','+faststart',str(P/'Stocks-Programming-Preview.mp4')])
time=0
for x in items:x['start']=time;time+=x['duration']
(P/'rundown.json').write_text(json.dumps({'segments':items,'duration':time,'note':'Studio content reused from approved sample. Program voiceovers are separately scripted. Not a live transmission.'},indent=2))
