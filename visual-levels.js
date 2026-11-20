const VisualLevels=(()=>{
'use strict';const R=MoreRules,copy=R.clone;
const ids=['shush','sokoban','robby','grasshopper','hexpath','fullhex','wolf','wumpus','tanks','bomber','snakepdf','plumber','mines','arkanoid','lemmings','knight','breach'];
const fixed={wolf:[6,6],tanks:[13,11],bomber:[11,11],snakepdf:[18,18],lemmings:[20,12],arkanoid:[10,8],fullhex:[9,9]};
const arrays=['walls','hard','cells','pits','beasts','rocks','boxes','goals','black','enemies','ground','mines'];
function validate(id,map){
 if(!ids.includes(id)||!map||typeof map!=='object'||Array.isArray(map))throw Error('Некорректное поле редактора.');
 const ok=(test,text)=>{if(!test)throw Error(text)},integer=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
 ok(integer(map.w,2,20)&&integer(map.h,2,20),'Стороны поля: 2–20 клеток.');const out={w:map.w,h:map.h},n=out.w*out.h;
 if(fixed[id])ok(out.w===fixed[id][0]&&out.h===fixed[id][1],'Для этой игры сохраняется размер '+fixed[id].join('×')+'.');
 if(['mines','knight','breach'].includes(id))ok(out.w===out.h,'Для этой игры нужно квадратное поле.');
 if(['knight','queens'].includes(id))ok(out.w<=(id==='queens'?10:10)&&out.w>=(id==='queens'?4:3),'Шахматное поле: '+(id==='queens'?4:3)+'–10.');
 for(const key of arrays)if(map[key]!==undefined){ok(Array.isArray(map[key])&&map[key].length<=n&&new Set(map[key]).size===map[key].length&&map[key].every(i=>integer(i,0,n-1)),key+': клетки должны быть уникальны и внутри поля.');out[key]=[...map[key]]}
 for(const key of ['start','goal','sheep'])if(map[key]!==undefined){ok(integer(map[key],0,n-1),'Точка '+key+' должна быть внутри поля.');out[key]=map[key]}
 for(const key of ['numbers','masks','terrain','matrix'])if(map[key]!==undefined){ok(Array.isArray(map[key])&&map[key].length===n,key+': нужен элемент для каждой клетки.');out[key]=[...map[key]]}
 if(out.numbers)ok(out.numbers.every(i=>integer(i,1,Math.max(out.w,out.h)-1)),'Длина прыжка: от 1 до стороны поля минус 1.');
 if(out.masks)ok(out.masks.every(i=>integer(i,1,15)),'Неверная форма трубы.');
 if(out.terrain)ok(out.terrain.every(x=>['grass','forest','water'].includes(x)),'Неизвестная местность.');
 if(map.bricks){ok(Array.isArray(map.bricks)&&map.bricks.length>0&&map.bricks.length<=n,'Нужен хотя бы один блок.');ok(new Set(map.bricks.map(b=>b.cell)).size===map.bricks.length&&map.bricks.every(b=>integer(b.cell,0,n-1)&&integer(b.color,0,4)),'Неверные блоки.');out.bricks=copy(map.bricks)}
 const blocked=[...(out.walls||[]),...(out.hard||[]),...(out.ground||[]),...(out.black||[]),...Array.from({length:n},(_,i)=>i).filter(i=>out.terrain?.[i]==='water')];
 if(out.start!==undefined)ok(!blocked.includes(out.start),'Старт не может находиться в стене.');
 if(out.goal!==undefined)ok(!blocked.includes(out.goal)&&out.start!==out.goal,'Финиш должен быть свободен и отличаться от старта.');
 if(['shush','fullhex'].includes(id))ok(out.cells?.length>1&&out.cells.includes(out.start)&&(!('goal'in out)||out.cells.includes(out.goal)),'Старт и финиш должны быть на доступных клетках.');
 if(id==='fullhex')ok(out.cells.every(i=>{const q=i%9-4,r=(i/9|0)-4;return Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))<=4}),'Клетка за пределами шестиугольника.');
 if(id==='grasshopper')ok(out.numbers,'Нужны числа для всех клеток.');
 if(id==='sokoban'){ok(out.boxes?.length>0&&out.boxes.length===out.goals?.length,'Ящиков и целей должно быть поровну, хотя бы по одному.');ok(out.boxes.every(i=>!blocked.includes(i)&&i!==out.start)&&out.goals.every(i=>!blocked.includes(i)),'Ящики и цели не могут быть в стенах или на игроке.')}
 if(id==='wumpus'||id==='wolf'){const danger=[...(out.pits||[]),...(out.beasts||[]),...(out.rocks||[])];ok(new Set(danger).size===danger.length,'Опасности и камни не должны перекрываться.');ok(!danger.includes(out.start)&&!danger.includes(out.goal??out.sheep),'Старт и цель должны быть отдельно от препятствий.');if(id==='wolf')ok(out.sheep!==out.start,'Овца не должна начинать на волке.')}
 if(['tanks','bomber'].includes(id))ok(out.enemies?.length>0&&out.enemies.every(i=>i!==out.start&&!blocked.includes(i)),'Нужен хотя бы один враг вне стен и игрока.');
 if(id==='mines')ok(out.mines?.length>0&&out.mines.length<n,'Нужно от 1 до числа клеток минус 1 мины.');
 if(id==='plumber')ok(out.masks&&out.start!==undefined&&out.goal!==undefined,'Нужны трубы, вход и выход.');
 if(id==='breach'){ok(out.w>=5&&out.w<=7,'Матрица: от 5×5 до 7×7.');ok(out.matrix?.every(x=>BreachProtocol.bytes.includes(x)),'Используй коды 1C, 55, 7A, BD, E9, FF.');out.capacity=map.capacity;out.time=map.time;ok(integer(out.capacity,4,10)&&integer(out.time,10,180),'Буфер 4–10, время 10–180 с.');ok(Array.isArray(map.targets)&&map.targets.length>=1&&map.targets.length<=3,'Нужно 1–3 цепочки.');out.targets=map.targets.map((t,i)=>{ok(Array.isArray(t.codes)&&t.codes.length>=2&&t.codes.length<=out.capacity&&t.codes.every(x=>BreachProtocol.bytes.includes(x)),'Неверная целевая цепочка.');return {name:'Доступ '+(i+1),codes:[...t.codes],reward:(i+1)*100,complete:false}})}
 // Optional solution witnesses are caches, accepted only while they remain valid.
 if(Array.isArray(map.solutionRoute)){
  const route=map.solutionRoute,unique=new Set(route),inside=route.every(i=>integer(i,0,n-1));let valid=false;
  if(id==='breach'&&inside&&route.length<=out.capacity&&unique.size===route.length){const path=[];valid=route.every(i=>{const legal=BreachProtocol.legal({w:out.w,path}).includes(i);path.push(i);return legal})&&out.targets.every(t=>BreachProtocol.matches(route.map(i=>out.matrix[i]),t.codes))}
  if(id==='fullhex'&&inside&&route[0]===out.start&&unique.size===route.length&&route.length===out.cells.length){valid=route.every((i,k)=>out.cells.includes(i)&&(!k||[[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]].some(([dx,dy])=>route[k-1]%out.w+dx===i%out.w&&Math.floor(route[k-1]/out.w)+dy===Math.floor(i/out.w))))}
  if(valid)out.solutionRoute=[...route];
 }
 if(id==='plumber'&&Array.isArray(map.solutionMasks)&&map.solutionMasks.length===n){const rotate=x=>(x<<1&15)|(x>>3&1),target=map.solutionMasks,dirs=[-out.w,1,out.w,-1];const compatible=target.every((mask,i)=>{if(!integer(mask,1,15))return false;let current=out.masks[i];for(let k=0;k<([out.start,out.goal].includes(i)?1:4);k++){if(current===mask)return true;current=rotate(current)}return false});if(compatible&&R.search(out.start,p=>p===out.goal,p=>R.neighbors(p,out.w,out.h).filter(q=>{const d=dirs.indexOf(q-p);return target[p]&(1<<d)&&target[q]&(1<<((d+2)%4))})).path.length)out.solutionMasks=[...target]}
 return out;
}
function snapshot(id,config){
 if(config.map)return copy(config.map);const m=MoreModels.create(id,config),s=m.s,v=m.view(),map={w:s.w||s.n||v.w,h:s.h||s.n||v.h};
 if(['knight','queens'].includes(id)){map.start=s.pos;return map}
 if(id==='arkanoid')return {w:10,h:8,bricks:s.bricks.filter(b=>b.alive).map(b=>({cell:Math.round((b.y-25)/25)*10+Math.round((b.x-18)/45),color:b.color||0}))};
 if(id==='breach')return {w:s.w,h:s.w,matrix:[...s.matrix],capacity:s.capacity,time:Math.round(s.left),targets:copy(s.targets),solutionRoute:s.planted?[...s.planted]:undefined};
 if(!['plumber','mines'].includes(id))map.start=s.start??s.pos??s.snake?.[0]??41;
 if(['shush','hexpath','wumpus','plumber','lemmings'].includes(id))map.goal=s.goal??s.exit;
 if(id==='shush'||id==='fullhex')map.cells=[...s.cells];if(id==='fullhex')map.solutionRoute=[...s.solution];
 if(id==='sokoban'){map.walls=[...s.walls];map.boxes=[...s.boxes];map.goals=[...s.goals]}
 if(id==='robby'){map.walls=s.blocks||[];map.black=[...s.black]}
 if(id==='grasshopper')map.numbers=[...s.numbers];
 if(id==='hexpath'){map.cells=[...s.cells];map.walls=s.blocks.filter(i=>s.terrain[i]!=='water');map.terrain=Array.from({length:s.w*s.h},(_,i)=>s.terrain[i]||'grass')}
 if(id==='wolf'){map.pits=[...s.pits];map.rocks=[...s.hills];map.sheep=s.beast}
 if(id==='wumpus'){map.pits=[...s.pits];map.beasts=[...s.beasts]}
 if(id==='tanks'||id==='bomber'){map.walls=[...s.walls];map.hard=[...s.hard];map.enemies=[...s.enemies]}
 if(id==='snakepdf'){map.walls=[...s.walls];map.start=s.snake[0]}
 if(id==='plumber'){map.masks=[...s.masks];map.start=s.start;map.solutionMasks=[...s.target]}
 if(id==='mines')map.mines=[...s.mines];
 if(id==='lemmings'){map.start=s.start??41;map.ground=[...s.terrain];map.goal=s.exit}
 return map;
}
function apply(id,m,map,config){
 const s=m.s,w=map.w,h=map.h,n=w*h,all=Array.from({length:n},(_,i)=>i),C=(text='',tone='')=>({text,tone});
 s.w=w;s.h=h;s.score=0;s.done=false;s.message='Твой уровень применён.';
 if(map.start!==undefined){s.start=map.start;s.pos=map.start;s.path=[map.start]}
 if(map.goal!==undefined)s.goal=map.goal;
 if(id==='breach'){Object.assign(s,{matrix:[...map.matrix],capacity:map.capacity,left:map.time,targets:copy(map.targets),path:[],buffer:[],started:false,planted:map.solutionRoute?[...map.solutionRoute]:null,botPlan:null});return m}
 if(id==='knight'||id==='queens'){return m}
 if(id==='wolf'){s.pits=[...map.pits];s.hills=[...map.rocks];s.beast=map.sheep;return m}
 if(id==='wumpus'){s.pits=[...map.pits];s.beasts=[...map.beasts];s.killed=[];s.revealed=new Set([s.pos]);s.arrows=Math.max(1,s.beasts.length);return m}
 if(id==='tanks'||id==='bomber'){s.walls=[...map.walls];s.hard=[...map.hard];s.enemies=[...map.enemies];if(id==='tanks')s.visual={x:s.pos%w+.5,y:(s.pos/w|0)+.5};return m}
 if(id==='arkanoid'){s.bricks=map.bricks.map(b=>({x:18+b.cell%10*45,y:25+(b.cell/10|0)*25,alive:true,color:b.color}));return m}
 if(id==='mines'){s.mines=[...map.mines];s.mineCount=s.mines.length;s.open=[];s.flags=[];s.first=true;return m}
 if(id==='snakepdf'){s.walls=[...map.walls];const route=R.search(s.pos,p=>p!==s.pos&&R.neighbors(p,w,h).filter(i=>i!==s.pos&&!s.walls.includes(i)).length>0,p=>R.neighbors(p,w,h).filter(i=>!s.walls.includes(i))).path;const a=route[1],b=a!==undefined?R.neighbors(a,w,h).find(i=>i!==s.pos&&!s.walls.includes(i)):undefined;if(a===undefined||b===undefined)throw Error('Оставь три соседние свободные клетки для змейки.');s.snake=[s.pos,a,b];s.dir=s.pos-a;s.next=s.dir;if(s.walls.includes(s.food)||s.snake.includes(s.food))s.food=all.find(i=>!s.walls.includes(i)&&!s.snake.includes(i));return m}
 if(id==='lemmings'){s.terrain=[...map.ground];s.exit=map.goal;if(s.rescueModel)return m;const tick=m.tick;m.tick=(dt,bot)=>{const old=s.spawned;tick(dt,bot);for(const p of s.people)if(p.id>=old){p.x=map.start%w;p.y=map.start/w|0;p.fall=0}};return m}
 const done=text=>{s.done=true;s.message=text},grid=cells=>({kind:'grid',w,h,cells,info:'Свой уровень · '+s.score});
 if(id==='sokoban'){
  s.walls=[...map.walls];s.boxes=[...map.boxes];s.goals=[...map.goals];const history=[];
  m.act=(a,i)=>{if(a==='undo'){const old=history.pop();if(old){Object.assign(s,old);s.done=false}return}if(a!=='cell'||s.done)return;const next=R.sokobanNext({pos:s.pos,boxes:s.boxes},w,h,s.walls).find(t=>t.pos===i);if(!next)return;history.push({pos:s.pos,boxes:[...s.boxes],score:s.score});s.pos=next.pos;s.boxes=next.boxes;s.score++;if(s.goals.every(i=>s.boxes.includes(i)))done('Все ящики на целях!')};
  m.bot=()=>{const p=R.search({pos:s.pos,boxes:s.boxes},t=>s.goals.every(i=>t.boxes.includes(i)),t=>R.sokobanNext(t,w,h,s.walls),t=>t.pos+':'+t.boxes.join(),60000).path;if(p[1])m.act('cell',p[1].pos);else done('Решение из этой позиции не найдено. Измени поле или отмени ход.')};m.view=()=>grid(all.map(i=>C('',s.walls.includes(i)?'wall':'')));return m;
 }
 if(id==='plumber'){
  s.masks=[...map.masks];s.fixed=[s.start,s.goal];s.water=[];let solution=null;const rotate=x=>(x<<1&15)|(x>>3&1),dirs=[-w,1,w,-1];
  if(map.solutionMasks){const target=map.solutionMasks;solution=R.search(s.start,p=>p===s.goal,p=>R.neighbors(p,w,h).filter(q=>{const d=dirs.indexOf(q-p);return target[p]&(1<<d)&&target[q]&(1<<((d+2)%4))})).path.map(i=>[i,target[i]])}
  const next=p=>R.neighbors(p,w,h).filter(q=>{const d=dirs.indexOf(q-p);return s.masks[p]&(1<<d)&&s.masks[q]&(1<<((d+2)%4))});
  m.act=(a,i)=>{if(a==='cell'&&!s.fixed.includes(i)){s.masks[i]=rotate(s.masks[i]);s.water=[];s.score++;solution=null}if(a==='check'){const seen=new Set([s.start]),q=[s.start];for(let k=0;k<q.length;k++)for(const i of next(q[k]))if(!seen.has(i)){seen.add(i);q.push(i)}s.water=q;if(seen.has(s.goal))done('Вода дошла до выхода!');else s.message='Есть разрыв. Синим показана доступная воде сеть.'}};
  function find(){let calls=0;const route=[],seen=new Set();function visit(p,entry){if(++calls>70000)return false;let mask=s.masks[p],choices=[];for(let k=0;k<(s.fixed.includes(p)?1:4);k++){if(!choices.includes(mask))choices.push(mask);mask=rotate(mask)}for(const mask of choices){if(entry>=0&&!(mask&(1<<entry)))continue;seen.add(p);route.push([p,mask]);if(p===s.goal)return true;for(const q of R.neighbors(p,w,h)){const d=dirs.indexOf(q-p);if(!seen.has(q)&&(mask&(1<<d))&&visit(q,(d+2)%4))return true}route.pop();seen.delete(p)}return false}return visit(s.start,-1)?route:[]}
  m.bot=()=>{if(!solution)solution=find();if(!solution.length){done('Соединение не найдено: проверь трубы и направления входа/выхода.');return}const row=solution.find(([i,mask])=>s.masks[i]!==mask);if(row){s.masks[row[0]]=rotate(s.masks[row[0]]);s.score++}else m.act('check')};m.view=()=>grid(s.masks.map((_,i)=>C('',s.water.includes(i)?'flow':'')));return m;
 }
 s.blocks=[...(map.walls||[])];s.black=[...(map.black||[])];s.cells=map.cells?[...map.cells]:all.filter(i=>!s.blocks.includes(i)&&!s.black.includes(i));
 if(id==='grasshopper')s.numbers=[...map.numbers];if(id==='hexpath'){s.terrain=[...map.terrain];s.blocks=[...new Set([...s.blocks,...all.filter(i=>s.terrain[i]==='water')])];s.cells=all.filter(i=>!s.blocks.includes(i));s.hex=true}
 if(id==='fullhex'){s.blocks=all.filter(i=>!s.cells.includes(i));s.hex=true}
 const adjacent=p=>{const x=p%w,y=p/w|0,step=id==='grasshopper'?s.numbers[p]:id==='shush'?(config.step||[2,3,1][config.variant||0]):1,dirs=id==='fullhex'?[[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]]:id==='hexpath'?(y%2?[[1,0],[-1,0],[0,-1],[1,-1],[0,1],[1,1]]:[[1,0],[-1,0],[0,-1],[-1,-1],[0,1],[-1,1]]):[[1,0],[-1,0],[0,1],[0,-1]];return dirs.map(([dx,dy])=>[x+dx*step,y+dy*step]).filter(([x,y])=>x>=0&&y>=0&&x<w&&y<h).map(([x,y])=>y*w+x).filter(i=>(s.cells.includes(i)||id==='robby'&&s.black.includes(i))&&!s.blocks.includes(i))};
 s.step=config.step||[2,3,1][config.variant||0];let plan=map.solutionRoute?[...map.solutionRoute]:null;const cover=['grasshopper','fullhex','robby'].includes(id);
 m.act=(a,i)=>{if(a!=='cell'||!adjacent(s.pos).includes(i)||s.done)return;if(cover&&id!=='robby'&&s.path.includes(i)){s.message='Эта клетка уже посещена.';return}s.pos=i;s.path.push(i);plan=null;if(id==='robby'&&s.black.includes(i)){s.path=[];s.message='Чёрная точка сбросила белые точки.'}s.score=cover?new Set(s.path.filter(i=>s.cells.includes(i))).size:s.score+(s.terrain?.[i]==='forest'?3:1);if(cover?s.cells.every(i=>s.path.includes(i)):i===s.goal)done(cover?'Все клетки посещены!':'Финиш найден!')};
 m.bot=()=>{let path=[];if(id==='robby'){const targets=s.cells.filter(i=>!s.path.includes(i));path=R.search(s.pos,p=>targets.includes(p),p=>adjacent(p).filter(i=>!s.black.includes(i))).path}else if(cover){if(!plan)plan=R.hamilton(s.cells.filter(i=>i===s.pos||!s.path.includes(i)),s.pos,adjacent,100000).path;path=plan;const rest=plan.slice(1);if(path[1]!==undefined){m.act('cell',path[1]);plan=rest;return}}else if(id==='hexpath'){
   const distance=new Map([[s.pos,0]]),prev=new Map(),q=new Set(s.cells);while(q.size){const p=[...q].reduce((a,b)=>(distance.get(a)??Infinity)<(distance.get(b)??Infinity)?a:b);q.delete(p);if(!distance.has(p)||p===s.goal)break;for(const i of adjacent(p)){const cost=distance.get(p)+(s.terrain[i]==='forest'?3:1);if(cost<(distance.get(i)??Infinity)){distance.set(i,cost);prev.set(i,p)}}}if(distance.has(s.goal))for(let i=s.goal;i!==undefined;i=prev.get(i))path.unshift(i);
  }else path=R.search(s.pos,p=>p===s.goal,adjacent).path;
  if(path[1]!==undefined)m.act('cell',path[1]);else done('Маршрут не найден. Проверь свой уровень в редакторе.')};
 m.view=()=>id==='hexpath'||id==='fullhex'?{kind:'hexmap',w,h,cells:s.cells}:grid(all.map(i=>C(id==='grasshopper'?s.numbers[i]:'',s.blocks.includes(i)?'wall':s.black.includes(i)?'black':s.path.includes(i)?'visited':id==='shush'&&!s.cells.includes(i)?'water':'')));
 return m;
}
return {ids,fixed,validate,snapshot,apply};
})();
(()=>{const create=MoreModels.create;MoreModels.create=function(id,config={}){
 if(id==='breach'){const m=BreachProtocol.create(config);return config.map?VisualLevels.apply(id,m,VisualLevels.validate(id,config.map),config):m}
 let map=config.map?VisualLevels.validate(id,config.map):null,c={...config};
 if(map&&['wumpus','mines','knight','queens'].includes(id)){c.boardSize=map.w;if(id==='mines')c.mines=map.mines.length;if(['knight','queens'].includes(id))c.start=map.start||0}
 const m=create(id,c);if(map)VisualLevels.apply(id,m,map,c);
 if(id==='bipartite'&&config.graph){const graph=CourseLevels.validate('ershov',config.graph);Object.assign(m.s,{n:graph.n,edges:graph.edges,colors:Array(graph.n).fill(-1),result:MoreRules.bipartite(graph.n,graph.edges),cursor:0})}
 return m;
}})();
