from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
p=Path(__file__).resolve().parent;r=p.parent
F='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';B=F.replace('.ttf','-Bold.ttf')
def text(d,xy,s,n=24,c='white',bold=False):d.text(xy,s,font=ImageFont.truetype(B if bold else F,n),fill=c)
def base():
 im=Image.new('RGBA',(1920,1080));d=ImageDraw.Draw(im)
 logo=Image.open(r/'source/unpacked/TAMASHA-T-ORIGINAL.png').convert('RGBA');logo.thumbnail((65,65));logo.putdata([(a,b,c,0 if max(a,b,c)<8 else e) for a,b,c,e in logo.getdata()]);im.alpha_composite(logo,(1650,28));text(d,(1730,40),'Stocks',39,bold=True)
 d.rounded_rectangle((45,36,300,72),4,fill=(4,22,43,210));text(d,(58,44),'RECORDED PREVIEW',17,'#c4e5f1',True)
 text(d,(818,154),'Stocks',42,'#d7e3ef',True)
 for y,t in [(251,'MARKETS'),(280,'BUSINESS'),(309,'PEOPLE')]:text(d,(824,y),t,20,'#aabfd6',True)
 return im,d
panels=[('THE AI ECONOMY',[('CHIPS','Computing hardware'),('CLOUD','Capacity for customers'),('POWER','Physical infrastructure'),('RETURNS','The business test')]),('FOLLOW THE MONEY',[('BUYERS','Infrastructure spending'),('SUPPLIERS','Equipment and services'),('OPERATORS','Computing capacity'),('CUSTOMERS','Demand and revenue')]),('POWERING AI',[('485 TWh','2025 global demand'),('950 TWh','2030 projection'),('SCOPE','All data centers'),('SOURCE','IEA / 2026')]),('THE DELIVERY TEST',[('GRID ACCESS','Connections matter'),('EQUIPMENT','Supply constraints'),('CAPACITY','Delivered vs announced'),('LOCATION','Different local limits')]),('DEMAND vs COST',[('DEMAND','Cloud customers'),('INVESTMENT','Infrastructure buildout'),('MARGINS','Multiple cost drivers'),('SOURCE','Microsoft / FY26 Q4')]),('WHAT TO WATCH',[('COMMITMENTS','Spending decisions'),('DELIVERY','Capacity in service'),('CASH','Revenue into returns'),('NEXT','Execution matters')])]
heads=[('THE AI BOOM: WHO GETS PAID?','Behind the headlines: infrastructure, customers and returns'),('FOLLOW THE MONEY','Different businesses. Different customers. Different risks.'),('THE POWER BEHIND AI','Global data-center electricity consumption / IEA projection'),('FROM ANNOUNCEMENT TO OPERATION','Grid connections, equipment and execution'),('STRONG DEMAND. REAL COSTS.','Microsoft Cloud / fiscal fourth quarter 2026'),('THE NEXT CHAPTER: RETURNS','Spending commitments / delivered capacity / cash generation')]
for j,((title,rows),(head,sub)) in enumerate(zip(panels,heads)):
 for speaker in ['AMINA','DEXTER','DESK','CORRESPONDENT']:
  im,d=base();d.rectangle((1620,185,1919,745),fill=(2,14,31,235));text(d,(1641,206),title,21,bold=True)
  for i,(a,b) in enumerate(rows):
   y=282+i*101;d.line((1642,y-18,1900,y-18),fill='#345069');text(d,(1644,y),a,21,'#d5e7f3',True);text(d,(1644,y+34),b,17,'#8bb1ca')
  if speaker!='DESK':
   x=200 if speaker!='DEXTER' else 1120
   label='AI CORRESPONDENT' if speaker=='CORRESPONDENT' else speaker
   d.rectangle((x,753,x+330,795),fill='#f0f3f5');d.rectangle((x,753,x+10,795),fill='#c72231');text(d,(x+25,759),label,25,'#071627',True)
   d.rectangle((x,797,x+310,826),fill='#10253b');text(d,(x+25,800),'RECORDED ANALYSIS' if speaker=='CORRESPONDENT' else 'AI PRESENTER',16,'#cbdce9')
  d.rectangle((57,844,1864,1006),fill=(3,20,43,248));d.rectangle((57,817,355,862),fill='#bd2030');text(d,(79,827),'BEHIND THE MOVE',22,bold=True)
  text(d,(82,881),head,39,bold=True);text(d,(83,944),sub,26,'#d5e0eb')
  d.rectangle((0,1016,1920,1080),fill='#eef0f1');d.rectangle((1580,1016,1920,1080),fill='#b71f2d');text(d,(1613,1028),'MARKETS',21,bold=True);text(d,(1613,1053),'MOVE PEOPLE',15,bold=True)
  im.save(p/f'overlay-{j}-{speaker}.png')
