from pathlib import Path
import re,base64,random,math
p=Path(__file__).resolve().parents[1];dest=p/'assets'/'previews';dest.mkdir(exist_ok=True)
ids=['bug','hanoi','philosophers','maze','transport','ershov','sequential','postfix','prim','wave','boyer','shush','parking','knight','queens','bipartite','sokoban','readers','buffer','sorting','battleship','fifteen','hexpath','bulls','wolf','wumpus','poker','grasshopper','snakepdf','arkanoid','lander','tetris','tanks','mines','robby','bomber','ticwide','plumber','words','fullhex','invaders','lemmings','pong','2048','memory']
green='#a8ce84';yellow='#ebca7b';blue='#78b4d1';pink='#c28bb4';red='#e18a78';light='#e1e5cb';dark='#102330'
def rect(x,y,w,h,c,stroke='none'):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}" stroke="{stroke}" stroke-width="2"/>'
def line(x,y,a,b,c=blue,width=3):return f'<path d="M{x} {y}L{a} {b}" fill="none" stroke="{c}" stroke-width="{width}"/>'
def txt(x,y,t,c=light,size=16):return f'<text x="{x}" y="{y}" fill="{c}" font-family="monospace" font-size="{size}" font-weight="bold" text-anchor="middle">{t}</text>'
def sprite(name,x,y,w,h=None):
 raw=(p/'assets'/f'{name}.svg').read_bytes();data=base64.b64encode(raw).decode();return f'<image href="data:image/svg+xml;base64,{data}" x="{x}" y="{y}" width="{w}" height="{h or w}"/>'
def tiles(w,h,draw,size=22,x0=None,y0=None):
 x0=x0 if x0 is not None else (360-w*size)/2;y0=y0 if y0 is not None else (200-h*size)/2
 return ''.join(draw(x0+x*size,y0+y*size,x,y,size) for y in range(h) for x in range(w))
