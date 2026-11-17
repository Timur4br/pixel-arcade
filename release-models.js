/* t4br 0.5: deterministic levels and explicit, testable game state. */
(function(){
'use strict';
const R=MoreRules,previous=MoreModels.create;
const grid=(s,cells,info='')=>({kind:'grid',w:s.w,h:s.h,cells,info});
const cell=(text='',tone='')=>({text,tone});
const finish=(s,message)=>{s.done=true;s.message=message};
const adjacent=(p,w,h)=>R.neighbors(p,w,h);
MoreModels.create=function(id,c={}){
 if(id==='parking')return parking(c);
 if(id==='poker')return poker(c);
 if(id==='plumber')return plumber(c);
 if(id==='tanks')return tanks(c);
 const m=previous(id,c),s=m.s,v=c.variant||0;
 if(id==='bulls'){
  if(s.secret===s.mySecret)s.secret=String((Number(s.secret[0])+1)%6)+s.secret.slice(1);
  m.help+=' У вас два разных секрета: ты угадываешь код бота, бот угадывает твой. Твой код задаётся в редакторе (mySecret). Последняя твоя попытка закреплена под журналом.';
 }
 if(id==='battleship'){
  s.shipLengths=s.ships.map(x=>x.length);
  m.previewShip=(index,p,vertical=s.vertical)=>{
   const len=s.shipLengths[index];if(!Number.isInteger(index)||!Number.isInteger(p)||!len||p<0||p>=100)return null;const x=p%10,y=p/10|0;
   const coords=Array.from({length:len},(_,k)=>[x+(vertical?0:k),y+(vertical?k:0)]);
   if(coords.some(([x,y])=>x>=10||y>=10))return null;
   const other=s.ships.filter((_,i)=>i!==index).flat();if(coords.some(([x,y])=>other.some(p=>Math.abs(p%10-x)<=1&&Math.abs((p/10|0)-y)<=1)))return null;
   return coords.map(([x,y])=>y*10+x);
  };
  m.moveShip=(index,p,vertical=s.vertical)=>{const cells=m.previewShip(index,p,vertical);if(!cells)return false;s.ships[index]=cells;s.own=s.ships.flat();return true};
  m.buttons.unshift({action:'dockFleet',label:'Убрать флот в гараж'});
  const old=m.act;m.act=(a,i,val)=>{if(a==='dockFleet'){s.placing=true;s.ships=s.shipLengths.map(()=>[]);s.own=[];s.selectedShip=null;return}if(a==='readyFleet'&&s.own.length!==20){s.message='Расставь все 10 кораблей из гаража.';return}old(a,i,val);if(a==='randomFleet')s.shipLengths=s.ships.map(x=>x.length)};
  m.help='Слева — гараж флота. Перетащи корабль на своё поле или выбери корабль и нажми клетку. Тень показывает посадку, красная — конфликт. «Повернуть» меняет ориентацию; R — тоже. Можно перемещать уже стоящие корабли. Соприкосновения запрещены. «Начать бой» доступно после размещения 20 палуб. ЛКМ по правому полю — выстрел.';
 }
 if(id==='shush'){
  const step=c.step||[2,3,1][v],w=[12,14,11][v],h=[10,13,11][v];
  s.w=w;s.h=h;s.step=step;s.start=0;s.pos=0;s.path=[0];s.cells=[];
  for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step)s.cells.push(y*w+x);
  // Distinct stepping-stone layouts, with an uninterrupted outer route.
  s.cells=s.cells.filter(i=>i%w===0||(i/w|0)===Math.floor((h-1)/step)*step||((i/w|0)/step+i%w/step+v)%4!==2);
  s.goal=s.cells.at(-1);s.cursor=1;
  const next=p=>s.cells.filter(i=>(i%w===p%w&&Math.abs(i-p)===w*step)||((i/w|0)===(p/w|0)&&Math.abs(i-p)===step));
  s.solution=R.search(0,p=>p===s.goal,next).path;
  m.act=(a,i)=>{if(a!=='cell'||!next(s.pos).includes(i)||s.done)return;s.pos=i;s.path.push(i);s.score++;if(i===s.goal)finish(s,'Финиш! Прыжков: '+s.score)};
  m.bot=()=>m.act('cell',s.solution[s.cursor++]);
  m.help='Синяя кувшинка — старт, красная — финиш. Нажимай кувшинку по горизонтали или вертикали. Длина прыжка: '+step+' кл. (через '+(step-1)+' кл.).';
  m.view=()=>grid(s,Array.from({length:w*h},(_,i)=>cell('',s.cells.includes(i)?'pad':'water')),'Прыжок: '+step+' кл. · через '+(step-1)+' кл. · синяя → красная');
 }
 if(id==='hexpath'&&v){
  const oldCells=[...s.cells],w=s.w,h=s.h;
  const transform=i=>v===1?(h-1-(i/w|0))*w+i%w:(h-1-(i/w|0))*w+(w-1-i%w);
  s.cells=oldCells.map(transform);s.blocks=s.blocks.map(transform);const terrain=[];s.terrain.forEach((t,i)=>terrain[transform(i)]=t);s.terrain=terrain;
  s.start=transform(s.start);s.goal=transform(s.goal);s.pos=s.start;s.path=[s.start];
  const next=p=>{const x=p%w,y=p/w|0;return (y%2?[[1,0],[-1,0],[0,-1],[1,-1],[0,1],[1,1]]:[[1,0],[-1,0],[0,-1],[-1,-1],[0,1],[-1,1]]).map(([dx,dy])=>[x+dx,y+dy]).filter(([x,y])=>x>=0&&y>=0&&x<w&&y<h).map(([x,y])=>y*w+x).filter(i=>s.cells.includes(i))};
  const distance=new Map([[s.start,0]]),prev=new Map(),q=new Set(s.cells);
  while(q.size){const p=[...q].reduce((a,b)=>(distance.get(a)??Infinity)<(distance.get(b)??Infinity)?a:b);q.delete(p);if(!distance.has(p)||p===s.goal)break;for(const n of next(p)){const d=distance.get(p)+(s.terrain[n]==='forest'?3:1);if(d<(distance.get(n)??Infinity)){distance.set(n,d);prev.set(n,p)}}}
  s.solution=[];if(distance.has(s.goal))for(let p=s.goal;p!==undefined;p=prev.get(p))s.solution.unshift(p);s.optimal=distance.get(s.goal);s.cursor=1;
  m.act=(a,i)=>{if(a==='cell'&&next(s.pos).includes(i)){s.pos=i;s.path.push(i);s.score+=s.terrain[i]==='forest'?3:1;if(i===s.goal)finish(s,'Финиш! Стоимость '+s.score+'; оптимум '+s.optimal)}};m.bot=()=>m.act('cell',s.solution[s.cursor++]);
 }
 if(id==='sokoban'){
  m.buttons.unshift({action:'undo',label:'Отменить ход'});const old=m.act,history=[];
  m.act=(a,i,val)=>{if(a==='undo'){const p=history.pop();if(p){Object.assign(s,p);s.done=false;s.message='Ход отменён.'}return}const p={pos:s.pos,boxes:[...s.boxes],score:s.score};old(a,i,val);if(p.pos!==s.pos)history.push(p)};
  m.bot=()=>{const route=R.search({pos:s.pos,boxes:[...s.boxes]},t=>s.goals.every(i=>t.boxes.includes(i)),t=>R.sokobanNext(t,s.w,s.h,s.walls),t=>t.pos+':'+t.boxes.join(),60000).path;if(route[1])m.act('cell',route[1].pos);else if(!s.goals.every(i=>s.boxes.includes(i)))s.message='Ящик в тупике. Отмени последний ход или начни заново.'};
  m.help+=' «Отменить ход» возвращает ящик из тупика. На цель можно наступать, ящики нельзя тянуть.';
 }
 if(id==='wolf'){
  m.buttons=[{action:'wait',label:'Подождать ход'}];const rand=R.rng(c.seed||31);s.wait=false;s.turn=0;
  m.act=(a,i)=>{if(s.done||!['cell','wait'].includes(a))return;if(a==='cell'&&(!adjacent(s.pos,6,6).includes(i)||s.pits.includes(i)))return;
   if(s.wait){s.wait=false;s.message='Волк выбирается с кочки: пропущен один ход.'}else if(a==='cell'){s.pos=i;s.path.push(i);s.wait=s.hills.includes(i);s.message=s.wait?'Кочка: следующий ход — задержка. Нажми «Подождать».':'Выбери соседнюю клетку.'}
   s.turn++;s.score=s.turn;if(s.pos===s.beast){finish(s,'Овца поймана за '+s.turn+' ходов!');return}
   // The sheep moves every other turn, making interception possible.
   if(s.turn%2===0){const choices=adjacent(s.beast,6,6).filter(p=>!s.pits.includes(p));if(choices.length)s.beast=choices[rand()*choices.length|0]}
   if(s.pos===s.beast)finish(s,'Овца поймана за '+s.turn+' ходов!');
  };
  m.bot=()=>{if(s.wait){m.act('wait');return}const p=R.search(s.pos,p=>p===s.beast,p=>adjacent(p,6,6).filter(i=>!s.pits.includes(i))).path;if(p[1]!==undefined)m.act('cell',p[1])};
  m.help='Волк ловит овцу. Стрелки или соседняя клетка — один ход. Ямы непроходимы. Кочка задерживает на один ход: нажми «Подождать». Овца шагает раз в два хода — перехвати её.';
 }
 if(id==='snakepdf'){
  s.started=false;s.message='Настрой змейку, нажми «Применить», затем «Старт».';m.buttons.unshift({action:'start',label:'Старт'});
  const act=m.act,tick=m.tick;m.act=(a,i,val)=>{if(a==='start'){s.started=true;s.message='Собирай фрукты!';return}if(a==='direction'&&s.reverse){const d={left:-1,right:1,up:-18,down:18}[i];if(d===-s.dir&&s.snake.length>1){s.snake.reverse();const a=s.snake[0],b=s.snake[1];s.dir=a%18===(b+1)%18?1:(a+1)%18===b%18?-1:(Math.floor(a/18)+18-Math.floor(b/18))%18===1?18:-18;s.next=s.dir;return}}act(a,i,val)};m.tick=(dt,bot)=>{if(bot)s.started=true;if(s.started)tick(dt,bot)};
 }
 if(id==='mines'){
  const act=m.act;m.buttons=m.buttons.filter(b=>b.action!=='flag');s.flagMode=false;
  m.act=(a,i,val)=>{if(a==='flag-cell'){if(s.open.includes(i))return;const was=s.flagMode;s.flagMode=true;act('cell',i,val);s.flagMode=was;return}if(a==='cell'){s.flagMode=false;if(s.first&&!s.flags.includes(i)){let safe=Array.from({length:s.w*s.h},(_,p)=>p).filter(p=>Math.abs(p%s.w-i%s.w)<=1&&Math.abs((p/s.w|0)-(i/s.w|0))<=1);if(s.w*s.h-safe.length<s.mineCount)safe=[i];const relocate=s.mines.filter(p=>safe.includes(p));s.mines=s.mines.filter(p=>!safe.includes(p));const free=Array.from({length:s.w*s.h},(_,p)=>p).filter(p=>!safe.includes(p)&&!s.mines.includes(p));while(relocate.length){const k=Math.random()*free.length|0;s.mines.push(free.splice(k,1)[0]);relocate.pop()}}}act(a,i,val)};
  const rand=R.rng(c.seed||Date.now());let first=true;
  m.bot=()=>{if(first){first=false;const choices=Array.from({length:s.w*s.h},(_,i)=>i);m.act('cell',choices[Math.random()*choices.length|0]);return}
   const around=p=>Array.from({length:s.w*s.h},(_,i)=>i).filter(i=>i!==p&&Math.abs(i%s.w-p%s.w)<=1&&Math.abs((i/s.w|0)-(p/s.w|0))<=1);
   const constraints=s.open.map(p=>({cells:around(p).filter(i=>!s.open.includes(i)&&!s.flags.includes(i)),n:around(p).filter(i=>s.mines.includes(i)).length-around(p).filter(i=>s.flags.includes(i)).length})).filter(t=>t.cells.length);
   for(const t of constraints){if(t.n===0){m.act('cell',t.cells[0]);return}if(t.n===t.cells.length){s.flags.push(...t.cells);return}}
   for(const a of constraints)for(const b of constraints)if(a!==b&&a.cells.every(i=>b.cells.includes(i))){const diff=b.cells.filter(i=>!a.cells.includes(i)),n=b.n-a.n;if(diff.length&&n===0){m.act('cell',diff[0]);return}if(diff.length&&n===diff.length){s.flags.push(...diff);return}}
   const free=Array.from({length:s.w*s.h},(_,i)=>i).filter(i=>!s.open.includes(i)&&!s.flags.includes(i));const risk=i=>Math.max(s.mineCount/(s.w*s.h),...constraints.filter(t=>t.cells.includes(i)).map(t=>t.n/t.cells.length));free.sort((a,b)=>risk(a)-risk(b)||rand()-.5);if(free.length)m.act('cell',free[0]);
  };
  m.help='ЛКМ — открыть клетку, ПКМ — поставить или снять флаг. На телефоне: удерживай клетку. Победа, когда открыты все безопасные клетки; флаги необязательны. Первое открытие освобождает область без мин. Бот использует числа и ограничения, при неоднозначности рискует; старт каждый раз новый.';
 }
 if(id==='lemmings'){
  const tick=m.tick;m.tick=(dt,bot)=>tick(dt*.5,bot);
  m.help+=' Темп уменьшен вдвое. Выбранная роль подсвечена; значок над леммингом показывает его назначение.';
 }
 if(id==='invaders')upgradeInvaders(m,c);
 return m;
};
function parking(c){
 const v=c.variant||0,random=R.rng(c.seed??31),capacity=[4,6,8][v],total=[14,23,32][v];
 const s={id:'parking',capacity,slots:Array(capacity).fill(null),waiting:[],departed:[],lost:0,arrived:0,total,time:0,score:0,done:false,message:'Нажми свободное место, чтобы впустить первую машину.',nextArrival:0};
 const m={s,realtime:true,buttons:[],inputs:[],help:'Ты охранник. Нажми свободное место: первая машина из очереди займёт его. Над машиной — оставшееся время стоянки, затем она уезжает сама (+10). В очереди виден запас терпения: не успела заехать — уезжает расстроенной (−5). Мест меньше, чем машин. Задание немного изменено: добавлены очередь, таймеры и очки. Уровни отличаются вместимостью и потоком.'};
 m.act=(a,i)=>{if(a!=='cell'||s.done||!Number.isInteger(i)||i<0||i>=capacity)return;if(s.slots[i]){s.message='Машина уедет через '+Math.ceil(s.slots[i].remaining)+' с.';return}if(!s.waiting.length){s.message='Ожидаем следующую машину.';return}const car=s.waiting.shift();s.slots[i]={...car,remaining:car.duration};s.message='Машина '+car.id+' припаркована на '+car.duration+' с.'};
 m.tick=(dt,bot)=>{if(s.done)return;s.time+=dt;s.nextArrival-=dt;if(s.arrived<total&&s.nextArrival<=0){s.arrived++;s.waiting.push({id:'А'+String(s.arrived).padStart(2,'0'),patience:20+random()*16,duration:12+(random()*19|0),color:s.arrived*41});s.nextArrival=[4.8,3.8,3.2][v]}
  for(let i=0;i<capacity;i++){const car=s.slots[i];if(car&&(car.remaining-=dt)<=0){s.departed.push(car);s.slots[i]=null;s.score+=10}}
  for(const car of s.waiting)car.patience-=dt;const lost=s.waiting.filter(car=>car.patience<=0);s.lost+=lost.length;s.score-=5*lost.length;s.waiting=s.waiting.filter(car=>car.patience>0);if(lost.length)s.message='Машина не дождалась: −5 очков.';
  if(bot&&s.waiting.length){const i=s.slots.indexOf(null);if(i>=0)m.act('cell',i)}
  if(s.arrived===total&&!s.waiting.length&&s.slots.every(x=>!x))finish(s,'Смена окончена. Обслужено '+s.departed.length+', уехало из очереди '+s.lost+'. Счёт: '+s.score);
 };
 m.view=()=>({kind:'parking',info:'Очередь: '+s.waiting.length+' · Приедет ещё: '+(total-s.arrived)+' · Обслужено: '+s.departed.length+' · Потеряно: '+s.lost});return m;
}
function poker(c){
 const random=R.rng(c.seed??Date.now()),s={id:'poker',score:0,done:false,message:'Две твои карты и две карты дилера. Открой флоп.',deck:Array.from({length:52},(_,i)=>i),community:[],reveal:false,stage:0};
 for(let i=51;i;i--){const j=random()*(i+1)|0;[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]]}s.hand=[s.deck.pop(),s.deck.pop()];s.enemy=[s.deck.pop(),s.deck.pop()];
 const best=cards=>{let hand=null;for(let a=0;a<cards.length;a++)for(let b=a+1;b<cards.length;b++)for(let d=b+1;d<cards.length;d++)for(let e=d+1;e<cards.length;e++)for(let f=e+1;f<cards.length;f++){const candidate=[cards[a],cards[b],cards[d],cards[e],cards[f]];if(!hand||R.comparePoker(candidate,hand)>0)hand=candidate}return hand};
 const m={s,inputs:[],buttons:[{action:'deal',label:'Следующий этап / вскрытие'}],help:'Техасский холдем без ставок. У тебя 2 личные карты, у дилера — 2 другие. Флоп открывает 3 общие карты, тёрн и ривер — ещё по одной. Каждый собирает лучшую комбинацию из 5 карт, выбирая из 7 (2 личные + 5 общих). Затем вскрытие.'};
 m.best=best;m.act=a=>{if(a!=='deal'||s.done)return;if(s.community.length<5){const n=s.community.length===0?3:1;for(let i=0;i<n;i++)s.community.push(s.deck.pop());s.stage++;s.message=['','Флоп: три общие карты.','Тёрн: четвёртая общая карта.','Ривер: пятая общая карта. Теперь вскрытие.'][s.stage];return}s.reveal=true;s.best=best([...s.hand,...s.community]);s.enemyBest=best([...s.enemy,...s.community]);const result=R.comparePoker(s.best,s.enemyBest);s.score=result>0?10:result===0?5:0;finish(s,(result>0?'Ты выиграл! ':result<0?'Дилер выиграл. ':'Ничья. ')+R.pokerRank(s.best).name+' / '+R.pokerRank(s.enemyBest).name)};m.bot=()=>m.act('deal');m.view=()=>({kind:'holdem',info:s.message});return m;
}
function plumber(c){
 const v=c.variant||0,w=[6,7,8][v],h=[5,6,7][v],random=R.rng(c.seed??31),s={id:'plumber',w,h,score:0,done:false,message:'Соедини синий вход и красный выход. Вращать их нельзя.',masks:[],water:[]};
 const rotate=x=>(x<<1&15)|(x>>3&1),dirs=[-w,1,w,-1];
 // A bent interior route; spare tees/crosses admit alternative connections.
 const route=[],points=[[[1,1],[4,1],[4,3],[2,3]],[[1,1],[5,1],[5,3],[2,3],[2,4],[5,4]],[[2,1],[6,1],[6,3],[3,3],[3,5],[6,5]]][v];
 route.push(points[0][1]*w+points[0][0]);for(let k=1;k<points.length;k++){let p=route.at(-1),x=p%w,y=p/w|0;const [tx,ty]=points[k];while(x!==tx||y!==ty){x+=Math.sign(tx-x);y+=Math.sign(ty-y);route.push(y*w+x)}}
 s.start=route[0];s.goal=route.at(-1);s.fixed=[s.start,s.goal];s.target=Array.from({length:w*h},()=>[3,5,7,15][random()*4|0]);
 route.forEach((p,k)=>{s.target[p]=0;if(k)s.target[p]|=1<<dirs.indexOf(route[k-1]-p);if(k<route.length-1)s.target[p]|=1<<dirs.indexOf(route[k+1]-p);if(k>0&&k<route.length-1&&k%3===v%3)s.target[p]|=15});
 s.masks=s.target.map((mask,i)=>{if(s.fixed.includes(i))return mask;for(let j=0,n=route.includes(i)?1+2*(random()*2|0):random()*4|0;j<n;j++)mask=rotate(mask);return mask});
 const flow=()=>{const q=[s.start],seen=new Set(q);for(let k=0;k<q.length;k++)for(const n of adjacent(q[k],w,h)){const d=dirs.indexOf(n-q[k]);if((s.masks[q[k]]&(1<<d))&&(s.masks[n]&(1<<((d+2)%4)))&&!seen.has(n)){seen.add(n);q.push(n)}}return q};
 const m={s,inputs:[],buttons:[{action:'check',label:'Пустить воду'}],help:'Синий кран ВХОД и красный слив ВЫХОД закреплены внутри поля: их нельзя вращать. Нажимай остальные трубы: прямые, угловые, тройники и крестовины. Вода идёт только по соединённым концам. Допускается любой маршрут от входа к выходу; лишние ветки разрешены. Нажми «Пустить воду» для проверки.'};
 m.act=(a,i)=>{if(a==='cell'&&Number.isInteger(i)&&i>=0&&i<w*h&&!s.fixed.includes(i)){s.masks[i]=rotate(s.masks[i]);s.water=[];s.score++}if(a==='check'){s.water=flow();if(s.water.includes(s.goal))finish(s,'Вода дошла до выхода! Поворотов: '+s.score);else s.message='Вода остановилась. Синим показаны соединённые трубы.'}};
 m.bot=()=>{const i=s.masks.findIndex((mask,i)=>route.includes(i)&&mask!==s.target[i]);if(i>=0)m.act('cell',i);else m.act('check')};m.view=()=>grid(s,s.masks.map((_,i)=>cell('',s.water.includes(i)?'flow':'')),'Синий ВХОД → красный ВЫХОД · закреплены · ветки допустимы');return m;
}
function tanks(c){
 const v=c.variant||0,w=13,h=11,random=R.rng(c.seed??31),s={id:'tanks',w,h,pos:8*w+2,dir:'up',hp:5,score:0,done:false,message:'Стрелки — движение, пробел или «Огонь» — выстрел.',enemies:[2*w+2,2*w+10,5*w+10].slice(0,2+Math.min(v,1)),walls:[],hard:[],bullets:[],blast:[],elapsed:0,cooldown:0,moveCooldown:0,enemyClock:0};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!x||!y||x===w-1||y===h-1)s.hard.push(i);else if(y===4&&x>3&&x<9||v>0&&y===7&&x>5&&x<10)s.walls.push(i)}
 const delta=d=>({up:-w,down:w,left:-1,right:1}[d]),clear=i=>i>=0&&i<w*h&&!s.hard.includes(i)&&!s.walls.includes(i);
 const shot=(p,d,enemy)=>s.bullets.push({x:p%w+.5,y:(p/w|0)+.5,dir:d,enemy});
 const m={s,realtime:true,inputs:[],buttons:[{action:'shoot',label:'Огонь'}],help:'Стрелки перемещают танк и поворачивают башню. Пробел или «Огонь» выпускает снаряд: он летит до первого препятствия. Кирпичи разрушаются, бетон — нет. Уничтожь вражеские танки, уклоняясь от их снарядов.'};
 m.act=(a,d)=>{if(s.done)return;if(a==='direction'&&delta(d)){s.dir=d;const n=s.pos+delta(d);if(s.moveCooldown<=0&&adjacent(s.pos,w,h).includes(n)&&clear(n)&&!s.enemies.includes(n)){s.pos=n;s.moveCooldown=.12}}if(a==='shoot'&&s.cooldown<=0){shot(s.pos,s.dir,false);s.cooldown=.25}};
 m.bot=()=>{for(const e of s.enemies){if(e%w===s.pos%w||(e/w|0)===(s.pos/w|0)){s.dir=e%w===s.pos%w?e>s.pos?'down':'up':e>s.pos?'right':'left';m.act('shoot');return}}const route=R.search(s.pos,p=>s.enemies.some(e=>p%w===e%w||(p/w|0)===(e/w|0)),p=>adjacent(p,w,h).filter(i=>clear(i)&&!s.enemies.includes(i))).path;if(route[1]!==undefined)m.act('direction',Object.keys({up:0,down:0,left:0,right:0}).find(d=>delta(d)===route[1]-s.pos))};
 s.enemyTanks=s.enemies.map((pos,id)=>({id,pos,dir:'down',angle:180,x:pos%w+.5,y:(pos/w|0)+.5}));
 m.tick=(dt,bot)=>{if(s.done)return;s.cooldown-=dt;s.moveCooldown-=dt;s.elapsed+=dt;s.enemyClock+=dt;s.blast=s.blast.filter(b=>(b.life-=dt)>0);if(bot&&s.elapsed>.13){s.elapsed=0;m.bot()}
  s.enemyTanks=s.enemyTanks.filter(e=>s.enemies.includes(e.pos));for(const pos of s.enemies)if(!s.enemyTanks.some(e=>e.pos===pos))s.enemyTanks.push({id:pos,pos,dir:'down',angle:180,x:pos%w+.5,y:(pos/w|0)+.5});
 if(s.enemyClock>1){s.enemyClock=0;for(const e of s.enemyTanks){const p=e.pos;let d=p%w===s.pos%w?s.pos>p?'down':'up':(p/w|0)===(s.pos/w|0)?s.pos>p?'right':'left':null;if(d){e.dir=d;shot(p,d,true)}else{const choices=adjacent(p,w,h).filter(i=>clear(i)&&i!==s.pos&&!s.enemyTanks.some(t=>t.pos===i));if(choices.length){e.pos=choices[random()*choices.length|0];e.dir=Object.keys({up:0,down:0,left:0,right:0}).find(d=>delta(d)===e.pos-p)}}}s.enemies=s.enemyTanks.map(e=>e.pos)}
 for(const e of s.enemyTanks){const target={up:0,right:90,down:180,left:270}[e.dir],turn=((target-e.angle+540)%360)-180;e.angle+=Math.sign(turn)*Math.min(Math.abs(turn),dt*540);const tx=e.pos%w+.5,ty=(e.pos/w|0)+.5;e.x+=Math.sign(tx-e.x)*Math.min(Math.abs(tx-e.x),dt/.18);e.y+=Math.sign(ty-e.y)*Math.min(Math.abs(ty-e.y),dt/.18)}
  const kept=[];for(const b of s.bullets){let alive=true;const steps=Math.ceil(dt*12/.2);for(let k=0;k<steps&&alive;k++){b.x+=({right:1,left:-1}[b.dir]||0)*12*dt/steps;b.y+=({down:1,up:-1}[b.dir]||0)*12*dt/steps;const p=Math.floor(b.y)*w+Math.floor(b.x);if(!clear(p)){s.walls=s.walls.filter(i=>i!==p);s.blast.push({pos:p,life:.2});alive=false}else if(b.enemy&&p===s.pos){s.hp--;alive=false;s.blast.push({pos:p,life:.3})}else if(!b.enemy&&s.enemies.includes(p)){s.enemies=s.enemies.filter(i=>i!==p);s.score+=100;alive=false;s.blast.push({pos:p,life:.35})}}if(alive)kept.push(b)}s.bullets=kept;if(s.hp<=0)finish(s,'Танк уничтожен.');else if(!s.enemies.length)finish(s,'Все вражеские танки уничтожены!');
 };m.view=()=>grid(s,Array.from({length:w*h},(_,i)=>cell('',s.hard.includes(i)?'wall':s.walls.includes(i)?'brick':'')),'Броня '+s.hp+' · Врагов '+s.enemies.length);return m;
}
function upgradeInvaders(m,c){
 const s=m.s,v=c.variant||0,oldAct=m.act,oldTick=m.tick;s.powerups=[];s.triple=0;s.big=0;s.kills=0;
 // Staggered formations make the three levels visibly different.
 s.enemies.forEach((e,i)=>{if(v===1)e.y+=Math.abs(i%6-2.5)*12;if(v===2){e.y+=i%2*22;e.x+=((i/6|0)%2)*12}});
 m.act=(a,i,val)=>{const count=s.lasers.length;oldAct(a,i,val);if(a==='shoot'&&s.lasers.length>count){const b=s.lasers.at(-1);if(s.big>0)b.large=true;if(s.triple>0){s.lasers.push({...b,x:b.x-20},{...b,x:b.x+20})}}};
 m.tick=(dt,bot)=>{s.triple=Math.max(0,s.triple-dt);s.big=Math.max(0,s.big-dt);const before=[...s.enemies];for(const b of s.lasers)if(b.large){const e=s.enemies.find(e=>Math.abs(e.x-b.x)<27&&Math.abs(e.y-b.y)<22);if(e){s.enemies=s.enemies.filter(x=>x!==e);b.y=-50;s.score+=10}}oldTick(dt,bot);for(const e of before)if(!s.enemies.includes(e)){s.kills++;if(s.kills%10===0)s.powerups.push({x:e.x,y:e.y,type:s.kills%20===0?'big':'triple'})}for(const p of s.powerups){p.y+=75*dt;if(Math.abs(p.x-s.x)<26&&Math.abs(p.y-425)<22){s[p.type]=5;p.y=1000;s.message=(p.type==='big'?'Большие снаряды':'Тройной выстрел')+' на 5 секунд!'}}s.powerups=s.powerups.filter(p=>p.y<480)};
 m.help+=' Из каждого десятого врага падает бонус. Подбери его пушкой: тройной выстрел или большие снаряды на 5 секунд.';
 const view=m.view;m.view=()=>({...view(),info:'Жизни '+s.hp+' · Волна '+s.wave+'/'+s.target+(s.triple?' · ×3 '+Math.ceil(s.triple)+' с':'')+(s.big?' · Большие '+Math.ceil(s.big)+' с':'')});
}
})();
