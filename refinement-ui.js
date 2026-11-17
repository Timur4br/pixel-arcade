const RefinementUI=(()=>{
'use strict';const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),asset=n=>globalThis.PixelAssets?.[n]||'assets/'+n+'.svg',img=(n,cls='')=>`<img class="${cls}" src="${asset(n)}" alt="" draggable="false">`;
const colors=['#6a9ac6','#d66d65','#83b15d','#dddcc8','#d6b554','#ad77be'];
const peg=n=>`<span class="duel-peg" style="background:${colors[+n]}"></span>`;
const card=(c,hidden=false)=>hidden?'<span class="poker-card back">▦</span>':`<span class="poker-card ${[1,2].includes(c/13|0)?'red':''}">${['2','3','4','5','6','7','8','9','10','J','Q','K','A'][c%13]}<b>${['♠','♥','♦','♣'][c/13|0]}</b></span>`;
function courseGrid(level,state,id){
 return `<div class="algorithm-grid pixel-map ${id}" style="--cols:${level.w};--rows:${level.h};grid-template-columns:repeat(${level.w},1fr);grid-template-rows:repeat(${level.h},1fr)">${Array.from({length:level.w*level.h},(_,i)=>{
  const wall=level.walls.includes(i),at=state.pos===i,path=state.path.includes(i),seen=state.explored.has(i);let body=wall?img('wall'):'';
  if(!wall&&id==='wave'&&seen)body+=`<small class="wave-number">${state.search.dist[i]}</small>`;
  if(!wall&&i===level.start)body+='<b class="map-start">С</b>';
  if(!wall&&i===level.goal)body+='<span class="map-goal">⚑</span>';
  if(at)body+=img('person','map-person');
  return `<button data-grid="${i}" class="${wall?'map-wall':path?'map-path':seen?'map-seen':'map-floor'} ${at?'current':''}" aria-label="Клетка ${i}${wall?', стена':''}${at?', игрок':''}${i===level.goal?', финиш':''}">${body}</button>`;
 }).join('')}</div>`;
}
function shipSVG(length,vertical=false){
 const len=length*24,shape=`<path d="M2 5L${len-12} 3L${len-2} 12L${len-12} 21L2 19Z" fill="#849d9b" stroke="#d4dfc3" stroke-width="2"/><path d="M6 8H${len-15}V16H6Z" fill="#3e6174"/>${Array.from({length:length-1},(_,i)=>`<path d="M${(i+1)*24} 5V19" stroke="#607c80" stroke-width="1"/>`).join('')}<rect x="${Math.min(len-14,Math.max(4,len*.4))}" y="7" width="10" height="10" fill="#c1c7a4"/><path d="M${Math.min(len-8,len*.4+8)} 12H${len-3}" stroke="#e0d5a3" stroke-width="3"/>`;
 return `<svg viewBox="0 0 ${vertical?24:len} ${vertical?len:24}" preserveAspectRatio="none" aria-hidden="true">${vertical?'<g transform="translate(24 0) rotate(90)">'+shape+'</g>':shape}</svg>`;
}
function fleet(s){
 const field=isOwn=>`<div class="sea-wrapper"><div class="sea-field" style="grid-template-columns:repeat(10,1fr)">${Array.from({length:100},(_,p)=>{
  const fired=(isOwn?s.incoming:s.shots).includes(p),hit=fired&&(isOwn?s.own:s.enemy).includes(p);return `<button data-more-cell="${isOwn?p+100:p}" class="sea-cell ${fired?'fired':''} ${hit?'struck':''}" aria-label="${isOwn?'Своя':'Противник'} ${String.fromCharCode(1040+p%10)}${1+(p/10|0)}">${hit?'<b class="sea-hit">✹</b>':fired?'<b class="sea-miss">●</b>':''}</button>`;
 }).join('')}</div>${isOwn?'<div class="fleet-overlay">'+s.ships.map((ship,i)=>{if(!ship.length)return '';const first=Math.min(...ship),vertical=ship.length>1&&ship[1]-ship[0]===10;return `<span class="monolith-ship" style="left:${first%10*10}%;top:${Math.floor(first/10)*10}%;width:${vertical?10:ship.length*10}%;height:${vertical?ship.length*10:10}%" data-render-ship="${i}">${shipSVG(ship.length,vertical)}</span>`}).join('')+'</div>':''}</div>`;
 return `<div class="fleet-game"><aside class="fleet-garage"><strong>ГАРАЖ</strong><small>${s.placing?'Перетащи корабль':'Флот в бою'}</small>${s.ships.map((ship,i)=>`<button data-ship="${i}" draggable="${s.placing}" class="dock-ship ${s.selectedShip===i?'selected':''}" aria-label="Корабль ${s.shipLengths[i]} палуб"><span class="dock-whole">${shipSVG(s.shipLengths[i])}</span><small>${s.shipLengths[i]} пал. · ${ship.length?'на поле':'в гараже'}</small></button>`).join('')}</aside><section><strong>ТВОЙ ФЛОТ</strong>${field(true)}</section><section><strong>ПРОТИВНИК</strong>${field(false)}</section></div>`;
}
function duel(s){
 const rows=list=>list.map((row,i)=>`<div class="duel-attempt"><small>${i+1}</small>${[...row.guess].map(peg).join('')}<b>${row.result[0]} Б · ${row.result[1]} К</b></div>`).join('');
 return `<div class="code-duel"><section class="human-code"><h3>ТЫ → КОД БОТА</h3><small>Четыре скрытых цвета · повторы разрешены</small><div class="duel-stream human-stream">${rows(s.humanLog)}</div><div class="duel-proposal">${s.proposal.map((n,i)=>`<button data-more-cell="${i}" class="duel-peg" style="background:${colors[+n]}" aria-label="Цвет ${i+1}"></button>`).join('')}</div><div class="duel-palette">${colors.map((color,i)=>`<button data-more-cell="${100+i}" style="background:${color}" class="${s.activeColor===String(i)?'selected':''}" aria-label="Цвет палитры ${i+1}"></button>`).join('')}</div></section><section class="bot-code"><h3>БОТ → ТВОЙ КОД</h3><div class="duel-secret">${[...s.mySecret].map(peg).join('')}<small>Твой секрет</small></div><div class="duel-stream bot-stream">${rows(s.botLog)}</div><div class="bot-thinking ${s.pending?'thinking':''}">${s.pending?'Бот думает · '+s.wait.toFixed(1)+' с':s.done?'Игра окончена':'Ждёт твоей попытки'}</div><small>Б — быки: цвет и место.<br>К — коровы: цвет в другом месте.</small></section></div>`;
}
function poker(s,model){
 const seat=(p,i)=>`<section class="poker-seat ${i===s.actor?'acting':''} ${p.folded?'folded':''} ${p.stack===0&&!p.totalBet?'busted':''}"><div class="seat-heading"><b>${E(p.name)} ${s.dealer===i?'<i>D</i>':''}</b><strong>${p.stack} ◈</strong></div><div class="seat-cards">${p.hand.map(c=>card(c,i!==0&&(!s.reveal||p.folded))).join('')}</div><small>${E(p.lastAction)}${p.allIn&&!s.handDone?' · ОЛЛ-ИН':''}${!s.handDone&&p.roundBet?' · ставка '+p.roundBet:''}</small></section>`;
 const options=model.options(0),yourTurn=s.actor===0&&!s.handDone&&!s.done,disabled=yourTurn?'':'disabled',info=s.reveal&&!s.players[0].folded?MoreRules.pokerRank(PokerTournament.best([...s.players[0].hand,...s.community])).name:'';
 return `<div class="tournament-table"><div class="opponent-seats">${s.players.slice(1).map((p,i)=>seat(p,i+1)).join('')}</div><div class="community-zone"><div class="pot-label">БАНК <strong>${s.pot} ◈</strong><span>${s.handDone?'Раздача завершена':s.actor===0?'ТВОЙ ХОД':'Ход: '+E(s.players[s.actor]?.name)}</span></div><div class="community-cards">${s.community.map(c=>card(c)).join('')+Array.from({length:5-s.community.length},()=>'<span class="poker-card empty">?</span>').join('')}</div><div class="poker-last">${E(s.message)}</div></div><div class="human-seat">${seat(s.players[0],0)}<div class="hand-explanation">${E(info||'Лучшая пятёрка из 2 личных и 5 общих')}<br>Цель: собрать все 4000 фишек.</div></div><div class="poker-actions">${s.handDone&&!s.done?'<button class="primary" data-poker-action="nextHand">Следующая раздача</button>':s.done?'<b>'+E(s.message)+'</b>':`<button class="secondary" data-poker-action="fold" ${disabled}>Пас</button><button class="primary" data-poker-action="${options?.toCall?'call':'check'}" ${disabled}>${options?.toCall?'Колл '+Math.min(options.toCall,s.players[0].stack):'Чек'}</button><label>Повысить до <input id="raiseAmount" type="number" step="1" min="${options?.min||s.bigBlind}" max="${options?.max||1000}" value="${s.raiseDraft}" ${disabled}></label><button class="secondary" data-poker-action="raise" ${yourTurn&&options?.canRaise?'':'disabled'}>Повысить</button><button class="secondary" data-poker-action="allin" ${yourTurn&&options?.canAllIn?'':'disabled'}>Олл-ин</button>`}</div></div>`;
}
function render(v,s,id,model){
 if(id==='tanks')return null;
 if(id==='battleship')return fleet(s);
 if(id==='bulls')return duel(s);
 if(id==='poker')return poker(s,model);
 if(id==='knight')return `<div class="algorithm-grid more-grid pixel-grid knight-board" style="--cols:${v.w};--rows:${v.h};grid-template-columns:repeat(${v.w},1fr);grid-template-rows:repeat(${v.h},1fr)">${v.cells.map((c,i)=>`<button data-more-cell="${i}" class="${E(c.tone)}" aria-label="Клетка ${i+1}">${c.text==='♞'?'<span class="chess-piece">♞</span>':c.text?'<small class="knight-index">'+c.text+'</small>':''}</button>`).join('')}</div>`;
 if(id==='wumpus')return `<div class="t4-field cave-field" style="--cols:${s.w};--rows:${s.h};aspect-ratio:${s.w}/${s.h}"><div class="t4-cells" style="grid-template-columns:repeat(${s.w},1fr)">${v.cells.map((c,i)=>{const visible=s.revealed.has(i)||s.done,alive=s.beasts.includes(i)&&!s.killed.includes(i);const body=i===s.pos?img('person'):!visible?'<span class="cave-unknown">?</span>':s.pits.includes(i)?'<span class="pit"></span>':alive?img('wumpus'):i===s.goal?img('coin'):s.killed.includes(i)?'<b>✕</b>':'';return `<button data-more-cell="${i}" class="${c.tone}" aria-label="Клетка ${i+1}${!visible?', неизвестна':''}">${body}${i===s.start?'<small class="cave-start">С</small>':''}</button>`}).join('')}</div></div>`;
 return undefined;
}
const logLengths=new WeakMap();
function bind({board,model,act,bot,applyConfig,extra}){
 const s=model.s;
 if(s.id==='snakepdf'){
  const side=document.querySelector('.rules-side');let settings=side.querySelector('.simple-snake');
  if(!settings||settings._state!==s){settings?.remove();side.querySelector('.game-options')?.remove();settings=document.createElement('div');settings.className='game-options simple-snake';settings.dataset.game=s.id;settings._state=s;
   settings.innerHTML=`<h3>ЗМЕЙКА</h3><label>Режим<select data-setting="mode">${[['classic','Классика'],['portal','Без границ'],['walls','Препятствия']].map(([value,title])=>`<option value="${value}" ${s.mode===value?'selected':''}>${title}</option>`).join('')}</select></label><label>Скорость<select data-setting="speed">${[[6,'Спокойно'],[10,'Обычно'],[14,'Быстро']].map(([value,title])=>`<option value="${value}" ${Math.abs(s.speed-value)===Math.min(...[6,10,14].map(n=>Math.abs(s.speed-n)))?'selected':''}>${title}</option>`).join('')}</select></label><details><summary>Внешний вид</summary><label>Цвет<input type="color" data-setting="snakeColor" value="${s.snakeColor}"></label><label>Фрукт<select data-setting="fruit">${[['apple','Яблоко'],['orange','Апельсин'],['berry','Ягода']].map(([value,title])=>`<option value="${value}" ${s.fruit===value?'selected':''}>${title}</option>`).join('')}</select></label></details><button class="primary" data-apply-settings>Применить</button><small>Затем нажми «Старт» под полем.</small>`;
   settings.querySelector('[data-apply-settings]').onclick=()=>{const config={};for(const input of settings.querySelectorAll('[data-setting]'))config[input.dataset.setting]=input.dataset.setting==='speed'?+input.value:input.value;config.reverse=false;config.wrap=config.mode==='portal';applyConfig(config)};side.append(settings);
  }
 }
 if(s.id==='bulls'){
  const old=logLengths.get(s)||{};for(const [key,list] of [['human',s.humanLog],['bot',s.botLog]]){const stream=board.querySelector('.'+key+'-stream');if(stream&&old[key]!==list.length)stream.scrollTop=stream.scrollHeight;old[key]=list.length}logLengths.set(s,old);
  const submit=extra.querySelector('[data-action="submit"]');if(submit){submit.disabled=bot||s.pending||s.done;submit.textContent=s.pending?'Бот думает…':'Сделать попытку'}
 }
 if(s.id==='poker'){
  board.querySelectorAll('[data-poker-action]').forEach(button=>{if(bot)button.disabled=true;button.onclick=()=>{if(!bot)act(button.dataset.pokerAction)}});
  const input=board.querySelector('#raiseAmount');if(input)input.oninput=()=>s.raiseDraft=+input.value;
  const side=document.querySelector('.rules-side');if(!side.querySelector('.poker-rules')){const rules=document.createElement('details');rules.className='game-options poker-rules';rules.dataset.game='poker';rules.innerHTML='<summary>Правила холдема и комбинации</summary><p>По 1000 фишек каждому. Кнопка D переходит по кругу. Слева от D — малый и большой блайнды; вдвоём малый ставит D. На префлопе первым действует игрок после большого блайнда, дальше — после D.</p><p>Этапы: 2 личные карты → флоп (3 общие) → тёрн (+1) → ривер (+1). После каждого этапа — торги. Чек — без ставки; колл — уравнять; повышение — увеличить общую ставку этого круга; пас — сбросить; олл-ин — все оставшиеся фишки.</p><p>Лучшие 5 из 7 карт: старшая карта, пара, две пары, тройка, стрит, флеш, фулл-хаус, каре, стрит-флеш. Туз может замыкать A–2–3–4–5. При равенстве сравниваются кикеры, затем банк делится.</p><p>Минимальное повышение равно прошлому полному повышению. Короткий олл-ин не открывает новое повышение уже походившим. Олл-ин участвует только в покрытых им банках; остальное — отдельные банки. Непокрытая ставка возвращается.</p><p>Блайнды удваиваются каждые 6 раздач. Проигравший все фишки выбывает. Цель — обанкротить трёх ботов. Здесь только игровые фишки.</p><a href="https://www.pokerstars.com/poker/games/texas-holdem/" target="_blank" rel="noopener noreferrer">Источник правил: PokerStars</a>';side.append(rules)}
 }
}
const pictures={};
function picture(c,name,x,y,w,h=w,angle=0){if(!pictures[name]){pictures[name]=new Image();pictures[name].src=asset(name)}const im=pictures[name];if(!im.complete)return;c.save();c.translate(x+w/2,y+h/2);c.rotate(angle*Math.PI/180);c.drawImage(im,-w/2,-h/2,w,h);c.restore()}
function tanks(c,s){
 const size=48,W=s.w*size,H=s.h*size;if(c.canvas.width!==W)c.canvas.width=W;if(c.canvas.height!==H)c.canvas.height=H;c.imageSmoothingEnabled=false;c.fillStyle='#183b36';c.fillRect(0,0,W,H);
 for(let i=0;i<s.w*s.h;i++){const x=i%s.w*size,y=(i/s.w|0)*size;c.fillStyle=(i+(i/s.w|0))%2?'#21473c':'#234b40';c.fillRect(x,y,size,size);if(s.hard.includes(i))picture(c,'rock',x,y,size);else if(s.walls.includes(i))picture(c,'wall',x,y,size)}
 for(const pos of s.enemies){const e=s.enemyTanks?.find(e=>e.pos===pos);c.save();c.filter='hue-rotate(140deg)';picture(c,'tank',((e?.x??pos%s.w+.5)-.5)*size,((e?.y??(pos/s.w|0)+.5)-.5)*size,size,size,e?.angle??180);c.restore();if(e?.maxHp>1){for(let k=0;k<e.maxHp;k++){c.fillStyle=k<e.hp?'#e5bd72':'#3a4250';c.fillRect((e.x-.35)*size+k*8,(e.y-.47)*size,6,3)}}}
 const x=s.visual?.x??s.pos%s.w+.5,y=s.visual?.y??(s.pos/s.w|0)+.5;picture(c,'tank',(x-.5)*size,(y-.5)*size,size,size,{up:0,right:90,down:180,left:270}[s.dir]);
 for(const b of s.bullets){const x=b.x*size,y=b.y*size,dx=({left:-1,right:1}[b.dir]||0),dy=({up:-1,down:1}[b.dir]||0);c.strokeStyle=b.enemy?'#ed99774d':'#ffdd914d';c.lineWidth=5;c.beginPath();c.moveTo(x-dx*18,y-dy*18);c.lineTo(x,y);c.stroke();c.fillStyle=b.enemy?'#ffa77d':'#fff4b5';c.fillRect(x-3,y-3,6,6)}
 for(const b of s.blast){const x=(b.pos%s.w+.5)*size,y=((b.pos/s.w|0)+.5)*size;c.fillStyle='#f4b65b';c.globalAlpha=Math.min(1,b.life*5);c.fillRect(x-13,y-4,26,8);c.fillRect(x-4,y-13,8,26);c.globalAlpha=1}return true;
}
return {render,bind,courseGrid,tanks};
})();
(()=>{
 const previous=PixelArt.render,bind=PixelArt.bind,scene=PixelArt.scene;
 // The controller passes the current model so custom actions can expose legal options.
 PixelArt.render=(v,s,id,model)=>{const html=RefinementUI.render(v,s,id,model);return html===undefined?previous(v,s,id):html};
 PixelArt.bind=options=>{bind(options);RefinementUI.bind(options)};
 PixelArt.scene=(context,v)=>v.scene==='tanks'?RefinementUI.tanks(context,v.state):scene(context,v);
})();
