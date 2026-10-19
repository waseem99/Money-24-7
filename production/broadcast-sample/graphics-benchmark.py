from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import sys,math,re,base64,io,subprocess,json,wave,struct
P=Path(sys.argv[1]);ROOT=Path(__file__).resolve().parent
W,H=1920,1080;FPS=24;SECONDS=26
INK='#101a20';PAPER='#f4f3ee';TEAL='#007f78';LIME='#dcf579';RED='#b63d37';MUTED='#617076';LINE='#d2d8d5'
fonts={}
def font(s,bold=False,narrow=False):
 k=(s,bold,narrow)
 if k not in fonts:fonts[k]=ImageFont.truetype('/usr/share/fonts/opentype/urw-base35/NimbusSans'+('Narrow' if narrow else '')+('-Bold.otf' if bold else '-Regular.otf'),s)
 return fonts[k]
def txt(d,xy,s,size=28,fill=INK,bold=False,narrow=False):d.text(xy,s,font=font(size,bold,narrow),fill=fill)
def ease(t):return 1-(1-max(0,min(1,t)))**3
logo=Image.open(io.BytesIO(base64.b64decode(re.search('base64,([^\x27]+)',(ROOT/'brand.mjs').read_text()).group(1)))).convert('RGBA');logo.thumbnail((38,48))
def bug(im,d,x=1640,y=24):
 d.rectangle((x-15,y-8,1888,y+60),fill=INK);im.paste(logo,(x,y),logo);txt(d,(x+50,y+2),'Stocks',44,'white',True)
def top(im,d,label,section):
 txt(d,(48,24),'STOCKS',32,INK,True);d.rectangle((200,24,204,61),fill=TEAL);txt(d,(228,29),label,24,INK,True);txt(d,(1240,32),section,20,MUTED);bug(im,d)
def footer(d,t):
 d.rectangle((0,990,1920,1080),fill=INK);d.rectangle((0,990,270,1080),fill=TEAL);txt(d,(28,1006),'STOCKS / EXPLAINER',22,'white',True);txt(d,(28,1041),'ILLUSTRATIVE DATA',18,LIME)
 msg='REVENUE +20%    /    OPERATING PROFIT -20%    /    MARGIN 12% TO 8%    /    HYPOTHETICAL EXAMPLE    /    '
 x=300-int(t*105)%2200
 for i in range(3):txt(d,(x+i*2200,1021),msg,28,'white',True)
 d.rectangle((0,990,270,1080),fill=TEAL);txt(d,(28,1006),'STOCKS / EXPLAINER',22,'white',True);txt(d,(28,1041),'ILLUSTRATIVE DATA',18,LIME)
def opener(t,nextshow=False):
 im=Image.new('RGB',(W,H),INK);d=ImageDraw.Draw(im);p=ease(t/1.1)
 # Architectural planes translate into a single typographic lockup.
 offset=int((1-p)*650);d.polygon([(1250+offset,0),(1920,0),(1920,1080),(880+offset,1080)],fill=TEAL)
 d.polygon([(1610+offset,0),(1920,0),(1920,1080),(1240+offset,1080)],fill='#04655f')
 for i in range(7):
  x=1320+i*100-int(t*18);d.line((x,120,x-170,900),fill='#24847b',width=2)
 im.paste(logo,(64,55),logo);txt(d,(116,55),'Stocks',42,'white',True)
 txt(d,(64,185),'02 / EARNINGS EXPLAINED' if nextshow else '01 / THE BUSINESS BRIEF',23,LIME,True)
 sx=64+int((1-p)*140)
 for j,line in enumerate(['EARNINGS','EXPLAINED'] if nextshow else ['THE BUSINESS','BRIEF']):txt(d,(sx,305+j*166),line,150,'white',True,True)
 d.rectangle((64,710,64+int(p*990),718),fill=LIME)
 txt(d,(64,766),'Beyond the headline. Inside the business.' if nextshow else 'A clearer view of global business.',38,'white')
 txt(d,(64,978),'STOCKS  /  BROADCAST DESIGN BENCHMARK',20,'#9db3b5');txt(d,(1540,978),'PROGRAM 02' if nextshow else 'PROGRAM 01',24,LIME,True)
 # Giant chapter number adds depth while preserving information hierarchy.
 txt(d,(1430,620),'02' if nextshow else '01',240,LIME,True,True)
 return im

