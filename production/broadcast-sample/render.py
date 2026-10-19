from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import subprocess,re,base64,sys
root=Path(__file__).resolve().parent
src=Path(sys.argv[1]); out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def txt(d,xy,s,size=26,fill='#ffffff',b=False):d.text(xy,s,font=ImageFont.truetype(bold if b else font,size),fill=fill)
logo=Image.open(__import__('io').BytesIO(base64.b64decode(re.search('base64,([^\x27]+)',(root/'brand.mjs').read_text()).group(1)))).convert('RGBA');logo.thumbnail((38,48))
labels=[('NORA','ANCHOR','READING THE RESULTS'),('MARCUS','MARKETS ANALYST','LOOK BEYOND SALES'),('NORA','ANCHOR','THE FOLLOW-UP'),('MARCUS','MARKETS ANALYST','WHAT TO WATCH')]
for i,(name,role,headline) in enumerate(labels,1):
 im=Image.new('RGB',(1920,1080),'#07192e');d=ImageDraw.Draw(im)
 d.rectangle((0,0,1920,84),fill='#072b54');d.rectangle((0,82,1920,86),fill='#32c8ef')
 txt(d,(38,19),'THE BUSINESS BRIEF',32,b=True);txt(d,(650,27),'GLOBAL BUSINESS  /  EXPLAINED',21,fill='#a8d6ee')
 im.paste(logo,(1660,15),logo);txt(d,(1713,23),'Stocks',32,b=True)
 d.rectangle((1434,100,1882,883),fill='#0b2949');d.rectangle((1434,100,1440,883),fill='#2bbce5')
 txt(d,(1470,128),'EARNINGS DESK',20,fill='#42d3f5',b=True)
 txt(d,(1470,181),'Sales are only',31,b=True);txt(d,(1470,224),'the starting point.',31,b=True)
 txt(d,(1470,296),'ILLUSTRATIVE EXAMPLE',17,fill='#a1b8cd')
 txt(d,(1470,349),'Revenue',25);txt(d,(1790,349),'+12%',25,fill='#50e0bd',b=True)
 d.rectangle((1470,402,1835,430),fill='#123a58');d.rectangle((1470,402,1795,430),fill='#38c8db')
 txt(d,(1470,469),'Profit',25);txt(d,(1795,469),'-4%',25,fill='#ffb869',b=True)
 d.rectangle((1470,522,1835,550),fill='#123a58');d.rectangle((1470,522,1655,550),fill='#eead62')
 txt(d,(1470,600),'CHECK THE DRIVERS',19,fill='#a1b8cd',b=True)
 for j,s in enumerate(['01  Operating margins','02  Cash generation','03  One-off expenses']):txt(d,(1470,651+j*58),s,23)
 d.rectangle((38,906,1882,978),fill='#f3f6f8');d.rectangle((38,906,435,978),fill='#096193')
 txt(d,(60,916),name,26,b=True);txt(d,(60,950),role,16,fill='#bfeaff')
 txt(d,(466,922),headline,32,fill='#082945',b=True)
 d.rectangle((0,1000,1920,1080),fill='#04101e');txt(d,(38,1017),'BUSINESS',22,fill='#44d5ef',b=True)
 txt(d,(38,1052),'AI PRESENTERS · DEMO',12,fill='#94aabd')
 im.save(out/f'frame-{i}.png')
 ticker='REVENUE IS NOT PROFIT     /     EXAMINE MARGINS AND CASH FLOW     /     SEPARATE ONE-OFF COSTS FROM RECURRING PRESSURES     /     ILLUSTRATIVE EXPLAINER — NOT LIVE MARKET DATA     /     '
 (out/'ticker.txt').write_text(ticker*2)
 # Keep original footage and all faces intact; broadcast frame is separately reproducible.
 # Clip ticker to its own strip so it never crosses the fixed BUSINESS label.
 f=f"[0:v]scale=1386:780,setsar=1[v];[1:v][v]overlay=38:100:shortest=1[base];color=c=0x04101e:s=1660x80:r=30,drawtext=fontfile={font}:textfile={out/'ticker.txt'}:fontsize=26:fontcolor=white:x='-mod(t*110+{[0,7.682,16.729,21.745][i-1]*110},5200)':y=25[tick];[base][tick]overlay=260:1000:shortest=1[vout]"
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(src/f'{i:02}.mp4'),'-loop','1','-i',str(out/f'frame-{i}.png'),'-filter_complex_threads','1','-filter_complex',f,'-map','[vout]','-map','0:a','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-r','30','-c:a','aac','-ar','48000','-ac','2','-shortest',str(out/f'shot-{i}.mp4')],check=True)
(out/'shots.txt').write_text('\n'.join(f"file 'shot-{i}.mp4'" for i in range(1,5)))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(out/'shots.txt'),'-c','copy','-movflags','+faststart',str(out/'Stocks-Broadcast-Sample.mp4')],check=True)
print(out/'Stocks-Broadcast-Sample.mp4')
