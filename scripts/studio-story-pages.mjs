import {calculate} from '../public/js/calculator.mjs';

export const storyPath=(s,l)=>`${l==='it'?'/it/storie/':'/histoires/'}${s.founder.toLowerCase().replaceAll(' ','-')}/`;
// Display the supplied artwork unchanged, using one SVG viewport per logo.
// Order in the supplied board: property, joinery, electrical, restaurant, hotel.
export const suppliedClientLogos={
 claire:{viewBox:'43 38 95 108',ratio:95/108},
 marc:{viewBox:'198 45 127 100',ratio:127/100},
 samir:{viewBox:'370 45 211 78',ratio:211/78},
 sarah:{viewBox:'20 223 144 124',ratio:144/124},
 luca:{viewBox:'208 226 108 125',ratio:108/125}
};
export const storyLogo=(s,esc,l='fr',{showSector=true}={})=>{
 const logo=suppliedClientLogos[s.id];
 return `<div class="st-sector-identity"><svg class="st-company-logo st-company-logo-user" data-client-logo="${s.id}" viewBox="${logo.viewBox}" width="${Math.round(logo.ratio*70)}" height="70" style="--client-logo-ratio:${logo.ratio}" role="img" aria-label="${esc(s.company)}"><defs><filter id="client-cutout-${s.id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 -100 -100 -100 0 280" result="cutout"/><feComposite in="cutout" in2="SourceAlpha" operator="in"/></filter></defs><image href="/assets/stories/logos/logos-fournis-v10.png" width="599" height="360" filter="url(#client-cutout-${s.id})"/></svg><div class="st-company-reading"><span class="st-company-name">${esc(s.company)}</span>${showSector?`<small>${esc(s[l].sector)}</small>`:''}</div></div>`;
};

// Modelling assumptions for fictional teams, never measured customer results.
export const storyAssumptions={
 claire:{people:6,hours:2,days:26,rate:13},
 samir:{people:4,hours:2.5,days:22,rate:13},
 marc:{people:3,hours:3.5,days:22,rate:13},
 sarah:{people:4,hours:1.5,days:26,rate:13},
 luca:{people:8,hours:4,days:30,rate:13}
};

const consequences={
 claire:['Un rappel mieux préparé','Les conseillers retrouvent le bien, les échanges et les disponibilités sur une même fiche. Ils peuvent parler du projet dès le premier appel.'],
 samir:['Moins d’interruptions sur le terrain','Le bureau organise les interventions à partir d’une demande complète. Les techniciens retrouvent l’adresse, le besoin et les pièces utiles dans leur agenda. Les urgences sont signalées à la bonne personne.'],
 marc:['Les détails du chantier restent dans le dossier','Marc consacre sa relecture aux choix de fabrication, au prix et aux conditions. Il retrouve les notes et photos sans recommencer la recherche.'],
 sarah:['Une préparation plus calme avant le service','Les factures et les doublons à examiner sont réunis. Sarah garde la validation et le paiement, avec une liste claire à partager avec son comptable.'],
 luca:['Un investissement plus facile à préparer','Les pièces, les sources des aides et les échéances sont réunies. Luca peut comparer les pistes et préciser son projet avant de s’engager.']
};
const consequencesIt={
 claire:['Una chiamata meglio preparata','I consulenti trovano immobile, scambi e disponibilità nella stessa scheda. Possono parlare del progetto già dalla prima chiamata.'],
 samir:['Meno interruzioni sul campo','L’ufficio organizza gli interventi da una richiesta completa. I tecnici trovano indirizzo, esigenza e documenti in agenda. Le urgenze vengono segnalate alla persona giusta.'],
 marc:['I dettagli restano nella pratica','Marc dedica la revisione a lavorazione, prezzo e condizioni. Ritrova appunti e foto senza ricominciare la ricerca.'],
 sarah:['Più calma prima del servizio','Fatture e duplicati da controllare sono riuniti. Sarah mantiene approvazione e pagamento con un elenco chiaro da condividere con il commercialista.'],
 luca:['Un investimento più semplice da preparare','Documenti, fonti e scadenze sono riuniti. Luca può confrontare le opportunità e precisare il progetto prima di impegnarsi.']
};
const roles={claire:['Directrice d’agence immobilière','Direttrice di agenzia immobiliare'],samir:['Dirigeant d’entreprise électrique','Titolare di impresa elettrica'],marc:['Menuisier agenceur','Falegname arredatore'],sarah:['Restauratrice','Ristoratrice'],luca:['Hôtelier indépendant','Albergatore indipendente']};

