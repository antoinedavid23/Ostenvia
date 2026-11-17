import {mountFactoryMotion} from './factory-motion.mjs';
import {factoryCycle} from './factory-transfer.mjs';
const variants={scheduling:'planning',inventory:'inventory',invoices:'records',deadlines:'records',onboarding:'records','funding-documents':'records','crm-enrichment':'control','support-triage':'control','social-plan':'control','sales-reporting':'control'};
let enginePromise;
export function mountIsometricFactory(drawing,{lang='fr',system,reduced=()=>false,onProgress=()=>{}}={}){
 const host=drawing.querySelector('[data-live-factory]'),fallback=mountFactoryMotion(drawing,{reduced});
 let factory=null,loading=false,failed=false,disposed=false,visible=false,renderScene=true,running=true,raf=0,last=null,elapsed=0,idle=0,previousStage=-1,previousSignal='';
 const moving=()=>visible&&running&&!document.hidden&&!reduced()&&!disposed;
 function paint(){
  const state=reduced()?{time:19,cycle:0,stage:4,status:'archived'}:factoryCycle(elapsed);
  if(state.stage!==previousStage){previousStage=state.stage;fallback.setStage(state.stage);}
  const signal=[state.cycle,state.stage,state.status,reduced()].join(':');
  if(signal!==previousSignal){previousSignal=signal;onProgress({...state,reduced:reduced()});}
  if(factory&&renderScene)factory.renderAt(state.time,{ambientTime:idle,cycle:state.cycle});
  host.dataset.taskTime=state.time.toFixed(2);host.dataset.cycle=String(state.cycle);
 }
 function tick(now){
  raf=0;if(!moving())return;
  const delta=last===null?0:Math.min((now-last)/1000,.1);last=now;elapsed+=delta;idle+=delta;
  paint();raf=requestAnimationFrame(tick);
 }
 function refresh(){
  cancelAnimationFrame(raf);raf=0;last=null;host.dataset.motionState=moving()?'running':'paused';
  fallback.setVisible(visible&&renderScene&&!factory&&running&&!reduced());
  if(visible&&!factory&&!failed)void load();
  paint();if(moving())raf=requestAnimationFrame(tick);
 }
 async function load(){
  if(loading||disposed||failed)return;loading=true;
  try{
   const module=host.dataset.engine==='drawn'?import('./drawn-factory.mjs'):(enginePromise ||= import('./isometric-engine.mjs'));
   const {createFactory}=await module;if(disposed)return;
   const libraryHero=Boolean(drawing.closest('.st-library-machine'));
   factory=createFactory(host,{language:lang,variant:variants[system.id]||'quote',stationNames:system.stages.map(s=>s.title[lang]),opaque:!libraryHero,showLabels:!libraryHero,showPlinth:!libraryHero});
   if(!factory)throw Error('WebGL unavailable');
   if(disposed){factory.dispose();factory=null;return;}
   drawing.classList.add('isometric-ready');fallback.setVisible(false);refresh();
  }catch{failed=true;drawing.classList.add('isometric-fallback');refresh();}
  finally{loading=false;}
 }
 return {
  setVisible(value,{render=true}={}){visible=Boolean(value);renderScene=render;refresh();},
  setRunning(value){running=Boolean(value);refresh();},
  dispose(){disposed=true;cancelAnimationFrame(raf);factory?.dispose();fallback.dispose();}
 };
}
