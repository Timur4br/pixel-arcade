const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function context(){const store=new Map(),c={performance,console,setInterval(){return 1},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}};vm.createContext(c);for(const f of ['engine.js','course-catalog.js','pdf-formulations.js','more-catalog.js','more-rules.js','action-models.js','arcade-models.js','more-models.js','model-upgrades.js','release-models.js','poker-tournament.js','refinement-models.js','extras.js','lemming-levels.js','visual-levels.js','warehouse-levels.js','warehouse.js','music-themes.js','local-music.js','pixel-sound.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),c);return c}
class Param{constructor(){this.value=0}setValueAtTime(n){assert.ok(Number.isFinite(n));this.value=n}setTargetAtTime(n){this.setValueAtTime(n)}linearRampToValueAtTime(n){this.setValueAtTime(n)}exponentialRampToValueAtTime(n){assert.ok(n>0);this.setValueAtTime(n)}cancelScheduledValues(){}}
class Node{constructor(){this.gain=new Param();this.frequency=new Param();this.playbackRate=new Param();this.threshold=new Param();this.knee=new Param();this.ratio=new Param();this.attack=new Param();this.release=new Param()}connect(){}disconnect(){}setPeriodicWave(){}start(t){assert.ok(Number.isFinite(t))}stop(){} }
class Context{constructor(){this.currentTime=0;this.sampleRate=48000;this.destination={};this.state='running'}createGain(){return new Node()}createBiquadFilter(){return new Node()}createDynamicsCompressor(){return new Node()}createPeriodicWave(){return {}}createBuffer(_n,n){return {getChannelData:()=>new Float32Array(n)}}createBufferSource(){return new Node()}createOscillator(){return new Node()}resume(){this.state='running';return Promise.resolve()}suspend(){this.state='suspended';return Promise.resolve()}}
test('every catalog game has exactly one original audio profile',()=>{const c=context(),ids=c.CourseCatalog.games.map(g=>g.id).concat(['pong','2048','memory','breach']);assert.equal(new Set(ids).size,46);assert.equal(Object.keys(c.PixelSound.profiles).length,46);for(const id of ids)assert.ok(c.PixelSound.profiles[id],id)});
test('audio settings clamp malformed storage and keep the two channels independent',()=>{const p=context().PixelSound,n=p.normalize({enabled:false,games:8,menu:-2,gameMusic:false});assert.equal(n.enabled,false);assert.equal(n.games,1);assert.equal(n.menu,0);assert.equal(n.gameMusic,false);p.setSettings({enabled:false,games:.13,menu:.82});assert.equal(p.settings.games,.13);assert.equal(p.settings.menu,.82);assert.equal(p.settings.enabled,false);p.setSettings({games:.9});assert.equal(p.settings.menu,.82);assert.equal(p.settings.enabled,false)});
test('synthesis has bounded polyphony, finite envelopes and throttles fast bot steps',()=>{const p=context().PixelSound,ctx=new Context(),s=p.createSynth(ctx);assert.equal(s.effect('step','bug','games',true),true);assert.equal(s.effect('step','bug','games',true),false);ctx.currentTime=.21;assert.equal(s.effect('step','bug','games',true),true);for(let i=0;i<200;i++){ctx.currentTime+=.25;s.effect(i%2?'explode':'line','tanks')}assert.ok(s.voices.size<=28);s.setVolumes({enabled:false,games:0,menu:1});assert.equal(s.master.gain.value,0);assert.equal(s.buses.games.gain.value,0);assert.equal(s.buses.menu.gain.value,1);s.setMusic('menu');s.schedule();assert.ok(Number.isFinite(s.next));s.stopVoices()});
test('models preserve rules with sound tracking and rendering alone produces no effects',async()=>{const c=context();c.AudioContext=Context;const p=c.PixelSound;await p.unlock();p.startGame('sokoban');const m=c.MoreModels.create('sokoban',{variant:0}),before=p.state.voices;for(let k=0;k<40;k++)m.view();assert.equal(p.state.voices,before);m.bot();assert.ok(m.s.score>0);assert.ok(p.state.voices>=before);p.pause(true);assert.equal(p.state.paused,true);assert.equal(p.state.music,null);p.stopGame();assert.equal(p.state.activeId,'');assert.equal(p.state.music,'menu:')});
test('missing audio support never prevents starting or finishing a game',async()=>{const p=context().PixelSound;assert.equal(await p.unlock(),false);p.startGame('tetris');p.effect('line');p.result('Победа!');p.stopGame();assert.equal(p.state.activeId,'')});
test('game melodies have explicit assignments and all other games inherit the menu composition',()=>{const c=context(),themes=vm.runInContext('PixelMusicThemes',c);assert.equal(themes.resolve('tetris').id,'korobeiniki');assert.equal(themes.resolve('lemmings').id,'lemmings-medley');for(const id of Object.keys(c.PixelSound.profiles))if(!Object.hasOwn(themes.gameThemes,id))assert.equal(themes.resolve(id),themes.ambient);assert.equal(themes.resolve('tetris','menu'),themes.ambient);assert.ok(themes.ambient.units*60/themes.ambient.bpm/2>120);assert.equal(themes.eventAt(themes.gameThemes.tetris,0)[0].pitch,76);assert.equal(themes.eventAt(themes.gameThemes.lemmings,0)[0].pitch,67)});
test('all melodic instruments are genuinely quantized to 16-bit PCM and have non-silent samples',()=>{const c=context(),themes=vm.runInContext('PixelMusicThemes',c),buffers=[];class BufferContext extends Context{createBuffer(_n,n,rate){const data=new Float32Array(n),buffer={duration:n/rate,getChannelData:()=>data};buffers.push(data);return buffer}}const bank=themes.buildBank(new BufferContext());assert.deepEqual(Object.keys(bank),['keys','lead','bell','bass','pad','pluck','air']);for(const data of buffers){let peak=0;for(let i=0;i<data.length;i+=13){peak=Math.max(peak,Math.abs(data[i]));assert.ok(Math.abs(data[i]*32768-Math.round(data[i]*32768))<.001)}assert.ok(peak>.2&&peak<=1)}assert.equal(bank.pad.loop,true)});

test('menu and fallback games keep the same sounding voices, cursor and scheduling time',()=>{
 const c=context(),s=c.PixelSound.createSynth(new Context());s.setMusic('menu');s.schedule();
 const layer=s.layer,step=s.step,next=s.next,voices=[...s.voices];
 for(const id of ['bug','maze','poker','sokoban']){s.setMusic('games',id);assert.equal(s.layer,layer);assert.equal(s.step,step);assert.equal(s.next,next);assert.ok(voices.every(v=>s.voices.has(v)));}
 s.setMusic('menu');assert.equal(s.layer,layer);assert.equal(s.step,step);
});
test('dedicated themes crossfade and returning to the menu resumes its saved position',()=>{
 const c=context(),s=c.PixelSound.createSynth(new Context());s.setMusic('menu');s.schedule();const step=s.step,ambient=s.layer;
 for(const id of ['tetris','lemmings','bomber','arkanoid','tanks','invaders']){s.setMusic('games',id);assert.notEqual(s.layer.theme,ambient.theme);s.schedule();assert.ok(Number.isFinite(s.next));}
 s.setMusic('menu');assert.equal(s.step,step);assert.equal(s.layer.theme,ambient.theme);
 s.setMusic('');s.setMusic('menu');assert.equal(s.step,step);
});
test('all six dedicated themes are distinct and invader march accelerates as enemies disappear',()=>{
 const c=context(),themes=vm.runInContext('PixelMusicThemes',c),s=c.PixelSound.createSynth(new Context());
 assert.equal(new Set(Object.values(themes.gameThemes).map(t=>t.id)).size,6);
 for(const theme of Object.values(themes.gameThemes)){assert.ok(theme.notes.length);for(let i=0;i<400;i++)for(const n of themes.eventAt(theme,i))assert.ok(n.pitch>0&&n.duration>0);}
 s.setMusic('games','invaders');s.schedule();const slow=s.next;s.setMusic('');s.cursors.clear();s.setMusic('games','invaders');s.intensity=1;s.schedule();assert.ok(s.next<slow);
});

test('menu arrangements have different audible openings, instruments and rhythms',()=>{
 const c=context(),themes=vm.runInContext('PixelMusicThemes',c);
 const signatures=[];
 for(const theme of themes.menuThemes.slice(1)){
  let melody=0,backing=0;const instruments=new Set();
  for(let step=0;step<Math.ceil(15*theme.bpm/30);step++){
   melody+=themes.eventAt(theme,step).length;
   for(const e of themes.backingAt(theme,step)){backing++;instruments.add(e.noise?'noise':e.instrument);assert.ok(e.duration>0&&e.volume>0);}
  }
  assert.ok(themes.eventAt(theme,0).length,'melody starts immediately');
  assert.ok(melody>0&&backing>0);
  signatures.push(JSON.stringify([theme.bpm,theme.instrument,melody,backing,[...instruments]]));
  const ctx=new Context(),s=c.PixelSound.createSynth(ctx);s.setMusic('menu','',theme.id);
  for(let i=0;i<600;i++){ctx.currentTime=i/10;s.voices.clear();s.schedule();assert.ok(Number.isFinite(s.next));}
 }
 assert.equal(new Set(signatures).size,3);
 assert.equal(new Set(themes.menuThemes.map(t=>t.style)).size,4);
});