export function storyPage(s,l,{loc,esc,primary,route,cases,demo}){
 const t=s[l],it=l==='it',nf=new Intl.NumberFormat(it?'it-IT':'fr-FR',{maximumFractionDigits:1}),assumptions=storyAssumptions[s.id],results=calculate(assumptions),c=cases.find(c=>c.id===s.system);
 const [outcome,detail]=(it?consequencesIt:consequences)[s.id];
 const time=Number.isInteger(assumptions.hours)?`${assumptions.hours} h`:`${Math.floor(assumptions.hours)} h 30`;
 const metric=(value,unit,label)=>`<div><strong>${nf.format(value)}<span class="story-metric-unit">${unit}</span></strong><span>${label}</span></div>`;
 return `<section class="story-page-hero st-shell">
  <div class="story-topline"><a class="st-secondary story-back" href="${loc(l,'/#nos-realisations','/it/#nos-realisations')}"><span aria-hidden="true">←</span>${loc(l,'Retour aux histoires','Torna alle storie')}</a></div>
  <div class="story-page-intro"><figure><img src="${s.image}" width="600" height="650" alt="${esc(s.founder)}, ${loc(l,'portrait illustratif','ritratto illustrativo')}"></figure><div>${storyLogo(s,esc,l)}<p class="story-page-person">${esc(s.founder)} · ${esc(roles[s.id][it?1:0])}</p><h1>${esc(t.title)}</h1><p>${esc(t.context)}</p></div></div>
 </section>
 <section class="story-chapters st-shell"><article><span>01</span><div><h2>${loc(l,'Ce qu’il fallait simplifier.','Cosa semplificare.')}</h2><p>${esc(t.need)}</p></div></article><article><span>02</span><div><h2>${loc(l,'Le système, concrètement.','Il sistema, in pratica.')}</h2><p>${esc(t.work)}</p></div></article></section>
 <section class="story-workflow st-shell" data-native-workflow data-lang="${l}" aria-label="${loc(l,'Le workflow utilisé dans ce scénario','Il workflow di questo scenario')}">${demo(c,l,{workflowOnly:true})}</section>
 <section class="story-estimate"><div class="st-shell"><header><h2>${loc(l,'Du temps retrouvé,<br><em>à l’échelle de l’équipe.</em>','Tempo recuperato,<br><em>per tutta la squadra.</em>')}</h2><p class="story-estimate-base">${loc(l,'Projection d’équipe','Proiezione di squadra')}<br><strong>${assumptions.people} ${loc(l,'salariés','collaboratori')} × ${time} / ${loc(l,'jour','giorno')}</strong><br>${assumptions.days} ${loc(l,'jours / mois','giorni / mese')} · ${assumptions.rate} € ${loc(l,'brut / heure','lordi / ora')}</p></header>
  <div class="story-metrics">${metric(results.monthlyHours,'h',loc(l,'de temps libéré / mois','di tempo liberato / mese'))}${metric(results.monthlyValue,'€',loc(l,'de valeur brute du temps libéré (estimation) / mois','di valore lordo del tempo liberato (stima) / mese'))}${metric(results.yearlyHours,'h',loc(l,'de temps libéré / an','di tempo liberato / anno'))}${metric(results.yearlyValue,'€',loc(l,'de valeur brute du temps libéré (estimation) / an','di valore lordo del tempo liberato (stima) / anno'))}</div>
  <p class="story-assumptions">${loc(l,'Simulation sur l’ensemble des tâches répétitives de l’équipe ; le workflow montre l’un des circuits. Projection annuelle à activité constante, hors charges. Le temps valorisé ne correspond pas à une économie de trésorerie garantie.','Simulazione sull’insieme delle attività ripetitive del team; il workflow mostra uno dei circuiti. Proiezione annuale ad attività costante, esclusi gli oneri. Il tempo valorizzato non equivale a un risparmio di cassa garantito.')}</p>
 </div></section>
 <section class="story-outcome st-shell"><div><h2>${esc(outcome)}</h2><p>${esc(detail)}</p><p>${esc(t.result)}</p></div><blockquote>« ${esc(t.quote)} »<cite>${esc(s.founder)} · ${esc(t.sector)}</cite></blockquote></section>

 <section class="story-page-end st-shell"><h2>${loc(l,'Et dans<br><em>votre entreprise ?</em>','E nella<br><em>vostra impresa?</em>')}</h2>${primary(loc(l,'Réserver un audit de 20 min','Prenota un incontro di 20 min'),route('audit',l))}</section>`;
}