def studio(t):
 im=Image.new('RGB',(W,H),PAPER);d=ImageDraw.Draw(im);top(im,d,'THE BUSINESS BRIEF','STUDIO / DESIGN PREVIEW')
 frame=min(192,max(1,int(t*24)+1));im.paste(Image.open(P/'frames'/f'{frame:03d}.jpg'),(24,92))
 d=ImageDraw.Draw(im);d.rectangle((1464,92,1896,890),fill=INK)
 txt(d,(1492,125),'THE BIG PICTURE',23,LIME,True);d.line((1492,171,1868,171),fill='#405052',width=2)
 txt(d,(1492,207),'Sales are up.',38,'white',True);txt(d,(1492,253),'Profit is down.',38,'white',True)
 txt(d,(1492,335),'REVENUE',22,'#a5b8ba');txt(d,(1488,368),'+20%',90,LIME,True)
 d.line((1492,486,1868,486),fill='#405052',width=2)
 txt(d,(1492,520),'OPERATING MARGIN',22,'#a5b8ba');txt(d,(1490,560),'12% → 8%',62,'white',True)
 txt(d,(1492,663),'What changed?',29,LIME,True);txt(d,(1492,714),'Costs grew faster',28,'white');txt(d,(1492,750),'than revenue.',28,'white')
 txt(d,(1492,838),'HYPOTHETICAL EXAMPLE',18,'#a5b8ba')
 d.rectangle((24,890,1896,972),fill=PAPER);txt(d,(45,903),'BEYOND REVENUE',23,TEAL,True);txt(d,(345,893),'Growth does not always mean stronger earnings',43,INK,True,True)
 footer(d,t);return im

def chart(t):
 im=Image.new('RGB',(W,H),PAPER);d=ImageDraw.Draw(im);top(im,d,'EARNINGS EXPLAINED','DATA / HYPOTHETICAL COMPANY')
 txt(d,(58,122),'SALES GROW. MARGINS SHRINK.',65,INK,True,True);txt(d,(60,203),'A 20% rise in revenue can still come with a 20% fall in operating profit.',28,MUTED)
 d.line((60,264,1860,264),fill=LINE,width=2)
 txt(d,(60,299),'REVENUE',27,TEAL,True);txt(d,(60,340),'USD millions',22,MUTED)
 left,right,base,ceiling=140,1110,820,405
 for v in [0,40,80,120]:
  y=base-v/120*(base-ceiling);d.line((left,y,right,y),fill=LINE,width=2);txt(d,(65,y-14),str(v),23,MUTED)
 q=ease(t/2)
 for x,v,name,col in [(340,100,'PERIOD 1','#a0b1ac'),(740,120,'PERIOD 2',TEAL)]:
  h=v/120*(base-ceiling)*q;d.rectangle((x,base-h,x+195,base),fill=col);txt(d,(x+40,base-h-62),str(round(v*q)),48,INK,True);txt(d,(x+23,844),name,24,MUTED,True)
 d.rectangle((1148,296,1860,900),fill=INK);txt(d,(1180,325),'OPERATING MARGIN',26,LIME,True)
 txt(d,(1180,390),'12%',100,'white',True);txt(d,(1610,548),'8%',100,'white',True)
 r=ease((t-1.5)/2);d.line((1260,520,1260+440*r,520+170*r),fill=LIME,width=6)
 d.ellipse((1253,513,1267,527),fill=LIME)
 if r>.99:d.ellipse((1693,683,1707,697),fill=LIME)
 txt(d,(1180,733),'−4 percentage points',32,LIME,True)
 txt(d,(1180,800),'Operating profit: $12m → $9.6m',27,'white')
 txt(d,(60,932),'SOURCE: ILLUSTRATIVE DATASET  /  Margin = operating profit ÷ revenue  /  Not a market quote',23,MUTED)
 footer(d,t+8);return im

def transition(t):
 im=opener(t,True);d=ImageDraw.Draw(im)
 if t<.5:
  edge=int(ease(t/.5)*1920);d.rectangle((edge,0,1920,1080),fill=LIME)
 return im

out=P/'benchmark-silent.mp4';proc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1920x1080','-r','24','-i','-','-an','-c:v','libx264','-threads','2','-preset','fast','-crf','21','-pix_fmt','yuv420p',str(out)],stdin=subprocess.PIPE)
for f in range(FPS*SECONDS):
 t=f/FPS
 im=opener(t) if t<4 else studio(t-4) if t<12 else chart(t-12) if t<22 else transition(t-22)
 if f in [60,168,408]:im.save(P/({60:'01-program-identity.png',168:'02-studio-layout.png',408:'03-earnings-chart.png'}[f]))
 proc.stdin.write(im.tobytes())
proc.stdin.close()
if proc.wait():raise RuntimeError('Render failed')
# Original synthetic sting, used only for the identity and junction.
with wave.open(str(P/'sound.wav'),'wb') as w:
 w.setnchannels(1);w.setsampwidth(2);w.setframerate(48000)
 for j in range(26*48000):
  t=j/48000;v=0
  for base in [0,22]:
   for start,hz in [(0,164.81),(.16,246.94),(.32,329.63),(.48,493.88)]:
    u=t-base-start
    if 0<=u<2:v+=.09*math.sin(2*math.pi*hz*u)*math.exp(-u*3)*min(1,u*120)
  w.writeframesraw(struct.pack('<h',int(v*32767)))
subprocess.run(['ffmpeg','-v','error','-y','-i',str(out),'-i',str(P/'sound.wav'),'-i',str(P.parent/'full-frame-review/source.mp4'),'-filter_complex','[2:a]atrim=0:8,asetpts=PTS-STARTPTS,adelay=4000|4000,apad[a];[1:a][a]amix=inputs=2:duration=longest:normalize=0[m]','-map','0:v','-map','[m]','-t','26','-c:v','copy','-c:a','aac','-b:a','160k','-movflags','+faststart',str(P/'Stocks-Graphics-Benchmark.mp4')],check=True)
