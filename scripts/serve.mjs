import http from 'node:http';
import {securityHeaders} from '../src/security-headers.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {handleContact,handleChat} from '../src/worker.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const port=Number(process.env.PORT||8092);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.json':'application/json'};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,`http://127.0.0.1:${port}`);
  if(['/api/contact','/api/chat'].includes(url.pathname)){
   const chunks=[];for await(const c of req)chunks.push(c);
   const request=new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks),duplex:'half'}:{})});
   const response=await (url.pathname==='/api/chat'?handleChat:handleContact)(request,{});
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  let status=200;
  try{if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');}catch{file=path.join(root,'404.html');status=404;}
  const data=await fs.readFile(file);
  const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
  if(status===200&&range){const start=Number(range[1]),end=Math.min(Number(range[2]||data.length-1),data.length-1);if(start>end||start>=data.length){res.writeHead(416,{'content-range':`bytes */${data.length}`});res.end();return;}res.writeHead(206,{'content-type':mime[path.extname(file)]||'application/octet-stream','content-range':`bytes ${start}-${end}/${data.length}`,'accept-ranges':'bytes','content-length':end-start+1,'cache-control':'no-store'});res.end(req.method==='HEAD'?undefined:data.subarray(start,end+1));return;}
  res.writeHead(status,{...securityHeaders({development:true}),'content-type':mime[path.extname(file)]||'application/octet-stream','content-length':data.length,'cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow'});
  res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(500);res.end('Prévisualisation momentanément indisponible');}
}).listen(port,'127.0.0.1',()=>console.log(`Ostenvia Studio · http://127.0.0.1:${port}/`));
