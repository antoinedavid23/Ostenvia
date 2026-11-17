import {createAtmosphere} from './ambient-wind.js';
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
const labels={fr:{loading:'Préparation de votre visite…',ready:'Entrer sur le site',progress:'Chargement du site'},it:{loading:'Prepariamo la vostra visita…',ready:'Entra nel sito',progress:'Caricamento del sito'}};

export function mountEntry(hero,{skip=false}={}){
 const previousRestoration=history.scrollRestoration;history.scrollRestoration='manual';if(!location.hash)window.scrollTo({top:0,left:0,behavior:'instant'});
 const ScrollTrigger=window.ScrollTrigger;let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='reduce';
 const panel=hero.querySelector('.entry-screen'),content=hero.querySelector('.hero-content'),brand=panel.querySelector('.entry-brand'),logo=panel.querySelector('.entry-logo'),letter=panel.querySelector('.portal-letter');
 const enter=panel.querySelector('.entry-enter'),bar=panel.querySelector('.entry-progress'),status=panel.querySelector('.entry-status');
 const monogram=brand.classList.contains('entry-brand-monogram');let geometry=monogram?{offsetX:.085,offsetY:.126,holeX:.245,holeY:.268,ring:.008}:{offsetX:.416,offsetY:0,holeX:.049,holeY:.054,ring:.00168};
 let scene=null;try{scene=createAtmosphere(hero,panel);}catch(error){console.error(error);}
 const state={progress:skip?1:0,target:skip?1:0},pointer={lastX:0,lastY:0,lastTime:0};
 let frame=0,disposed=false,ready=false,lastTime=0,clock=0,trigger=null,language='fr',lastProgress=-1;
 const loadingStarted=performance.getEntriesByType('navigation')[0]?.startTime??performance.now(),minimumLoadingMs=skip||reduced?0:1100;
 let loadingTimer=0,deadlineTimer=0,wordmarkTimer=0,passageStarted=0,assetProgress=0,lastLoad=-1;
 if(!skip&&!reduced)document.documentElement.classList.add('entry-playing');
 const wordmark=new Image();wordmark.src='/assets/logos/ostenvia-principal.svg';
 let portal={width:1,height:1,logoWidth:300,logoHeight:70,maxScale:60};
 const gaps=[],costs=[],debug=new URLSearchParams(location.search).has('motion-debug');let meter=null,frames=0,lastReport=0;
 if(debug){meter=document.createElement('output');meter.className='motion-meter';meter.setAttribute('aria-label','Contrôle de la cadence de l’animation');meter.textContent='Mesure de la cadence…';document.body.append(meter);}
 function labelsUpdate(){status.textContent=ready?labels[language].ready:labels[language].loading;enter.querySelector('span').textContent=labels[language].ready;bar.setAttribute('aria-label',labels[language].progress);}
 function requestDraw(){if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(draw);}
 function measure(){const width=panel.clientWidth,height=panel.clientHeight,logoWidth=brand.offsetWidth,logoHeight=logo.offsetHeight;portal={width,height,logoWidth,logoHeight,maxScale:Math.hypot(width,height)/(logoWidth*geometry.holeX)*1.15};lastProgress=-1;requestDraw();}
 const observer=new ResizeObserver(measure);observer.observe(panel);scene?.onResize(measure);measure();
 function draw(time){
  frame=0;if(disposed||document.hidden)return;const start=performance.now();
  if(!ready){const elapsed=minimumLoadingMs?clamp((time-loadingStarted)/minimumLoadingMs):1,value=Math.round(Math.min(assetProgress,elapsed)*100);if(value!==lastLoad){bar.setAttribute('aria-valuenow',String(value));panel.style.setProperty('--load',value/100);lastLoad=value;}}
  const gap=lastTime?time-lastTime:0,dt=gap>0&&gap<250?Math.min(gap/1000,.1):1/60;lastTime=time;clock+=dt;
  if(ready){if(passageStarted)state.target=smooth(0,1,(time-passageStarted)/1350);state.progress+=(state.target-state.progress)*(reduced?1:1-Math.exp(-dt*18));if(Math.abs(state.target-state.progress)<.00001)state.progress=state.target;}
  const raw=ready?state.progress:0,p=clamp(raw/.78),ambience=smooth(.25,1,p);
  if(lastProgress!==raw){
   const align=smooth(0,.4,p),zoom=smooth(.055,.96,p),scale=reduced?1:Math.exp(zoom*Math.log(portal.maxScale));
   const shiftX=portal.logoWidth*geometry.offsetX*align,shiftY=-portal.height*.03*(1-align)-portal.logoHeight*geometry.offsetY*align,x=portal.width/2-portal.logoWidth*geometry.offsetX+shiftX,y=portal.height/2+portal.logoHeight*geometry.offsetY+shiftY;
   brand.style.transform=`translate3d(${shiftX}px,${shiftY}px,0) scale(${scale})`;brand.style.visibility=(!reduced&&p>.36)?'hidden':'visible';
   logo.style.opacity=reduced?1:1-smooth(.22,.34,p);letter.style.opacity=0;
   const opening=reduced?0:smooth(.04,.19,p),rx=portal.logoWidth*geometry.holeX*scale*opening,ry=portal.logoWidth*geometry.holeY*scale*opening;
   scene?.drawPortal({x,y,rx,ry,visible:p<1,ringScale:portal.logoWidth*geometry.ring*scale,ringOpacity:reduced?0:smooth(.12,.28,p)});
   panel.style.opacity=reduced?1-smooth(.2,1,p):1-smooth(.91,1,p);panel.style.visibility=p>=1?'hidden':'visible';
   panel.inert=p>=1;panel.setAttribute('aria-hidden',p>=1?'true':'false');content.inert=p<1;content.style.opacity=1;content.style.transform='none';
   if(!scene)panel.style.background=p<1?'#f7f7f2':'transparent';
   enter.style.opacity=1-smooth(0,.13,p);enter.style.visibility=ready&&p<.13?'visible':'hidden';
   hero.dataset.phase=p<1?'passage-o':'ambiance';hero.dataset.scroll=raw.toFixed(3);lastProgress=raw;
  }
  const sceneActive=scrollY<hero.parentElement.offsetTop+hero.parentElement.offsetHeight;
  const sceneOpacity=clamp(hero.getBoundingClientRect().bottom/innerHeight);
  scene?.draw({time:clock,dt,opacity:sceneActive?ambience*sceneOpacity:0,scroll:scrollY,reduced});
  if(debug&&gap>0&&gap<250&&ambience>.2){gaps.push(gap);costs.push(performance.now()-start);if(gaps.length>240){gaps.shift();costs.shift();}frames++;if(time-lastReport>750&&gaps.length>20){const sorted=[...gaps].sort((a,b)=>a-b),avg=gaps.reduce((a,b)=>a+b,0)/gaps.length,cpu=costs.reduce((a,b)=>a+b,0)/costs.length;meter.textContent=`Cadence ${Math.round(1000/avg)} i/s · intervalle p95 ${sorted[Math.floor(sorted.length*.95)].toFixed(1)} ms · dessin ${cpu.toFixed(2)} ms · souffle ${scene?.diagnostics().stirred||0} éléments`;lastReport=time;}}
  if(!ready||passageStarted||(!reduced&&sceneActive&&(ambience>0||Math.abs(state.target-state.progress)>.00001)))requestDraw();
 }
 function readScroll(self){state.target=clamp(self.progress);requestDraw();}
 function nativeScroll(){if(!trigger&&!skip&&!document.documentElement.classList.contains('entry-playing')){const track=hero.parentElement;state.target=clamp((scrollY-track.offsetTop)/Math.max(1,track.offsetHeight-innerHeight));requestDraw();}}
 window.addEventListener('scroll',nativeScroll,{passive:true});
 const goToHero=()=>{if(ready&&!skip){clearTimeout(wordmarkTimer);passageStarted=performance.now();requestDraw();}};
 function move(event){
  if(reduced||event.pointerType==='touch')return;
  const now=performance.now(),elapsed=(now-pointer.lastTime)/1000,continuous=pointer.lastTime&&elapsed<.12;
  const vx=continuous?(event.clientX-pointer.lastX)/Math.max(.008,elapsed):0,vy=continuous?(event.clientY-pointer.lastY)/Math.max(.008,elapsed):0;
  pointer.lastX=event.clientX;pointer.lastY=event.clientY;pointer.lastTime=now;
  scene?.blow(event.clientX,event.clientY,vx,vy);requestDraw();
 }
 function leave(){pointer.lastTime=0;requestDraw();}
 function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{lastTime=0;requestDraw();}}
 enter.addEventListener('click',goToHero);document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);
 labelsUpdate();requestDraw();
 const tasks=[document.fonts.ready,wordmark.decode().catch(()=>{}),...[...hero.querySelectorAll('img')].map(img=>img.decode().catch(()=>{})),scene?.ready];let completed=0;
 const assetsReady=Promise.allSettled(tasks.map(task=>Promise.resolve(task).finally(()=>{completed++;assetProgress=completed/tasks.length;requestDraw();})));
 const minimumDelay=minimumLoadingMs?new Promise(resolve=>{loadingTimer=setTimeout(resolve,Math.max(0,minimumLoadingMs-(performance.now()-loadingStarted)));}):Promise.resolve();
 const deadline=new Promise(resolve=>{deadlineTimer=setTimeout(resolve,Math.max(0,1800-(performance.now()-loadingStarted)));});
 Promise.allSettled([skip||reduced?Promise.resolve():Promise.race([assetsReady,deadline]),minimumDelay]).then(()=>{
  if(disposed)return;loadingTimer=0;clearTimeout(deadlineTimer);
  if(!skip&&!reduced){brand.classList.remove('entry-brand-monogram');brand.classList.add('entry-brand-wordmark');logo.src=wordmark.src;logo.width=320;logo.height=70;geometry={offsetX:.416,offsetY:0,holeX:.049,holeY:.054,ring:.00168};measure();wordmarkTimer=setTimeout(goToHero,550);}
  bar.setAttribute('aria-valuenow','100');panel.style.setProperty('--load',1);ready=true;panel.dataset.ready='true';bar.setAttribute('aria-hidden','true');enter.disabled=false;document.body.classList.add('has-atmosphere');document.documentElement.classList.add('entry-ready');labelsUpdate();lastProgress=-1;ScrollTrigger?.refresh();requestDraw();
 });
 return{setReduced(value){reduced=value;if(value){clearTimeout(wordmarkTimer);passageStarted=0;state.target=1;}lastProgress=-1;requestDraw();},setLanguage(lang){language=lang;labelsUpdate();},dispose(){disposed=true;cancelAnimationFrame(frame);clearTimeout(loadingTimer);clearTimeout(deadlineTimer);clearTimeout(wordmarkTimer);observer.disconnect();trigger?.kill();scene?.dispose();meter?.remove();document.documentElement.classList.remove('entry-playing');document.body.classList.remove('has-atmosphere');history.scrollRestoration=previousRestoration;enter.removeEventListener('click',goToHero);document.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);}};
}
