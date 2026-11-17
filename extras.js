const PixelExtras=(()=>{
'use strict';
function shuffled(a,random){a=[...a];for(let i=a.length-1;i;i--){const j=random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
const symbols=['★','♥','♦','♣','♠','☀','☾','♫','⚑','♜','♞','⚙','✿','⌘','⊕','○','□','△','✚','∞','Ω','Ψ','Σ','π','λ','β','Ж','Ф','Ю','Я','⚡','☂'];
function memory(size,random=Math.random){if(![4,6,8].includes(size))throw Error('Размер: 4, 6 или 8');const chosen=shuffled(symbols,random).slice(0,size*size/2);return shuffled([...chosen,...chosen],random)}
function reflect(y){const length=464,t=((y-8)%(length*2)+length*2)%(length*2);return 8+(t<=length?t:length*2-t)}
function predict(ball,x){if((x-ball.x)*ball.vx<=0)return 240;return reflect(ball.y+(x-ball.x)/ball.vx*ball.vy)}
function bounce(ball,top,velocity,sign,random=Math.random){
 const hit=Math.max(-1,Math.min(1,(ball.y-top-40)/43)),speed=Math.min(535,Math.max(240,Math.hypot(ball.vx,ball.vy)*1.04));
 let angle=hit*1.05+Math.max(-.25,Math.min(.25,velocity/1500))+(random()-.5)*.11;
 if(Math.abs(angle)<.09)angle=(random()<.5?-1:1)*(.09+random()*.1);angle=Math.max(-1.15,Math.min(1.15,angle));
 ball.vx=sign*speed*Math.cos(angle);ball.vy=speed*Math.sin(angle);ball.spin=Math.max(-65,Math.min(65,velocity*.08));
}
function pong(state,dt,bot,random=Math.random){
 const count=Math.max(1,Math.ceil(dt/.012)),step=dt/count;
 for(let k=0;k<count;k++){
  const b=state.ball,oldLeft=state.left,oldRight=state.right;state.ai=state.ai||{left:{clock:0,target:200},right:{clock:0,target:200}};
  for(const side of ['left','right']){if(side==='left'&&!bot)continue;const ai=state.ai[side],toward=side==='left'?b.vx<0:b.vx>0,opponent=side==='left'?state.right:state.left;ai.clock-=step;
   if(ai.clock<=0){ai.clock=.11+random()*.1;const attack=(opponent+40<240?1:-1)*(19+random()*13);ai.target=toward?predict(b,side==='left'?30:450)-40-attack+(random()-.5)*(16+Math.min(90,(state.rally||0)*4)):200}
   const max=(side==='left'?300:285)*step;state[side]+=Math.max(-max,Math.min(max,ai.target-state[side]));
  }
  if(!bot){if(state.keys.up)state.left-=340*step;if(state.keys.down)state.left+=340*step}
  state.left=Math.max(0,Math.min(400,state.left));state.right=Math.max(0,Math.min(400,state.right));
  if(state.serveDelay>0){state.serveDelay-=step;continue}
  b.vy=Math.max(-520,Math.min(520,b.vy+(b.spin||0)*step));b.spin=(b.spin||0)*Math.exp(-step*1.8);b.x+=b.vx*step;b.y+=b.vy*step;
  if(b.y<8){b.y=16-b.y;b.vy=Math.abs(b.vy);b.spin=-(b.spin||0)*.5}if(b.y>472){b.y=944-b.y;b.vy=-Math.abs(b.vy);b.spin=-(b.spin||0)*.5}
  if(b.vx<0&&b.x<=30&&b.x>=8&&b.y>=state.left-8&&b.y<=state.left+88){b.x=30;const velocity=Math.max(-500,Math.min(500,(state.left-(state.lastHumanLeft??oldLeft))/(dt||.016)));bounce(b,state.left,bot?(state.left-oldLeft)/step:velocity,1,random);state.rally=(state.rally||0)+1}
  if(b.vx>0&&b.x>=450&&b.x<=472&&b.y>=state.right-8&&b.y<=state.right+88){b.x=450;bounce(b,state.right,(state.right-oldRight)/step,-1,random);state.rally=(state.rally||0)+1}
  if(b.x<0||b.x>480){state.lastHumanLeft=state.left;return b.x<0?1:0}
 }
 state.lastHumanLeft=state.left;return null;
}
return {memory,reflect,predict,bounce,pong};
})();
const BreachProtocol=(()=>{
'use strict';const bytes=['1C','55','7A','BD','E9','FF'],R=MoreRules;
const matches=(buffer,sequence)=>buffer.some((_,i)=>sequence.every((code,j)=>buffer[i+j]===code));
function legal(s,path=s.path){if(!path.length)return Array.from({length:s.w},(_,i)=>i);const p=path.at(-1),column=path.length%2===1;return Array.from({length:s.w*s.w},(_,i)=>i).filter(i=>!path.includes(i)&&(column?i%s.w===p%s.w:Math.floor(i/s.w)===Math.floor(p/s.w)))}
function solve(s,budget=180000){
 const prefix=[...s.path],full=s.targets.reduce((n,t)=>n+t.reward,0);let bestPath=[...prefix],bestValue=-1,nodes=0;const score=path=>{const buffer=path.map(i=>s.matrix[i]);return s.targets.reduce((n,t)=>n+(matches(buffer,t.codes)?t.reward:0),0)};
 if(!prefix.length&&s.planted){bestPath=[...s.planted];bestValue=score(bestPath)}
 const dfs=path=>{if(++nodes>budget)return;const value=score(path);if(value>bestValue||value===bestValue&&path.length<bestPath.length){bestValue=value;bestPath=[...path]}if(value===full||path.length===s.capacity)return;for(const i of legal(s,path)){dfs([...path,i]);if(nodes>budget)return}};dfs(prefix);return {path:bestPath,value:bestValue,nodes,limited:nodes>budget};
}
function create(config={}){
 const variant=config.variant||0,s={id:'breach'},m={s,realtime:true,inputs:[],buttons:[{action:'finish',label:'Завершить взлом'},{action:'reset',label:'Новая матрица'}],help:'Начни с верхней строки. Затем выбирай в столбце последней клетки, потом в её строке — чередуй до конца. Одну клетку нельзя выбрать дважды. Коды попадают в ограниченный буфер. Цепочка загружается, если целиком встречается в буфере подряд; цепочки могут перекрываться. Таймер включается с первого выбора. Цель — загрузить все цепочки, либо получить максимум очков. Это наша версия мини-игры по мотивам «Взлома протокола».'};
 function generate(seed){const random=R.rng(seed);for(let k=0;k<8;k++)random();const w=[5,6,7][variant],capacity=[6,7,8][variant];Object.assign(s,{w,h:w,capacity,matrix:Array.from({length:w*w},()=>bytes[random()*6|0]),path:[],buffer:[],targets:[],started:false,left:[60,50,40][variant],score:0,done:false,message:'Планируй маршрут. Таймер начнётся после первого кода.',planted:[],botPlan:null});
  for(let attempt=0;attempt<30;attempt++){s.planted=[];for(let k=0;k<capacity;k++){const options=legal(s,s.planted);if(!options.length)break;s.planted.push(options[random()*options.length|0])}if(s.planted.length===capacity)break}
  if(s.planted.length<capacity)s.planted=Array.from({length:capacity},(_,i)=>Math.floor((i+1)/2)*w+Math.floor(i/2));
  const stream=s.planted.map(i=>s.matrix[i]),spec=variant===0?[[0,3],[2,3]]:variant===1?[[0,3],[2,3],[4,3]]:[[0,4],[2,4],[4,4]];
  s.targets=spec.map(([start,length],i)=>({name:'Доступ '+['I','II','III'][i],codes:stream.slice(start,start+length),reward:(i+1)*100,complete:false}));
 }
 const finish=()=>{s.done=true;s.message=(s.targets.every(t=>t.complete)?'Протокол взломан!':'Загружено '+s.targets.filter(t=>t.complete).length+'/'+s.targets.length+'.')+' Очки: '+s.score};
 m.act=(a,i)=>{if(a==='reset'){generate(Math.floor(Math.random()*2147483646)+1);return}if(s.done)return;if(a==='finish'){finish();return}if(a!=='cell'||!legal(s).includes(i)){s.message='Выбери свободный код в подсвеченной '+(!s.path.length||s.path.length%2===0?'строке.':'колонке.');return}s.started=true;s.path.push(i);s.buffer.push(s.matrix[i]);s.botPlan=null;s.targets.forEach(t=>t.complete=matches(s.buffer,t.codes));s.score=s.targets.reduce((n,t)=>n+(t.complete?t.reward:0),0);s.message='Следующий выбор: '+(s.path.length%2?'столбец':'строка')+'. Буфер '+s.path.length+'/'+s.capacity;if(s.targets.every(t=>t.complete)||s.path.length===s.capacity||!legal(s).length)finish()};
 m.bot=()=>{if(s.done)return;if(!s.botPlan)s.botPlan=solve(s).path.slice(s.path.length);const i=s.botPlan?.[0];if(i===undefined){finish();return}const rest=s.botPlan.slice(1);m.act('cell',i);s.botPlan=rest};
 m.tick=(dt,bot)=>{if(s.done)return;if(s.started){s.left=Math.max(0,s.left-dt);if(s.left===0)finish()}if(bot&&!s.done){s.botClock=(s.botClock||0)+dt;if(s.botClock>=.6){s.botClock=0;m.bot()}}};
 m.view=()=>({kind:'breach',info:'Строка → столбец → строка · без повторов · цепочки могут пересекаться'});generate(config.seed??31);return m;
}
return {create,legal,solve,matches,bytes};
})();
