/* Stable DOM updates, editor dialogs and 0.5 game presentations. */
const T4UI=(()=>{
const E=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const img=(name,cls='')=>`<img class="${cls}" src="assets/${name}.svg" alt="" draggable="false">`;
function patch(parent,html){
 const template=document.createElement('template');template.innerHTML=html;
 function sync(a,b){
  if(a.nodeType!==b.nodeType||a.nodeName!==b.nodeName){a.replaceWith(b.cloneNode(true));return}
  if(a.nodeType===3){if(a.nodeValue!==b.nodeValue)a.nodeValue=b.nodeValue;return}
  if(a.nodeType!==1)return;
  for(const attr of [...a.attributes])if(!b.hasAttribute(attr.name))a.removeAttribute(attr.name);
  for(const attr of [...b.attributes])if(a.getAttribute(attr.name)!==attr.value)a.setAttribute(attr.name,attr.value);
  children(a,b);
 }
 function children(a,b){for(let i=0;i<b.childNodes.length;i++){if(!a.childNodes[i])a.append(b.childNodes[i].cloneNode(true));else sync(a.childNodes[i],b.childNodes[i])}while(a.childNodes.length>b.childNodes.length)a.lastChild.remove()}
 children(parent,template.content);
}
function editor(panel,onClose){
 const dialog=document.createElement('dialog');dialog.className='editor-dialog';
 const close=document.createElement('button');close.className='secondary editor-close';close.textContent='Готово — вернуться к игре';
 panel.before(dialog);dialog.append(close,panel);panel.hidden=false;
 close.onclick=()=>dialog.close();dialog.addEventListener('close',onClose);
 return {open(){dialog.showModal()},close(){dialog.close()},dispose(){dialog.remove()}};
}
function layout(s,body,overlay=''){
 return `<div class="t4-field" style="--cols:${s.w};--rows:${s.h};aspect-ratio:${s.w}/${s.h}"><div class="t4-cells" style="grid-template-columns:repeat(${s.w},1fr)">${body}</div>${overlay}</div>`;
}
const piece=(s,pos,name,style='',key='actor')=>`<div class="t4-piece ${key}" style="left:${pos%s.w/s.w*100}%;top:${Math.floor(pos/s.w)/s.h*100}%;width:${100/s.w}%;height:${100/s.h}%;${style}">${img(name)}</div>`;
function render(v,s,id){
 if(id==='parking')return `<div class="guard-game"><div class="guard-office">ОХРАНА · СМЕНА ${Math.floor(s.time)} с <strong>ОЧКИ ${s.score}</strong></div><div class="guard-slots" style="grid-template-columns:repeat(${s.capacity/2},1fr)">${s.slots.map((car,i)=>`<button data-more-cell="${i}" class="guard-slot ${car?'occupied':''}" aria-label="Парковка ${i+1}">${car?img('car')+'<b>'+car.id+'</b><span>'+Math.ceil(car.remaining)+' с</span>':'<b>P '+(i+1)+'</b><span>Заехать</span>'}</button>`).join('')}</div><div class="guard-queue"><strong>ОЧЕРЕДЬ ${s.waiting.length} · ЕЩЁ ПРИЕДЕТ ${s.total-s.arrived}</strong><div>${s.waiting.map(car=>`<div class="waiting-car" style="--patience:${Math.max(0,car.patience/36)*100}%">${img('car')}<b>${car.id}</b><span>${Math.ceil(car.patience)} с ☺</span><small>стоянка ${car.duration} с</small></div>`).join('')||'<p>Въезд свободен. Ждём машины.</p>'}</div></div></div>`;
 if(id==='poker'){
  const card=c=>`<span class="small-card ${[1,2].includes(c/13|0)?'red':''}">${['2','3','4','5','6','7','8','9','10','J','Q','K','A'][c%13]}<b>${['♠','♥','♦','♣'][c/13|0]}</b></span>`;
  return `<div class="holdem-table"><section><strong>ДИЛЕР · 2 ЛИЧНЫЕ</strong><div>${s.enemy.map(c=>s.reveal?card(c):'<span class="small-card back">▦</span>').join('')}</div></section><section><strong>ОБЩИЕ КАРТЫ · ${s.community.length}/5</strong><div>${s.community.map(card).join('')+Array.from({length:5-s.community.length},()=>'<span class="small-card empty">?</span>').join('')}</div></section><section><strong>ТЫ · 2 ЛИЧНЫЕ</strong><div>${s.hand.map(card).join('')}</div></section></div>`;
 }
 if(id==='battleship'){
  const own=p=>s.own.includes(p),shot=p=>s.shots.includes(p),hit=p=>s.enemy.includes(p),incoming=p=>s.incoming.includes(p);
  const field=(isOwn)=>`<div class="sea-field" style="grid-template-columns:repeat(10,1fr)">${Array.from({length:100},(_,p)=>{const fired=isOwn?incoming(p):shot(p),struck=fired&&(isOwn?own(p):hit(p));return `<button data-more-cell="${isOwn?p+100:p}" class="sea-cell ${isOwn&&own(p)?'hull':''} ${fired?'fired':''} ${struck?'struck':''}" aria-label="${isOwn?'Своя':'Противник'} ${String.fromCharCode(1040+p%10)}${1+(p/10|0)}">${struck?'<b class="sea-hit">✹</b>':fired?'<b class="sea-miss">●</b>':isOwn&&own(p)?'<i class="ship-deck"></i>':''}</button>`}).join('')}</div>`;
  return `<div class="fleet-game"><aside class="fleet-garage"><strong>ГАРАЖ</strong><small>${s.placing?'Перетащи или выбери':'Флот в бою'}</small>${s.ships.map((ship,i)=>`<button data-ship="${i}" draggable="${s.placing}" class="dock-ship ${s.selectedShip===i?'selected':''}" aria-label="Корабль ${s.shipLengths[i]} палуб"><span>${Array.from({length:s.shipLengths[i]},()=>'<i class="ship-deck"></i>').join('')}</span><small>${ship.length?'на поле':'в гараже'}</small></button>`).join('')}</aside><section><strong>ТВОЙ ФЛОТ</strong>${field(true)}</section><section><strong>ПРОТИВНИК</strong>${field(false)}</section></div>`;
 }
 if(['sokoban','wolf','robby','tanks','shush','grasshopper','lemmings','plumber'].includes(id)){
  let overlay='';
  if(['sokoban','wolf','robby','tanks'].includes(id))overlay+=piece(s,s.pos,id==='sokoban'?'person':id==='wolf'?'wolf':id==='tanks'?'tank':'robby',id==='tanks'?`--angle:${{up:0,right:90,down:180,left:270}[s.dir]}deg`:id==='robby'?'transition:none':'');
  if(id==='tanks'){
   overlay+=s.enemies.map((p,i)=>piece(s,p,'tank','filter:hue-rotate(130deg)','enemy-'+i)).join('');
   overlay+=s.bullets.map(b=>`<i class="tank-bullet ${b.enemy?'enemy':''}" style="left:${b.x/s.w*100}%;top:${b.y/s.h*100}%"></i>`).join('');
   overlay+=s.blast.map(b=>`<i class="tank-blast" style="left:${b.pos%s.w/s.w*100}%;top:${Math.floor(b.pos/s.w)/s.h*100}%;width:${100/s.w}%;height:${100/s.h}%"></i>`).join('');
  }
  const cells=v.cells.map((c,i)=>{
   let body='',tone=c.tone||'';
   if(id==='sokoban')body=s.walls.includes(i)?img('wall'):s.boxes.includes(i)?img('crate')+(s.goals.includes(i)?'<b class="goal-mark filled">✓</b>':''):s.goals.includes(i)?'<b class="goal-mark">◎</b>':'';
   if(id==='wolf')body=s.pits.includes(i)?'<span class="pit"></span>':s.beast===i?img('sheep'):s.hills.includes(i)?img('rock'):'';
   if(id==='robby')body=s.black.includes(i)?'<span class="pit"></span>':`<span class="dot ${s.path.includes(i)?'gold':''}"></span>`;
   if(id==='tanks')body=s.hard.includes(i)?img('rock'):s.walls.includes(i)?img('wall'):'';
   if(id==='shush'){body=s.cells.includes(i)?img('pad'):'';if(i===s.start)tone+=' start-pad';if(i===s.goal)tone+=' finish-pad';if(i===s.pos)body+=img('person','jump-actor');if(i===s.start||i===s.goal)body+=`<b class="pad-label">${i===s.start?'С':'Ф'}</b>`}
   if(id==='grasshopper')body=`<b class="jump-number">${s.numbers[i]}</b>`+(i===s.pos?img('person','jump-actor'):'');
   if(id==='lemmings'){
    const p=s.people.find(p=>p.y*s.w+p.x===i),symbols={walker:'➜',builder:'⚒',digger:'↓',basher:'▸',blocker:'✋',floater:'☂'};
    body=s.terrain.includes(i)?img('rock'):p?img('lemming')+`<b class="role-icon role-${p.role}">${symbols[p.role]}</b>`:i===s.exit?'<span class="portal-pixel"></span>':'';
    if(p)tone+=' role-'+p.role;
   }
   if(id==='plumber'){
    const mask=s.masks[i],flow=s.water.includes(i);body=`<svg viewBox="0 0 48 48" class="pipe"><rect width="48" height="48" fill="#2d4557"/><g stroke="${flow?'#57c4e9':'#c4d3cc'}" stroke-width="11" fill="none">${[1,2,4,8].map((bit,k)=>mask&bit?`<path d="M24 24L${[24,48,24,0][k]} ${[0,24,48,24][k]}"/>`:'').join('')}</g><rect x="18" y="18" width="12" height="12" fill="${flow?'#57c4e9':'#c4d3cc'}"/></svg>`;
    if(i===s.start||i===s.goal){tone+=' fixed-end '+(i===s.start?'pipe-in':'pipe-out');body+=`<b class="endpoint-icon">${i===s.start?['▲','▶','▼','◀'][Math.log2(mask)]:'◎'}</b><small class="endpoint-label">${i===s.start?'ВХОД':'ВЫХОД'}</small>`}
   }
   return `<button data-more-cell="${i}" class="${E(tone)}" aria-label="Клетка ${i+1}${id==='grasshopper'?', прыжок '+s.numbers[i]:''}">${body}</button>`;
  }).join('');return layout(s,cells,overlay);
 }
 return null;
}
let dragIndex=null,pressTimer=0;
function bind({board,model,act,update,bot,applyConfig}){
 const s=model.s;
 if(s.id==='mines')board.querySelectorAll('[data-more-cell]').forEach(b=>{
  b.oncontextmenu=e=>{e.preventDefault();if(!bot)act('flag-cell',+b.dataset.moreCell)};
  b.onpointerdown=e=>{if(e.pointerType==='touch')pressTimer=setTimeout(()=>{b.dataset.longPress='yes';act('flag-cell',+b.dataset.moreCell)},450)};
  b.onpointerup=()=>clearTimeout(pressTimer);b.onpointercancel=()=>clearTimeout(pressTimer);
  const click=b.onclick;b.onclick=e=>{if(b.dataset.longPress){delete b.dataset.longPress;return}click(e)};
 });
 if(s.id==='bulls'){
  const log=board.querySelector('.code-log');if(log)log.scrollTop=log.scrollHeight;
 }
 if(s.id==='lemmings')document.querySelectorAll('#moreExtra [data-action^="role-"]').forEach(b=>{b.classList.toggle('selected',b.dataset.action==='role-'+s.role);b.setAttribute('aria-pressed',String(b.dataset.action==='role-'+s.role))});
 if(s.id==='snakepdf'){
  const side=document.querySelector('.rules-side');let options=side.querySelector('.snake-settings');
  if(!options||options._state!==s){options?.remove();side.querySelector('.game-options')?.remove();options=document.createElement('div');options.className='snake-settings game-options';options.dataset.game=s.id;options._state=s;
   options.innerHTML=`<h3>НАСТРОЙКИ</h3><label>Режим<select data-setting="mode">${['classic','walls','maze','sprint','slow','fast','reverse','portal','garden','survival'].map((x,i)=>`<option value="${x}" ${s.mode===x?'selected':''}>${['Классика','Стены','Лабиринт','Спринт','Релакс','Турбо','Развороты','Порталы','Сад','Выживание'][i]}</option>`).join('')}</select></label><label>Скорость, клеток/с<input type="number" data-setting="speed" min="2" max="30" value="${s.speed}"></label><label>Цвет<input type="color" data-setting="snakeColor" value="${s.snakeColor}"></label><label>Фрукт<select data-setting="fruit">${['apple','orange','berry'].map((x,i)=>`<option value="${x}" ${s.fruit===x?'selected':''}>${['Яблоко','Апельсин','Ягода'][i]}</option>`).join('')}</select></label><label><input type="checkbox" data-setting="wrap" ${s.wrap?'checked':''}> Переход через края</label><label><input type="checkbox" data-setting="reverse" ${s.reverse?'checked':''}> Разворот всей змейки</label><button class="primary" data-apply-settings>Применить</button><small>Применение начинает новую игру. Затем нажми «Старт».</small>`;
   options.querySelector('[data-apply-settings]').onclick=()=>{const c={};for(const input of options.querySelectorAll('[data-setting]'))c[input.dataset.setting]=input.type==='checkbox'?input.checked:input.type==='number'?Number(input.value):input.value;applyConfig(c)};side.append(options);
  }
 }
 if(s.id==='battleship'&&s.placing&&!bot){
  board.onkeydown=e=>{if(e.key.toLowerCase()==='r'){e.preventDefault();act('rotateFleet')}};
  const ghost=(index,p)=>{board.querySelectorAll('.ghost-ok,.ghost-no').forEach(b=>b.classList.remove('ghost-ok','ghost-no'));const cells=model.previewShip(index,p);if(cells)for(const q of cells)board.querySelector(`[data-more-cell="${q+100}"]`)?.classList.add('ghost-ok');else board.querySelector(`[data-more-cell="${p+100}"]`)?.classList.add('ghost-no')};
  board.querySelectorAll('[data-ship]').forEach(b=>{const index=+b.dataset.ship;b.onclick=()=>{s.selectedShip=index;update()};b.ondragstart=e=>{dragIndex=index;s.selectedShip=index;e.dataTransfer.setData('text/plain',String(index))};b.ondragend=()=>{dragIndex=null;board.querySelectorAll('.ghost-ok,.ghost-no').forEach(b=>b.classList.remove('ghost-ok','ghost-no'))}});
  board.querySelectorAll('.sea-cell[data-more-cell]').forEach(b=>{const p=+b.dataset.moreCell-100;if(p<0)return;const index=s.ships.findIndex(ship=>ship.includes(p));b.draggable=index>=0;b.ondragstart=e=>{dragIndex=index;s.selectedShip=index;e.dataTransfer.setData('text/plain',String(index))};b.ondragover=e=>{e.preventDefault();if(dragIndex!==null)ghost(dragIndex,p)};b.onpointerenter=()=>{if(s.selectedShip!==null)ghost(s.selectedShip,p)};b.ondrop=e=>{e.preventDefault();const index=Number(e.dataTransfer.getData('text/plain'));if(model.moveShip(index,p)){s.message='Корабль установлен.';s.selectedShip=null}else s.message='Корабль не помещается или касается другого.';dragIndex=null;update()}});
 }
}
return {patch,editor,render,bind};
})();
(()=>{const original=PixelArt.render,bind=PixelArt.bind,scene=PixelArt.scene;
PixelArt.render=(v,s,id)=>{let html=T4UI.render(v,s,id)??original(v,s,id);if(id==='bulls'&&html){html=html.replace('<div class="mastermind">','<div class="mastermind"><small class="code-explanation">ДВА РАЗНЫХ КОДА: ты угадываешь код бота, бот — твой.</small>');const own=s.log.find(x=>x.startsWith('Ты'));if(own)html=html.replace('<div class="code-palette">','<small class="last-guess">Последняя твоя: '+own.replace(/[<>]/g,'')+'</small><div class="code-palette">')}return html};
PixelArt.bind=options=>{bind(options);T4UI.bind(options)};
PixelArt.scene=(ctx,v)=>{const result=scene(ctx,v);if(v.scene==='invaders'){
 for(const b of v.state.lasers)if(b.large){ctx.fillStyle='#f4c26b';ctx.fillRect(b.x-7,b.y-12,14,24)}
 for(const p of v.state.powerups||[]){ctx.fillStyle=p.type==='triple'?'#81dfcc':'#ecc56c';ctx.fillRect(p.x-12,p.y-12,24,24);ctx.fillStyle='#142335';ctx.font='bold 15px monospace';ctx.textAlign='center';ctx.fillText(p.type==='triple'?'×3':'●',p.x,p.y+5)}
}return result};})();