# Full-screen explanatory chart, drawn from IEA data. Zero baseline, same scale.
im=Image.new('RGB',(1920,1080),'#06182c');d=ImageDraw.Draw(im)
text(d,(100,120),'THE POWER BEHIND AI',54,bold=True);text(d,(104,200),'Global data-center electricity consumption',30,'#9bbcd0')
for v in [0,250,500,750,1000]:
 y=830-v*.48;d.line((320,y,1600,y),fill='#25425b',width=2);text(d,(190,y-12),str(v),22,'#8eabbf')
for x,v,yr in [(520,485,'2025'),(1120,950,'2030')]:
 top=830-v*.48;d.rectangle((x,top,x+240,830),fill='#2bbaca' if yr=='2025' else '#263d5b',outline='#40d2e3',width=4);text(d,(x+24,top-58),f'{v} TWh',35,bold=True);text(d,(x+70,852),yr,27,bold=True)
text(d,(1110,904),'PROJECTED',22,'#f2ba64',True);text(d,(100,976),'Source: IEA, Key Questions on Energy and AI (2026). All data centers; not AI alone.',23,'#9bbcd0')
im.save(p/'power-chart.png')
# Value chain: commercial relationships, no proportional financial flows.
im=Image.new('RGB',(1920,1080),'#06182c');d=ImageDraw.Draw(im);text(d,(100,120),'FOLLOW THE MONEY',54,bold=True);text(d,(104,203),'One technology theme. Several different businesses.',29,'#9bbcd0')
for i,(a,b) in enumerate([('HARDWARE','Chips + networking'),('BUILDOUT','Sites + equipment'),('CAPACITY','Cloud + data centers'),('CUSTOMERS','Applications + usage')]):
 x=100+i*450;d.rounded_rectangle((x,380,x+365,650),16,fill='#102b43',outline='#2bbaca',width=3);text(d,(x+28,430),a,31,bold=True);text(d,(x+28,505),b,23,'#b6cfdf');
 if i<3:d.line((x+375,515,x+435,515),fill='#efb35e',width=5);d.polygon([(x+435,515),(x+420,505),(x+420,525)],fill='#efb35e')
text(d,(105,765),'Spending creates revenue for another business.',35,bold=True);text(d,(105,830),'The next test: customers, costs and durable returns.',29,'#9bbcd0');text(d,(105,975),'Stocks editorial schematic / commercial relationships, not measured cash flows',22,'#9bbcd0');im.save(p/'value-chain.png')
(p/'ticker.txt').write_text(('BEHIND THE MOVE    /    THE BUSINESS BEHIND AI    /    CHIPS  •  CLOUD  •  DATA CENTERS  •  ELECTRICITY    /    SPENDING COMMITMENTS  •  DELIVERED CAPACITY  •  CASH GENERATION    /    ')*5)
print('Graphics ready')
for name in ['power-chart.png','value-chain.png']:
 im=Image.open(p/name).convert('RGBA');brand,draw=base();im.alpha_composite(brand.crop((0,0,1920,100)),(0,0));im.convert('RGB').save(p/name)
