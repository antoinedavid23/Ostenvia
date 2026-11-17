const SVG_NS='http://www.w3.org/2000/svg';
const MODULES=['reception','analyse','transformation','redirection','livraison'];
const mounted=new WeakMap();
let instance=0;

export function mountFactoryMotion(drawing,{reduced=()=>false}={}){
 if(!drawing)return {setStage(){},setVisible(){},reset(){},dispose(){}};
 if(mounted.has(drawing))return mounted.get(drawing);
 const svg=drawing.matches?.('svg')?drawing:drawing.querySelector('svg[data-factory],svg.factory-specimens');
 if(!svg)return {setStage(){},setVisible(){},reset(){},dispose(){}};
 const doc=svg.ownerDocument,win=doc.defaultView,uid=++instance;
 const modules=Object.fromEntries(MODULES.map(name=>[name,svg.querySelector(`[data-module="${name}"]`)]));
 const styles=new Map(),undo=[],animations=new Set(),idle=new Set(),working=new Set(),patterns=new Map();
 let stage=-1,visible=false,disposed=false,raf=0,lastTick=0,activePattern=null;
 const systemMotion=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 const isReduced=()=>Boolean(reduced()||systemMotion?.matches);
 const canMove=()=>!disposed&&visible&&!doc.hidden&&!isReduced();

 function remember(el){if(el&&!styles.has(el))styles.set(el,el.getAttribute('style'));return el;}
 function set(el,values){if(!el)return;remember(el);Object.assign(el.style,values);}
 function wrap(name,part,predicate){
  const parent=modules[name];if(!parent)return null;
  const paths=[...parent.children].filter(n=>n.localName==='path'&&predicate(n.getAttribute('d')||''));
  if(!paths.length)return null;
  const group=doc.createElementNS(SVG_NS,'g');group.dataset.factoryPart=part;
  parent.insertBefore(group,paths[0]);for(const path of paths)group.append(path);
  undo.push(()=>{for(const path of [...group.children])parent.insertBefore(path,group);group.remove();});
  return group;
 }
 const intakePaper=wrap('reception','intake-paper',d=>d.startsWith('m60 60')||d.startsWith('m65 58')||d.startsWith('m72 57'));
 const scanPaper=wrap('analyse','scan-paper',d=>d.startsWith('m80 75')||d.startsWith('m88 75'));
 const piston=wrap('transformation','piston',d=>d.startsWith('M96 38')||d.startsWith('M96 47'));
 const gate=wrap('redirection','gate',d=>d.startsWith('m87 60')||d.startsWith('m87 59'));
 const gripper=wrap('livraison','gripper',d=>d.startsWith('m98 43'));
 const parcel=wrap('livraison','parcel',d=>d.startsWith('m69 57')||d.startsWith('m98 71')||d.startsWith('m84 51')||d.startsWith('m103 76')||d.startsWith('m106 76'));
 const scan=modules.analyse?.querySelector('.scanner-light');
 const raw=svg.querySelector('[data-factory-motion="raw"]');
 const structured=svg.querySelector('[data-factory-motion="structured"]');
 const routed=svg.querySelector('[data-factory-motion="routed"]');
 const completed=svg.querySelector('.factory-complete');
 const actors=Object.fromEntries(MODULES.map(name=>[name,modules[name]?.querySelector('image[data-ostie-svg]')]));

 for(const el of [intakePaper,scanPaper,piston,gate,gripper,parcel,scan,raw,structured,routed,completed,...Object.values(actors)]){
  if(el)set(el,{transformBox:'fill-box',transformOrigin:'50% 50%'});
 }
 set(gate,{transformOrigin:'8% 85%'});
 for(const actor of Object.values(actors))set(actor,{transformOrigin:'50% 100%'});

 const sourcePattern=svg.querySelector('pattern[id$="machine-rollers"]');
 if(sourcePattern){
  for(const name of MODULES){
   const module=modules[name];if(!module)continue;
   const targets=[...module.querySelectorAll('[fill],[stroke]')].filter(el=>['fill','stroke'].some(attr=>(el.getAttribute(attr)||'').includes(`#${sourcePattern.id}`)));
   if(!targets.length)continue;
   const clone=sourcePattern.cloneNode(true);clone.id=`${sourcePattern.id}-motion-${uid}-${name}`;clone.dataset.factoryPart='rollers';sourcePattern.parentNode.append(clone);
   for(const el of targets)for(const attr of ['fill','stroke']){
    const value=el.getAttribute(attr);if(!value?.includes(`#${sourcePattern.id}`))continue;
    el.setAttribute(attr,value.replace(`#${sourcePattern.id}`,`#${clone.id}`));undo.push(()=>el.setAttribute(attr,value));
   }
   patterns.set(name,{element:clone,phase:0});undo.push(()=>clone.remove());
  }
 }

 function animate(el,keyframes,timing={},bucket=null){
  if(!el)return null;remember(el);
  if(isReduced()||!visible||doc.hidden||!el.animate){Object.assign(el.style,keyframes.at(-1));return null;}
  const a=el.animate(keyframes,{duration:700,fill:'forwards',easing:'ease-in-out',...timing});
  animations.add(a);bucket?.add(a);
  a.finished?.catch(()=>{});
  return a;
 }
 function cancel(bucket){for(const a of bucket){a.cancel();animations.delete(a);}bucket.clear();}
 function cancelAll(){for(const a of animations)a.cancel();animations.clear();idle.clear();working.clear();}
 function stopPattern(){if(raf)win.cancelAnimationFrame(raf);raf=0;lastTick=0;activePattern=null;}
 function tick(now){
  raf=0;if(!canMove()||!activePattern)return;
  const delta=lastTick?Math.min(now-lastTick,50):0;lastTick=now;
  activePattern.phase=(activePattern.phase+delta/720*7)%7;
  activePattern.element.setAttribute('patternTransform',`rotate(-27) translate(0,${activePattern.phase.toFixed(3)})`);
  raf=win.requestAnimationFrame(tick);
 }
 function runPattern(name){stopPattern();const pattern=patterns.get(name);if(!pattern||!canMove())return;activePattern=pattern;raf=win.requestAnimationFrame(tick);}

 function staticState(index){
  set(intakePaper,{opacity:index<=0?'1':'0',transform:'none'});
  set(scanPaper,{opacity:index===1?'1':'0',transform:'none'});
  set(raw,{opacity:'0',transform:'none'});
  set(structured,{opacity:index===2?'1':'0',transform:'none'});
  set(routed,{opacity:index===3?'1':'0',transform:index>=4?'translate(65px,-33px)':'translate(33px,-17px)'});
  set(parcel,{opacity:index>=4?'1':'0',transform:'none'});
  set(completed,{opacity:index>=4?'1':'0',transform:'none'});
  set(scan,{opacity:index===1?'.8':'.35',transform:'none'});
  set(piston,{transform:'none'});set(gripper,{transform:'none'});
  set(gate,{transform:index>=4?'rotate(-15deg)':'rotate(0deg)'});
  for(const actor of Object.values(actors))set(actor,{transform:'none'});
 }

 function actorMotion(name){
  const actor=actors[name];if(!actor||!canMove()||stage===3)return;
  const active=MODULES[stage]===name;
  animate(actor,active?[
   {transform:'translate(0,0) rotate(0deg)'},
   {transform:'translate(-1.8px,-.5px) rotate(-2deg)',offset:.4},
   {transform:'translate(-.6px,0) rotate(-.6deg)',offset:.7},
   {transform:'translate(0,0) rotate(0deg)'}
  ]:[{transform:'scaleY(1)'},{transform:'scaleY(1.008)',offset:.45},{transform:'scaleY(1)'}],
  active?{duration:1100,iterations:1}:{duration:5800+MODULES.indexOf(name)*310,iterations:Infinity},idle);
 }
 function startMechanics(){
  if(!canMove()||stage===3)return;
  for(const name of MODULES)actorMotion(name);
  if(stage===0)runPattern('reception');
  if(stage===1){
   runPattern('analyse');
   animate(scan,[{opacity:.45,transform:'translate(0,0)'},{opacity:.95,transform:'translate(9px,-4.5px)',offset:.5},{opacity:.45,transform:'translate(0,0)'}],{duration:1050,iterations:2},working);
  }
  if(stage===2){
   runPattern('transformation');
   animate(piston,[{transform:'translateY(0)'},{transform:'translateY(3px)',offset:.4},{transform:'translateY(3px)',offset:.58},{transform:'translateY(0)'}],{duration:900,iterations:1},working);
  }
  if(stage===4)runPattern('redirection');
 }
 function finishMechanicalLoops(){cancel(working);stopPattern();set(scan,{opacity:'.35',transform:'none'});set(piston,{transform:'none'});}
 function after(a,callback){if(a)a.finished.then(()=>{if(!disposed)callback();}).catch(()=>{});else callback();}

 function setStage(index){
  if(disposed)return;
  if(!Number.isInteger(index)||index<0){reset();return;}
  index=Math.min(index,4);stage=index;
  cancelAll();stopPattern();staticState(index);
  drawing.dataset.factoryMotionStage=String(index);
  if(!canMove())return;
  startMechanics();
  if(index===0){
   const input=animate(intakePaper,[{opacity:0,transform:'translate(-18px,9px)'},{opacity:1,transform:'translate(0,0)'}],{duration:750});
   after(input,()=>{if(stage===0)stopPattern();});
  }
  if(index===1)animate(scanPaper,[{opacity:0,transform:'translate(-17px,8.5px)'},{opacity:1,transform:'translate(0,0)',offset:.6},{opacity:1,transform:'translate(0,0)'}],{duration:1000});
  if(index===2){
   set(raw,{opacity:'1'});
   animate(raw,[{opacity:1,transform:'translate(0,0)'},{opacity:0,transform:'translate(35px,-17px)'}],{duration:650});
   const output=animate(structured,[{opacity:0,transform:'translate(-20px,-10px)'},{opacity:0,transform:'translate(-20px,-10px)',offset:.4},{opacity:1,transform:'translate(0,0)'}],{duration:1150});
   after(output,()=>{if(stage===2)finishMechanicalLoops();});
  }
  if(index===4){
   animate(gate,[{transform:'rotate(0deg)'},{transform:'rotate(-15deg)'}],{duration:280});
   const travel=animate(routed,[{opacity:1,transform:'translate(33px,-17px)'},{opacity:1,transform:'translate(65px,-33px)',offset:.85},{opacity:0,transform:'translate(65px,-33px)'}],{duration:950});
   animate(parcel,[{opacity:0,transform:'translate(-11px,-5.5px)'},{opacity:0,transform:'translate(-11px,-5.5px)',offset:.55},{opacity:1,transform:'translate(0,0)'}],{duration:1300});
   animate(gripper,[{transform:'translateY(0)'},{transform:'translateY(2.5px)',offset:.4},{transform:'translateY(2.5px)',offset:.62},{transform:'translateY(0)'}],{duration:750,delay:450},working);
   animate(completed,[{opacity:0,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,delay:1100});
   after(travel,()=>{if(stage===4)stopPattern();});
  }
 }

 function refresh(){
  if(disposed)return;
  if(isReduced()){
   cancelAll();stopPattern();staticState(stage);return;
  }
  if(!visible||doc.hidden){
   for(const a of animations)if(a.playState==='running')a.pause();
   if(raf)win.cancelAnimationFrame(raf);raf=0;lastTick=0;return;
  }
  for(const a of animations)if(a.playState==='paused')a.play();
  if(!idle.size&&stage!==3)for(const name of MODULES)actorMotion(name);
  if(activePattern&&!raf)raf=win.requestAnimationFrame(tick);
 }
 function setVisible(value){visible=Boolean(value);refresh();}
 function reset(){
  if(disposed)return;stage=-1;cancelAll();stopPattern();staticState(-1);
  drawing.dataset.factoryMotionStage='idle';if(canMove())startMechanics();
 }
 const visibility=()=>refresh();doc.addEventListener('visibilitychange',visibility);
 const mediaChange=()=>refresh();systemMotion?.addEventListener?.('change',mediaChange);
 const motionObserver=typeof win.MutationObserver==='function'?new win.MutationObserver(refresh):null;
 motionObserver?.observe(doc.documentElement,{attributes:true,attributeFilter:['data-motion']});
 function dispose(){
  if(disposed)return;disposed=true;cancelAll();stopPattern();
  doc.removeEventListener('visibilitychange',visibility);systemMotion?.removeEventListener?.('change',mediaChange);motionObserver?.disconnect();
  for(const [el,style]of styles){if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);}
  for(const restore of undo.reverse())restore();
  delete drawing.dataset.factoryMotionStage;mounted.delete(drawing);
 }
 const api={setStage,setVisible,reset,dispose};mounted.set(drawing,api);reset();return api;
}
