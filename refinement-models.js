(function(){
'use strict';const R=MoreRules,create=MoreModels.create;
MoreModels.create=function(id,config={}){
 if(id==='poker')return PokerTournament.create(config);
 if(id==='bulls')return codeDuel(config);
 if(id==='wumpus')return wumpus(config);
 if(id==='snakepdf')config={...config,mode:['classic','portal','walls'].includes(config.mode)?config.mode:'classic',wrap:config.mode==='portal',reverse:false};
 const m=create(id,config),s=m.s;
 if(id==='snakepdf')m.help='Выбери один из трёх режимов и скорость, нажми «Применить», затем «Старт». Стрелки — поворот змейки. Разворачиваться в собственное тело нельзя. Цвет и фрукт спрятаны в «Внешний вид». Классика: края опасны; без границ: края соединены; препятствия: на поле есть стены.';
 if(id==='wolf'){
  const rand=R.rng(config.seed??31),blocked=p=>s.pits.includes(p)||s.hills.includes(p),next=p=>R.neighbors(p,6,6).filter(i=>!blocked(i));s.turn=0;s.wait=false;
  if(blocked(s.beast))s.beast=Array.from({length:36},(_,i)=>i).find(i=>i!==s.pos&&!blocked(i));
  m.act=(a,i)=>{if(s.done||!['cell','wait'].includes(a))return;if(a==='cell'&&!next(s.pos).includes(i)){s.message='Камни и ямы непроходимы.';return}if(a==='cell'){s.pos=i;s.path.push(i)}s.turn++;s.score=s.turn;
   if(s.pos===s.beast){s.done=true;s.message='Овца поймана за '+s.turn+' ходов!';return}
   if(s.turn%2===0){const choices=next(s.beast);if(choices.length)s.beast=choices[rand()*choices.length|0]}s.message='Перехвати овцу. По камням и ямам ходить нельзя.';
   if(s.pos===s.beast){s.done=true;s.message='Овца поймана за '+s.turn+' ходов!'}
  };
  m.bot=()=>{const path=R.search(s.pos,p=>p===s.beast,next).path;if(path[1]!==undefined)m.act('cell',path[1]);else m.act('wait')};
  m.help='Поймай овцу. Стрелки или соседняя клетка — ход. Камни и ямы непроходимы для обоих: бот подчиняется тем же правилам. Овца двигается раз в два хода. «Подождать» позволяет устроить перехват.';
 }
 if(id==='grasshopper'){
  m.help+=' Посещённые клетки становятся золотистыми; повторно на них прыгать нельзя.';
  const view=m.view;m.view=()=>({...view(),info:'Посещено '+new Set(s.path).size+' / '+s.cells.length+' · прыжок равен числу под ногами'});
 }
 if(id==='tanks'){
  const oldAct=m.act,tick=m.tick;s.visual={x:s.pos%s.w+.5,y:(s.pos/s.w|0)+.5};
  m.act=(a,d)=>{const tx=s.pos%s.w+.5,ty=(s.pos/s.w|0)+.5;if(Math.abs(tx-s.visual.x)+Math.abs(ty-s.visual.y)>1.5)s.visual={x:tx,y:ty};const n=s.bullets.length;oldAct(a,d);if(a==='shoot'&&s.bullets.length>n){const b=s.bullets.at(-1);b.x=s.visual.x;b.y=s.visual.y}};
  m.tick=(dt,bot)=>{tick(dt,bot);const x=s.pos%s.w+.5,y=(s.pos/s.w|0)+.5,max=dt/ .12;s.visual.x+=Math.sign(x-s.visual.x)*Math.min(Math.abs(x-s.visual.x),max);s.visual.y+=Math.sign(y-s.visual.y)*Math.min(Math.abs(y-s.visual.y),max)};
  m.view=()=>({kind:'scene',scene:'tanks',state:s,info:'Броня '+s.hp+' · Врагов '+s.enemies.length+(s.enemyMode==='tactical'?' · Усиленные враги против бота':'')});
 }
 return m;
};
function codeDuel(c){
 const random=R.rng(c.seed??31),codes=R.codes(),s={id:'bulls',secret:Array.from({length:4},()=>random()*6|0).join(''),mySecret:c.mySecret||'0123',proposal:['0','1','2','3'],activeColor:'0',mine:[...codes],theirs:[...codes],humanLog:[],botLog:[],pending:false,wait:0,score:0,done:false,message:'Ты слева, бот справа. Каждый угадывает свой код.'};
 if(s.secret===s.mySecret)s.secret=String((+s.secret[0]+1)%6)+s.secret.slice(1);
 const filter=(list,g,r)=>list.filter(code=>R.bulls(code,g).join()===r.join());
 const m={s,realtime:true,inputs:[{name:'guess',label:'Код',value:'0123'}],buttons:[{action:'submit',label:'Сделать попытку'}],help:'Слева твои попытки угадать код бота, справа попытки бота угадать твой код. Это два разных секрета. Выбери цвет в палитре и нажми место в своём ряду. Бык — верный цвет и место, корова — верный цвет в другом месте. Повторы разрешены. После твоей попытки бот думает 1,5 секунды; до его ответа новый ход закрыт. Свой код можно изменить в редакторе (mySecret).'};
 m.act=(a,i,val={})=>{
  if(a==='cell'){if(i>=100)s.activeColor=String(i-100);else if(i>=0&&i<4)s.proposal[i]=s.activeColor;return}
  if(a!=='submit'||s.pending||s.done)return;const g=(val.guess??s.proposal.join('')).trim();if(!/^[0-5]{4}$/.test(g)){s.message='Нужны четыре цвета от 0 до 5.';return}
  const result=R.bulls(s.secret,g);s.humanLog.push({guess:g,result});s.mine=filter(s.mine,g,result);s.score++;
  if(result[0]===4){s.done=true;s.message='Ты первым угадал код бота!';return}s.pending=true;s.wait=1.5;s.message='Бот думает…';
 };
 function answer(){const guess=s.theirs[Math.floor(s.theirs.length/2)],result=R.bulls(s.mySecret,guess);s.botLog.push({guess,result});s.theirs=filter(s.theirs,guess,result);s.pending=false;s.wait=0;s.message='Твой ход.';if(result[0]===4){s.done=true;s.message='Бот первым угадал твой код. Твой ответ: '+s.secret}}
 m.bot=()=>{if(!s.pending&&!s.done)m.act('submit',0,{guess:s.mine[Math.floor(s.mine.length/2)]})};
 m.tick=(dt,bot)=>{if(s.done)return;if(bot&&!s.pending)m.bot();if(s.pending){s.wait=Math.max(0,s.wait-dt);if(s.wait<1e-6)answer()}};
 m.view=()=>({kind:'code-duel',info:s.pending?'Ответ бота через '+s.wait.toFixed(1)+' с':'Два разных кода · бык = цвет + место · корова = только цвет'});return m;
}
function wumpus(c){
 const variant=c.variant||0,w=c.boardSize||[6,8,10][variant],h=w,random=R.rng(c.seed??31),n=w*h,s={id:'wumpus',w,h,score:0,done:false,pos:0,start:0,goal:0,pits:[],beasts:[],killed:[],path:[],arrows:[1,2,3][variant],revealed:new Set(),message:''};
 for(let warm=0;warm<8;warm++)random();
 const shuffle=()=>{const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i;i--){const j=random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
 let route=[];
 for(let attempt=0;attempt<120;attempt++){const a=shuffle();s.start=Number.isInteger(c.start)?c.start%n:a.pop();const unused=a.filter(i=>i!==s.start);s.goal=unused.pop();s.pits=unused.splice(0,Math.min([4,9,17][variant],n-5));s.beasts=unused.splice(0,[1,2,3][variant]);const hazards=new Set([...s.pits,...s.beasts]);route=R.search(s.start,p=>p===s.goal,p=>R.neighbors(p,w,h).filter(i=>!hazards.has(i))).path;if(route.length>1)break}
 if(!route.length){s.pits=[];s.beasts=[];route=R.search(s.start,p=>p===s.goal,p=>R.neighbors(p,w,h)).path}
 s.pos=s.start;s.path=[s.start];s.revealed.add(s.start);
 const alive=()=>s.beasts.filter(i=>!s.killed.includes(i)),sense=()=>{const near=R.neighbors(s.pos,w,h);s.message=(near.some(i=>s.pits.includes(i))?'Ветер: рядом яма. ':'')+(near.some(i=>alive().includes(i))?'Запах: рядом вампус. ':'')+(near.includes(s.goal)?'Блеск: рядом золото.':'')||'Здесь спокойно.'};sense();
 const m={s,inputs:[],buttons:['up','right','down','left'].map(d=>({action:'shoot-'+d,label:'Стрела '+({up:'↑',right:'→',down:'↓',left:'←'}[d])})),help:'Найди золото в пещере. Золото, ямы и вампусы всегда в разных клетках; их места меняются с seed. Поле растёт по уровням: 6×6, 8×8, 10×10; опасностей тоже больше. Ветер предупреждает о соседней яме, запах — о соседнем вампусе, блеск — о золоте рядом. Стрелка летит по прямой до первого вампуса. Бот для демонстрации знает карту целиком.'};
 m.act=(a,i)=>{if(s.done)return;if(a.startsWith('shoot-')){if(!s.arrows){s.message='Стрел больше нет.';return}s.arrows--;const d={up:-w,right:1,down:w,left:-1}[a.slice(6)];let p=s.pos;while(R.neighbors(p,w,h).includes(p+d)){p+=d;if(alive().includes(p)){s.killed.push(p);s.revealed.add(p);s.message='Вампус повержен. Осталось стрел: '+s.arrows;return}}s.message='Стрела не попала. Осталось: '+s.arrows;return}
  if(a!=='cell'||!R.neighbors(s.pos,w,h).includes(i))return;s.pos=i;s.path.push(i);s.revealed.add(i);s.score++;
  if(s.pits.includes(i)){s.done=true;s.message='Ты упал в яму.'}else if(alive().includes(i)){s.done=true;s.message='Вампус тебя поймал.'}else if(i===s.goal){s.done=true;s.message='Золото найдено за '+s.score+' шагов!'}else sense();
 };
 m.bot=()=>{const route=R.search(s.pos,p=>p===s.goal,p=>R.neighbors(p,w,h).filter(i=>!s.pits.includes(i)&&!alive().includes(i))).path;if(route[1]!==undefined)m.act('cell',route[1])};
 m.view=()=>({kind:'grid',w,h,cells:Array.from({length:n},(_,i)=>({text:'',tone:!s.revealed.has(i)&&!s.done?'fog':s.pits.includes(i)?'danger':'visited'})),info:'Пещера '+w+'×'+h+' · Ям '+s.pits.length+' · Вампусов '+alive().length+' · Стрел '+s.arrows});return m;
}
})();
