import {mountStudio} from './studio-interactions.mjs';
export function mountAgency(reduced){
 const services=document.querySelector('.ag-nav-services'),summary=services?.querySelector('summary'),cleanups=[];
 const studio=mountStudio(reduced);cleanups.push(()=>studio.dispose());
 const outside=e=>{if(services?.open&&!services.contains(e.target))services.open=false;};
 const escape=e=>{if(e.key==='Escape'&&services?.open){services.open=false;if(innerWidth>1020)summary.focus();}};
 document.addEventListener('click',outside);document.addEventListener('keydown',escape);
 const guideButtons=[...document.querySelectorAll('[data-open-guide]')];
 const openGuide=()=>{const launcher=document.querySelector('.companion-launcher');if(launcher?.getAttribute('aria-expanded')!=='true')launcher?.click();else document.querySelector('[data-chat-reply], #ostie-question')?.focus();};
 for(const button of guideButtons)button.addEventListener('click',openGuide);
 const tourButtons=[...document.querySelectorAll('[data-start-tour]')];
 const startTour=()=>document.dispatchEvent(new Event('ostenvia-guide-tour'));
 for(const button of tourButtons)button.addEventListener('click',startTour);
 cleanups.push(()=>{for(const button of tourButtons)button.removeEventListener('click',startTour);});
 for(const button of document.querySelectorAll('[data-story-open]')){
  const dialog=document.getElementById(button.dataset.storyOpen);if(!dialog)continue;
  const open=()=>{dialog.showModal();document.body.classList.add('story-open');};
  const close=()=>dialog.close();
  const restore=()=>{document.body.classList.remove('story-open');button.focus({preventScroll:true});};
  const outside=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}};
  const closer=dialog.querySelector('[data-story-close]');button.addEventListener('click',open);closer.addEventListener('click',close);dialog.addEventListener('close',restore);dialog.addEventListener('click',outside);
  cleanups.push(()=>{button.removeEventListener('click',open);closer.removeEventListener('click',close);dialog.removeEventListener('close',restore);dialog.removeEventListener('click',outside);});
 }
 // One scene follows the offer currently being read. The mobile version keeps both visuals in the flow.
 for(const story of document.querySelectorAll('[data-service-story]')){
  const steps=[...story.querySelectorAll('[data-service-step]')],ratios=new Map();
  const storyObserver=new IntersectionObserver(entries=>{
   for(const entry of entries)ratios.set(entry.target,entry.isIntersecting?entry.intersectionRatio:0);
   const current=steps.filter(step=>ratios.get(step)>0).sort((a,b)=>ratios.get(b)-ratios.get(a))[0];
   if(current)story.dataset.scene=current.dataset.serviceStep;
  },{rootMargin:'-15% 0px -15% 0px',threshold:[0,.15,.35,.6,.85]});
  for(const step of steps)storyObserver.observe(step);
  cleanups.push(()=>storyObserver.disconnect());
 }
 const methodSteps=[...document.querySelectorAll('[data-method-step]')],methodRatios=new Map();
 const methodObserver=new IntersectionObserver(entries=>{
  for(const entry of entries)methodRatios.set(entry.target,entry.isIntersecting?entry.intersectionRatio:0);
  const current=methodSteps.filter(step=>methodRatios.get(step)>0).sort((a,b)=>methodRatios.get(b)-methodRatios.get(a))[0];
  if(current)for(const step of methodSteps)step.classList.toggle('is-current',step===current);
 },{rootMargin:'-20% 0px -25% 0px',threshold:[0,.3,.6,.9]});
 for(const step of methodSteps)methodObserver.observe(step);
 cleanups.push(()=>methodObserver.disconnect());
 const previews=[...document.querySelectorAll('[data-preview]')],timers=new Map(),visible=new Set(),seen=new Set();
 function stop(node){clearTimeout(timers.get(node));timers.delete(node);node.classList.remove('is-previewing');}
 function play(node){stop(node);if(reduced()||document.hidden||!visible.has(node))return;requestAnimationFrame(()=>{if(reduced()||document.hidden||!visible.has(node))return;node.classList.add('is-previewing');timers.set(node,setTimeout(()=>stop(node),2500));});}
 const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){visible.add(e.target);if(!seen.has(e.target)){seen.add(e.target);play(e.target);}}else{visible.delete(e.target);stop(e.target);}}},{threshold:.35});
 for(const node of previews){observer.observe(node);const replay=()=>play(node);node.addEventListener('pointerenter',replay);node.addEventListener('focusin',replay);cleanups.push(()=>{node.removeEventListener('pointerenter',replay);node.removeEventListener('focusin',replay);});}
 const refresh=()=>{if(reduced()||document.hidden)for(const node of previews)stop(node);};document.addEventListener('ostenvia-motion',refresh);document.addEventListener('visibilitychange',refresh);
 return{dispose(){observer.disconnect();for(const node of previews)stop(node);for(const cleanup of cleanups)cleanup();for(const button of guideButtons)button.removeEventListener('click',openGuide);document.removeEventListener('click',outside);document.removeEventListener('keydown',escape);document.removeEventListener('ostenvia-motion',refresh);document.removeEventListener('visibilitychange',refresh);}};
}
