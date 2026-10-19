from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import base64,re,io,json,sys
P=Path(sys.argv[1]);P.mkdir(exist_ok=True);ROOT=Path(__file__).resolve().parent
W,H=1920,1080;BLACK='#111318';WHITE='#f6f5f1';BLUE='#0057ff';ORANGE='#ff713c';GREY='#667079'
f={}
def font(n,b=False,narrow=False):
 k=(n,b,narrow)
 if k not in f:f[k]=ImageFont.truetype('/usr/share/fonts/opentype/urw-base35/NimbusSans'+('Narrow' if narrow else '')+('-Bold.otf' if b else '-Regular.otf'),n)
 return f[k]
def text(d,p,s,n=30,c=BLACK,b=False,narrow=False):d.text(p,s,font=font(n,b,narrow),fill=c)
logo=Image.open(io.BytesIO(base64.b64decode(re.search('base64,([^\x27]+)',(ROOT/'brand.mjs').read_text()).group(1)))).convert('RGBA');logo.thumbnail((40,48))
def bug(im,x=1625,y=48,dark=False):
 d=ImageDraw.Draw(im);d.rectangle((x-14,y-8,x+230,y+57),fill=BLACK);im.paste(logo,(x,y),logo);text(d,(x+55,y+1),'Stocks',44,'white',True)
def footer(im,story=False):
 d=ImageDraw.Draw(im);d.rectangle((0,969,W,H),fill=BLACK)
 d.rectangle((0,969,295,1026),fill=BLUE);text(d,(34,983),'EARNINGS EXPLAINED',21,'white',True)
 text(d,(324,981),'REVENUE  +20%',26,'white',True);text(d,(690,981),'OPERATING PROFIT  −20%',26,'white',True);text(d,(1234,981),'MARGIN  12% → 8%',26,'white',True)
 d.line((34,1026,1886,1026),fill='#3e434a',width=1)
 text(d,(34,1040),'ILLUSTRATIVE EXAMPLE',18,'#a3adb8',True);text(d,(324,1037),'Sales alone do not tell the earnings story     /     Compare margins, cash flow and outlook',23,'#e4e6e8')
# 01: a typography-led on-air identity. No fictitious market prices.
im=Image.new('RGB',(W,H),WHITE);d=ImageDraw.Draw(im)
d.rectangle((0,0,24,H),fill=BLUE);bug(im)
text(d,(76,61),'GLOBAL BUSINESS  /  ORIGINAL PROGRAMMING',24,BLACK,True)
for y,s in [(220,'THE BUSINESS'),(407,'BRIEF')]:text(d,(65,y),s,187,BLACK,True,True)
# The bracket motif becomes the reveal mask in motion, not a decorative chart.
d.rectangle((1250,255,1300,725),fill=BLUE);d.rectangle((1250,255,1740,305),fill=BLUE);d.rectangle((1250,675,1740,725),fill=BLUE)
d.rectangle((1450,449,1850,501),fill=ORANGE)
text(d,(77,682),'The stories behind the numbers.',43,BLACK)
d.line((77,888,1843,888),fill='#b6b9bb',width=2)
text(d,(77,924),'BUSINESS',25,BLACK,True);text(d,(455,924),'MARKETS',25,BLACK,True);text(d,(825,924),'ECONOMY',25,BLACK,True)
text(d,(1510,924),'01 / STOCKS',25,BLUE,True)
im.save(P/'01-Programme-Identity.png')
# 02: real existing presenter frame, 16:9 crop; graphics occupy lower furniture only.
src=Image.open(P/'presenter-source.png').convert('RGB').resize((W,H),Image.Resampling.LANCZOS);im=src;d=ImageDraw.Draw(im);bug(im)
d.rectangle((58,745,443,797),fill=BLUE);text(d,(78,757),'THE BUSINESS BRIEF',25,'white',True)
d.rectangle((58,797,1862,937),fill=WHITE);d.rectangle((58,797,68,937),fill=BLUE)
text(d,(94,813),'Growth is only half the story',66,BLACK,True,True)
text(d,(96,892),'REVENUE   /   MARGINS   /   CASH FLOW   /   OUTLOOK',23,GREY,True)
footer(im);im.save(P/'02-Presenter-Graphics.png')
# 03: a single comparison with direct endpoint labels, explicit illustrative context.
im=Image.new('RGB',(W,H),WHITE);d=ImageDraw.Draw(im);bug(im)
text(d,(68,61),'EARNINGS EXPLAINED',25,BLUE,True)
text(d,(63,143),'Sales up. Profits down.',88,BLACK,True,True)
text(d,(68,255),'Change from the starting period  /  Both series indexed to 100',28,GREY)
left,right,top,bottom=120,1410,350,774
values={'Revenue':[100,104,110,108,116,120],'Operating profit':[100,108,103,96,102,80]}
def xy(i,v):return (left+i*(right-left)/5,bottom-(v-80)/40*(bottom-top))
for v in [80,90,100,110,120]:
 y=xy(0,v)[1];d.line((left,y,right,y),fill='#ccd0d4' if v==100 else '#e1e2e1',width=2 if v==100 else 1);text(d,(62,y-15),str(v),23,GREY)
for name,col in [('Revenue',BLUE),('Operating profit',ORANGE)]:
 pts=[xy(i,v) for i,v in enumerate(values[name])];d.line(pts,fill=col,width=7,joint='curve')
 x,y=pts[-1];d.ellipse((x-9,y-9,x+9,y+9),fill=col)
 text(d,(1470,y-43),name,25,BLACK,True);text(d,(1466,y-6),'+20%' if name=='Revenue' else '−20%',62,col,True)
for i in range(6):text(d,(xy(i,80)[0]-10,804),'P'+str(i+1),23,GREY)
# Explicit point annotation, placed in free chart space.
x,y=xy(3,96);d.line((x,y+17,x,y+74),fill=BLACK,width=2);text(d,(x-115,y+85),'Profit falls below its starting level',22,BLACK)
text(d,(68,907),'SOURCE: HYPOTHETICAL SIX-PERIOD EXAMPLE  •  NOT MARKET DATA',20,GREY,True)
footer(im);im.save(P/'03-Financial-Analysis.png')
(P/'illustrative-data.json').write_text(json.dumps({'label':'Hypothetical six-period example; not market data','index_base':100,'series':values,'end_period_revenue_m':120,'end_period_operating_profit_m':9.6,'start_period_revenue_m':100,'start_period_operating_profit_m':12},indent=2))
print('Created three 1920x1080 review frames')
