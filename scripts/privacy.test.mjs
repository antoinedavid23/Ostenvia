import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {sixMonthsFrom,readMotion,saveMotion} from '../public/js/privacy-state.mjs';
import {securityHeaders} from '../src/security-headers.mjs';
import site from '../src/site-worker.mjs';
import {handleChat,handleContact} from '../src/worker.mjs';
const now=1794481200000;
function memory(){const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};}
test('six-month validity uses calendar months, including short months',()=>{
 assert.equal(new Date(sixMonthsFrom(Date.parse('2026-08-31T12:00:00Z'))).toISOString(),'2027-02-28T12:00:00.000Z');
 assert.equal(new Date(sixMonthsFrom(Date.parse('2026-05-01T12:00:00Z'))).toISOString(),'2026-11-01T12:00:00.000Z');
});
test('motion storage expires and ignores legacy indefinite values',()=>{
 const store=memory();assert.equal(readMotion(store,now),null);store.setItem('ostenvia-motion','reduce');assert.equal(readMotion(store,now),null);saveMotion(store,true,now);assert.equal(readMotion(store,now),'reduce');assert.equal(readMotion(store,sixMonthsFrom(now)),null);
});
test('HTTP and www redirect to the canonical HTTPS URL without dropping path or query',async()=>{
 for(const url of ['http://ostenvia.com/audit/?x=1','https://www.ostenvia.com/audit/?x=1']){const response=await site.fetch(new Request(url),{ASSETS:{fetch(){throw Error('Should redirect before assets');}}});assert.equal(response.status,308);assert.equal(response.headers.get('location'),'https://ostenvia.com/audit/?x=1');}
 const response=await site.fetch(new Request('https://ostenvia.com/absent/'),{ASSETS:{fetch:()=>new Response('missing',{status:404})}});assert.equal(response.status,404);
});
test('CSP restricts execution and embedding; preview has no HTTPS upgrade',()=>{
 const headers=securityHeaders();assert.match(headers['Content-Security-Policy'],/object-src 'none'/);assert.match(headers['Content-Security-Policy'],/frame-ancestors 'self'/);assert.equal(headers['Strict-Transport-Security'],'max-age=31536000');assert.doesNotMatch(headers['Content-Security-Policy'].split('script-src ')[1].split(';')[0],/unsafe-inline|unsafe-eval/);assert.doesNotMatch(securityHeaders({development:true})['Content-Security-Policy'],/upgrade-insecure/);
});
test('every generated page links to legal information and no eager third-party script or iframe in generated HTML',async()=>{
 const pages=JSON.parse(await fs.readFile(new URL('../docs/pages.json',import.meta.url),'utf8'));
 for(const page of pages){const html=await fs.readFile(new URL('../dist'+page.path+'index.html',import.meta.url),'utf8');assert.match(html,/href="\/(?:it\/cookie|cookies)\/"/);assert.doesNotMatch(html,/<dialog\b/);assert.doesNotMatch(html,/<script[^>]+src="https?:/);assert.doesNotMatch(html,/<iframe\b/);}
});
test('collection notices and simulation assumptions are visible in both languages',async()=>{
 for(const [contact,audit,story] of [['/contact/','/audit/','/histoires/claire-roussel/'],['/it/contatti/','/it/primo-incontro/','/it/storie/claire-roussel/']]){
  const read=path=>fs.readFile(new URL('../dist'+path+'index.html',import.meta.url),'utf8');assert.match(await read(contact),/12 mois|12 mesi/);assert.match(await read(audit),/data-calendar-mount/);assert.match(await read(story),/story-assumptions/);
 }
 const app=await fs.readFile(new URL('../public/js/app.js',import.meta.url),'utf8');assert.doesNotMatch(app,/history:|chatHistory/);assert.match(app,/JSON.stringify\(\{question,lang:data.lang\}\)/);
});
test('API validation rejects cross-site, malformed and excessive chat input before calling AI',async()=>{
 let calls=0;const env={AI:{run:()=>{calls++;throw Error();}}};
 const make=(body,origin='https://ostenvia.com')=>new Request('https://ostenvia.com/api/chat',{method:'POST',headers:{origin,'content-type':'application/json'},body});
 assert.equal((await handleChat(make('{}','https://other.example'),env)).status,403);assert.equal((await handleChat(make('{'),env)).status,400);assert.equal((await handleChat(make(JSON.stringify({question:'x'.repeat(601)})),env)).status,400);assert.equal(calls,0);
});
test('invalid contact input never sends mail',async()=>{
 let sent=0;const response=await handleContact(new Request('https://ostenvia.com/api/contact',{method:'POST',headers:{origin:'https://ostenvia.com','content-type':'application/json'},body:JSON.stringify({email:'invalid',message:'x'})}),{EMAIL:{send(){sent++;}}});assert.equal(response.status,400);assert.equal(sent,0);
});

test('Calendly uses native cookie controls and never hides its consent interface',async()=>{
 const source=await fs.readFile(new URL('../public/js/calendar-embed.mjs',import.meta.url),'utf8');assert.match(source,/if\(!calendars.length\)return/);assert.match(source,/Calendly\.initInlineWidget|sdk.initInlineWidget/);assert.doesNotMatch(source,/showModal|data-calendar-allow|readReceipt/);
 for(const route of ['/audit/','/it/primo-incontro/']){const html=await fs.readFile(new URL('../dist'+route+'index.html',import.meta.url),'utf8');assert.doesNotMatch(html,/hide_gdpr_banner|hide_cookie_banner|data-calendar-gate/);assert.match(html,/audit-email-alternative/);assert.ok(html.includes('href="'+(route==='/audit/'?'/contact/':'/it/contatti/')+'"'));}
});
test('old simulator URLs redirect to the calculator on the corresponding homepage',async()=>{
 for(const [path,expected] of [['/simulateur/','/?source=old#simulateur'],['/it/simulatore/','/it/?source=old#simulateur']]){
  const response=await site.fetch(new Request('https://ostenvia.com'+path+'?source=old'),{ASSETS:{fetch(){throw Error('Should redirect before assets');}}});assert.equal(response.status,308);assert.equal(response.headers.get('location'),'https://ostenvia.com'+expected);
 }
});
test('removed sections leave no generated page, sitemap entry or internal link',async()=>{
 const pages=JSON.parse(await fs.readFile(new URL('../docs/pages.json',import.meta.url),'utf8'));assert.ok(!pages.some(p=>p.key==='resources'||p.key==='simulator'));
 const sitemap=await fs.readFile(new URL('../dist/sitemap.xml',import.meta.url),'utf8');assert.doesNotMatch(sitemap,/\/ressources\/|\/it\/risorse\/|\/simulateur\/|\/it\/simulatore\//);
 for(const page of pages){const html=await fs.readFile(new URL('../dist'+page.path+'index.html',import.meta.url),'utf8');assert.doesNotMatch(html,/href="\/(?:ressources|it\/risorse|simulateur|it\/simulatore)\//);}
 const home=await fs.readFile(new URL('../dist/index.html',import.meta.url),'utf8');assert.match(home,/id="simulateur"/);assert.match(home,/href="\/#simulateur"/);
});
