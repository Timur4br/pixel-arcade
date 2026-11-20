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
const garden={...ambient,id:'pixel-garden',title:'Утро в саду',bpm:64,instrument:'bell',chords:[[48,55,59,64],[50,57,62,66],[43,55,59,62],[48,55,60,64],[45,57,60,64],[41,53,57,60],[43,55,59,62],[48,55,59,64]],phrases:[[[4,72,6],[20,71,6],[40,67,10]],[[8,69,8],[28,74,8],[48,66,10]],[[12,67,8],[36,71,12]],[[4,76,8],[28,72,10]],[[8,69,8],[24,72,8],[44,76,10]],[[12,77,8],[36,72,12]],[[8,71,8],[32,69,10]],[[12,67,12],[40,72,14]]]};
const train={...ambient,id:'pixel-train',title:'Ночной поезд',bpm:72,chords:[[45,52,57,60],[41,53,57,60],[48,55,60,64],[43,55,59,62],[45,52,57,64],[41,53,57,60],[38,50,57,62],[40,52,56,59]],phrases:[[[0,64,6],[12,60,6],[28,59,8],[48,57,10]],[[4,60,8],[20,65,8],[44,64,10]],[[8,67,6],[24,64,8],[48,60,10]],[[4,62,8],[20,59,8],[40,55,12]],[[8,64,8],[24,69,8],[48,67,10]],[[4,65,8],[28,60,10]],[[8,62,8],[24,64,8],[44,57,12]],[[12,59,10],[36,56,14]]]};
const shore={...ambient,id:'pixel-shore',title:'Звёздный берег',bpm:48,instrument:'bell',chords:[[41,53,60,64],[48,55,59,64],[43,55,62,69],[45,57,60,64],[41,53,57,64],[48,55,60,67],[43,55,59,62],[48,55,59,64]],phrases:[[[12,76,12],[40,72,14]],[[8,71,14],[44,67,12]],[[16,74,12],[42,69,14]],[[8,72,12],[36,64,16]],[[16,65,14],[44,72,12]],[[12,79,12],[40,76,14]],[[16,74,12],[44,71,12]],[[8,67,14],[36,72,18]]]};
const menuThemes=[ambient,garden,train,shore];
function resolve(id,mode='games',menuId=ambient.id){return mode==='games'&&gameThemes[id]?gameThemes[id]:(menuThemes.find(t=>t.id===menuId)||ambient)}
function eventAt(theme,step){if(theme.style==='ambient16'){const k=step%theme.units,section=Math.floor(k/64),local=k%64;return (theme.phrases[section]||[]).filter(e=>e[0]===local&&e[1]).map(e=>({pitch:e[1],duration:e[2]}))}if(theme.style==='signal16'&&step>=16)return [];const length=theme.notes.reduce((a,n)=>a+n[1],0),at=step%length,result=[];let cursor=0;for(const [pitch,duration] of theme.notes){if(cursor===at&&pitch)result.push({pitch,duration});cursor+=duration}return result}
function buildBank(ctx){const rate=32000,bank={};for(const name of ['keys','lead','bell','bass','pad']){if(name==='pad'){const period=Math.round(rate/130.813),buffer=ctx.createBuffer(1,period*4,rate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++){const phase=2*Math.PI*i/period;data[i]=Math.round((Math.sin(phase)*.77+Math.sin(phase*2)*.14)*32767)/32768}bank[name]={buffer,root:rate/period,loop:true};continue}const root=name==='bass'?65.406:name==='pad'?130.813:261.626,duration=name==='pad'?6:['keys','lead'].includes(name)?6:2,buffer=ctx.createBuffer(1,rate*duration,rate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++){const t=i/rate,p=2*Math.PI*root*t;let v;if(name==='keys')v=(Math.sin(p+.3*Math.exp(-t*3)*Math.sin(p*2))*.82+Math.sin(p*2)*.1*Math.exp(-t*2))*Math.exp(-t*.9);else if(name==='lead')v=(Math.sin(p+(1.2*Math.exp(-t*5)+.35)*Math.sin(p*2))*.8+Math.sin(p*3)*.12)*(.65+.35*Math.exp(-t*4));else if(name==='bell')v=(Math.sin(p)*.65+Math.sin(p*2)*.23+Math.sin(p*3)*.09)*Math.exp(-t*2);else if(name==='bass')v=Math.sin(p+.3*Math.sin(p*2))*.8+Math.sin(p*2)*.15;else v=(Math.sin(p*.999)*.37+Math.sin(p*1.001)*.37+Math.sin(p*2)*.12)*Math.min(1,t/.15);const fade=Math.min(1,(duration-t)/.15);data[i]=Math.round(Math.max(-1,Math.min(1,v*fade))*32767)/32768}bank[name]={buffer,root}}return bank}
return {ambient,menuThemes,gameThemes,resolve,eventAt,buildBank};
})();

