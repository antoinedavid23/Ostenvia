// The only long-lived local preference is an explicit animation setting.
export function sixMonthsFrom(now){
 const date=new Date(now),day=date.getUTCDate();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+6);
 const lastDay=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(day,lastDay));return date.getTime();
}
export function readMotion(storage,now=Date.now()){
 try{const raw=storage.getItem('ostenvia-motion');if(!raw)return null;const r=JSON.parse(raw);return ['reduce','full'].includes(r.value)&&r.expiresAt>now&&r.expiresAt<=sixMonthsFrom(now)?r.value:null;}catch{return null;}
}
export function saveMotion(storage,value,now=Date.now()){
 try{storage.setItem('ostenvia-motion',JSON.stringify({value:value?'reduce':'full',expiresAt:sixMonthsFrom(now)}));}catch{}
}
