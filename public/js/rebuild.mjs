export function mountRebuild(reduced){
 const arrival=document.querySelector('.rb-arrival');
 if(arrival){let seen=false;try{seen=sessionStorage.getItem('ostenvia-rebuild-seen')==='1';sessionStorage.setItem('ostenvia-rebuild-seen','1');}catch{}if(seen||reduced())arrival.remove();else arrival.addEventListener('animationend',()=>arrival.remove(),{once:true});}
 const scenes=[...document.querySelectorAll('[data-rb-motion]')],visible=new Set(),cleanups=[],it=document.documentElement.lang==='it';
 function refresh(){for(const scene of scenes){scene.classList.toggle('is-playing',visible.has(scene)&&!document.hidden&&!reduced()&&scene.dataset.paused!=='true');const button=scene.parentElement.querySelector('[data-rb-pause]');if(button){button.disabled=reduced();button.textContent=reduced()?(it?'Animazioni ridotte':'Animations réduites'):scene.dataset.paused==='true'?(it?'Riprendi':'Reprendre'):(it?'Metti in pausa':'Mettre en pause');button.setAttribute('aria-pressed',String(scene.dataset.paused==='true'));}}}
 const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target);}refresh();},{threshold:.25});
 for(const scene of scenes){observer.observe(scene);const button=scene.parentElement.querySelector('[data-rb-pause]');if(button){const toggle=()=>{scene.dataset.paused=String(scene.dataset.paused!=='true');refresh();};button.addEventListener('click',toggle);cleanups.push(()=>button.removeEventListener('click',toggle));}}
 document.addEventListener('visibilitychange',refresh);document.addEventListener('ostenvia-motion',refresh);
 return {dispose(){observer.disconnect();for(const cleanup of cleanups)cleanup();document.removeEventListener('visibilitychange',refresh);document.removeEventListener('ostenvia-motion',refresh);}};
}
