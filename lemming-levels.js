/* Ten authored rescue puzzles. Coordinates describe actual terrain, not cosmetic variants. */
const LemmingLevels=(()=>{
 'use strict';
 const row=(y,a=1,b=18)=>Array.from({length:b-a+1},(_,i)=>y*20+a+i);
 const wall=(x,a,b)=>Array.from({length:b-a+1},(_,i)=>(a+i)*20+x);
 const level=(title,start,exit,ground,hint,total=5,dir=1)=>({title,start,exit,ground:[...new Set(ground)],hint,total,dir});
 const levels=[
  level('Первый мост',162,177,row(9).filter(i=>i%20!==9),'Закрой один разрыв строителем. Остальные пройдут по готовому мосту.'),
  level('Каменные ворота',162,177,[...row(9),...wall(9,6,8)],'Назначь проходчика перед каменными воротами.'),
  level('Мягкая посадка',42,197,[...row(3,1,5),...row(10)],'Внизу выход. До большого падения выдай каждому парашют.'),
  level('Два берега',161,178,[...row(9).filter(i=>![5,6,12,13].includes(i%20)),...wall(9,7,8)],'Два моста и стена между ними: меняй роли ведущего лемминга.',6),
  level('Подземная шахта',62,197,[...row(4),...wall(9,0,4),...row(10),...wall(13,7,9)],'Копатель поможет спуститься с верхней полки; внизу потребуется проходчик.',6),
  level('Обратный путь',57,182,[...row(3,9,18),...row(10),...wall(5,8,9)],'Поток идёт влево. Подготовь спуск и пробей нижнюю преграду.',6,-1),
  level('Архипелаг',161,178,[...row(9).filter(i=>![4,5,8,11,12,15,16].includes(i%20)),...wall(7,7,8),...wall(14,6,8)],'Четыре разрыва, две стены и только восемь секций моста у каждого строителя.',8),
  level('Каскад пещер',42,198,[...row(3,1,7),...row(6,7,15).filter(i=>i%20!==12),...row(10),...wall(17,7,9)],'Три яруса: не строй мост там, где нужен спуск. Следи за глубиной падения.',8),
  level('За тремя стенами',42,197,[...row(3),...wall(10,0,3),...row(6,7,18),...wall(14,3,6),...row(10),...wall(16,7,9)],'Верхние стены обходятся через шахты. Внизу нужно открыть проход к выходу.',9),
  level('Последняя экспедиция',42,198,[...row(3,1,18),...wall(7,0,3),...row(6,4,18),...wall(12,3,6),...row(10).filter(i=>![12,13,15,17].includes(i%20)),...wall(14,7,9),...wall(16,8,9)],'Два спуска, три нижних разрыва, стены и десять подопечных. Сначала подготовь маршрут, затем веди весь поток.',10)
 ];
 const roles={walker:'Идущий',builder:'Строитель',digger:'Копатель',basher:'Проходчик',blocker:'Блокировщик',floater:'Парашютист'};
 const difficulty=i=>i<3?'Лёгкий':i<6?'Средний':i<9?'Сложный':'Экспертный';
 function create(config={}){
  const variant=Math.max(0,Math.min(9,config.variant||0)),preset=levels[variant];
  const s={id:'lemmings',rescueModel:true,w:20,h:12,variant,title:preset.title,difficulty:difficulty(variant),start:preset.start,exit:preset.exit,terrain:[...preset.ground],people:[],spawned:0,total:preset.total,saved:0,dead:0,elapsed:0,turn:0,score:0,done:false,role:'builder',message:preset.hint,spawnDirection:preset.dir,timeLimit:variant===9?420:320,manualAssignments:0};
  const ground=i=>s.terrain.includes(i),inside=(x,y)=>x>=0&&x<s.w&&y>=0&&y<s.h;
  const m={s,realtime:true,inputs:[],buttons:Object.entries(roles).map(([r,label])=>({action:'role-'+r,label})),help:'Уровень '+(variant+1)+'/10 «'+s.title+'» · '+s.difficulty+'. '+preset.hint+' Выбери роль и нажми лемминга. Строитель кладёт до 8 секций моста, копатель роет вниз, проходчик пробивает стену, блокировщик разворачивает поток. Парашют остаётся у лемминга после смены работы. Падение больше трёх клеток без парашюта смертельно. Спаси всех '+s.total+'. Синий вход — начало потока, зелёный портал — выход.'};
  const assign=(p,role)=>{if(!roles[role])return;if(role==='floater'){p.floating=true;p.role='floater';}else p.role=role;};
  m.act=(a,i)=>{if(s.done)return;if(a.startsWith('role-')){const role=a.slice(5);if(roles[role]){s.role=role;s.message='Выбрана роль: '+roles[role]+'. Нажми лемминга на поле.';}return;}if(a==='cell'){const p=s.people.find(p=>p.y*s.w+p.x===i);if(p){assign(p,s.role);s.manualAssignments++;s.message='Лемминг №'+(p.id+1)+': '+roles[s.role]+(p.floating?' · парашют есть':'');}}};
  // Probe the real floor and obstacles. No hidden solution or teleportation.
  function guide(p){
   const under=(p.y+1)*s.w+p.x,ahead=p.y*s.w+p.x+p.dir,belowAhead=(p.y+1)*s.w+p.x+p.dir,targetY=Math.floor(s.exit/s.w);
   if(!ground(under)){if(!p.floating){assign(p,'floater');}return;}
   if(p.role==='digger')assign(p,'walker');
   if(p.y<targetY&&ground(ahead)){assign(p,'digger');return;}
   if(ground(ahead)){assign(p,'basher');return;}
   if(!ground(belowAhead)&&p.y>=targetY){assign(p,'builder');return;}
   if(p.role==='blocker')assign(p,'walker');
  }
  m.bot=()=>s.people.forEach(guide);
  function step(bot){
   s.turn++;
   if(s.spawned<s.total&&s.turn%4===1)s.people.push({id:s.spawned++,x:s.start%s.w,y:Math.floor(s.start/s.w),dir:s.spawnDirection,role:'walker',fall:0,build:8,floating:false});
   const alive=[];
   for(const p of s.people){
    if(p.y*s.w+p.x===s.exit&&ground((p.y+1)*s.w+p.x)){if(p.fall>3&&!p.floating)s.dead++;else{s.saved++;s.score+=100;}continue;}
    if(bot)guide(p);
    if(p.role==='blocker'&&ground((p.y+1)*s.w+p.x)){alive.push(p);continue;}
    let under=(p.y+1)*s.w+p.x;
    if(p.role==='digger'&&ground(under))s.terrain=s.terrain.filter(i=>i!==under);
    if(!ground(under)){p.y++;p.fall++;if(!inside(p.x,p.y)){s.dead++;continue;}alive.push(p);continue;}
    if(p.fall>3&&!p.floating){s.dead++;continue;}p.fall=0;
    const nx=p.x+p.dir,ahead=p.y*s.w+nx,below=(p.y+1)*s.w+nx;
    if(!inside(nx,p.y)){p.dir*=-1;alive.push(p);continue;}
    if(p.role==='builder'&&p.build>0&&!ground(below)){s.terrain.push(below);p.build--;}
    if(ground(ahead)){if(p.role==='basher')s.terrain=s.terrain.filter(i=>i!==ahead);else p.dir*=-1;}
    else if(s.people.some(q=>q!==p&&q.role==='blocker'&&q.x===nx&&q.y===p.y))p.dir*=-1;
    else p.x=nx;
    alive.push(p);
   }
   s.people=alive;
   if(s.saved+s.dead===s.total){s.done=true;s.message=s.saved===s.total?'Все '+s.total+' леммингов спасены!':'Спасено '+s.saved+' из '+s.total+'. Попробуй другой маршрут.';}
   if(s.turn>=s.timeLimit){s.done=true;s.message='Время вышло. Спасено '+s.saved+' из '+s.total+'.';}
  }
  m.tick=(dt,bot)=>{if(s.done||!Number.isFinite(dt)||dt<=0)return;s.elapsed+=Math.min(dt,1)*.5;while(s.elapsed>=.25&&!s.done){s.elapsed-=.25;step(bot);}};
  m.view=()=>({kind:'grid',w:s.w,h:s.h,cells:Array.from({length:s.w*s.h},(_,i)=>({text:'',tone:ground(i)?'brick':i===s.exit?'purple':i===s.start?'lemmings-entry':''})),info:(s.variant+1)+'/10 · '+s.difficulty+' · '+s.title+' · Спасено '+s.saved+'/'+s.total+' · В пути '+s.people.length+' · Ещё выйдут '+(s.total-s.spawned)+' · Потеряно '+s.dead});
  return m;
 }
 return {levels,difficulty,create};
})();
(function(){const base=MoreModels.create;MoreModels.create=(id,config={})=>id==='lemmings'?LemmingLevels.create(config):base(id,config);})();
