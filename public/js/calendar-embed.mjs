// The native Calendly cookie controls remain enabled inside the booking frame.
// No extra modal or local consent gate is added by Ostenvia.
export function mountCalendar(lang='fr'){
 try{localStorage.removeItem('ostenvia-privacy-v1');}catch{}
 const calendars=[...document.querySelectorAll('[data-audit-calendar]')];
 if(!calendars.length)return;
 let sdkPromise;
 function loadSDK(){
  if(window.Calendly?.initInlineWidget)return Promise.resolve(window.Calendly);
  if(sdkPromise)return sdkPromise;
  sdkPromise=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://assets.calendly.com/assets/external/widget.js';script.async=true;
   script.onload=()=>window.Calendly?.initInlineWidget?resolve(window.Calendly):reject(Error('Calendar SDK unavailable'));
   script.onerror=()=>reject(Error('Calendar could not load'));
   document.head.append(script);
  });return sdkPromise;
 }
 for(const calendar of calendars){
  const mount=calendar.querySelector('[data-calendar-mount]'),error=calendar.querySelector('[data-calendar-error]');
  calendar.setAttribute('aria-busy','true');
  loadSDK().then(sdk=>{sdk.initInlineWidget({url:calendar.dataset.url,parentElement:mount,resize:true});calendar.removeAttribute('aria-busy');}).catch(()=>{calendar.removeAttribute('aria-busy');error.hidden=false;});
 }
}
