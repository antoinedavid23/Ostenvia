const mod=(value,length)=>((value%length)+length)%length;
export const wheelOffset=(item,phase,length)=>mod(item-phase+length/2,length)-length/2;

// Both wheels follow the same circle as their SVG, with mirrored centers.
export function mountContinuousWheel({root,stage,items,reduced,side='left',seconds=8,onIndex}){
 const gsap=window.gsap,state={phase:0};
 let width=1,height=1,index=-1,visible=false,running=false,disposed=false,frame=0,lastTime=0,navigation=null;
 stage.classList.add('is-continuous-wheel');
 function paint(manual=false){
  const selected=mod(Math.round(state.phase),items.length);
  for(let i=0;i<items.length;i++){
   const item=items[i],slot=wheelOffset(i,state.phase,items.length),distance=Math.abs(slot),shown=distance<1.8;
   if(item.style.visibility!==(shown?'visible':'hidden')){item.classList.toggle('is-orbit-visible',shown);item.style.visibility=shown?'visible':'hidden';}
   if(!shown)continue;
   const angle=slot*.39,x=(side==='left'?-258+500*Math.cos(angle):708-500*Math.cos(angle))*width/450,y=(290+500*Math.sin(angle))*height/580,scale=.35+.65*Math.exp(-1.083*slot*slot);
   item.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(-50%,-50%) scale(${scale.toFixed(4)})`;
   item.style.zIndex=String(100-Math.round(distance*20));
   item.style.pointerEvents=distance<1.5?'auto':'none';
  }
  if(selected!==index||manual){index=selected;onIndex(index,manual);}
 }
 function advance(delta){if(!navigation){state.phase+=Math.min(delta,.1)/seconds;paint();}}
 const tick=(_time,delta)=>advance(delta/1000);
 const nativeTick=time=>{if(!running)return;advance((time-lastTime)/1000);lastTime=time;frame=requestAnimationFrame(nativeTick);};
 function refresh(){
  const active=!disposed&&visible&&!document.hidden&&!reduced();
  if(active===running)return;
  running=active;stage.classList.toggle('is-wheel-running',active);
  if(active){lastTime=performance.now();if(gsap?.ticker)gsap.ticker.add(tick);else frame=requestAnimationFrame(nativeTick);}
  else{gsap?.ticker?.remove(tick);cancelAnimationFrame(frame);navigation?.kill();navigation=null;if(reduced())state.phase=Math.round(state.phase);paint();}
 }
 function goTo(next){
  navigation?.kill();navigation=null;
  const target=state.phase+wheelOffset(mod(next,items.length),state.phase,items.length);
  if(!running||reduced()||!gsap){state.phase=target;paint(true);return;}
  navigation=gsap.to(state,{phase:target,duration:.75,ease:'power2.inOut',onUpdate:()=>paint(),onComplete:()=>{navigation=null;paint(true);}});
 }
 const resize=new ResizeObserver(entries=>{const rect=entries[0].contentRect;width=rect.width;height=rect.height;paint();});
 resize.observe(stage);const rect=stage.getBoundingClientRect();width=rect.width;height=rect.height;paint();
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refresh();},{rootMargin:'100px 0px',threshold:0});observer.observe(root);
 document.addEventListener('visibilitychange',refresh);document.addEventListener('ostenvia-motion',refresh);
 return{get index(){return index;},goTo,step(delta){goTo(index+delta);},sync(){onIndex(index,false);},dispose(){disposed=true;refresh();resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',refresh);document.removeEventListener('ostenvia-motion',refresh);stage.classList.remove('is-continuous-wheel','is-wheel-running');for(const item of items){item.classList.remove('is-orbit-visible');for(const property of ['transform','visibility','z-index','pointer-events'])item.style.removeProperty(property);}}};
}
