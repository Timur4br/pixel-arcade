/* Responsive disclosure and touch input; uses existing game actions. */
(()=>{
 'use strict';
 const dialog=document.querySelector('#gameDialog'),rules=dialog?.querySelector('.rules-side');
 if(!dialog||!rules)return;
 const media=matchMedia('(max-width:900px)'),toggle=document.createElement('button');
 toggle.type='button';toggle.className='secondary mobile-rules-toggle';toggle.id='mobileRulesToggle';rules.id='gameRules';toggle.setAttribute('aria-controls',rules.id);toggle.setAttribute('aria-expanded','false');
 const label=()=>{toggle.textContent=document.documentElement.lang==='en'?'Rules and game settings':'Правила и параметры игры';};label();
 rules.before(toggle);
 toggle.onclick=()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));rules.classList.toggle('mobile-rules-open',open);};
 new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 new MutationObserver(()=>{if(!dialog.open){toggle.setAttribute('aria-expanded','false');rules.classList.remove('mobile-rules-open');}}).observe(dialog,{attributes:true,attributeFilter:['open']});
 const controls=document.querySelector('#touchControls');let timer=null,repeat=null,held=null,blockedUntil=0;
 function stop(){clearTimeout(timer);clearInterval(repeat);timer=null;repeat=null;held=null;}
 controls?.addEventListener('pointerdown',e=>{
  const button=e.target.closest('button[data-dir]');if(!button||e.pointerType==='mouse'||!media.matches)return;
  e.preventDefault();stop();held=button;blockedUntil=performance.now()+1000;button.setPointerCapture(e.pointerId);button.click();
  timer=setTimeout(()=>{repeat=setInterval(()=>{if(!held||controls.hidden||!dialog.open){stop();return;}held.click();},135);},270);
 });
 controls?.addEventListener('click',e=>{if(e.isTrusted&&performance.now()<blockedUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 controls?.addEventListener('pointerup',()=>{if(held)blockedUntil=performance.now()+400;stop();});controls?.addEventListener('pointercancel',stop);controls?.addEventListener('lostpointercapture',stop);
 window.addEventListener('blur',stop);dialog.addEventListener('close',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
})();
