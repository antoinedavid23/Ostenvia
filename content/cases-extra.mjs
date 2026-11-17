const b=(fr,it)=>({fr,it});
const n=(id,app,x,y,fr,it)=>({id,app,x,y,label:b(fr,it)});
const e=(from,to,fr='',it='')=>({from,to,label:b(fr,it)});
const modules=['reception','analyse','transformation','redirection','livraison'];
const stages=rows=>rows.map(([fr,it,detailFr,detailIt],i)=>({module:modules[i],title:b(fr,it),detail:b(detailFr,detailIt)}));
const toolNames={gmail:'Gmail',drive:'Google Drive',sheets:'Google Sheets',calendar:'Google Calendar',telegram:'Telegram',slack:'Slack',ai:'Agent IA',human:'Validation humaine'};
const tools=(...ids)=>ids.map(id=>({id,label:toolNames[id]}));

export const extraCases=[
  {
    id:'crm-enrichment',slug:b('enrichissement-fiches-prospects','arricchimento-schede-contatti'),
    title:b('Un contact devient un dossier préparé.','Un contatto diventa una scheda pronta.'),
    category:b('Prospection et CRM','Contatti e CRM'),
    summary:b('Le site d’une entreprise apporte du contexte à sa fiche. Les informations incertaines attendent une vérification.','Il sito dell’impresa arricchisce la scheda. I dati incerti aspettano una verifica.'),
    source:{url:'https://n8n.io/workflows/20950-enrich-outbound-leads-in-google-sheets-with-firecrawl-hunter-and-gpt-56/',author:'Mina Saad',title:'Enrich outbound leads in Google Sheets with Firecrawl, Hunter, and GPT-5.6'},
    input:b('Une entreprise et son adresse de site.','Un’impresa e il suo sito.'),
    output:b('Une fiche sourcée et un résumé commercial.','Una scheda con fonti e sintesi commerciale.'),
    check:b('Les données absentes restent à confirmer.','I dati assenti restano da confermare.'),
    tools:tools('sheets','ai','human','gmail'),
    nodes:[
      n('contact','sheets',80,160,'Contact à compléter','Contatto da completare'),n('domain','ai',255,160,'Retrouver le site','Trovare il sito'),
      n('research','ai',435,80,'Lire les sources','Leggere le fonti'),n('missing','human',435,255,'Source absente','Fonte assente'),
      n('structure','ai',610,80,'Préparer la fiche','Preparare la scheda'),n('verify','human',775,80,'Vérifier les faits','Verificare i dati'),
      n('review','human',775,255,'Précision nécessaire','Serve un chiarimento'),n('crm','sheets',940,80,'Actualiser le suivi','Aggiornare il registro'),
      n('brief','gmail',940,255,'Résumé pour l’équipe','Sintesi per il team')
    ],
    edges:[e('contact','domain'),e('domain','research', 'Site trouvé','Sito trovato'),e('domain','missing','À confirmer','Da confermare'),e('research','structure'),e('structure','verify'),e('verify','review','Doute','Dubbio'),e('verify','crm','Confirmé','Confermato'),e('review','crm','Après correction','Dopo la correzione'),e('crm','brief')],
    stageNodeIds:[['contact'],['domain','research'],['structure'],['verify','review','missing'],['crm','brief']],
    stages:stages([
      ['Recevoir le contact','Ricevere il contatto','La fiche d’exemple entre.','Entra la scheda d’esempio.'],
      ['Consulter les sources','Consultare le fonti','Le site fournit le contexte.','Il sito fornisce il contesto.'],
      ['Organiser les informations','Ordinare i dati','Les faits rejoignent leurs champs.','I fatti compilano i campi.'],
      ['Garder les incertitudes visibles','Segnalare le incertezze','Les points douteux attendent.','I dati dubbi aspettano.'],
      ['Préparer le rendez-vous','Preparare l’incontro','La fiche rejoint le suivi.','La scheda aggiorna il registro.']
    ]),
    demo:{fr:{Entreprise:'Atelier Démo',Site:'atelier-demo.example',État:'Fiche incomplète'},it:{Impresa:'Laboratorio Demo',Sito:'laboratorio-demo.example',Stato:'Scheda incompleta'}},
    outcome:b('La fiche fictive rassemble le contexte utile avant l’échange.','La scheda fittizia raccoglie il contesto utile all’incontro.'),
    limitation:b('Recherche simulée sur des sources d’exemple. Un contrôle humain est ajouté avant la mise à jour de la fiche. Aucun contact n’est recherché ni sollicité.','Ricerca simulata su fonti d’esempio. Una verifica umana è aggiunta prima di aggiornare la scheda. Nessun contatto viene cercato o sollecitato.')
  },
  {
    id:'support-triage',slug:b('tri-assistance-clients','smistamento-assistenza-clienti'),
    title:b('Chaque message trouve le bon interlocuteur.','Ogni messaggio trova il referente giusto.'),
    category:b('Assistance clients','Assistenza clienti'),
    summary:b('Les demandes sont classées. Une réponse se prépare à partir de votre FAQ et attend votre relecture.','Le richieste vengono classificate. La risposta segue le FAQ e aspetta la vostra revisione.'),
    source:{url:'https://n8n.io/workflows/18047-triage-support-emails-and-draft-ai-replies-with-gmail-google-sheets-and-openai/',author:'Ziad Karim',title:'Triage support emails and draft AI replies with Gmail, Google Sheets and OpenAI'},
    input:b('Un message et une FAQ d’entreprise.','Un messaggio e le FAQ aziendali.'),
    output:b('Un ticket suivi et une réponse à relire.','Una richiesta registrata e una risposta da rileggere.'),
    check:b('Vous validez le brouillon avant l’envoi.','Approvate la bozza prima dell’invio.'),
    tools:tools('gmail','drive','ai','sheets','slack','human'),
    nodes:[
      n('email','gmail',80,85,'Message reçu','Messaggio ricevuto'),n('faq','drive',80,255,'Votre FAQ','Le vostre FAQ'),
      n('classify','ai',275,85,'Classer la demande','Classificare la richiesta'),n('ticket','sheets',470,85,'Ouvrir le suivi','Aprire la pratica'),
      n('urgent','slack',470,255,'Alerter le responsable','Avvisare il referente'),n('draft','ai',665,85,'Préparer une réponse','Preparare la risposta'),
      n('approve','human',855,85,'Votre relecture','La vostra revisione'),n('ready','gmail',855,255,'Brouillon disponible','Bozza disponibile')
    ],
    edges:[e('email','classify'),e('classify','ticket'),e('classify','urgent','Urgent','Urgente'),e('ticket','draft'),e('faq','draft'),e('draft','approve'),e('urgent','approve'),e('approve','ready')],
    stageNodeIds:[['email','faq'],['classify'],['ticket','draft'],['urgent','approve'],['ready']],
    stages:stages([
      ['Recevoir le message','Ricevere il messaggio','La demande rejoint le circuit.','La richiesta entra nel flusso.'],
      ['Repérer le sujet','Individuare il tema','Le contexte détermine le classement.','Il contesto determina la categoria.'],
      ['Préparer le brouillon','Preparare la bozza','La FAQ fournit la réponse.','Le FAQ orientano la risposta.'],
      ['Vous passer la main','Passarvi la pratica','L’urgence et le brouillon apparaissent.','Urgenza e bozza diventano visibili.'],
      ['Retrouver la réponse','Ritrovare la risposta','Le brouillon reste dans Gmail.','La bozza rimane in Gmail.']
    ]),
    demo:{fr:{Sujet:'Délai de livraison',Catégorie:'Question produit',Réponse:'Brouillon à relire'},it:{Oggetto:'Tempi di consegna',Categoria:'Domanda sul prodotto',Risposta:'Bozza da rileggere'}},
    outcome:b('Le message d’exemple retrouve son contexte et sa prochaine action.','Il messaggio d’esempio ritrova contesto e prossimo passo.'),
    limitation:b('FAQ et messages fictifs. La démonstration ne lit aucune boîte mail et n’envoie pas la réponse.','FAQ e messaggi fittizi. La dimostrazione non legge caselle e-mail e non invia risposte.')
  },
  {
    id:'onboarding',slug:b('preparer-arrivee-collaborateur','preparare-arrivo-collaboratore'),
    title:b('L’arrivée se prépare dans le bon ordre.','L’arrivo si prepara nell’ordine giusto.'),
    category:b('Administration du personnel','Amministrazione del personale'),
    summary:b('Après confirmation du recrutement, le dossier, la checklist et les messages d’accueil se préparent ensemble.','Dopo la conferma dell’assunzione, cartella, checklist e messaggi di benvenuto si preparano insieme.'),
    source:{url:'https://n8n.io/workflows/15975-orchestrate-employee-onboarding-with-google-sheets-drive-jira-gmail-and-slack/',author:'WeblineIndia',title:'Orchestrate employee onboarding with Google Sheets, Drive, Jira, Gmail, and Slack'},
    input:b('Une arrivée déjà confirmée et les champs requis.','Un arrivo già confermato e i campi richiesti.'),
    output:b('Un dossier d’accueil et une checklist suivie.','Una cartella di benvenuto e una checklist.'),
    check:b('L’équipe vérifie les informations administratives.','Il team verifica i dati amministrativi.'),
    tools:tools('sheets','drive','human','gmail','slack'),
    nodes:[
      n('profile','sheets',85,160,'Arrivée confirmée','Arrivo confermato'),n('required','sheets',270,160,'Vérifier les champs','Verificare i campi'),
      n('missing','gmail',465,60,'Demander une précision','Chiedere un chiarimento'),n('folder','drive',465,250,'Préparer le dossier','Preparare la cartella'),
      n('checklist','sheets',650,250,'Créer la checklist','Creare la checklist'),n('review','human',650,80,'Vérification de l’équipe','Verifica del team'),
      n('welcome','gmail',840,160,'Préparer l’accueil','Preparare il benvenuto'),n('record','slack',940,260,'Informer l’équipe','Informare il team')
    ],
    edges:[e('profile','required'),e('required','missing','Incomplet','Incompleto'),e('required','folder','Complet','Completo'),e('folder','checklist'),e('checklist','review'),e('review','welcome'),e('welcome','record')],
    stageNodeIds:[['profile'],['required','missing'],['folder','checklist'],['review'],['welcome','record']],
    stages:stages([
      ['Recevoir l’arrivée','Ricevere l’arrivo','Le recrutement est déjà confirmé.','L’assunzione è già confermata.'],
      ['Vérifier la fiche','Verificare la scheda','Les champs manquants sont signalés.','I campi mancanti vengono segnalati.'],
      ['Rassembler le dossier','Riunire la pratica','La checklist organise les préparatifs.','La checklist organizza i preparativi.'],
      ['Relire les informations','Rileggere i dati','L’équipe confirme les éléments administratifs.','Il team conferma i dati amministrativi.'],
      ['Préparer le premier jour','Preparare il primo giorno','L’accueil rejoint les personnes concernées.','Il benvenuto raggiunge i referenti.']
    ]),
    demo:{fr:{Profil:'Nouvelle arrivée fictive',Décision:'Recrutement déjà confirmé',Contrôle:'Informations administratives'},it:{Profilo:'Nuovo arrivo fittizio',Decisione:'Assunzione già confermata',Verifica:'Dati amministrativi'}},
    outcome:b('Les préparatifs d’exemple rejoignent un suivi partagé.','I preparativi d’esempio entrano in un registro condiviso.'),
    limitation:b('Les tâches Jira sont illustrées par une checklist. Un contrôle administratif humain est ajouté avant l’accueil. Aucun candidat n’est évalué ou sélectionné ; aucun accès n’est créé.','Le attività Jira sono illustrate da una checklist. Un controllo amministrativo umano è aggiunto prima del benvenuto. Nessun candidato viene valutato o selezionato; nessun accesso viene creato.')
  },
  {
    id:'inventory',slug:b('alerte-reapprovisionnement-stock','avviso-riassortimento-scorte'),
    title:b('Le stock vous prévient avant la rupture.','Le scorte segnalano cosa riordinare.'),
    category:b('Stock et approvisionnement','Scorte e acquisti'),
    summary:b('Le rythme des sorties et le délai fournisseur aident à préparer une proposition de réapprovisionnement.','Consumi e tempi del fornitore aiutano a preparare una proposta di riordino.'),
    source:{url:'https://n8n.io/workflows/18067-forecast-stockouts-and-draft-purchase-orders-with-gemini-sheets-slack-and-gmail/',author:'Oka Hironobu',title:'Forecast stockouts and draft purchase orders with Gemini, Sheets, Slack and Gmail'},
    input:b('Stock disponible, sorties et délai fournisseur.','Giacenza, consumi e tempi del fornitore.'),
    output:b('Une alerte et une commande à relire.','Un avviso e un ordine da rileggere.'),
    check:b('Vous décidez de la quantité à commander.','Decidete voi la quantità da ordinare.'),
    tools:tools('calendar','sheets','ai','human','gmail'),
    nodes:[
      n('schedule','calendar',80,160,'Contrôle quotidien','Controllo giornaliero'),n('inventory','sheets',260,160,'Lire le stock','Leggere le scorte'),
      n('cover','sheets',440,160,'Calculer la couverture','Calcolare la copertura'),n('recommend','ai',625,70,'Proposer un réassort','Proporre un riordino'),
      n('normal','sheets',625,255,'Stock suffisant','Scorte sufficienti'),n('review','human',800,70,'Votre validation','La vostra approvazione'),
      n('draft','gmail',945,150,'Brouillon fournisseur','Bozza al fornitore'),n('status','sheets',800,255,'Actualiser le suivi','Aggiornare il registro')
    ],
    edges:[e('schedule','inventory'),e('inventory','cover'),e('cover','recommend','À surveiller','Da controllare'),e('cover','normal','Suffisant','Sufficiente'),e('recommend','review'),e('review','draft'),e('draft','status'),e('normal','status')],
    stageNodeIds:[['schedule','inventory'],['cover'],['recommend'],['normal','review'],['draft','status']],
    stages:stages([
      ['Lire les mouvements','Leggere i movimenti','Le tableau fournit les quantités.','Il foglio fornisce le quantità.'],
      ['Comparer au délai','Confrontare i tempi','La couverture indique le besoin.','La copertura segnala il fabbisogno.'],
      ['Préparer le réassort','Preparare il riordino','Une proposition explique le calcul.','Una proposta spiega il calcolo.'],
      ['Vous laisser décider','Lasciarvi decidere','Vous vérifiez la quantité proposée.','Verificate la quantità proposta.'],
      ['Retrouver la commande','Ritrovare l’ordine','Le brouillon rejoint le suivi.','La bozza aggiorna il registro.']
    ]),
    demo:{fr:{Référence:'MAT-DEMO-08',Stock:'12 unités',Couverture:'3 jours',Délai:'5 jours'},it:{Codice:'MAT-DEMO-08',Giacenza:'12 unità',Copertura:'3 giorni',Consegna:'5 giorni'}},
    outcome:b('Le réassort fictif attend votre décision avant tout achat.','Il riordino fittizio aspetta la vostra decisione.'),
    limitation:b('Quantités et délais fictifs. La vérification humaine est ajoutée à cette adaptation ; aucune commande n’est passée.','Quantità e tempi fittizi. La verifica umana è aggiunta nell’adattamento; nessun ordine viene effettuato.')
  },
  {
    id:'review-requests',slug:b('demande-avis-apres-intervention','richiesta-recensione-dopo-intervento'),
    title:b('Après l’intervention, demander un vrai retour.','Dopo l’intervento, chiedere un riscontro vero.'),
    category:b('Suivi après prestation','Seguito della prestazione'),
    summary:b('Les prestations terminées déclenchent une demande d’avis, avec un délai et un contrôle des messages déjà envoyés.','Le prestazioni concluse avviano una richiesta di recensione, con attesa e controllo degli invii precedenti.'),
    source:{url:'https://n8n.io/workflows/21672-request-google-reviews-for-completed-projects-with-google-sheets-and-gmail/',author:'Vivek Sharma',title:'Request Google reviews for completed projects with Google Sheets and Gmail'},
    input:b('Une prestation terminée et le suivi des demandes.','Una prestazione conclusa e il registro delle richieste.'),
    output:b('Une invitation à laisser son propre avis.','Un invito a lasciare la propria recensione.'),
    check:b('La même demande ne repart pas deux fois.','La stessa richiesta non parte due volte.'),
    tools:tools('sheets','calendar','gmail'),
    nodes:[
      n('jobs','sheets',80,150,'Prestations terminées','Prestazioni concluse'),n('delay','calendar',265,150,'Vérifier le délai','Verificare l’attesa'),
      n('eligible','sheets',450,150,'Consulter les envois','Controllare gli invii'),n('skip','sheets',450,265,'Déjà demandé','Già richiesto'),
      n('message','gmail',645,150,'Préparer le message','Preparare il messaggio'),n('request','gmail',845,150,'Demander un avis','Chiedere una recensione'),
      n('stamp','sheets',845,265,'Noter la date','Annotare la data')
    ],
    edges:[e('jobs','delay'),e('delay','eligible'),e('eligible','skip','Déjà envoyé','Già inviato'),e('eligible','message','À demander','Da richiedere'),e('message','request'),e('request','stamp')],
    stageNodeIds:[['jobs'],['delay','eligible'],['message'],['skip'],['request','stamp']],
    stages:stages([
      ['Retrouver la prestation','Ritrovare la prestazione','Le travail est déclaré terminé.','Il lavoro risulta concluso.'],
      ['Vérifier le moment','Verificare il momento','Délai et historique sont contrôlés.','Attesa e storico vengono controllati.'],
      ['Préparer l’invitation','Preparare l’invito','Le message reprend la prestation.','Il messaggio richiama la prestazione.'],
      ['Éviter le doublon','Evitare i duplicati','Un envoi précédent arrête la demande.','Un invio precedente blocca la richiesta.'],
      ['Garder la trace','Conservare la traccia','La date rejoint le tableau.','La data aggiorna il registro.']
    ]),
    demo:{fr:{Prestation:'Intervention Démo',Terminée:'Depuis 3 jours',Demande:'Non envoyée'},it:{Prestazione:'Intervento Demo',Conclusa:'Da 3 giorni',Richiesta:'Non inviata'}},
    outcome:b('Une demande fictive est préparée, puis marquée dans le suivi.','Una richiesta fittizia viene preparata e registrata.'),
    limitation:b('Aucun avis n’est écrit, acheté ou publié par le système. L’envoi de l’invitation est simulé.','Il sistema non scrive, compra o pubblica recensioni. L’invio dell’invito è simulato.')
  },
  {
    id:'social-plan',slug:b('planning-contenus-validation','piano-contenuti-approvazione'),
    title:b('Le planning avance. Vous choisissez ce qui sort.','Il piano procede. Scegliete voi cosa esce.'),
    category:b('Communication et contenus','Comunicazione e contenuti'),
    summary:b('Une idée devient un brouillon adapté au canal. Votre relecture décide de la version conservée.','Un’idea diventa una bozza per il canale scelto. La vostra revisione decide quale versione conservare.'),
    source:{url:'https://n8n.io/workflows/9402-create-multi-platform-social-media-content-with-sonnet-45-gotohuman-approval-and-sheets/',author:'Davide Boizza',title:'Create multi-platform social media content with Sonnet 4.5, GoToHuman approval & Sheets'},
    input:b('Une idée, un canal et vos consignes éditoriales.','Un’idea, un canale e le regole editoriali.'),
    output:b('Un contenu approuvé dans le planning.','Un contenuto approvato nel piano.'),
    check:b('Vous approuvez ou demandez une révision.','Approvate oppure chiedete una revisione.'),
    tools:tools('sheets','drive','ai','human'),
    nodes:[
      n('ideas','sheets',80,85,'Lire le planning','Leggere il piano'),n('brand','drive',80,255,'Vos consignes','Le vostre regole'),
      n('generate','ai',285,85,'Rédiger la proposition','Scrivere la proposta'),n('draft','sheets',490,85,'Conserver le brouillon','Conservare la bozza'),
      n('review','human',690,85,'Votre relecture','La vostra revisione'),n('revise','ai',690,255,'Reprendre le texte','Rivedere il testo'),
      n('approved','sheets',900,85,'Version approuvée','Versione approvata'),n('plan','sheets',900,255,'Planning à jour','Piano aggiornato')
    ],
    edges:[e('ideas','generate'),e('brand','generate'),e('generate','draft'),e('draft','review'),e('review','revise','À revoir','Da rivedere'),e('revise','generate'),e('review','approved','Approuvé','Approvato'),e('approved','plan')],
    stageNodeIds:[['ideas','brand'],['generate'],['draft'],['review','revise'],['approved','plan']],
    stages:stages([
      ['Prendre le brief','Ricevere il brief','L’idée rejoint les consignes.','L’idea incontra le regole.'],
      ['Préparer le contenu','Preparare il contenuto','Le canal guide la rédaction.','Il canale orienta la scrittura.'],
      ['Enregistrer la version','Salvare la versione','Le brouillon reste consultable.','La bozza resta consultabile.'],
      ['Vous laisser relire','Lasciarvi la revisione','Votre retour oriente la suite.','Il vostro riscontro orienta il seguito.'],
      ['Actualiser le planning','Aggiornare il piano','La version approuvée est rangée.','La versione approvata viene salvata.']
    ]),
    demo:{fr:{Sujet:'Ouverture d’un nouvel atelier',Canal:'LinkedIn',Statut:'À relire'},it:{Tema:'Apertura di un laboratorio',Canale:'LinkedIn',Stato:'Da rileggere'}},
    outcome:b('Le texte fictif rejoint le planning après validation.','Il testo fittizio entra nel piano dopo l’approvazione.'),
    limitation:b('GoToHuman est représenté par un contrôle humain. Les consignes sont illustratives ; aucune publication ni génération de média n’est lancée.','GoToHuman è rappresentato da un controllo umano. Regole illustrative; nessuna pubblicazione o generazione di media viene avviata.')
  },
  {
    id:'sales-reporting',slug:b('rapport-commercial-hebdomadaire','report-commerciale-settimanale'),
    title:b('La semaine se lit dans un seul rapport.','La settimana si legge in un solo report.'),
    category:b('Pilotage commercial','Gestione commerciale'),
    summary:b('Les lignes de vente deviennent des totaux et un résumé daté, transmis aux bons destinataires.','Le vendite diventano totali e una sintesi datata, destinata ai referenti giusti.'),
    source:{url:'https://n8n.io/workflows/14563-generate-weekly-sales-insights-with-google-sheets-gemini-ai-and-gmail/',author:'Avkash Kakdiya',title:'Generate weekly sales insights with Google Sheets, Gemini AI and Gmail'},
    input:b('Des ventes et une période de référence.','Vendite e un periodo di riferimento.'),
    output:b('Un rapport avec chiffres et sources.','Un report con numeri e fonti.'),
    check:b('Les hypothèses restent visibles dans le rapport.','Le ipotesi restano visibili nel report.'),
    tools:tools('calendar','sheets','ai','gmail'),
    nodes:[
      n('schedule','calendar',80,160,'Clôture de semaine','Chiusura settimanale'),n('sales','sheets',270,75,'Lire les ventes','Leggere le vendite'),
      n('period','sheets',270,255,'Définir la période','Definire il periodo'),n('clean','sheets',460,160,'Contrôler les lignes','Verificare le righe'),
      n('calculate','sheets',650,75,'Calculer les totaux','Calcolare i totali'),n('summary','ai',650,255,'Rédiger le résumé','Scrivere la sintesi'),
      n('chart','sheets',825,75,'Préparer le graphique','Preparare il grafico'),n('report','gmail',945,180,'Rapport disponible','Report disponibile')
    ],
    edges:[e('schedule','sales'),e('schedule','period'),e('sales','clean'),e('period','clean'),e('clean','calculate'),e('calculate','summary'),e('calculate','chart'),e('summary','report'),e('chart','report')],
    stageNodeIds:[['schedule','sales','period'],['clean'],['calculate','chart'],['summary'],['report']],
    stages:stages([
      ['Rassembler la semaine','Riunire la settimana','Les ventes rejoignent leur période.','Le vendite trovano il periodo.'],
      ['Vérifier les données','Verificare i dati','Les lignes inutilisables sont écartées.','Le righe inutilizzabili vengono escluse.'],
      ['Préparer les chiffres','Preparare i numeri','Totaux et graphique sont calculés.','Totali e grafico vengono calcolati.'],
      ['Mettre en mots','Scrivere la sintesi','Le résumé suit les chiffres.','La sintesi segue i numeri.'],
      ['Partager le rapport','Condividere il report','Le document daté devient disponible.','Il documento datato diventa disponibile.']
    ]),
    demo:{fr:{Période:'Semaine Démo',Ventes:'32 lignes fictives',Livrable:'Rapport interne'},it:{Periodo:'Settimana Demo',Vendite:'32 righe fittizie',Documento:'Report interno'}},
    outcome:b('Les chiffres d’exemple alimentent un rapport lisible.','I dati d’esempio alimentano un report leggibile.'),
    limitation:b('Les chiffres sont fictifs. Le graphique du modèle est représenté dans la simulation ; aucun fichier de vente ni service d’envoi n’est connecté.','I numeri sono fittizi. Il grafico è rappresentato nella simulazione; nessun archivio vendite o servizio di invio è collegato.')
  },
  {
    id:'funding-documents',slug:b('pieces-dossier-financement','documenti-pratica-finanziamento'),
    title:b('Les pièces manquantes restent dans le suivi.','I documenti mancanti restano sotto controllo.'),
    category:b('Préparation d’un dossier de financement','Preparazione della pratica di finanziamento'),
    summary:b('Une liste définie avec vous indique ce qui est reçu, ce qui manque et quand relancer.','Una lista definita insieme indica cosa è arrivato, cosa manca e quando sollecitare.'),
    source:{url:'https://n8n.io/workflows/20400-chase-missing-client-documents-from-google-sheets-with-openai-and-gmail/',author:'NewBrainsAI',title:'Chase missing client documents from Google Sheets with OpenAI and Gmail'},
    input:b('Une liste de pièces et leur état de réception.','Una lista di documenti e il loro stato.'),
    output:b('Un dossier suivi et des relances ciblées.','Una pratica tracciata e solleciti mirati.'),
    check:b('Vous définissez les pièces et les échéances.','Definite voi documenti e scadenze.'),
    tools:tools('sheets','drive','ai','human','gmail'),
    nodes:[
      n('required','sheets',80,85,'Pièces demandées','Documenti richiesti'),n('received','drive',80,255,'Pièces reçues','Documenti ricevuti'),
      n('compare','sheets',285,160,'Comparer les états','Confrontare gli stati'),n('complete','sheets',490,75,'Dossier complet','Pratica completa'),
      n('missing','sheets',490,255,'Pièces à obtenir','Documenti da ottenere'),n('compose','ai',690,255,'Préparer la relance','Preparare il sollecito'),
      n('review','human',690,75,'Vérifier le calendrier','Verificare il calendario'),n('email','gmail',900,255,'Demande préparée','Richiesta preparata'),
      n('tracking','sheets',900,75,'Actualiser le suivi','Aggiornare il registro')
    ],
    edges:[e('required','compare'),e('received','compare'),e('compare','complete','Complet','Completo'),e('compare','missing','Incomplet','Incompleto'),e('missing','compose'),e('compose','review'),e('review','email','Relance prévue','Sollecito previsto'),e('email','tracking'),e('complete','tracking')],
    stageNodeIds:[['required','received'],['compare'],['missing','compose'],['complete','review'],['email','tracking']],
    stages:stages([
      ['Rassembler les états','Riunire gli stati','La checklist définit les attentes.','La checklist definisce i documenti.'],
      ['Repérer ce qui manque','Individuare cosa manca','Les éléments reçus sont rapprochés.','I documenti ricevuti vengono confrontati.'],
      ['Préparer la demande','Preparare la richiesta','La relance cible les manques.','Il sollecito riguarda i documenti mancanti.'],
      ['Vérifier le moment','Verificare il momento','Le calendrier évite les relances excessives.','Il calendario regola i solleciti.'],
      ['Garder le dossier à jour','Aggiornare la pratica','Date et statut sont conservés.','Data e stato vengono conservati.']
    ]),
    demo:{fr:{Dossier:'Projet Démo',Pièces:'4 reçues sur 5',Manque:'Devis fournisseur',Relances:'1 sur 3'},it:{Pratica:'Progetto Demo',Documenti:'4 ricevuti su 5',Manca:'Preventivo fornitore',Solleciti:'1 su 3'}},
    outcome:b('La pièce d’exemple à obtenir reste visible jusqu’à réception.','Il documento d’esempio resta visibile fino alla ricezione.'),
    limitation:b('La checklist vient de l’équipe. Un contrôle humain du calendrier est ajouté avant la relance simulée. Aucune éligibilité, aide ou attribution de financement n’est décidée.','La checklist viene dal team. Un controllo umano del calendario è aggiunto prima del sollecito simulato. Nessuna ammissibilità, agevolazione o assegnazione viene decisa.')
  }
];
