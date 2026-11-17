import {createStudioRevision} from './studio-revision.mjs';
import {compactSimulator,processWheel,reassuranceFaq} from './studio-v6.mjs';

export function createStudioHome({loc,esc,primary,textLink,route,cases,casePath,localizeEntry,faq}){
 const helpers={loc,esc,primary,textLink,route,cases,casePath};
 const revision=createStudioRevision(helpers);
 const simulator=l=>`<section class="st-home-simulator" id="simulateur"><header class="st-section-heading st-shell"><h2>${loc(l,'Simulateur<br><em>du temps gagné.</em>','Simulatore<br><em>del tempo risparmiato.</em>')}</h2></header>${compactSimulator(l)}</section>`;
 return l=>revision.hero(l,localizeEntry)+simulator(l)+revision.services(l)+revision.stories(l)+revision.projects(l)+processWheel(l,helpers)+reassuranceFaq(l,faq);
}
