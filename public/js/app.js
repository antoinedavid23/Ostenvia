import {mountCalendar} from './calendar-embed.mjs';
import {readMotion,saveMotion} from './privacy-state.mjs';
import {guideIntent} from './ostie-guide.mjs';
import {mountRebuild} from './rebuild.mjs';
import {mountAgency} from './agency.mjs';
import {calculate,calculateProductivity} from './calculator.mjs';
import {mountDemos,mountAmbientMedia} from './demo-player.mjs';
const data=JSON.parse(document.querySelector('#site-data').textContent),it=data.lang==='it';
mountCalendar(data.lang);
const say=(fr,italian)=>it?italian:fr;
const media=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=media.matches,entryController=null,portraitMotion=null;
try{const saved=readMotion(localStorage);if(saved)reduced=saved==='reduce';}catch{}
document.documentElement.dataset.motion=reduced?'reduce':'full';
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
function closeMenu(){document.body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open);if(open)nav.querySelector('summary, a')?.focus();});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
addEventListener('resize',()=>{if(innerWidth>1020)closeMenu();},{passive:true});
const hero=document.querySelector('.hero');
if(hero){
 const entrySurfaces=[document.querySelector('.site-header'),document.querySelector('.companion')];for(const surface of entrySurfaces)surface.inert=true;
 let entered=false;try{entered=sessionStorage.getItem('ostenvia-entered')==='1';}catch{}
 const skip=(entered&&!new URLSearchParams(location.search).has('entree'))||reduced||Boolean(location.hash);
 if(skip)document.querySelector('.hero-track').classList.add('is-return');
 try{const {mountEntry}=await import('./entry.js');entryController=mountEntry(hero,{skip});entryController.setLanguage(data.lang);const observer=new MutationObserver(()=>{if(hero.dataset.phase==='ambiance'){if(!skip){entryController?.dispose?.();entryController=null;document.querySelector('.hero-track').classList.add('is-return');window.scrollTo({top:0,left:0,behavior:'instant'});}document.body.classList.add('entered');for(const surface of entrySurfaces)surface.inert=false;try{sessionStorage.setItem('ostenvia-entered','1');}catch{}if(location.hash)document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({behavior:'instant'});observer.disconnect();}});observer.observe(hero,{attributes:true,attributeFilter:['data-phase']});}
 catch{document.documentElement.classList.remove('has-entry');hero.querySelector('.entry-screen')?.remove();hero.querySelector('.hero-content').inert=false;document.querySelector('.hero-track').classList.add('is-return');document.body.classList.add('entered');for(const surface of entrySurfaces)surface.inert=false;}
}
function setMotion(value,persist=false){reduced=value;document.documentElement.dataset.motion=value?'reduce':'full';for(const b of document.querySelectorAll('.motion-toggle'))b.setAttribute('aria-pressed',String(value));entryController?.setReduced?.(value);document.dispatchEvent(new Event('ostenvia-motion'));if(value&&portraitMotion){portraitMotion.scrollTrigger?.kill();portraitMotion.kill();window.gsap?.set('.portrait-photo>img',{clearProps:'transform'});portraitMotion=null;}if(persist)try{saveMotion(localStorage,value);}catch{}}
setMotion(reduced);for(const b of document.querySelectorAll('.motion-toggle'))b.addEventListener('click',()=>setMotion(!reduced,true));media.addEventListener('change',event=>setMotion(event.matches));
for(const section of document.querySelectorAll('.calculator')){
 const form=section.querySelector('form'),fields=[...form.querySelectorAll('input[type=number]')];
 const number=new Intl.NumberFormat(data.lang==='fr'?'fr-FR':'it-IT',{maximumFractionDigits:1});
 const money=new Intl.NumberFormat(data.lang==='fr'?'fr-FR':'it-IT',{style:'currency',currency:'EUR',minimumFractionDigits:section.classList.contains('st-quick-calculator')?0:2,maximumFractionDigits:section.classList.contains('st-quick-calculator')?0:2});
 function update(){
  const missingRate=form.elements.rate.value==='';const values=Object.fromEntries(fields.map(x=>[x.name,x.value===''?(x.name==='rate'?0:NaN):Number(x.value)]));
  try{const results={...calculate(values),...calculateProductivity(values)};section.classList.toggle('wide-result',results.monthlyHours>=1000);for(const [key,value]of Object.entries(results)){const output=section.querySelector(`[data-result="${key}"]`);if(output)output.value=missingRate&&key.includes('Value')?'—':(key.includes('Value')?money:number).format(value);}section.querySelector('[data-productivity-gauge]')?.style.setProperty('--progress',results.productivityPercent);for(const f of fields)f.removeAttribute('aria-invalid');section.querySelector('.calc-error').hidden=true;}catch{section.querySelector('[data-productivity-gauge]')?.style.setProperty('--progress',0);for(const f of fields)f.setAttribute('aria-invalid',String(!f.validity.valid||f.value===''||(f.name==='hours'||f.name==='workingHours')&&values.hours>values.workingHours));for(const result of section.querySelectorAll('[data-result]'))result.value='—';section.querySelector('.calc-error').hidden=false;}
  for(const slider of form.querySelectorAll('.range')){const field=form.querySelector('#'+slider.dataset.sync);if(field.value!=='')slider.value=field.value;const fill=(Number(slider.value)-Number(slider.min))/(Number(slider.max)-Number(slider.min))*100;slider.style.setProperty('--fill',`${fill}%`);}
 }
 for(const slider of form.querySelectorAll('.range'))slider.addEventListener('input',()=>{form.querySelector('#'+slider.dataset.sync).value=slider.value;update();});
 for(const field of fields)field.addEventListener('input',update);
 form.addEventListener('submit',event=>event.preventDefault());update();
}
const demos=mountDemos(data,()=>reduced,say);
const ambientMedia=mountAmbientMedia(()=>reduced);
for(const contactForm of document.querySelectorAll('.contact-form')){
 contactForm.elements.started.value=String(Date.now());
 contactForm.addEventListener('submit',async event=>{
  event.preventDefault();if(!contactForm.reportValidity())return;
  const button=contactForm.querySelector('button[type=submit]'),status=contactForm.querySelector('.form-status');button.disabled=true;status.textContent=say('Envoi de votre demande…','Invio della richiesta…');
  try{const response=await fetch('/api/contact',{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(contactForm)))});const result=await response.json();if(!response.ok||!result.ok)throw Error(result.error||'failed');status.textContent=say('Votre demande a bien été envoyée. Nous vous répondrons à l’adresse indiquée.','La richiesta è stata inviata. Vi risponderemo all’indirizzo indicato.');contactForm.reset();contactForm.elements.started.value=String(Date.now());}
  catch{status.textContent=say('L’envoi n’a pas abouti. Vous pouvez réessayer ou nous écrire directement à ','L’invio non è riuscito. Potete riprovare o scriverci a ');const link=document.createElement('a');link.href='mailto:contact@ostenvia.com';link.textContent='contact@ostenvia.com';link.className='text-link';status.append(link);}
  finally{button.disabled=false;status.focus();}
 });
}
const launch=document.querySelector('.companion-launcher'),chat=document.querySelector('.ostie-panel'),chatLog=chat.querySelector('.chat-messages'),chatForm=chat.querySelector('.chat-form');
let tourIndex=-1,awaiting='tour-start',highlightTimer=0;

