const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){
 const handlers={},button={clicks:0,click(){this.clicks++},setPointerCapture(){}};
 const node=()=>({setAttribute(){},classList:{remove(){},toggle(){}},before(){},getAttribute(){return 'false'}});
 const rules=node(),dialog={...node(),open:true,querySelector:()=>rules,addEventListener:(k,v)=>handlers['dialog-'+k]=v};
 const controls={hidden:false,addEventListener:(k,v)=>handlers[k]=v};let timeout,interval;
 const c={document:{documentElement:{lang:'ru'},querySelector:s=>s==='#gameDialog'?dialog:controls,createElement:node,addEventListener(){}},matchMedia:()=>({matches:true}),MutationObserver:class{observe(){}},window:{addEventListener(){}},performance:{now:()=>100},setTimeout:fn=>(timeout=fn,1),setInterval:fn=>(interval=fn,2),clearTimeout:()=>timeout=null,clearInterval:()=>interval=null};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../mobile.js'),'utf8'),c);
 return {handlers,button,timeout:()=>timeout,interval:()=>interval};
}
test('mouse and keyboard clicks remain available after pointerup',()=>{const {handlers}=setup();handlers.pointerup();let blocked=false;handlers.click({isTrusted:true,preventDefault(){blocked=true},stopImmediatePropagation(){}});assert.equal(blocked,false)});
test('touch starts immediately, repeats while held and stops on release',()=>{const s=setup();s.handlers.pointerdown({target:{closest:()=>s.button},pointerType:'touch',pointerId:1,preventDefault(){}});assert.equal(s.button.clicks,1);s.timeout()();s.interval()();assert.equal(s.button.clicks,2);s.handlers.pointerup();assert.equal(s.interval(),null);let blocked=false;s.handlers.click({isTrusted:true,preventDefault(){blocked=true},stopImmediatePropagation(){}});assert.equal(blocked,true)});
test('touch repeats stop when the controls disappear',()=>{const s=setup();s.handlers.pointerdown({target:{closest:()=>s.button},pointerType:'touch',pointerId:1,preventDefault(){}});s.timeout()();s.handlers.pointercancel();assert.equal(s.interval(),null)});
