/* Four-seat no-limit Hold'em tournament with finite play chips. */
const PokerTournament=(()=>{
'use strict';const R=MoreRules;
function best(cards){let chosen=null;for(let a=0;a<cards.length;a++)for(let b=a+1;b<cards.length;b++)for(let c=b+1;c<cards.length;c++)for(let d=c+1;d<cards.length;d++)for(let e=d+1;e<cards.length;e++){const hand=[cards[a],cards[b],cards[c],cards[d],cards[e]];if(!chosen||R.comparePoker(hand,chosen)>0)chosen=hand}return chosen}
function distribute(players,board,dealer=0){
 const levels=[...new Set(players.map(p=>p.totalBet).filter(Boolean))].sort((a,b)=>a-b),awards=Array(players.length).fill(0),pots=[];let previous=0;
 for(const level of levels){const contributed=players.map((p,i)=>p.totalBet>=level?i:-1).filter(i=>i>=0),amount=(level-previous)*contributed.length;previous=level;
  if(contributed.length===1){awards[contributed[0]]+=amount;pots.push({amount,winners:contributed,refund:true});continue}
  const eligible=contributed.filter(i=>!players[i].folded);if(!eligible.length)throw Error('Банк без участника');
  let winners=[eligible[0]],top=best([...players[eligible[0]].hand,...board]);
  for(const i of eligible.slice(1)){const hand=best([...players[i].hand,...board]),comparison=R.comparePoker(hand,top);if(comparison>0){winners=[i];top=hand}else if(comparison===0)winners.push(i)}
  const each=Math.floor(amount/winners.length);winners.forEach(i=>awards[i]+=each);const order=Array.from({length:players.length},(_,k)=>(dealer+1+k)%players.length).filter(i=>winners.includes(i));for(let k=0;k<amount%winners.length;k++)awards[order[k]]++;pots.push({amount,winners,refund:false});
 }
 return {awards,pots};
}
function create(config={}){
 const variant=config.variant||0,random=R.rng(config.seed??Date.now()),initial=1000;
 const s={id:'poker',players:['Ты','Бот Лис','Бот Рок','Бот Неон'].map(name=>({name,stack:initial,hand:[],roundBet:0,totalBet:0,folded:false,allIn:false,actedSinceRaise:false,lastAction:''})),initial,score:0,done:false,message:'Собери все фишки трёх ботов.',handNo:0,dealer:3,actor:-1,community:[],pot:0,handDone:true,stage:0,currentBet:0,minRaise:20,pending:[],elapsed:0,log:[],raiseDraft:40,pots:[],reveal:false};
 s.difficulty=['Лёгкий','Средний','Сложный'][variant];s.equitySamples=0;
 const names=['Префлоп','Флоп','Тёрн','Ривер'];
 const m={s,realtime:true,buttons:[],inputs:[],best,help:'Турнир в безлимитный холдем: ты и три бота, по 1000 игровых фишек. Цель — забрать все фишки ботов. У каждого 2 личные карты, 5 общих; побеждает лучшая пятёрка из семи. Есть чек, колл, повышение до указанной суммы, пас и олл-ин. Блайнды растут каждые 6 раздач. Правила и комбинации раскрываются ниже.'};
 const active=()=>s.players.map((p,i)=>!p.folded?i:-1).filter(i=>i>=0),canAct=i=>!s.players[i].folded&&!s.players[i].allIn&&s.players[i].stack>0;
 const next=(from,predicate)=>{for(let k=1;k<=4;k++){const i=(from+k)%4;if(predicate(i))return i}return -1};
 const log=text=>{s.message=text;s.log.push(text);if(s.log.length>35)s.log.shift()};
 const pay=(i,amount)=>{const p=s.players[i],paid=Math.min(p.stack,Math.max(0,amount));p.stack-=paid;p.roundBet+=paid;p.totalBet+=paid;p.allIn=p.stack===0;s.pot+=paid;return paid};
 function finishHand(walkover=-1){
  s.actor=-1;s.handDone=true;s.pending=[];s.reveal=walkover<0;
  if(walkover>=0){s.players[walkover].stack+=s.pot;s.pots=[{amount:s.pot,winners:[walkover],refund:false}];log(s.players[walkover].name+' забирает '+s.pot+': остальные сбросили карты.')}
  else{const result=distribute(s.players,s.community,s.dealer);s.pots=result.pots;result.awards.forEach((n,i)=>s.players[i].stack+=n);log(result.awards.map((n,i)=>n?`${s.players[i].name}: +${n}`:'').filter(Boolean).join(' · '))}
  s.pot=0;s.players.forEach(p=>{p.totalBet=0;p.roundBet=0});s.score=s.players[0].stack-initial;
  if(s.players[0].stack===0){s.done=true;log('Турнир окончен: фишки закончились. Начни заново.')}
  else if(s.players.slice(1).every(p=>p.stack===0)){s.done=true;log('Победа! Все 4000 фишек у тебя. Три бота обанкрочены.')}
 }
 function runout(){while(s.community.length<5){s.deck.pop();const n=s.community.length===0?3:1;for(let k=0;k<n;k++)s.community.push(s.deck.pop())}s.stage=3;finishHand()}
 function advance(from){
  if(active().length===1){finishHand(active()[0]);return}
  s.pending=s.pending.filter(canAct);
  const acting=s.players.map((_,i)=>i).filter(canAct);
  if(acting.length<=1&&acting.every(i=>s.players[i].roundBet>=s.currentBet)){runout();return}
  if(!s.pending.length){nextStreet();return}
  s.actor=next(from,i=>s.pending.includes(i));s.elapsed=0;
  const p=s.players[s.actor];s.raiseDraft=Math.min(p.roundBet+p.stack,s.currentBet+s.minRaise);
 }
 function nextStreet(){
  if(s.stage===3){finishHand();return}
  s.stage++;s.deck.pop();for(let k=0;k<(s.stage===1?3:1);k++)s.community.push(s.deck.pop());s.players.forEach(p=>{p.roundBet=0;p.actedSinceRaise=false});s.currentBet=0;s.minRaise=s.bigBlind;s.pending=s.players.map((_,i)=>i).filter(canAct);s.actor=next(s.dealer,i=>s.pending.includes(i));s.elapsed=0;s.raiseDraft=s.bigBlind;log(names[s.stage]+' · банк '+s.pot);
  if(s.pending.length<=1)runout();
 }
 function newHand(){
  if(s.done||!s.handDone)return;s.handNo++;s.dealer=next(s.dealer,i=>s.players[i].stack>0);s.handDone=false;s.reveal=false;s.community=[];s.stage=0;s.pot=0;s.pots=[];s.log=[];
  s.bigBlind=Math.min(initial,([10,20,40][variant])*2**Math.floor((s.handNo-1)/6));s.smallBlind=Math.ceil(s.bigBlind/2);s.currentBet=s.bigBlind;s.minRaise=s.bigBlind;
  s.deck=Array.from({length:52},(_,i)=>i);for(let i=51;i;i--){const j=random()*(i+1)|0;[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]]}
  s.players.forEach(p=>{p.folded=p.stack===0;p.allIn=false;p.roundBet=0;p.totalBet=0;p.actedSinceRaise=false;p.lastAction=p.folded?'Выбыл':'';p.hand=p.folded?[]:[s.deck.pop(),s.deck.pop()]});
  const alive=active(),sb=alive.length===2?s.dealer:next(s.dealer,i=>!s.players[i].folded),bb=next(sb,i=>!s.players[i].folded);s.sb=sb;s.bb=bb;pay(sb,s.smallBlind);pay(bb,s.bigBlind);s.players[sb].lastAction='Малый блайнд';s.players[bb].lastAction='Большой блайнд';s.pending=s.players.map((_,i)=>i).filter(canAct);s.actor=next(bb,i=>s.pending.includes(i));s.elapsed=0;s.raiseDraft=s.currentBet+s.minRaise;log('Раздача '+s.handNo+' · блайнды '+s.smallBlind+'/'+s.bigBlind);
  if(s.actor<0)runout();
 }
 m.options=function(i=s.actor){const p=s.players[i];if(!p||s.handDone||s.done)return null;const toCall=Math.max(0,s.currentBet-p.roundBet),max=p.roundBet+p.stack,min=s.currentBet+s.minRaise,raiseOpen=(!p.actedSinceRaise||s.currentBet-(p.lastActedBet??0)>=s.minRaise)&&s.players.some((q,j)=>j!==i&&!q.folded&&!q.allIn&&q.stack>0);return {toCall,max,min,canRaise:raiseOpen&&max>s.currentBet,canAllIn:max<=s.currentBet||raiseOpen}};
 m.act=(action,_i,values={})=>{
  if(action==='nextHand'){newHand();return}if(s.done||s.handDone||s.actor<0)return;
  const i=s.actor,p=s.players[i],o=m.options(i);let label='';
  if(action==='fold'){p.folded=true;label='Пас'}
  else if(action==='check'){if(o.toCall){log('Для чека нужно, чтобы не было ставки.');return}label='Чек'}
  else if(action==='call'){const paid=pay(i,o.toCall);label=o.toCall?'Колл '+paid:'Чек'}
  else if(action==='raise'||action==='allin'){
   const target=action==='allin'?o.max:Number(values.raise??s.raiseDraft);
   if(target<=s.currentBet&&action==='allin'){const paid=pay(i,o.toCall);label='Олл-ин '+paid}
   else{
    if(!o.canRaise){log('Повышение сейчас закрыто. Можно уравнять или сбросить.');return}
    if(!Number.isInteger(target)||target>o.max||target<=s.currentBet||target<o.min&&target!==o.max){log('Минимум до '+o.min+', максимум '+o.max+'. Меньшее повышение допустимо только олл-ином.');return}
    const increment=target-s.currentBet,full=increment>=s.minRaise;pay(i,target-p.roundBet);s.currentBet=target;
    if(full){s.minRaise=increment;s.players.forEach((q,j)=>{if(j!==i)q.actedSinceRaise=false});s.pending=s.players.map((_,j)=>j).filter(j=>j!==i&&canAct(j))}
    else for(let j=0;j<4;j++)if(j!==i&&canAct(j)&&s.players[j].roundBet<s.currentBet&&!s.pending.includes(j))s.pending.push(j);
    label=(p.allIn?'Олл-ин до ':'Повышение до ')+target;
   }
  }else return;
  p.actedSinceRaise=true;p.lastActedBet=s.currentBet;p.lastAction=label;s.pending=s.pending.filter(j=>j!==i);log(p.name+': '+label);advance(i);
 };
 function strength(p){
  if(s.community.length>=3){const rank=R.pokerRank(best([...p.hand,...s.community]));return Math.min(.98,.3+rank.category*.11+(Math.max(...p.hand.map(c=>c%13))+2)/100)}
  const ranks=p.hand.map(c=>c%13+2).sort((a,b)=>b-a),pair=ranks[0]===ranks[1],suited=(p.hand[0]/13|0)===(p.hand[1]/13|0);return Math.min(.98,(ranks[0]+ranks[1])/38+(pair?.25:0)+(suited?.06:0));
 }
 // Sample from all cards unknown to this player, never from opponents' hands or the actual deck.
 function equity(playerIndex,samples){const p=s.players[playerIndex],known=[...p.hand,...s.community],pool=Array.from({length:52},(_,i)=>i).filter(c=>!known.includes(c)),opponents=active().filter(i=>i!==playerIndex).length;let sum=0;for(let k=0;k<samples;k++){const deck=[...pool],take=()=>{const n=random()*deck.length|0;return deck.splice(n,1)[0]},board=[...s.community];while(board.length<5)board.push(take());const own=best([...p.hand,...board]);let winners=1,lost=false;for(let j=0;j<opponents;j++){const other=best([take(),take(),...board]),cmp=R.comparePoker(other,own);if(cmp>0)lost=true;else if(cmp===0)winners++}if(!lost)sum+=1/winners}s.equitySamples=samples;return sum/samples}
 function strategicBot(i,p,o){const hard=variant===2,odds=o.toCall/(s.pot+o.toCall||1),power=equity(i,hard?100:32),position=(i-s.dealer+4)%4,margin=hard?.025:.075,affordable=o.toCall<=Math.max(s.bigBlind,p.stack*(hard?.22:.14));
  if(o.toCall&&power+margin<odds&&!(hard&&affordable&&random()<.05)){m.act('fold');return}
  // Value bets scale with the pot; occasional small late-position bluffs remain legal.
  const bluff=!o.toCall&&position<=1&&random()<(hard?.13:.04),threshold=hard?.53:.65;
  if(o.canRaise&&(power>threshold||bluff)&&random()<(hard?.8:.55)){let increment=Math.round(Math.max(s.bigBlind,s.pot*(power>.8?.85:hard?.6:.4)));const target=Math.min(o.max,Math.max(o.min,s.currentBet+increment));if(power>.74||target-p.roundBet<=p.stack*.35||bluff){m.act('raise',0,{raise:target});return}}
  m.act(o.toCall?'call':'check');
 }
 m.bot=()=>{
  if(s.done)return;if(s.handDone){newHand();return}const i=s.actor,p=s.players[i],o=m.options();if(variant>0){strategicBot(i,p,o);return}const power=strength(p),odds=o.toCall/(s.pot+o.toCall||1),risk=o.toCall/(p.stack+o.toCall||1);
  if(o.toCall>0&&power+random()*.23<.4+odds*.7+risk*.35){m.act('fold');return}
  if(o.canRaise&&(power>.72||random()<.055)&&random()<.4){const target=Math.min(o.max,Math.max(o.min,s.currentBet+s.bigBlind*(power>.8?3:1)));m.act('raise',0,{raise:target});return}
  m.act(o.toCall?'call':'check');
 };
 m.tick=(dt,botMode)=>{if(s.done)return;if(s.handDone){if(botMode){s.elapsed+=dt;if(s.elapsed>=1.5){s.elapsed=0;newHand()}}return}if(s.actor===0&&!botMode)return;s.elapsed+=dt;if(s.elapsed>=.7){s.elapsed=0;m.bot()}};
 m.view=()=>({kind:'tournament',info:s.difficulty+' · Раздача '+s.handNo+' · '+names[s.stage]+' · Блайнды '+s.smallBlind+'/'+s.bigBlind+' · В игре '+s.players.filter(p=>p.stack>0||p.totalBet>0).length+'/4'});
 newHand();return m;
}
return {create,best,distribute};
})();
