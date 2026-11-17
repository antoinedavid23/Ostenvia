import {mountIsometricFactory} from './isometric-player.mjs';
const baseGroups={invoices:[['document'],['read'],['check'],['review'],['ledger','notify']],scheduling:[['request'],['availability'],['offer'],['wait'],['book','log','confirmation']],quotes:[['transcript','context'],['analyse','catalogue'],['scope','draft'],['review'],['send']],deadlines:[['document'],['extract'],['normalise'],['review'],['register','calendar','notify','archive']]};
function loadVideo(video){
 if(!video||video.dataset.loaded)return;
 for(const source of video.querySelectorAll('source[data-src]')){source.src=source.dataset.src;delete source.dataset.src;}
 video.dataset.loaded='true';video.load();
}
export function mountDemos(data,reduced,say){
 const controllers=[];
 for(const panel of document.querySelectorAll('.case-demo')){
  const c=data.cases.find(x=>x.id===panel.dataset.case);if(!c)continue;
  const groups=c.stageNodeIds||baseGroups[c.id]||c.stages.map((_,i)=>c.nodes.filter((n,j)=>Math.min(4,Math.floor(j/c.nodes.length*5))===i).map(n=>n.id));
  const button=panel.querySelector('.demo-run'),buttonText=button.querySelector('span'),drawing=panel.querySelector('.atelier-drawing'),state=panel.querySelector('.demo-state'),video=drawing.querySelector('video'),notify=drawing.querySelector('.factory-notification');
  const requiresApproval=Boolean(baseGroups[c.id]||c.nodes.some(n=>groups[3]?.includes(n.id)&&n.app==='human'));
  let running=true,visible=false,lastProgress=null;
  function controls(){
   button.disabled=reduced();buttonText.textContent=reduced()?say('Animation réduite','Animazione ridotta'):running?say('Mettre en pause','Metti in pausa'):say('Reprendre l’animation','Riprendi l’animazione');
   drawing.classList.toggle('is-running',running&&!reduced());
   if(lastProgress)state.textContent=reduced()?say('Animation réduite','Animazione ridotta'):!running?say('En pause','In pausa'):lastProgress.stage===3&&requiresApproval?say('Vérification simulée','Verifica simulata'):say('L’atelier tourne en continu','L’atelier lavora in continuo');
  }
  function progress(current){
   lastProgress=current;const index=current.stage,stage=c.stages[index];
   panel.dataset.stage=String(index);panel.dataset.cycle=String(current.cycle);panel.dataset.loopState=current.status;
   panel.querySelector('[data-stage-title]').textContent=current.status==='returning'?say('Le prochain dossier arrive','Arriva il prossimo fascicolo'):stage.title[data.lang];
   panel.querySelector('[data-stage-detail]').textContent=current.status==='returning'?say('Ostie rejoint son poste. La prochaine tâche prend le relais.','Ostie torna alla sua postazione. La prossima attività prende il posto della precedente.'):index===3&&requiresApproval?say('L’accord humain est simulé pour laisser tourner cette démonstration.','L’approvazione umana è simulata per mantenere la dimostrazione in movimento.'):index===4&&c.id==='invoices'?say('Ostie récupère le dossier validé, le transporte et le range dans les dossiers.','Ostie prende il fascicolo approvato, lo trasporta e lo ripone nell’archivio.'):stage.detail[data.lang];
   for(const module of drawing.querySelectorAll('[data-module]'))module.classList.toggle('module-active',module.dataset.module===stage.module);
   for(const marker of panel.querySelectorAll('[data-stage-marker]'))marker.classList.toggle('is-active',Number(marker.dataset.stageMarker)===index);
   for(const n of panel.querySelectorAll('.graph-node,.workflow-node')){
    n.classList.toggle('is-active',Boolean(groups[index]?.includes(n.dataset.node)));
    n.classList.remove('is-hold');
    n.classList.toggle('is-done',groups.slice(0,index).flat().includes(n.dataset.node));
   }
   notify.textContent=c.id==='invoices'?say('Dossier classé','Fascicolo archiviato'):c.stages[4].title[data.lang];
   notify.classList.toggle('is-visible',current.status==='archived');controls();
  }
  const machine=mountIsometricFactory(drawing,{lang:data.lang,system:c,reduced,onProgress:progress});
  function updateView(){
   for(const view of panel.querySelectorAll('[data-demo-view]'))view.hidden=view.dataset.demoView!==panel.dataset.view;
   for(const b of panel.querySelectorAll('[data-view-target]'))b.setAttribute('aria-pressed',String(b.dataset.viewTarget===panel.dataset.view));
   machine.setVisible(visible,{render:panel.dataset.view==='factory'});controls();
   if(video){if(visible&&running&&!reduced()&&!document.hidden&&panel.dataset.view==='factory'){loadVideo(video);video.loop=true;video.play().catch(()=>{});}else video.pause();}
  }
  const switches=[...panel.querySelectorAll('[data-view-target]')];
  const switchView=e=>{panel.dataset.view=e.currentTarget.dataset.viewTarget;updateView();};
  for(const b of switches)b.addEventListener('click',switchView);
  const toggle=()=>{running=!running;machine.setRunning(running);updateView();};button.addEventListener('click',toggle);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;panel.classList.toggle('is-visible',visible);updateView();},{threshold:.25});observer.observe(panel.querySelector('.demo-views'));
  document.addEventListener('visibilitychange',updateView);document.addEventListener('ostenvia-motion',updateView);controls();
  controllers.push({dispose(){observer.disconnect();machine.dispose();video?.pause();button.removeEventListener('click',toggle);for(const b of switches)b.removeEventListener('click',switchView);document.removeEventListener('visibilitychange',updateView);document.removeEventListener('ostenvia-motion',updateView);}});
 }
 return controllers;
}
export function mountAmbientMedia(reduced){
 const videos=[...document.querySelectorAll('[data-ambient-video]')],visible=new Set(),cleanups=[];
 const observer=new IntersectionObserver(entries=>{for(const e of entries){const v=e.target;if(e.isIntersecting){visible.add(v);if(!reduced()&&!document.hidden){loadVideo(v);v.play().catch(()=>{});}}else{visible.delete(v);v.pause();}}},{threshold:.22});
 const refresh=()=>{for(const v of videos){if(reduced()||document.hidden||!visible.has(v))v.pause();else{loadVideo(v);if(!v.ended)v.play().catch(()=>{});}}};
 for(const v of videos){observer.observe(v);const card=v.closest('.case-card');if(card){const replay=()=>{if(reduced()||!visible.has(v))return;loadVideo(v);if(v.ended)v.currentTime=0;v.play().catch(()=>{});};card.addEventListener('pointerenter',replay);card.addEventListener('focusin',replay);cleanups.push(()=>{card.removeEventListener('pointerenter',replay);card.removeEventListener('focusin',replay);});}}
 document.addEventListener('visibilitychange',refresh);document.addEventListener('ostenvia-motion',refresh);
 // All three motions remain local to the footer and stop offscreen.
 const footer=document.querySelector('.footer-creature');let footerAnimations=[],footerVisible=false;
 const refreshFooter=()=>{
  for(const a of footerAnimations)a.cancel();footerAnimations=[];
  if(!footerVisible||document.hidden||reduced())return;
  const img=footer.querySelector('img'),light=footer.querySelector('.footer-work-light');
  footerAnimations=[img.animate([{transform:'rotate(-4deg) translateY(0)'},{transform:'rotate(-2deg) translateY(-5px)'},{transform:'rotate(-4deg) translateY(0)'}],{duration:4200,iterations:Infinity,easing:'ease-in-out'}),light.animate([{opacity:.45},{opacity:1},{opacity:.45}],{duration:2400,iterations:Infinity,easing:'ease-in-out'})];
 };
 const footerObserver=new IntersectionObserver(entries=>{footerVisible=entries[0].isIntersecting;refreshFooter();},{threshold:.15});if(footer)footerObserver.observe(footer);
 document.addEventListener('ostenvia-motion',refreshFooter);document.addEventListener('visibilitychange',refreshFooter);
 return {dispose(){observer.disconnect();footerObserver.disconnect();for(const v of videos)v.pause();for(const a of footerAnimations)a.cancel();for(const cleanup of cleanups)cleanup();document.removeEventListener('visibilitychange',refresh);document.removeEventListener('ostenvia-motion',refresh);document.removeEventListener('ostenvia-motion',refreshFooter);document.removeEventListener('visibilitychange',refreshFooter);}};
}
