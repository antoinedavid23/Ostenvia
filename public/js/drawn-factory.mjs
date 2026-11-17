import {transferPose} from './factory-transfer.mjs';
const mix=(a,b,p)=>a+(b-a)*p,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{const p=clamp(x);return p*p*(3-2*p);};
export function createFactory(host){
 const svg=host.querySelector('[data-drawn-factory]');if(!svg)return null;
 const parcel=svg.querySelector('[data-drawn-parcel]'),pdf=svg.querySelector('[data-parcel-form=pdf]'),folder=svg.querySelector('[data-parcel-form=folder]'),carrier=svg.querySelector('[data-drawn-carrier]'),previous=svg.querySelector('[data-drawn-previous]'),workers=[...svg.querySelectorAll('[data-drawn-worker]')],stations=[...svg.querySelectorAll('[data-drawn-station]')];
 let compact=false;
 const positions=[[40,48],[330,48],[620,48],[620,294],[330,294]],smallPositions=[[40,48],[330,48],[330,294],[330,540],[40,540]],workerPositions=[[74,91],[490,86],[781,80],[787,386]],smallWorkers=[[74,91],[490,86],[490,332],[490,578]];
 function layout(){compact=host.clientWidth<650;svg.dataset.layout=compact?'compact':'wide';host.closest('.atelier-drawing').dataset.factoryLayout=svg.dataset.layout;svg.setAttribute('viewBox',compact?'0 0 640 810':'0 0 1000 560');for(let i=0;i<stations.length;i++)stations[i].setAttribute('transform',`translate(${(compact?smallPositions:positions)[i].join(' ')})`);for(let i=0;i<workers.length;i++){const [x,y]=(compact?smallWorkers:workerPositions)[i];workers[i].setAttribute('x',x);workers[i].setAttribute('y',y);}for(const belt of svg.querySelectorAll('[data-drawn-belt]'))belt.setAttribute('d',compact?'M135 133H425V625H135':'M135 133H715C875 133 875 379 715 379H425');svg.querySelector('[data-drawn-ground]').setAttribute('d',compact?'M48 775H590':'M48 520H920');}
 const belts=[...svg.querySelectorAll('[data-drawn-belt]')];
 const observer=new ResizeObserver(layout);observer.observe(host);layout();
 function pointAt(t,keys){let a=keys[0],b=keys.at(-1);for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){a=keys[i-1];b=keys[i];break;}const p=ease((t-a[0])/(b[0]-a[0]));return [mix(a[1],b[1],p),mix(a[2],b[2],p)];}
 return {renderAt(t,{ambientTime=0,cycle=0}={}){
  let x=135,y=133;
  if(t>.8&&t<2.3)x=mix(135,425,ease((t-.8)/1.5));else if(t>=2.3&&t<3.1)x=425;
  else if(t>=3.1&&t<4.7)x=mix(425,715,ease((t-3.1)/1.6));
  else if(t>=4.7&&t<5.5)x=715;
  else if(t>=5.5&&t<7.3){const p=ease((t-5.5)/1.8);x=715+123*Math.sin(Math.PI*p);y=133+246*p;}
  else if(t>=7.3&&t<8.8){x=715;y=379;}
  else if(t>=8.8&&t<10.6){x=mix(715,425,ease((t-8.8)/1.8));y=379;}
  else if(t>=10.6){x=425;y=mix(379,420,ease((t-10.6)/.55));}
  if(compact)[x,y]=pointAt(t,[[0,135,133],[.8,135,133],[2.3,425,133],[3.1,425,133],[4.7,425,379],[5.5,425,379],[7.3,425,625],[8.8,425,625],[10.6,135,625],[11.45,135,667],[24,135,667]]);
  const pose=transferPose(t);let cx=425+pose.x*93.75,cy=470+(pose.z-2.83)*90;
  if(compact)[cx,cy]=pointAt(t,[[0,235,710],[8.1,235,710],[10.8,135,700],[12.4,135,700],[15.4,135,455],[17.4,135,455],[18.2,135,470],[19,135,470],[22.5,235,710],[24,235,710]]);
  const gait=pose.walking*Math.sin(ambientTime*13)*1.3;
  carrier.setAttribute('transform',`translate(${cx} ${cy-Math.abs(gait)}) rotate(${gait*.7})`);
  if(t>=11.45){x=mix(x,cx-22,pose.grip);y=mix(y,cy-29,pose.grip);x=mix(x,141,pose.deposit);y=mix(y,410,pose.deposit);}
  parcel.setAttribute('transform',`translate(${x} ${y}) scale(${t<.6?ease(t/.6):t>=16.75?mix(1,.4,pose.deposit):1})`);
  pdf.setAttribute('visibility',t<4.7?'visible':'hidden');folder.setAttribute('visibility',t>=4.7?'visible':'hidden');previous.setAttribute('visibility',cycle>0&&t<17.4?'visible':'hidden');
  for(let i=0;i<workers.length;i++)workers[i].style.transform=`translateY(${Math.sin(ambientTime*1.8+i)*1.3}px)`;
  belts[2].style.strokeDashoffset=String(-ambientTime*13);
  const stage=t<2.3?0:t<4.7?1:t<7.3?2:t<8.8?3:4;
  for(let i=0;i<stations.length;i++)stations[i].classList.toggle('is-active',i===stage);
  host.dataset.parcelPhase=t>=18.2?'archived':t>=12.05?'carrying':t>=11.45?'pickup':t>=4.7?'folder':'pdf';
 },dispose(){observer.disconnect();for(const worker of workers)worker.style.transform='';}};
}
