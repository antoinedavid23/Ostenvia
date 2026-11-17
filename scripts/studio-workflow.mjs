// The same nodes and connections get a vertical layout on narrow screens.
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={gmail:'Gmail',drive:'Google Drive',sheets:'Google Sheets',calendar:'Google Calendar',telegram:'Telegram',slack:'Slack',ai:'Ostie',ostie:'Ostie',pandadoc:'PandaDoc'};
function lines(text,limit){
 const result=[];let line='';
 for(const word of text.split(/\s+/)){if(line&&(line+' '+word).length>limit){result.push(line);line=word;}else line+=(line?' ':'')+word;}
 if(line)result.push(line);return result;
}
function toolIcon(app){
 if(app==='ai'||app==='ostie')return '<image href="/assets/mascotte.webp" x="-25" y="-31" width="50" height="60"/>';
 const asset={gmail:'gmail',drive:'drive',sheets:'sheets',slack:'slack',pandadoc:'file',telegram:'file'}[app];
 if(asset)return `<image href="/assets/apps/${asset}.svg" x="-21" y="-21" width="42" height="42"/>`;
 const shape=app==='human'?'<circle cx="0" cy="0" r="17"/><path d="m-9 0 6 7 12-14"/>':app==='calendar'?'<rect x="-17" y="-14" width="34" height="31" rx="4"/><path d="M-17-5H17M-8-19v9M8-19v9M-8 3h1M0 3h1M8 3h1M-8 10h1M0 10h1"/>':'<path d="M-12-18H5l10 10v26h-27zM5-18v10h10M-6 0H8M-6 7H8"/>';
 return `<g fill="none" stroke="#123b32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shape}</g>`;
}
export function workflowSVG(c,l,{portrait=false,positions=null,op=false}={}){
 const columns=[...new Set(c.nodes.map(n=>n.x))].sort((a,b)=>a-b),minY=Math.min(...c.nodes.map(n=>n.y)),maxY=Math.max(...c.nodes.map(n=>n.y));
 const coords=Object.fromEntries(c.nodes.map(n=>[n.id,positions?.[n.id]||(portrait?{x:minY===maxY?300:100+(n.y-minY)/(maxY-minY)*400,y:70+columns.indexOf(n.x)*175}:{x:n.x+20,y:n.y+20})]));
 const width=portrait?600:1080,height=Math.max(...Object.values(coords).map(n=>n.y))+160;
 const wires=c.edges.map((edge,i)=>{
  const a=coords[edge.from],b=coords[edge.to],sameRow=a.y===b.y,sameColumn=a.x===b.x;
  const labelHeight=86+lines(c.nodes.find(n=>n.id===edge.from).label[l],19).length*22;
  const start=a.y+labelHeight,end=b.y-38,middle=(start+end)/2,direction=Math.sign(b.x-a.x)||1;
  const d=portrait?(sameRow?`M${a.x+36*direction} ${a.y}C${a.x+65*direction} ${a.y-75},${b.x-65*direction} ${b.y-75},${b.x-36*direction} ${b.y}`:b.y<a.y?`M${a.x-36} ${a.y}C20 ${a.y},20 ${b.y},${b.x-36} ${b.y}`:`M${a.x} ${start}C${a.x} ${middle},${b.x} ${middle},${b.x} ${end}`):(sameColumn?`M${a.x} ${a.y}C${a.x+85} ${a.y},${b.x+85} ${b.y},${b.x} ${b.y}`:`M${a.x} ${a.y}C${(a.x+b.x)/2} ${a.y},${(a.x+b.x)/2} ${b.y},${b.x} ${b.y}`);
  return `<g style="--spark-delay:-${i*.31}s"><path class="workflow-conduit" d="${d}"/><path class="workflow-spark" d="${d}" pathLength="100"/></g>`;
 }).join('');
 const nodes=c.nodes.map((n,i)=>{
  const p=coords[n.id],label=lines(n.label[l],portrait?19:19),tool=n.app==='human'?(l==='fr'?'Votre accord':'La vostra approvazione'):names[n.app]||n.app;
  return `<g class="workflow-node${op?' op-node':''}" ${op?`data-op-node="${i}"`:''} data-node="${escape(n.id)}" transform="translate(${p.x} ${p.y})"><title>${escape(n.label[l])} · ${escape(tool)}</title><rect class="workflow-node-body${op?' op-node-body':''}" x="-36" y="-36" width="72" height="72" rx="18"/>${toolIcon(n.app)}<text class="workflow-label" text-anchor="middle" y="62">${label.map((line,j)=>`<tspan x="0" dy="${j?22:0}">${escape(line)}</tspan>`).join('')}</text><text class="workflow-tool" text-anchor="middle" y="${70+label.length*22}">${escape(tool)}</text></g>`;
 }).join('');
 return `<svg class="workflow-map workflow-${portrait?'portrait':'landscape'}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(c.title?.[l]||(l==='fr'?'Le parcours automatisé':'Il percorso automatico'))}"><g>${wires}</g>${nodes}</svg>`;
}
export function responsiveWorkflow(c,l){
 return `<div class="workflow-scroll workflow-fit">${workflowSVG(c,l)}${workflowSVG(c,l,{portrait:true})}</div>`;
}