function openChat(open){chat.hidden=!open;launch.setAttribute('aria-expanded',String(open));if(open)(chatLog.querySelector('[data-chat-reply]')||chatForm.elements.question).focus({preventScroll:true});else launch.focus({preventScroll:true});}
function clearHighlight(){clearTimeout(highlightTimer);document.querySelector('.guide-highlight')?.classList.remove('guide-highlight');}
launch.addEventListener('click',()=>openChat(chat.hidden));chat.querySelector('.ostie-close').addEventListener('click',()=>{clearHighlight();openChat(false);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!chat.hidden){clearHighlight();openChat(false);}if(document.body.classList.contains('menu-open')){closeMenu();menu.focus();}}});
function message(text,role='assistant',link=null,replies=[]){
 for(const old of chatLog.querySelectorAll('.chat-replies'))old.remove();
 const node=document.createElement('p');node.className=`chat-message ${role}`;node.textContent=text;
 if(link){const a=document.createElement('a');a.href=link.href;a.textContent=link.label;node.append(a);}
 if(replies.length){const choices=document.createElement('span');choices.className='chat-replies';for(const label of replies){const b=document.createElement('button');b.type='button';b.dataset.chatReply=label;b.textContent=label;choices.append(b);}node.append(choices);}
 chatLog.append(node);chatLog.scrollTop=chatLog.scrollHeight;return node;
}
const replies=()=>[say('Oui','Sì'),say('J’ai une question','Ho una domanda')];
function bookCall(){
 awaiting=null;clearHighlight();
 if(data.page==='audit'){openChat(false);const calendar=document.querySelector('[data-audit-calendar]');calendar?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});(calendar?.querySelector('iframe')||calendar)?.focus({preventScroll:true});return;}
 message(say('Je vous emmène à la page de rendez-vous.','Vi accompagno alla pagina per prenotare.'));location.assign(data.links.audit);
}
const tour=[
 {id:'accompagnements',text:say('Nous automatisons les tâches répétitives et recherchons des financements pour vos projets. Je vous montre un exemple ?','Automatizziamo le attività ripetitive e cerchiamo finanziamenti per i vostri progetti. Vi mostro un esempio?')},
 {id:'realisations',text:say('Une demande arrive, Ostie lit les informations et vos outils assurent le suivi. Le fonctionnement est adapté à votre entreprise. On regarde le temps que cela peut libérer ?','Arriva una richiesta, Ostie legge le informazioni e gli strumenti seguono il lavoro. Il percorso è adattato alla vostra impresa. Vediamo quanto tempo può liberare?')},
 {id:'simulateur',text:say('Ce simulateur estime les heures libérées et leur valeur pour votre équipe. On en parle pendant un audit gratuit de 20 minutes ?','Questo simulatore stima le ore liberate e il loro valore per il team. Ne parliamo in un incontro gratuito di 20 minuti?')}
];
function showTour(index){
 if(!document.getElementById('accompagnements')){location.assign(data.links.home+'?visite=1#accompagnements');return;}
 tourIndex=Math.min(index,tour.length-1);const point=tour[tourIndex],target=document.getElementById(point.id);clearHighlight();
 if(target){target.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});target.classList.add('guide-highlight');highlightTimer=setTimeout(clearHighlight,2500);}
 awaiting=tourIndex===tour.length-1?'audit':'tour-next';message(point.text,'assistant',null,replies());chatLog.querySelector('[data-chat-reply]')?.focus({preventScroll:true});
}
function answer(question){const q=question.toLocaleLowerCase();
 if(/prix|tarif|co[uû]t|budget|prezz|costo|quanto/.test(q))return {text:say('Le devis précise le prix, le travail prévu et les frais éventuels avant de commencer. On regarde votre besoin pendant un audit gratuit de 20 minutes ?','Il preventivo precisa prezzo, lavoro e costi prima di iniziare. Guardiamo la vostra esigenza in un incontro gratuito di 20 minuti?'),action:'audit'};
 if(/financ|aide|subven|incentiv|agevol/.test(q))return {text:say('L’IA aide à repérer les aides et financeurs à examiner. Nous vérifions les critères et préparons les démarches. On fait le point sur votre projet pendant un audit gratuit ?','L’IA aiuta a individuare incentivi e finanziatori da esaminare. Verifichiamo i requisiti e prepariamo le pratiche. Ne parliamo in un incontro gratuito?'),action:'audit'};
 if(/audit|rendez|r[ée]serv|appunt|incontro|visio/.test(q))return {text:say('L’audit dure 20 minutes, en visio, et il est gratuit. Je vous accompagne pour choisir un créneau ?','L’incontro dura 20 minuti, in video, ed è gratuito. Vi accompagno per scegliere un orario?'),action:'audit'};
 if(/maint|panne|probl[eè]m|assistenz|guasto/.test(q))return {text:say('Le suivi est défini dès le départ. Vous savez qui contacter et ce que couvre la maintenance.','L’assistenza viene definita dall’inizio. Sapete chi contattare e cosa comprende la manutenzione.'),link:{href:data.links.method,label:say('Notre accompagnement','Il nostro accompagnamento')}};
 if(/outil|logiciel|excel|gmail|outlook|crm|strument|software|compat/.test(q))return {text:say('Nous partons de vos outils actuels et vérifions comment les relier. On regarde votre cas pendant un audit gratuit ?','Partiamo dagli strumenti attuali e verifichiamo come collegarli. Guardiamo il vostro caso in un incontro gratuito?'),action:'audit'};
 if(/simul|heure|[ée]conom|temps|tempo|risparmi/.test(q))return {text:say('Le simulateur estime les heures libérées et leur valeur, avec vos propres réglages.','Il simulatore stima ore liberate e valore con le vostre impostazioni.'),link:{href:data.links.simulator||data.links.home+'#simulateur',label:say('Simuler le temps gagné','Simula il tempo risparmiato')}};
 if(/exemple|syst[eè]m|atelier|demo|esemp|sistem/.test(q))return {text:say('L’atelier montre des exemples de systèmes. Le vôtre est conçu autour de votre travail et de vos outils.','L’atelier mostra esempi di sistemi. Il vostro viene progettato attorno al lavoro e agli strumenti.'),link:{href:data.links.workshop,label:say('Explorer les systèmes','Esplora i sistemi')}};
 if(/automati|t[aâ]che|quotidien|attivit/.test(q))return {text:say('Nous relions vos outils pour prendre en charge les tâches répétitives : documents, suivi, relances et rendez-vous. On en parle pendant un audit gratuit ?','Colleghiamo gli strumenti per gestire attività ripetitive: documenti, registri, solleciti e appuntamenti. Ne parliamo in un incontro gratuito?'),action:'audit'};
 if(/qui|ostie|robot|mascott|chi sei/.test(q))return {text:say('Je suis Ostie, votre compagnon IA. Je vous explique le site et je vous aide à trouver le bon point de départ. On fait le tour ?','Sono Ostie, il vostro compagno IA. Vi spiego il sito e vi aiuto a trovare il punto di partenza. Facciamo un giro?'),action:'tour-start'};
 if(/merci|grazie/.test(q))return {text:say('Avec plaisir. Je suis là si vous avez une autre question.','Con piacere. Sono qui se avete altre domande.')};
 return null;
}
async function sendQuestion(value){
 const question=value.trim();if(!question||chatForm.querySelector('button').disabled)return;
 message(question,'user');const intent=guideIntent(question,awaiting);
 if(intent==='book'){bookCall();return;}
 if(intent==='tour'){showTour(0);return;}
 if(intent==='next'){showTour(tourIndex+1);return;}
 if(intent==='ask'||intent==='decline'){awaiting=null;clearHighlight();message(say('D’accord. Qu’aimeriez-vous savoir ?','Va bene. Cosa vorreste sapere?'));chatForm.elements.question.focus({preventScroll:true});return;}
 awaiting=null;const result=answer(question);
 if(result){awaiting=result.action||null;message(result.text,'assistant',result.link,result.action?replies():[]);return;}
 const button=chatForm.querySelector('button');button.disabled=true;const pending=message(say('Un instant…','Un momento…'));
 try{const response=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question,lang:data.lang})});const result=await response.json();if(!response.ok||!result.answer)throw Error();pending.remove();awaiting='audit';const offer=say(' On en parle pendant un audit gratuit de 20 minutes ?',' Ne parliamo in un incontro gratuito di 20 minuti?');message(result.answer+offer,'assistant',null,replies());}
 catch{pending.remove();awaiting='audit';message(say('Pour vous répondre sur ce point, on peut regarder votre situation pendant un audit gratuit de 20 minutes. On choisit un créneau ?','Per rispondervi possiamo guardare il vostro caso in un incontro gratuito di 20 minuti. Scegliamo un orario?'),'assistant',null,replies());}
 finally{button.disabled=false;chatLog.scrollTop=chatLog.scrollHeight;}
}
chatForm.addEventListener('submit',event=>{event.preventDefault();const input=chatForm.elements.question,value=input.value;input.value='';sendQuestion(value);});
chatLog.addEventListener('click',event=>{const reply=event.target.closest('[data-chat-reply]');if(reply)sendQuestion(reply.dataset.chatReply);});
document.addEventListener('ostenvia-guide-tour',()=>{openChat(true);chatLog.replaceChildren();showTour(0);});
if(new URLSearchParams(location.search).get('visite')==='1'){openChat(true);chatLog.replaceChildren();showTour(0);}
addEventListener('pagehide',()=>{entryController?.dispose?.();ambientMedia.dispose();for(const demo of demos)demo.dispose();});

const rebuildMotion=mountRebuild(()=>reduced);
const experience=mountAgency(()=>reduced);
addEventListener('pagehide',()=>experience.dispose());
addEventListener('pagehide',()=>rebuildMotion.dispose(),{once:true});
