import {calculate,calculateProductivity} from '../public/js/calculator.mjs';

export function studioCalculator(l='fr'){
 const it=l==='it',s=(fr,italian)=>it?italian:fr;
 const assumptions={people:6,hours:2,days:22,rate:13,workingHours:8};
 const totals={...calculate(assumptions),...calculateProductivity(assumptions)};
 const nf=new Intl.NumberFormat(it?'it-IT':'fr-FR',{maximumFractionDigits:1});
 const fields=[
  ['people',s('Salariés concernés','Collaboratori coinvolti'),'6','0','249','1','',s('De 0 à 249 personnes','Da 0 a 249 persone')],
  ['hours',s('Temps gagné par salarié / jour','Tempo guadagnato per persona / giorno'),'2','0','8','0.5','h',s('De 0 à 8 h, par pas de 30 min','Da 0 a 8 ore, a intervalli di 30 min')],
  ['rate',s('Salaire brut / heure','Retribuzione lorda / ora'),'13','0','','0.01','€',s('La moyenne de votre équipe','La media del vostro team')],
  ['days',s('Jours travaillés / mois','Giorni lavorati / mese'),'22','1','31','1',s('jours','giorni'),s('Adaptez la base à votre activité','Adattate la base alla vostra attività')],
  ['workingHours',s('Heures travaillées / jour','Ore lavorate / giorno'),'8','0.5','24','0.5','h',s('La durée habituelle d’une journée','La durata abituale di una giornata')]
 ];
 const inputs=fields.map(([name,label,value,min,max,step,unit,help])=>`<label for="calc-${name}"><span class="calc-field-copy"><span>${label}</span><small id="calc-${name}-help">${help}</small></span><span class="calc-input-value"><input id="calc-${name}" name="${name}" type="number" min="${min}" ${max?`max="${max}"`:''} step="${step}" value="${value}" ${name==='rate'?`placeholder="${s('Ex. 20','Es. 20')}"`:'required'} inputmode="${step==='1'?'numeric':'decimal'}" aria-describedby="calc-${name}-help calc-error"><span>${unit}</span></span></label>`).join('');
 const productivity=`<section class="calc-productivity" aria-labelledby="calc-productivity-title">
  <h3 id="calc-productivity-title">${s('Votre gain de productivité','Il vostro guadagno di produttività')}</h3>
  <div class="calc-productivity-main">
   <div class="calc-productivity-gauge" data-productivity-gauge style="--progress:${totals.productivityPercent}">
    <svg viewBox="0 0 160 160" aria-hidden="true" focusable="false"><circle class="calc-gauge-track" cx="80" cy="80" r="70"/><circle class="calc-gauge-fill" cx="80" cy="80" r="70" pathLength="100" transform="rotate(-90 80 80)"/></svg>
    <div class="calc-productivity-percent"><strong><output data-result="productivityPercent">${nf.format(totals.productivityPercent)}</output><span> %</span></strong><span>${s('de temps libéré','di tempo liberato')}</span></div>
   </div>
   <p class="calc-productivity-days"><strong><output data-result="monthlyDays">${nf.format(totals.monthlyDays)}</output></strong><span>${s('journées libérées par mois','giornate liberate al mese')}</span><small>${s('pour les salariés concernés','per le persone coinvolte')}</small></p>
  </div>
  <details class="calc-productivity-details"><summary>${s('Comprendre le calcul','Come funziona il calcolo')}</summary><p>${s('Temps gagné par salarié ÷ heures travaillées par jour × 100. Ce pourcentage représente du temps disponible pour d’autres tâches.','Tempo guadagnato per persona ÷ ore lavorate al giorno × 100. Questa percentuale rappresenta il tempo disponibile per altre attività.')}</p></details>
 </section>`;
 const periods=[['monthly',s('Par mois','Al mese')],['yearly',s('Par an','All’anno')]].map(([period,title])=>`<section class="calc-result-period"><h3>${title}</h3><div class="calc-metric"><strong><output data-result="${period}Hours">${nf.format(totals[period+'Hours'])}</output><span> h</span></strong><span>${s('Temps gagné','Tempo guadagnato')}</span></div><div class="calc-metric calc-money"><strong><output data-result="${period}Value">${nf.format(totals[period+'Value'])} €</output></strong><span title="${s('Valeur estimée au salaire brut saisi, hors charges.','Valore stimato alla retribuzione lorda indicata, esclusi gli oneri.')}">${s('Valeur de ce temps','Valore di questo tempo')}</span></div></section>`).join('');
 return `<section class="calculator st-quick-calculator st-calculator-v8 st-shell" aria-label="${s('Simulateur du temps gagné','Simulatore del tempo risparmiato')}"><form novalidate><div class="calc-inputs">${inputs}</div><p class="calc-error" id="calc-error" role="alert" hidden>${s('Vérifiez les valeurs saisies. Le temps gagné ne peut pas dépasser les heures travaillées par jour.','Verificate i valori inseriti. Il tempo guadagnato non può superare le ore lavorate al giorno.')}</p></form><div class="calc-results-v8" aria-live="polite" aria-atomic="true">${productivity}${periods}</div><p class="calc-legal-note">${s('Estimation selon vos réglages. Valeur calculée au salaire brut saisi, sur douze mois identiques. Hors charges et coût du projet ; aucune économie de trésorerie garantie.','Stima secondo le vostre ipotesi. Valore calcolato alla retribuzione lorda indicata, su dodici mesi identici. Esclusi oneri e costo del progetto; nessun risparmio di cassa garantito.')}</p></section>`;
}
