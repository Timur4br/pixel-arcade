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
const ambient={id:'pixel-evening',title:'Тёплый вечер',credit:'Оригинальная музыка «Пикселя»',bpm:68,style:'ambient16',instrument:'keys',units:384,chords:[[50,57,61,64],[47,54,57,62],[43,50,54,59],[45,52,57,61],[50,57,62,66],[47,54,59,62],[43,50,57,59],[45,52,57,64],[42,49,54,57],[43,50,55,59],[47,54,57,62],[45,52,57,61]],phrases:[
[[0,74,3],[5,69,2],[9,73,4],[16,76,3],[23,74,5]],
[[2,71,4],[8,66,3],[15,69,4],[25,74,5]],
[[0,67,5],[9,71,3],[18,69,3],[26,66,4]],
[[3,69,3],[10,73,4],[20,76,5],[28,0,4]],
[[0,78,5],[8,76,4],[19,74,4],[27,69,3]],
[[4,74,4],[13,71,5],[24,66,5]],
[[0,71,3],[6,69,4],[17,67,4],[27,62,4]],
[[2,69,5],[14,73,5],[25,76,5]],
[[0,66,4],[8,69,3],[18,73,5]],
[[3,67,5],[13,71,4],[25,74,4]],
[[0,71,4],[9,69,4],[19,66,5]],
[[4,69,6],[16,64,6],[27,62,5]]
]};
const gameThemes={tetris,lemmings};
function resolve(id,mode='games'){return mode==='games'&&gameThemes[id]?gameThemes[id]:ambient}
function eventAt(theme,step){if(theme.style==='ambient16'){const k=step%theme.units,section=Math.floor(k/32),local=k%32;return (theme.phrases[section]||[]).filter(e=>e[0]===local&&e[1]).map(e=>({pitch:e[1],duration:e[2]}))}const length=theme.notes.reduce((a,n)=>a+n[1],0),at=step%length,result=[];let cursor=0;for(const [pitch,duration] of theme.notes){if(cursor===at&&pitch)result.push({pitch,duration});cursor+=duration}return result}
function buildBank(ctx){const rate=32000,bank={};for(const name of ['keys','lead','bell','bass','pad']){if(name==='pad'){const period=Math.round(rate/130.813),buffer=ctx.createBuffer(1,period*4,rate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++){const phase=2*Math.PI*i/period;data[i]=Math.round((Math.sin(phase)*.77+Math.sin(phase*2)*.14)*32767)/32768}bank[name]={buffer,root:rate/period,loop:true};continue}const root=name==='bass'?65.406:name==='pad'?130.813:261.626,duration=name==='pad'?6:['keys','lead'].includes(name)?6:2,buffer=ctx.createBuffer(1,rate*duration,rate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++){const t=i/rate,p=2*Math.PI*root*t;let v;if(name==='keys')v=(Math.sin(p+1.1*Math.exp(-t*8)*Math.sin(p*2))*.73+Math.sin(p*2)*.18*Math.exp(-t*3)+Math.sin(p*3)*.08*Math.exp(-t*5))*Math.exp(-t*1.4);else if(name==='lead')v=(Math.sin(p+(1.2*Math.exp(-t*5)+.35)*Math.sin(p*2))*.8+Math.sin(p*3)*.12)*(.65+.35*Math.exp(-t*4));else if(name==='bell')v=(Math.sin(p)*.65+Math.sin(p*2)*.23+Math.sin(p*3)*.09)*Math.exp(-t*2);else if(name==='bass')v=Math.sin(p+.3*Math.sin(p*2))*.8+Math.sin(p*2)*.15;else v=(Math.sin(p*.999)*.37+Math.sin(p*1.001)*.37+Math.sin(p*2)*.12)*Math.min(1,t/.15);const fade=Math.min(1,(duration-t)/.15);data[i]=Math.round(Math.max(-1,Math.min(1,v*fade))*32767)/32768}bank[name]={buffer,root}}return bank}
return {ambient,gameThemes,resolve,eventAt,buildBank};
})();
