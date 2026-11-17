import {workflowSVG} from './studio-workflow.mjs';
export function operationsDemo(l,{loc,esc}){
 const nodes=[
 ['gmail',95,100,'Une demande arrive','Arriva una richiesta'],['ostie',300,100,'Lire les informations','Leggere le informazioni'],['sheets',505,100,'Retrouver le client','Ritrovare il cliente'],['sheets',710,100,'Écarter les doublons','Escludere i duplicati'],['ostie',915,100,'Organiser la suite','Organizzare il seguito'],
 ['gmail',300,330,'Demander les précisions','Chiedere i dettagli'],['sheets',505,330,'Créer le suivi','Creare il registro'],['drive',710,330,'Classer les pièces','Archiviare i documenti'],['gmail',915,330,'Répondre au client','Rispondere al cliente'],['slack',710,540,'Notifier l’équipe','Avvisare il team']
 ];
 const paths=[
  'M131 100H264','M336 100H469','M541 100H674','M746 100H879',
  'M264 100C180 100 180 330 264 330','M336 330C430 330 430 100 336 100',
  'M951 100C1080 100 1080 190 990 220C800 220 620 220 541 330',
  'M951 100C1080 100 1080 190 990 220C880 220 790 240 746 330',
  'M951 100C1080 100 1080 190 990 220C970 250 990 300 951 330',
  'M541 330C621 330 594 540 674 540',
  'M746 330C826 330 826 540 746 540',
  'M951 330C1060 330 1060 540 746 540'
 ];
 const mobileCase={title:{fr:'De la demande client au suivi, automatiquement.',it:'Dalla richiesta al registro, in automatico.'},nodes:nodes.map(([app,x,y,fr,it],i)=>({id:String(i),app,x,y,label:{fr,it}})),edges:[[0,1],[1,2],[2,3],[3,4],[1,5],[5,1],[4,6],[4,7],[4,8],[6,9],[7,9],[8,9]].map(([from,to])=>({from:String(from),to:String(to)}))};
 const mobilePositions=Object.fromEntries([[300,70],[300,235],[430,410],[430,580],[300,755],[100,410],[100,950],[300,950],[500,950],[300,1140]].map(([x,y],i)=>[String(i),{x,y}]));
 const wire=(d,i)=>`<g class="op-wire is-route" style="--spark-delay:-${i*.31}s"><path class="op-conduit" d="${d}"/><path class="op-spark" d="${d}" pathLength="100"/></g>`;
 return `<div class="op-demo op-simple op-autonomous" data-ops-flow><div class="op-viewport" tabindex="0" aria-label="${loc(l,'Exemple automatisé : réception, analyse, contrôle des doublons, réponse, classement et notification.','Esempio automatico: ricezione, analisi, controllo duplicati, risposta, archiviazione e notifica.')}"><svg class="op-map" viewBox="0 0 1090 635" role="img" aria-label="${loc(l,'Une demande Gmail est lue par Ostie, rapprochée du registre Google Sheets puis répartie automatiquement entre réponse Gmail, dossier Google Drive et suivi. Les précisions manquantes sont demandées par e-mail. Slack avertit l’équipe.','Ostie legge una richiesta Gmail e la confronta con Google Sheets. Risposta Gmail, cartella Google Drive e registro vengono preparati automaticamente. I dettagli mancanti vengono richiesti via e-mail. Slack avvisa il team.')}"><g class="op-wires">${paths.map(wire).join('')}</g>${nodes.map(([app,x,y,fr,it],i)=>`<g class="op-node is-route" data-op-node="${i}" transform="translate(${x} ${y})"><rect class="op-node-body" x="-36" y="-36" width="72" height="72" rx="17"/><image href="${app==='ostie'?'/assets/mascotte.webp':`/assets/apps/${app}.svg`}" x="${app==='ostie'?-25:-21}" y="${app==='ostie'?-31:-21}" width="${app==='ostie'?50:42}" height="${app==='ostie'?60:42}"/><text y="65" text-anchor="middle">${esc(l==='fr'?fr:it)}</text><text class="op-app-name" y="86" text-anchor="middle">${({gmail:'Gmail',ostie:'Ostie',sheets:'Google Sheets',drive:'Google Drive',slack:'Slack'})[app]}</text></g>`).join('')}</svg>${workflowSVG(mobileCase,l,{portrait:true,positions:mobilePositions,op:true})}</div></div>`;
}
