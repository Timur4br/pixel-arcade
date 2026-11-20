/* Original ambient compositions and new arrangements of traditional melodies. */
const PixelMusicThemes=(()=>{
'use strict';
// Notes are MIDI pitch and duration in half-beat units; zero is a rest.
const korobeiniki=[
[76,2],[71,1],[72,1],[74,2],[72,1],[71,1],[69,2],[69,1],[72,1],[76,2],[74,1],[72,1],
[71,3],[72,1],[74,2],[76,2],[72,2],[69,2],[69,4],[0,2],[74,2],
[77,2],[81,2],[79,1],[77,1],[76,3],[72,1],[76,2],[74,1],[72,1],
[71,2],[71,1],[72,1],[74,2],[76,2],[72,2],[69,2],[69,4],[0,4],
[76,4],[72,4],[74,4],[71,4],[72,4],[69,4],[68,4],[71,4],
[76,4],[72,4],[74,4],[71,4],[72,2],[76,2],[81,4],[80,8]
];
const londonBridge=[
[67,3],[69,1],[67,2],[65,2],[64,2],[65,2],[67,4],[62,2],[64,2],[65,4],[64,2],[65,2],[67,4],
[67,3],[69,1],[67,2],[65,2],[64,2],[65,2],[67,4],[62,4],[67,4],[64,2],[60,6]
];
const tetris={id:'korobeiniki',title:'Коробейники',credit:'Народная мелодия · аранжировка «Пикселя»',bpm:132,notes:korobeiniki,bass:[45,45,52,45,50,50,45,52],chords:[[57,60,64],[55,59,64],[57,60,64],[56,59,64]],instrument:'lead',style:'folk16'};
const lemmings={id:'london-bridge',title:'London Bridge',credit:'Народная мелодия · аранжировка «Пикселя»',bpm:110,notes:londonBridge,bass:[48,43,48,43],chords:[[60,64,67],[59,62,67]],instrument:'bell',style:'folk16'};
// Quiet original ambient: slow diatonic harmony, low melody, long overlapping pads.
const ambient={id:'pixel-evening',title:'Тихий вечер',credit:'Оригинальная музыка «Пикселя»',bpm:56,style:'ambient16',instrument:'keys',units:512,chords:[[48,55,60,64],[45,52,57,60],[41,53,57,60],[43,55,59,62],[48,55,60,64],[45,52,57,64],[41,53,57,60],[43,55,60,62]],phrases:[
[[8,67,8],[28,64,10],[48,62,8]],[[12,64,10],[36,60,12]],
[[8,65,10],[32,64,10],[52,60,8]],[[16,62,12],[44,67,10]],
[[8,64,12],[36,67,10]],[[12,64,10],[40,60,12]],
[[8,60,12],[36,65,10]],[[16,62,12],[44,60,12]]]};
// Fresh compositions for our versions; no commercial recordings or transcriptions.
const bomber={id:'bomber-workshop',title:'Искры в мастерской',credit:'Оригинальная тема «Пикселя»',bpm:112,style:'arcade16',instrument:'bell',notes:[[72,2],[0,1],[79,1],[76,2],[74,2],[72,2],[67,2],[69,2],[0,2],[74,2],[0,1],[81,1],[77,2],[76,2],[74,2],[69,2],[71,2],[0,2],[76,2],[79,2],[84,4],[83,2],[79,2],[76,2],[0,2],[74,2],[77,2],[81,2],[79,2],[76,2],[74,2],[72,4]],bass:[48,55,45,52,53,48,55,43],chords:[[60,64,67],[57,60,64],[53,57,60],[55,59,62]]};
const arkanoid={id:'prism-orbit',title:'Орбита призм',credit:'Оригинальная тема «Пикселя»',bpm:100,style:'arcade16',instrument:'lead',notes:[[76,3],[0,1],[71,2],[74,2],[79,4],[78,2],[74,2],[76,4],[67,2],[71,2],[74,4],[0,4],[72,3],[0,1],[67,2],[71,2],[76,4],[74,2],[71,2],[69,4],[66,2],[69,2],[71,4],[0,4],[76,2],[79,2],[83,4],[81,4],[78,4],[79,2],[76,2],[74,4],[71,4],[0,4],[72,4],[76,4],[74,4],[69,4],[71,8],[0,8]],bass:[40,47,36,43,45,52,35,42],chords:[[55,59,64],[55,60,64],[57,60,64],[54,59,62]]};
const tanks={id:'steel-signal',title:'Стальной дозор',credit:'Оригинальные сигналы «Пикселя»',bpm:84,style:'signal16',instrument:'lead',notes:[[55,2],[62,1],[67,1],[64,2],[62,2],[59,2],[62,2],[55,4]],bass:[31,38,34,41],chords:[[55,58,62],[53,57,60]]};
const invaders={id:'invader-march',title:'Шаги из космоса',credit:'Ритмическая обработка «Пикселя»',bpm:64,style:'march16',instrument:'bass',notes:[[43,2],[40,2],[41,2],[38,2]],bass:[31],chords:[[55,58,62]]};
// Public-domain classical melody, newly arranged alongside the traditional song.
const littleSwans=[[66,1],[66,1],[66,1],[66,1],[67,2],[69,2],[66,2],[62,2],[66,2],[69,2],[67,1],[67,1],[67,1],[67,1],[69,2],[71,2],[67,2],[64,2],[67,2],[71,2],[69,2],[67,2],[66,2],[64,2],[62,2],[66,2],[69,4],[67,2],[66,2],[64,2],[62,2],[61,4],[0,4]];
lemmings.id='lemmings-medley';lemmings.title='London Bridge · Маленькие лебеди';lemmings.notes=[...londonBridge,[0,8],...littleSwans.map(([p,d])=>[p?p-2:0,d]),[0,8]];
const gameThemes={tetris,lemmings,bomber,arkanoid,tanks,invaders};
// Each menu arrangement has its own meter, timbre and accompaniment.
const garden={id:'pixel-garden',title:'Утро в саду',credit:ambient.credit,bpm:96,style:'garden16',instrument:'pluck',units:128,chords:[[60,64,67],[57,60,64],[53,57,60],[55,59,62],[60,64,67],[57,60,64],[53,57,60],[55,59,62]],bars:[
[[0,76,2],[2,79,2],[4,84,3],[8,79,2],[10,76,2],[12,74,4]],
[[0,72,2],[3,76,1],[4,81,4],[10,79,2],[12,76,4]],
[[0,77,2],[2,76,2],[4,72,4],[8,69,2],[10,72,2],[12,76,4]],
[[0,74,2],[2,71,2],[4,67,3],[8,71,2],[10,74,2],[12,79,4]],
[[0,84,3],[4,83,2],[6,79,2],[8,76,4],[12,79,4]],
[[0,81,2],[2,79,2],[4,76,4],[8,72,2],[10,76,2],[12,79,4]],
[[0,77,4],[4,76,2],[6,72,2],[8,69,4],[12,72,4]],
[[0,74,2],[2,79,2],[4,71,4],[8,67,4],[12,72,4]]]};
const train={id:'pixel-train',title:'Ночной поезд',credit:ambient.credit,bpm:84,style:'train16',instrument:'keys',units:128,chords:[[57,60,64,67],[53,57,60,64],[55,59,62,65],[52,56,59,62],[57,60,64,67],[50,57,60,64],[55,59,62,65],[52,56,59,62]],bars:[
[[0,64,2],[3,67,1],[6,69,3],[11,67,1],[14,60,2]],
[[2,64,2],[5,65,1],[8,69,3],[13,64,3]],
[[0,62,3],[5,65,1],[8,67,2],[11,71,1],[14,65,2]],
[[2,64,2],[6,62,2],[10,59,2],[14,56,2]],
[[0,69,3],[5,72,1],[8,71,2],[11,67,1],[14,64,2]],
[[2,65,2],[5,69,1],[8,72,3],[13,69,3]],
[[0,67,3],[5,65,1],[8,62,3],[13,59,3]],
[[2,64,2],[6,62,2],[10,59,2],[14,57,2]]]};
const shore={id:'pixel-shore',title:'Звёздный берег',credit:ambient.credit,bpm:44,style:'shore16',instrument:'air',units:128,chords:[[50,57,61,66],[47,54,59,62],[43,55,59,66],[45,57,61,64],[50,57,62,69],[47,54,59,66],[43,55,62,67],[45,57,61,66]],bars:[
[[0,78,8],[10,73,6]],[[4,71,10]],[[0,78,6],[8,79,8]],[[4,76,10]],
[[0,81,10]],[[4,78,8],[14,74,2]],[[0,79,8],[10,74,6]],[[4,73,10]]]};
const menuThemes=[ambient,garden,train,shore];
function resolve(id,mode='games',menuId=ambient.id){return mode==='games'&&gameThemes[id]?gameThemes[id]:(menuThemes.find(t=>t.id===menuId)||ambient)}
function eventAt(theme,step){if(theme.bars){const k=step%theme.units;return theme.bars[Math.floor(k/16)].filter(e=>e[0]===k%16).map(e=>({pitch:e[1],duration:e[2]}));}if(theme.style==='ambient16'){const k=step%theme.units,section=Math.floor(k/64),local=k%64;return (theme.phrases[section]||[]).filter(e=>e[0]===local&&e[1]).map(e=>({pitch:e[1],duration:e[2]}))}if(theme.style==='signal16'&&step>=16)return [];const length=theme.notes.reduce((a,n)=>a+n[1],0),at=step%length,result=[];let cursor=0;for(const [pitch,duration] of theme.notes){if(cursor===at&&pitch)result.push({pitch,duration});cursor+=duration}return result}
function buildBank(ctx){const rate=32000,bank={};for(const name of ['keys','lead','bell','bass','pad']){if(name==='pad'){const period=Math.round(rate/130.813),buffer=ctx.createBuffer(1,period*4,rate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++){const phase=2*Math.PI*i/period;data[i]=Math.round((Math.sin(phase)*.77+Math.sin(phase*2)*.14)*32767)/32768}bank[name]={buffer,root:rate/period,loop:true};continue}const root=name==='bass'?65.406:name==='pad'?130.813:261.626,duration=name==='pad'?6:['keys','lead'].includes(name)?6:2,buffer=ctx.createBuffer(1,rate*duration,rate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++){const t=i/rate,p=2*Math.PI*root*t;let v;if(name==='keys')v=(Math.sin(p+.3*Math.exp(-t*3)*Math.sin(p*2))*.82+Math.sin(p*2)*.1*Math.exp(-t*2))*Math.exp(-t*.9);else if(name==='lead')v=(Math.sin(p+(1.2*Math.exp(-t*5)+.35)*Math.sin(p*2))*.8+Math.sin(p*3)*.12)*(.65+.35*Math.exp(-t*4));else if(name==='bell')v=(Math.sin(p)*.65+Math.sin(p*2)*.23+Math.sin(p*3)*.09)*Math.exp(-t*2);else if(name==='bass')v=Math.sin(p+.3*Math.sin(p*2))*.8+Math.sin(p*2)*.15;else v=(Math.sin(p*.999)*.37+Math.sin(p*1.001)*.37+Math.sin(p*2)*.12)*Math.min(1,t/.15);const fade=Math.min(1,(duration-t)/.15);data[i]=Math.round(Math.max(-1,Math.min(1,v*fade))*32767)/32768}bank[name]={buffer,root}}for(const name of ['pluck','air']){const root=261.626,buffer=ctx.createBuffer(1,rate*5,rate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++){const t=i/rate,p=2*Math.PI*root*t;const v=name==='pluck'?(Math.sin(p)*.7+Math.sin(p*3)*.22+Math.sin(p*5)*.08)*Math.exp(-t*5):(Math.sin(p)*.85+Math.sin(p*2)*.1+Math.sin(p*3)*.03)*Math.min(1,t/.18)*Math.exp(-t*.45);data[i]=Math.round(v*Math.min(1,(5-t)/.2)*32767)/32768;}bank[name]={buffer,root};}return bank}
// Backing events are musical data, shared by live playback and rendering checks.
function backingAt(theme,step){
 const k=step%theme.units,local=k%16,chord=theme.chords[Math.floor(k/16)],events=[];
 const add=(pitch,duration,volume,instrument,pan=0,delay=0)=>events.push({pitch,duration,volume,instrument,pan,delay});
 if(theme.style==='garden16'){
  if(local%4===0)add(chord[0]-24,2.4,.055,'bass');
  if(local%2===1)add(chord[[0,1,2,1][Math.floor(local/2)%4]],1.1,.045,'pluck',.32);
 }else if(theme.style==='train16'){
  if([0,6,8,14].includes(local))add(chord[0]-24+(local===6?7:local===14?12:0),1.5,.075,'bass');
  if([3,7,11,15].includes(local))for(const pitch of chord)add(pitch,1.6,.022,'keys',.23);
  if(local%2===0)events.push({noise:true,duration:.14,volume:local%4===0?.014:.008,pan:-.32});
  if(local===4||local===12)events.push({noise:true,duration:.32,volume:.025,pan:.12});
 }else if(theme.style==='shore16'){
  if(local===0)chord.forEach((p,i)=>add(p,19,.014,'pad',(i-1.5)*.35,i*.12));
  if(local===0||local===8)add(chord[(local===0?2:1)]+24,6,.04,'bell',local===0?-.65:.65);
 }
 return events;
}
return {ambient,menuThemes,gameThemes,resolve,eventAt,backingAt,buildBank};
})();

