const clamp=x=>Math.max(0,Math.min(1,x));
const step=(t,a,b)=>{const p=clamp((t-a)/(b-a));return p*p*(3-2*p);};
const mix=(a,b,p)=>a+(b-a)*p;
export const FACTORY_DURATION=24;
export const FACTORY_STAGE_ENDS=[2.3,4.7,7.3,8.8,FACTORY_DURATION];

export function factoryCycle(elapsed){
 const total=Math.max(0,elapsed),cycle=Math.floor(total/FACTORY_DURATION),time=total%FACTORY_DURATION;
 return {time,cycle,stage:FACTORY_STAGE_ENDS.findIndex(end=>time<end),status:time>=20.5?'returning':time>=18.2?'archived':'processing'};
}

// Each dossier has an endpoint; its carrier walks back before the next cycle.
export function transferPose(time){
 const t=Math.max(0,Math.min(FACTORY_DURATION,time));
 let x=-.8,z=2.9,rotation=0,walking=0;
 if(t>=8.1)rotation=mix(0,1.66,step(t,8.1,9.2));
 if(t>=9.2){const p=step(t,9.2,10.8);x=mix(-.8,0,p);z=mix(2.9,2.83,p);rotation=mix(1.66,Math.PI,step(t,10.55,10.95));walking=t<10.8?Math.sin(Math.PI*clamp((t-9.2)/1.6)):0;}
 if(t>=12.05)rotation=mix(Math.PI,Math.PI*1.5,step(t,12.05,12.4));
 if(t>=12.4){const p=step(t,12.4,15.4);x=mix(0,-3.2,p);walking=t<15.4?Math.sin(Math.PI*clamp((t-12.4)/3)):0;}
 if(t>=15.4)rotation=mix(Math.PI*1.5,Math.PI,step(t,15.4,15.9));
 if(t>=15.9){z=mix(2.83,2.7,step(t,15.9,16.6));walking=t<16.6?Math.sin(Math.PI*clamp((t-15.9)/.7))*.35:0;}
 if(t>=17.4)z=mix(2.7,2.88,step(t,17.4,18.2));
 if(t>=18.2)rotation=mix(Math.PI,Math.PI/2,step(t,18.2,19));
 if(t>=19){const p=step(t,19,22.5);x=mix(-3.2,-.8,p);z=mix(2.88,2.9,p);walking=t<22.5?Math.sin(Math.PI*clamp((t-19)/3.5)):0;}
 if(t>=22.5)rotation=mix(Math.PI/2,0,step(t,22.5,23.4));
 const release=step(t,17.4,18.2);
 return {x,z,rotation,walking,reach:step(t,10.85,11.4)*(1-release),place:step(t,15.9,16.7)*(1-release),grip:step(t,11.45,12.05),deposit:step(t,16.75,17.4),complete:t>=18.2};
}
