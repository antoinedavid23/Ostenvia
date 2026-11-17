import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
const pages=JSON.parse(await fs.readFile(path.join(root,'docs/pages.json'),'utf8')),failures=[],paths=new Set(pages.map(p=>p.path));
const exists=async p=>{try{await fs.access(p);return true;}catch{return false;}};
for(const page of pages){
 const file=path.join(dist,page.path,'index.html'),html=await fs.readFile(file,'utf8');
 if((html.match(/<h1[ >]/g)||[]).length!==1)failures.push(`${page.path}: expected one h1`);
 if(!html.includes(`<html lang="${page.lang}"`))failures.push(`${page.path}: wrong language`);
 for(const needle of ['name="description"','rel="canonical"','hreflang="fr"','hreflang="it"','application/ld+json'])if(!html.includes(needle))failures.push(`${page.path}: missing ${needle}`);
 for(const m of html.matchAll(/\b(?:href|src|poster|data-src)="([^"]+)"/g)){
  const href=m[1];if(!href.startsWith('/')||href.startsWith('//'))continue;
  const target=href.split(/[?#]/)[0];
  if(target.endsWith('/')){if(!paths.has(target))failures.push(`${page.path}: unresolved page ${href}`);}
  else if(!await exists(path.join(dist,target)))failures.push(`${page.path}: missing asset ${href}`);
 }
 for(const image of html.matchAll(/<img\b[^>]*>/g))if(!/\balt="/.test(image[0]))failures.push(`${page.path}: missing image alt`);
 if(/(Lorem ipsum|TODO|undefined|\[NEED:)/.test(html))failures.push(`${page.path}: unfinished content`);
 const raw=/<script id="site-data" type="application\/json">([\s\S]*?)<\/script>/.exec(html);try{JSON.parse(raw?.[1]);}catch{failures.push(`${page.path}: invalid page data`);}
 if(page.lang==='it'&&page.key==='home'&&html.includes('Faites défiler pour entrer'))failures.push(`${page.path}: French entry label`);
}
if(pages.length!==paths.size)failures.push('Duplicate route');
const result={date:new Date().toISOString(),pages:pages.length,errors:failures};await fs.writeFile(path.join(root,'docs/static-checks.json'),JSON.stringify(result,null,2));
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log(`${pages.length} pages vérifiées : routes, ressources, titres, langues, métadonnées et données valides.`);
