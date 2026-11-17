// Static-site middleware only. The separately routed /api/* Worker is unchanged.
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(['ostenvia.com','www.ostenvia.com'].includes(url.hostname)&&(url.protocol!=='https:'||url.hostname==='www.ostenvia.com')){
   url.protocol='https:';url.hostname='ostenvia.com';url.port='';
   return new Response(null,{status:308,headers:{location:url.href,'cache-control':'public, max-age=3600'}});
  }
  const simulatorHome={'/simulateur':'/','/simulateur/':'/','/it/simulatore':'/it/','/it/simulatore/':'/it/'}[url.pathname];
  if(simulatorHome){
   url.pathname=simulatorHome;url.hash='simulateur';
   return new Response(null,{status:308,headers:{location:url.href,'cache-control':'public, max-age=3600'}});
  }
  return env.ASSETS.fetch(request);
 }
};