for index,id in enumerate(ids):
 random.seed(index);art=''
 if id in ['maze','wave','bug','sokoban','wolf','wumpus','robby','bomber','tanks']:
  def draw(x,y,a,b,z):
   border=a==0 or b==0 or a==9 or b==5
   wall=border or (a%3==0 and b in [1,2,4] and id in ['maze','wave','sokoban','tanks'])
   out=rect(x,y,z-1,z-1,'#243c45' if wall else '#3c6552')
   if wall:out+=sprite('wall' if id in ['sokoban','tanks','bomber'] else 'rock',x,y,z-1)
   elif id=='bug' and b<3:out+=rect(x+2,y+2,z-5,z-5,green)
   elif id=='robby':out+=rect(x+9,y+9,5,5,yellow if a<4 else light)
   return out
  art=tiles(10,6,draw,25)
  name={'bug':'bug','sokoban':'person','wolf':'wolf','wumpus':'wumpus','robby':'robby','bomber':'person','tanks':'tank'}.get(id,'person')
  art+=sprite(name,100,95,40)
  if id=='wolf':art+=sprite('sheep',225,80,40)
  if id=='wumpus':art+=sprite('coin',225,117,30)
  if id=='bomber':art+=sprite('bomb',200,95,32)
  if id=='tanks':art+=sprite('tank',230,53,35)+line(138,105,230,105,yellow,4)
  if id=='sokoban':art+=sprite('crate',180,100,26)+txt(242,123,'◎',yellow,30)
  if id in ['maze','wave']:art+=line(140,135,240,135,blue,5)+line(240,135,240,70,blue,5)+rect(233,63,14,14,red)
 elif id=='hanoi':
  for x in [88,180,272]:art+=rect(x-3,65,6,90,blue)+rect(x-40,155,80,6,light)
  for i,col in enumerate([green,blue,pink,yellow]):art+=rect(88-37+i*8,140-i*18,74-i*16,15,col)
  art+=rect(250,140,44,15,pink)
 elif id=='philosophers':
  art+='<ellipse cx="180" cy="105" rx="78" ry="43" fill="#725a45" stroke="#c29e6a" stroke-width="5"/>'
  for i in range(5):
   a=i*math.tau/5-math.pi/2;x=180+95*math.cos(a);y=100+64*math.sin(a);art+=sprite('sage',x-20,y-20,40)+sprite('plate',180+40*math.cos(a)-12,100+22*math.sin(a)-10,24)
 elif id in ['ershov','sequential','prim','bipartite','transport']:
  pts=[(85,65),(85,135),(180,45),(180,105),(180,165),(275,65),(275,135)]
  for a,b in [(0,2),(0,3),(1,3),(1,4),(2,5),(3,5),(3,6),(4,6)]:
   x,y=pts[a];xx,yy=pts[b];art+=line(x,y,xx,yy,yellow if id=='prim' and a%2==0 else '#55748c',4)
   if id in ['prim','transport']:art+=txt((x+xx)/2,(y+yy)/2-5,str((a+b)%8+1),light,12)
  for i,(x,y) in enumerate(pts):
   col=[green,blue,pink][i%3] if id not in ['transport','bipartite'] else green if i<2 else yellow
   art+=rect(x-13,y-13,26,26,col,dark)+txt(x,y+5,str(i+1),dark,14)
  if id=='transport':art+=sprite('car',150,65,44)
 elif id=='postfix':
  art+=txt(160,63,'( A + B ) × C',light,22)
  for i,t in enumerate(['A','B','+','C','×']):art+=rect(65+i*47,93,40,42,[green,blue,yellow,pink,red][i])+txt(85+i*47,120,t,dark,22)
  art+=txt(180,165,'СТЕК  [ + × ]',blue,16)
 elif id=='boyer':
  for row,t in enumerate(['ABRACADABRA','ABRA']):
   for i,ch in enumerate(t):art+=rect(38+i*26+row*103,64+row*45,24,31,green if row else '#3f596c')+txt(50+i*26+row*103,86+row*45,ch,dark if row else light,18)
  art+=txt(180,166,'0              7',yellow)
 elif id=='shush':
  art+=rect(45,35,270,130,'#254f67')
  for x,y in [(60,110),(110,110),(160,110),(160,60),(210,60),(260,60)]:art+=sprite('pad',x,y,38)
  art+=sprite('person',111,85,40)+line(147,107,166,84,yellow,3)+txt(180,177,'ПРЫЖОК · 2 КЛЕТКИ',blue,14)
 elif id=='parking':
  art+=rect(45,40,270,127,'#425455',blue)
  for i in range(6):
   x=65+i%3*80;y=47+i//3*68;art+=rect(x,y,55,52,'#273d44',light)
   if i!=4:art+=sprite('car',x+10,y,35)+txt(x+45,y+15,str(12+i),yellow,10)
  art+=sprite('car',16,110,30)+sprite('car',320,80,30)
 elif id in ['knight','queens']:
  art=tiles(8,5,lambda x,y,a,b,z:rect(x,y,z,z,'#698b7a' if (a+b)%2 else '#263e4b'),26)
  art+=txt(140,140,'♞' if id=='knight' else '♛',yellow,76)
  if id=='queens':art+=txt(230,80,'♛',pink,52)
  else:art+=line(158,105,210,105,blue,4)+line(210,105,210,53,blue,4)
 elif id=='readers':
  art+=rect(140,55,85,100,'#c2b88f')+line(183,55,183,155,dark,4)
  for y in range(70,145,15):art+=line(150,y,175,y,'#596c65',3)+line(192,y,215,y,'#596c65',3)
  art+=sprite('reader',60,80,65)+sprite('writer',244,80,65)
 elif id=='buffer':
  for i in range(7):
   a=i*math.tau/7;x=180+90*math.cos(a);y=104+60*math.sin(a);art+=rect(x-20,y-18,40,36,green if i<4 else '#294456',blue)+txt(x,y+6,str(i+1),dark if i<4 else light)
  art+=txt(180,110,'FIFO',yellow,22)
 elif id=='sorting':
  for i,n in enumerate([3,6,2,9,5,7,4,8]):art+=rect(59+i*31,165-n*13,23,n*13,[green,blue,pink,yellow][i%4])+txt(70+i*31,156-n*13,str(n),light,12)
 elif id=='battleship':
  for offset in [35,195]:
   art+=tiles(5,5,lambda x,y,a,b,z:rect(x,y,z-1,z-1,'#305971',blue),24,offset,45)
   for a,b in [(1,1),(2,1),(3,1)]:art+=rect(offset+a*24+3,45+b*24+3,18,18,'#a3b9af')
  art+=txt(254,107,'✹',red,44)+txt(110,145,'●',light,20)
 elif id in ['fifteen','2048','grasshopper','mines','ticwide','words','memory']:
  n=4 if id in ['fifteen','2048','mines','words','memory'] else 3
  vals={'fifteen':['1','2','3','4','5','6','7','8','9','10','11','12','13','14','','15'],'2048':['2','4','','8','','16','2','','2','4','32','4','','2','','64'],'grasshopper':['2','1','2','1','2','1','1','2','1'],'mines':['1','1','','','⚑','2','1','','2','✹','2','','1','2','⚑',''],'ticwide':['×','○','','','×','○','','','×'],'words':list('КОДАЛИСАМОРЕИГРА'),'memory':['★','?','♥','?','?','◆','?','★','◆','?','♥','?','?','♣','?','♣']}[id]
  art=tiles(n,n,lambda x,y,a,b,z:rect(x,y,z-3,z-3,[green,blue,yellow,pink][(a+b)%4] if id!='mines' else '#587d89')+txt(x+(z-3)/2,y+z*.63,vals[b*n+a],dark,18 if n==4 else 28),32 if n==4 else 43)
 elif id in ['hexpath','fullhex']:
  for y in range(6):
   for x in range(9):
    
    if id=='fullhex' and abs(x-4)+abs(y-2.5)>5:continue
    xx=75+x*25+(y%2)*12;yy=44+y*22
    pts=' '.join(f'{xx+14*math.cos(k*math.pi/3)},{yy+14*math.sin(k*math.pi/3)}' for k in range(6))
    art+=f'<polygon points="{pts}" fill="{blue if x==y else green if x<5 else "#4e6b55"}" stroke="#172e3e" stroke-width="2"/>'
  art+=line(74,45,207,153,yellow,5)
 elif id=='bulls':
  for y in range(4):
   art+=rect(80,38+y*35,200,30,'#725a49')
   for x in range(4):art+=f'<circle cx="{100+x*35}" cy="{53+y*35}" r="10" fill="{[green,blue,red,yellow][(x+y)%4]}" stroke="#182c36" stroke-width="3"/>'
   art+=txt(254,58+y*35,str(y)+' •',light,14)
 elif id=='poker':
  art+=rect(40,42,280,122,'#315c48','#a4875e')
  for i,(n,suit) in enumerate([('A','♠'),('K','♥'),('Q','♠'),('J','♦'),('10','♣')]):art+=rect(65+i*48,65,40,70,light)+txt(85+i*48,90,n,red if suit in ['♥','♦'] else dark,17)+txt(85+i*48,119,suit,red if suit in ['♥','♦'] else dark,26)
 elif id=='snakepdf':
  art+=tiles(12,6,lambda x,y,a,b,z:rect(x,y,z-1,z-1,'#25483e'),23)
  for x,y in [(95,85),(118,85),(141,85),(164,85),(164,108),(164,131),(187,131),(210,131)]:art+=rect(x,y,21,21,green)
  art+=rect(98,89,4,4,dark)+rect(98,98,4,4,dark)+sprite('fruit',250,57,34)
 elif id=='arkanoid':
  for y in range(4):
   for x in range(8):
    if abs(x-3.5)+y<6:art+=rect(52+x*33,38+y*20,29,15,[pink,green,blue,yellow][y])
  art+=rect(149,166,72,9,green)+rect(202,129,9,9,light)+line(183,153,207,133,'#739292',2)
 elif id=='lander':
  art+='<path d="M20 180L65 140L100 150L135 112L180 163L224 163L255 126L294 150L340 135V200H20Z" fill="#5b6e77" stroke="#b1c2b9" stroke-width="3"/>'
  art+=rect(180,161,44,4,green)+sprite('ship',173,70,36)+rect(187,104,8,20,yellow)
 elif id=='tetris':
  art+=tiles(8,6,lambda x,y,a,b,z:rect(x,y,z-1,z-1,'#1b2e3d'),24)
  for x,y,col in [(1,5,green),(2,5,green),(2,4,green),(3,4,green),(4,5,pink),(5,5,pink),(5,4,pink),(5,3,pink),(6,5,blue),(6,4,blue),(7,5,blue),(7,4,blue),(2,1,yellow),(3,1,yellow),(3,2,yellow),(4,2,yellow)]:art+=rect(84+x*24,28+y*24,22,22,col,light)
 elif id=='plumber':
  art+=tiles(6,4,lambda x,y,a,b,z:rect(x,y,z-1,z-1,'#3c5664'),34)
  for points,col in [('M95 55V89H163V123H265',blue),('M129 55H163M197 55V89H265V157M95 157H163V123',light)]:art+=f'<path d="{points}" fill="none" stroke="{col}" stroke-width="12"/>'
  art+=rect(82,42,26,26,blue)+txt(95,61,'▼',dark,18)+rect(252,110,26,26,red)+txt(265,130,'◎',light,22)
 elif id=='invaders':
  for y in range(3):
   for x in range(7):art+=sprite('wumpus',65+x*33,40+y*29,25)
  art+=sprite('ship',163,145,36)+rect(178,127,4,11,yellow)+txt(280,170,'×3',yellow,20)
 elif id=='lemmings':
  art+=rect(35,78,180,22,'#6c5643')+rect(35,75,180,5,green)+rect(195,152,130,22,'#6c5643')+rect(195,149,130,5,green)
  for x,y in [(60,49),(105,49),(150,49),(212,103),(256,123)]:art+=sprite('lemming',x,y,30)
  art+=rect(285,119,33,30,blue,green)+txt(225,66,'⚒',yellow,20)
 elif id=='pong':art+=line(180,40,180,170,'#507280',2)+rect(65,70,10,60,green)+rect(285,105,10,60,pink)+rect(216,86,12,12,yellow)+txt(135,61,'03',green,23)+txt(230,61,'02',pink,23)
 frame=rect(0,0,360,200,'#142735')+''.join(rect(x,y,2,2,'#304a5a') for x in range(12,360,20) for y in range(12,200,20))
 frame+=rect(16,18,328,164,'none','#55727b')+art+rect(16,18,7,7,green)+rect(337,175,7,7,yellow)
 (dest/f'{id}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="720" height="400" viewBox="0 0 360 200" shape-rendering="crispEdges">{frame}</svg>',encoding='utf-8')
print(f'{len(ids)} distinct game covers created')
