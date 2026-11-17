export function guideIntent(message,awaiting=null){
 const text=String(message).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[’']/g,' ').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
 const refusal=/\b(non|pas maintenant|plus tard|pas encore|non ora|piu tardi)\b/.test(text);
 if(refusal)return 'decline';
 const question=text!=='pourquoi pas'&&/\b(mais|avant|combien|comment|pourquoi|quand|pero|prima|quanto|come|perche)\b/.test(text);
 const negative=text!=='pourquoi pas'&&/\b(pas|jamais|non|no|mai|not)\b/.test(text);
 if(negative&&!question&&/\b(reserv\w*|audit|appunt\w*|prenot\w*)\b/.test(text))return 'decline';
 const yes=/^(oui|ouais|ok|okay|d accord|volontiers|bien sur|pourquoi pas|si|certo|va bene)\b/.test(text);
 if(yes&&!question&&!negative&&awaiting)return {audit:'book','tour-start':'tour','tour-next':'next'}[awaiting]||'answer';
 if(!question&&!negative&&/\b(reserv\w*|prends? rendez vous|prendre rendez vous|prenot\w*)\b/.test(text))return 'book';
 if(!question&&/\b(visite|visiter|tour|visita|visitare)\b/.test(text))return 'tour';
 if(/^(j ai une question|ho una domanda)$/.test(text))return 'ask';
 return 'answer';
}
