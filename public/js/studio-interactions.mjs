import {mountContinuousWheel} from './continuous-wheel.mjs';
import {mountMethodReading} from './method-reading.mjs';

export function mountStudio(reduced){
 const cleanups=[];
 const main=document.querySelector('main');
 if(main){for(let i=0;i<6;i++){main.style.setProperty(`--wash-${i}-x`,`${8+Math.random()*84}%`);main.style.setProperty(`--wash-${i}-y`,`${i*17+Math.random()*9}%`);}}
 for(const card of document.querySelectorAll('[data-depth-card]')){
  let frame=0,rect=null,point=null;
  const reset=()=>{cancelAnimationFrame(frame);frame=0;rect=null;point=null;for(const name of ['--depth-x','--depth-y','--depth-rise'])card.style.removeProperty(name);};
  const enter=e=>{if(e.pointerType==='mouse'&&!reduced())rect=card.getBoundingClientRect();};
  const move=e=>{if(!rect||reduced()||e.pointerType!=='mouse')return;point={x:e.clientX,y:e.clientY};if(frame)return;frame=requestAnimationFrame(()=>{frame=0;if(!point||!rect)return;const x=Math.max(-1,Math.min(1,(point.x-rect.left)/rect.width*2-1)),y=Math.max(-1,Math.min(1,(point.y-rect.top)/rect.height*2-1));card.style.setProperty('--depth-x',`${-y*2}deg`);card.style.setProperty('--depth-y',`${x*2}deg`);card.style.setProperty('--depth-rise','-4px');});};
  card.addEventListener('pointerenter',enter);card.addEventListener('pointermove',move);card.addEventListener('pointerleave',reset);document.addEventListener('ostenvia-motion',reset);
  cleanups.push(()=>{reset();card.removeEventListener('pointerenter',enter);card.removeEventListener('pointermove',move);card.removeEventListener('pointerleave',reset);document.removeEventListener('ostenvia-motion',reset);});
 }
 const softScenes=[...document.querySelectorAll('.sv-scene-soft')];
 if(softScenes.length){
  const visible=new Set(),refresh=()=>{for(const scene of softScenes)scene.classList.toggle('is-soft-active',visible.has(scene)&&!reduced()&&!document.hidden);};
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);}refresh();},{threshold:.2});
  for(const scene of softScenes)observer.observe(scene);document.addEventListener('visibilitychange',refresh);document.addEventListener('ostenvia-motion',refresh);
  cleanups.push(()=>{observer.disconnect();document.removeEventListener('visibilitychange',refresh);document.removeEventListener('ostenvia-motion',refresh);for(const scene of softScenes)scene.classList.remove('is-soft-active');});
 }
 for(const wheel of document.querySelectorAll('[data-story-wheel]')){
  const people=[...wheel.querySelectorAll('[data-wheel-person]')],readings=[...wheel.querySelectorAll('[data-wheel-reading]')],status=wheel.querySelector('[data-wheel-status]'),count=wheel.querySelector('[data-wheel-count]');let keyboardSelection=false;
  const render=(index,manual)=>{
   for(let i=0;i<people.length;i++){let slot=(i-index+people.length)%people.length;if(slot>2)slot-=people.length;people[i].dataset.slot=String(slot);people[i].classList.toggle('is-active',i===index);people[i].tabIndex=i===index?0:-1;}
   const focused=manual?null:readings.find(article=>article.contains(document.activeElement)),readingIndex=focused?readings.indexOf(focused):index;
   for(let i=0;i<readings.length;i++)readings[i].hidden=i!==readingIndex;
   count.textContent=`${readingIndex+1} / ${people.length}`;
   if(manual&&status)status.textContent=people[index].getAttribute('aria-label');
   if(manual&&keyboardSelection){keyboardSelection=false;people[index].focus({preventScroll:true});}
  };
  const engine=mountContinuousWheel({root:wheel,stage:wheel.querySelector('.st-wheel-stage'),items:people,reduced,seconds:8,onIndex:render});
  const previous=()=>engine.step(-1),next=()=>engine.step(1),sync=()=>queueMicrotask(()=>engine.sync());
  const key=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();keyboardSelection=Boolean(e.target.closest('[data-wheel-person]'));engine.step(e.key==='ArrowDown'?1:-1);}};
  const select=e=>{const person=e.target.closest('[data-wheel-person]');if(person)engine.goTo(Number(person.dataset.wheelPerson));};
  const prevButton=wheel.querySelector('[data-wheel-prev]'),nextButton=wheel.querySelector('[data-wheel-next]');
  prevButton.addEventListener('click',previous);nextButton.addEventListener('click',next);wheel.addEventListener('keydown',key);wheel.addEventListener('click',select);wheel.addEventListener('focusout',sync);
  cleanups.push(()=>{engine.dispose();prevButton.removeEventListener('click',previous);nextButton.removeEventListener('click',next);wheel.removeEventListener('keydown',key);wheel.removeEventListener('click',select);wheel.removeEventListener('focusout',sync);});
 }
 for(const flow of document.querySelectorAll('[data-ops-flow]')){
  const nodes=[...flow.querySelectorAll('[data-op-node]')],total=new Set(nodes.map(n=>n.dataset.opNode)).size;let visible=false,step=0,timer=null;
  const clear=()=>{clearTimeout(timer);timer=null;};
  const refresh=()=>{clear();const active=visible&&!reduced()&&!document.hidden;flow.classList.toggle('is-energized',active);for(const n of nodes)n.classList.toggle('is-current',active&&Number(n.dataset.opNode)===step);if(active)timer=setTimeout(()=>{step=(step+1)%total;refresh();},1300);};
  const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;refresh();},{threshold:.2});observer.observe(flow);document.addEventListener('visibilitychange',refresh);document.addEventListener('ostenvia-motion',refresh);cleanups.push(()=>{clear();observer.disconnect();document.removeEventListener('visibilitychange',refresh);document.removeEventListener('ostenvia-motion',refresh);});
 }
 for(const wheel of document.querySelectorAll('[data-process-wheel]')){
  const buttons=[...wheel.querySelectorAll('[data-process-step]')],readings=[...wheel.querySelectorAll('[data-process-reading]')],prev=wheel.querySelector('[data-process-prev]'),next=wheel.querySelector('[data-process-next]'),count=wheel.querySelector('[data-process-count]'),it=wheel.dataset.lang==='it';let keyboardSelection=false;
  const render=(index,manual)=>{
   buttons.forEach((button,i)=>{button.setAttribute('aria-pressed',String(i===index));let slot=(i-index+buttons.length)%buttons.length;if(slot>3)slot-=buttons.length;button.dataset.processSlot=slot;button.tabIndex=i===index?0:-1;});
   const focused=manual?null:readings.find(article=>article.contains(document.activeElement)),readingIndex=focused?readings.indexOf(focused):index;
   readings.forEach((article,i)=>article.hidden=i!==readingIndex);
   if(count)count.textContent=`${it?'Tappa':'Étape'} ${readingIndex+1} / ${buttons.length}`;
   if(manual&&keyboardSelection){keyboardSelection=false;buttons[index].focus({preventScroll:true});}
  };
  const engine=mountContinuousWheel({root:wheel,stage:wheel.querySelector('.st-process-arc'),items:buttons,reduced,side:'right',seconds:8.5,onIndex:render});
  const click=e=>{const button=e.target.closest('[data-process-step]');if(button)engine.goTo(Number(button.dataset.processStep));},previous=()=>engine.step(-1),following=()=>engine.step(1),sync=()=>queueMicrotask(()=>engine.sync());
  const key=e=>{if(!e.target.closest('[data-process-step]'))return;let target;if(e.key==='ArrowDown'||e.key==='ArrowRight')target=engine.index+1;else if(e.key==='ArrowUp'||e.key==='ArrowLeft')target=engine.index-1;else if(e.key==='Home')target=0;else if(e.key==='End')target=buttons.length-1;if(target!==undefined){e.preventDefault();keyboardSelection=true;engine.goTo(target);}};
  wheel.addEventListener('keydown',key);wheel.addEventListener('click',click);wheel.addEventListener('focusout',sync);prev.addEventListener('click',previous);next.addEventListener('click',following);
  cleanups.push(()=>{engine.dispose();wheel.removeEventListener('keydown',key);wheel.removeEventListener('click',click);wheel.removeEventListener('focusout',sync);prev.removeEventListener('click',previous);next.removeEventListener('click',following);});
 }
 for(const journey of document.querySelectorAll('[data-offer-journey]')){
  const viewport=journey.querySelector('[data-journey-viewport]'),tabs=[...journey.querySelectorAll('[data-journey-step]')],slides=[...viewport.children],prev=journey.querySelector('[data-journey-prev]'),next=journey.querySelector('[data-journey-next]');let index=0,frame=0;
  const paint=i=>{index=Math.max(0,Math.min(slides.length-1,i));tabs.forEach((b,j)=>{b.setAttribute('aria-selected',String(j===index));b.tabIndex=j===index?0:-1;});slides.forEach((p,j)=>p.setAttribute('aria-hidden',String(j!==index)));prev.disabled=index===0;next.disabled=index===slides.length-1;journey.querySelector('[data-journey-count]').textContent=`0${index+1} / 0${slides.length}`;};
  const choose=i=>{paint(i);viewport.scrollTo({left:index*viewport.clientWidth,behavior:reduced()?'instant':'smooth'});};
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;paint(Math.round(viewport.scrollLeft/Math.max(1,viewport.clientWidth)));});};
  const click=e=>{const b=e.target.closest('[data-journey-step]');if(b)choose(Number(b.dataset.journeyStep));},previous=()=>choose(index-1),following=()=>choose(index+1);
  const key=e=>{if(!e.target.closest('[role=tab]')&&e.target!==viewport)return;let n;if(e.key==='ArrowRight')n=index+1;else if(e.key==='ArrowLeft')n=index-1;else if(e.key==='Home')n=0;else if(e.key==='End')n=slides.length-1;if(n!==undefined){e.preventDefault();choose(n);if(e.target.closest('[role=tab]'))tabs[index].focus({preventScroll:true});}};
  journey.addEventListener('click',click);journey.addEventListener('keydown',key);viewport.addEventListener('scroll',scroll,{passive:true});prev.addEventListener('click',previous);next.addEventListener('click',following);const resize=new ResizeObserver(()=>{viewport.scrollTo({left:index*viewport.clientWidth,behavior:'instant'});});resize.observe(viewport);paint(0);cleanups.push(()=>{cancelAnimationFrame(frame);resize.disconnect();journey.removeEventListener('click',click);journey.removeEventListener('keydown',key);viewport.removeEventListener('scroll',scroll);prev.removeEventListener('click',previous);next.removeEventListener('click',following);});
 }
 const methodReading=mountMethodReading(reduced);cleanups.push(()=>methodReading.dispose());
 for(const tabs of document.querySelectorAll('[data-offer-tabs]')){
  const buttons=[...tabs.querySelectorAll('[role=tab]')],panels=[...tabs.querySelectorAll('[role=tabpanel]')];
  const choose=i=>{buttons.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1;});panels.forEach((p,j)=>p.hidden=i!==j);};
  const click=e=>{const i=buttons.indexOf(e.target.closest('[role=tab]'));if(i>=0)choose(i);};
  const key=e=>{const i=buttons.indexOf(e.target);if(i<0)return;let n;if(e.key==='ArrowRight')n=(i+1)%buttons.length;else if(e.key==='ArrowLeft')n=(i+buttons.length-1)%buttons.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=buttons.length-1;if(n!==undefined){e.preventDefault();choose(n);buttons[n].focus();}};
  tabs.addEventListener('click',click);tabs.addEventListener('keydown',key);cleanups.push(()=>{tabs.removeEventListener('click',click);tabs.removeEventListener('keydown',key);});
 }
 for(const workflow of document.querySelectorAll('[data-native-workflow]')){
  let visible=false,paused=false;const pause=workflow.querySelector('[data-workflow-pause]'),it=workflow.dataset.lang==='it';
  const refresh=()=>{workflow.classList.toggle('is-flowing',visible&&!paused&&!reduced()&&!document.hidden);if(pause){pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?(it?'Riprendi':'Reprendre'):(it?'Pausa':'Pause');}};
  const toggle=()=>{paused=!paused;refresh();};pause?.addEventListener('click',toggle);const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;refresh();},{threshold:.15});observer.observe(workflow);document.addEventListener('visibilitychange',refresh);document.addEventListener('ostenvia-motion',refresh);cleanups.push(()=>{observer.disconnect();pause?.removeEventListener('click',toggle);document.removeEventListener('visibilitychange',refresh);document.removeEventListener('ostenvia-motion',refresh);});
 }

 return{dispose(){for(const cleanup of cleanups)cleanup();}};
}
