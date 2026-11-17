// Native scrolling advances each chapter's three views, then releases the chapter.
export function mountMethodReading(reduced){
 const readers=[],cleanups=[];
 let triggers=[],disposed=false,resizeTimer=0,first=true,lastWidth=innerWidth,lastHeight=innerHeight;
 const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
 for(const tabs of document.querySelectorAll('[data-method-tabs]')){
  const chapter=tabs.closest('.method-chapter'),buttons=[...tabs.querySelectorAll('[role=tab]')],panels=[...tabs.querySelectorAll('[role=tabpanel]')];
  let selected=-1,trigger=null;
  const choose=index=>{
   if(selected===index)return;selected=index;
   buttons.forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});
   panels.forEach((panel,i)=>{panel.classList.toggle('is-current',i===index);panel.setAttribute('aria-hidden',String(i!==index));panel.inert=i!==index;panel.tabIndex=i===index?0:-1;});
  };
  const select=index=>{
   choose(index);
   if(trigger?.isActive){
    window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*(index+.5)/buttons.length,behavior:'instant'});
    ScrollTrigger.update();
   }
  };
  const click=event=>{const index=buttons.indexOf(event.target.closest('[role=tab]'));if(index>=0)select(index);};
  const key=event=>{
   const index=buttons.indexOf(event.target);if(index<0)return;let next;
   if(event.key==='ArrowRight')next=(index+1)%buttons.length;else if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;
   if(next!==undefined){event.preventDefault();select(next);buttons[next].focus({preventScroll:true});}
  };
  tabs.addEventListener('click',click);tabs.addEventListener('keydown',key);choose(0);
  readers.push({chapter,choose,get selected(){return selected;},setTrigger(value){trigger=value;}});
  cleanups.push(()=>{tabs.removeEventListener('click',click);tabs.removeEventListener('keydown',key);});
 }
 if(!readers.length)return{dispose(){}};
 function clear(){for(const trigger of triggers)trigger.kill(true);triggers=[];for(const reader of readers){reader.setTrigger(null);reader.chapter.classList.remove('is-scroll-reading');}}
 function build(){
  if(disposed)return;clear();
  if(!gsap||!ScrollTrigger||reduced())return;
  gsap.registerPlugin(ScrollTrigger);
  const header=document.querySelector('.site-header')?.getBoundingClientRect().height||76;
  for(const reader of readers){
   const chapter=reader.chapter,height=chapter.offsetHeight;
   // Keep all text reachable on a short screen, without pinning a panel taller than it.
   if(height>innerHeight-header-28)continue;
   const paint=self=>reader.choose(Math.min(2,Math.floor(self.progress*3)));
   const trigger=ScrollTrigger.create({
    id:`method-reading-${chapter.id}`,trigger:chapter,pin:true,pinSpacing:true,
    start:()=>`top top+=${Math.round(Math.max(header+14,(innerHeight-chapter.offsetHeight+header)/2))}`,
    end:()=>`+=${Math.round(Math.max(660,innerHeight*1.25))}`,
    invalidateOnRefresh:true,anticipatePin:1,onUpdate:paint,onRefresh:paint
   });
   chapter.classList.add('is-scroll-reading');reader.setTrigger(trigger);triggers.push(trigger);
  }
  ScrollTrigger.refresh();
  if(first){
   first=false;
   const anchor=readers.find(reader=>'#'+reader.chapter.id===location.hash);
   if(anchor){const trigger=triggers.find(item=>item.trigger===anchor.chapter);if(trigger)window.scrollTo({top:trigger.start,behavior:'instant'});}
  }
 }
 const resize=()=>{
  if(Math.abs(innerWidth-lastWidth)<20&&Math.abs(innerHeight-lastHeight)<100)return;
  lastWidth=innerWidth;lastHeight=innerHeight;clearTimeout(resizeTimer);resizeTimer=setTimeout(build,180);
 };
 const motion=()=>{clearTimeout(resizeTimer);build();};
 document.addEventListener('ostenvia-motion',motion);window.addEventListener('resize',resize,{passive:true});
 Promise.resolve(document.fonts?.ready).then(()=>{if(!disposed)build();});
 return{dispose(){disposed=true;clearTimeout(resizeTimer);clear();document.removeEventListener('ostenvia-motion',motion);window.removeEventListener('resize',resize);for(const cleanup of cleanups)cleanup();}};
}
