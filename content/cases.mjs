export const cases = [
  {
    "id": "invoices",
    "slug": {
      "fr": "factures-fournisseurs",
      "it": "fatture-fornitori"
    },
    "title": {
      "fr": "Des factures prêtes à vérifier.",
      "it": "Fatture pronte da verificare."
    },
    "category": {
      "fr": "Comptabilité quotidienne",
      "it": "Contabilità quotidiana"
    },
    "summary": {
      "fr": "Un PDF arrive. Les informations sont reprises dans le suivi, et les montants qui ne concordent pas attendent votre regard.",
      "it": "Arriva un PDF. I dati passano nel registro e gli importi che non coincidono aspettano la vostra verifica."
    },
    "source": {
      "url": "https://n8n.io/workflows/20743-extract-and-validate-invoice-data-with-openai-google-sheets-and-gmail/",
      "author": "AI Automation Playbook",
      "title": "Extract and validate invoice data with OpenAI, Google Sheets, and Gmail"
    },
    "input": {
      "fr": "Une facture PDF et un registre contenant les factures déjà reçues.",
      "it": "Una fattura PDF e un registro delle fatture già ricevute."
    },
    "output": {
      "fr": "Une ligne de suivi structurée, ou un message expliquant ce qui bloque.",
      "it": "Una riga ordinata nel registro, oppure un messaggio che spiega cosa va controllato."
    },
    "check": {
      "fr": "Vous relisez les extractions incertaines et les totaux incohérents. Un doublon reste à part.",
      "it": "Rivedete i dati incerti e i totali incoerenti. Un duplicato resta separato."
    },
    "tools": [
      {
        "id": "drive",
        "label": "Google Drive"
      },
      {
        "id": "ai",
        "label": "OpenAI"
      },
      {
        "id": "sheets",
        "label": "Google Sheets"
      },
      {
        "id": "gmail",
        "label": "Gmail"
      }
    ],
    "nodes": [
      {
        "id": "document",
        "app": "drive",
        "label": {
          "fr": "PDF déposé",
          "it": "PDF caricato"
        },
        "x": 90,
        "y": 85
      },
      {
        "id": "read",
        "app": "ai",
        "label": {
          "fr": "Lire les champs",
          "it": "Leggere i dati"
        },
        "x": 275,
        "y": 85
      },
      {
        "id": "check",
        "app": "sheets",
        "label": {
          "fr": "Contrôler",
          "it": "Verificare"
        },
        "x": 460,
        "y": 85
      },
      {
        "id": "ledger",
        "app": "sheets",
        "label": {
          "fr": "Inscrire au suivi",
          "it": "Aggiornare il registro"
        },
        "x": 660,
        "y": 85
      },
      {
        "id": "notify",
        "app": "gmail",
        "label": {
          "fr": "Confirmer",
          "it": "Confermare"
        },
        "x": 875,
        "y": 85
      },
      {
        "id": "duplicate",
        "app": "gmail",
        "label": {
          "fr": "Doublon repéré",
          "it": "Duplicato trovato"
        },
        "x": 460,
        "y": 250
      },
      {
        "id": "review",
        "app": "gmail",
        "label": {
          "fr": "Votre vérification",
          "it": "La vostra verifica"
        },
        "x": 660,
        "y": 250
      }
    ],
    "edges": [
      {
        "from": "document",
        "to": "read",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "read",
        "to": "check",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "check",
        "to": "ledger",
        "label": {
          "fr": "Conforme",
          "it": "Conforme"
        }
      },
      {
        "from": "check",
        "to": "duplicate",
        "label": {
          "fr": "Déjà présent",
          "it": "Già presente"
        }
      },
      {
        "from": "check",
        "to": "review",
        "label": {
          "fr": "À vérifier",
          "it": "Da verificare"
        }
      },
      {
        "from": "review",
        "to": "ledger",
        "label": {
          "fr": "Après accord",
          "it": "Dopo l’approvazione"
        }
      },
      {
        "from": "ledger",
        "to": "notify",
        "label": {
          "fr": "",
          "it": ""
        }
      }
    ],
    "stages": [
      {
        "module": "reception",
        "title": {
          "fr": "Recevoir le PDF",
          "it": "Ricevere il PDF"
        },
        "detail": {
          "fr": "Le document rejoint le circuit de traitement.",
          "it": "Il documento entra nel flusso."
        }
      },
      {
        "module": "analyse",
        "title": {
          "fr": "Lire la facture",
          "it": "Leggere la fattura"
        },
        "detail": {
          "fr": "Le fournisseur, la référence et les montants sont relevés.",
          "it": "Vengono letti fornitore, riferimento e importi."
        }
      },
      {
        "module": "transformation",
        "title": {
          "fr": "Structurer les champs",
          "it": "Ordinare i dati"
        },
        "detail": {
          "fr": "Les informations prennent les colonnes du registre.",
          "it": "I dati vengono preparati per le colonne del registro."
        }
      },
      {
        "module": "redirection",
        "title": {
          "fr": "Traiter les exceptions",
          "it": "Gestire le eccezioni"
        },
        "detail": {
          "fr": "Doublon et incohérence suivent leur propre branche.",
          "it": "Duplicati e incongruenze seguono un percorso dedicato."
        }
      },
      {
        "module": "livraison",
        "title": {
          "fr": "Mettre le suivi à jour",
          "it": "Aggiornare il registro"
        },
        "detail": {
          "fr": "Le résultat contrôlé est enregistré dans la simulation.",
          "it": "Il risultato verificato viene registrato nella simulazione."
        }
      }
    ],
    "demo": {
      "fr": {
        "Document": "FAC-DEMO-104.pdf",
        "Fournisseur": "Fournisseur Démo",
        "Montant du document": "1 440,00 €",
        "État du registre": "Référence absente",
        "Contrôle": "Total cohérent"
      },
      "it": {
        "Documento": "FAT-DEMO-104.pdf",
        "Fornitore": "Fornitore Demo",
        "Importo del documento": "1.440,00 €",
        "Stato del registro": "Riferimento assente",
        "Verifica": "Totale coerente"
      }
    },
    "outcome": {
      "fr": "La facture d’exemple rejoint le registre. Un doublon ou un montant incohérent prend une autre branche.",
      "it": "La fattura d’esempio entra nel registro. Un duplicato o un importo incoerente segue un altro percorso."
    },
    "limitation": {
      "fr": "Dépôt documentaire simulé, adapté du point d’entrée fichier du modèle. Aucun compte Google ni logiciel comptable n’est connecté ; aucun paiement n’est lancé.",
      "it": "Caricamento documentale simulato, adattato all’ingresso file del modello. Nessun account Google o software contabile è collegato; non viene effettuato alcun pagamento."
    }
  },
  {
    "id": "scheduling",
    "slug": {
      "fr": "planning-interventions",
      "it": "pianificazione-interventi"
    },
    "title": {
      "fr": "Une intervention trouve son créneau.",
      "it": "Un intervento trova il suo orario."
    },
    "category": {
      "fr": "Planning des équipes terrain",
      "it": "Agenda delle squadre sul campo"
    },
    "summary": {
      "fr": "Une demande de dépannage devient une proposition de rendez-vous. Le client choisit ; l’agenda se remplit après son accord.",
      "it": "Una richiesta di intervento diventa una proposta di appuntamento. Il cliente sceglie; l’agenda si aggiorna dopo la conferma."
    },
    "source": {
      "url": "https://n8n.io/workflows/18092-offer-and-confirm-technician-visit-slots-with-google-calendar-gmail-sheets-and-telegram/",
      "author": "Dmytro",
      "title": "Offer and confirm technician visit slots with Google Calendar, Gmail, Sheets, and Telegram"
    },
    "input": {
      "fr": "Une demande d’intervention, sa durée et les disponibilités de l’équipe.",
      "it": "Una richiesta di intervento, la durata prevista e le disponibilità della squadra."
    },
    "output": {
      "fr": "Des créneaux proposés, puis une réservation confirmée ou une demande transmise au responsable.",
      "it": "Una proposta di orari, poi una prenotazione confermata o una richiesta passata al responsabile."
    },
    "check": {
      "fr": "Le système attend le choix du client. Sans créneau ou après expiration de l’offre, une personne reprend la main.",
      "it": "Il sistema aspetta la scelta del cliente. Senza disponibilità o quando l’offerta scade, interviene una persona."
    },
    "tools": [
      {
        "id": "gmail",
        "label": "Gmail"
      },
      {
        "id": "calendar",
        "label": "Google Calendar"
      },
      {
        "id": "sheets",
        "label": "Google Sheets"
      },
      {
        "id": "telegram",
        "label": "Telegram"
      }
    ],
    "nodes": [
      {
        "id": "request",
        "app": "gmail",
        "label": {
          "fr": "Demande reçue",
          "it": "Richiesta ricevuta"
        },
        "x": 75,
        "y": 165
      },
      {
        "id": "availability",
        "app": "calendar",
        "label": {
          "fr": "Chercher un créneau",
          "it": "Cercare un orario"
        },
        "x": 245,
        "y": 165
      },
      {
        "id": "offer",
        "app": "gmail",
        "label": {
          "fr": "Proposer des horaires",
          "it": "Proporre gli orari"
        },
        "x": 430,
        "y": 75
      },
      {
        "id": "manual",
        "app": "telegram",
        "label": {
          "fr": "Reprise par l’équipe",
          "it": "Interviene la squadra"
        },
        "x": 430,
        "y": 260
      },
      {
        "id": "wait",
        "app": "sheets",
        "label": {
          "fr": "Attendre le choix",
          "it": "Attendere la scelta"
        },
        "x": 620,
        "y": 75
      },
      {
        "id": "expired",
        "app": "telegram",
        "label": {
          "fr": "Offre expirée",
          "it": "Offerta scaduta"
        },
        "x": 620,
        "y": 260
      },
      {
        "id": "book",
        "app": "calendar",
        "label": {
          "fr": "Réserver",
          "it": "Prenotare"
        },
        "x": 805,
        "y": 75
      },
      {
        "id": "log",
        "app": "sheets",
        "label": {
          "fr": "Tracer le rendez-vous",
          "it": "Registrare la visita"
        },
        "x": 805,
        "y": 260
      },
      {
        "id": "confirmation",
        "app": "gmail",
        "label": {
          "fr": "Confirmer",
          "it": "Confermare"
        },
        "x": 925,
        "y": 165
      }
    ],
    "edges": [
      {
        "from": "request",
        "to": "availability",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "availability",
        "to": "offer",
        "label": {
          "fr": "Disponible",
          "it": "Disponibile"
        }
      },
      {
        "from": "availability",
        "to": "manual",
        "label": {
          "fr": "Aucun créneau",
          "it": "Nessun orario"
        }
      },
      {
        "from": "offer",
        "to": "wait",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "wait",
        "to": "book",
        "label": {
          "fr": "Choix du client",
          "it": "Scelta del cliente"
        }
      },
      {
        "from": "wait",
        "to": "expired",
        "label": {
          "fr": "Sans réponse",
          "it": "Senza risposta"
        }
      },
      {
        "from": "book",
        "to": "confirmation",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "book",
        "to": "log",
        "label": {
          "fr": "",
          "it": ""
        }
      }
    ],
    "stages": [
      {
        "module": "reception",
        "title": {
          "fr": "Recevoir la demande",
          "it": "Ricevere la richiesta"
        },
        "detail": {
          "fr": "Le type d’intervention fixe la durée à rechercher.",
          "it": "Il tipo di intervento determina la durata da cercare."
        }
      },
      {
        "module": "analyse",
        "title": {
          "fr": "Lire les disponibilités",
          "it": "Leggere le disponibilità"
        },
        "detail": {
          "fr": "Les horaires occupés sont écartés du calendrier d’exemple.",
          "it": "Gli orari occupati vengono esclusi dal calendario d’esempio."
        }
      },
      {
        "module": "transformation",
        "title": {
          "fr": "Préparer les propositions",
          "it": "Preparare le proposte"
        },
        "detail": {
          "fr": "Les créneaux libres deviennent une offre de rendez-vous.",
          "it": "Gli spazi liberi diventano una proposta di appuntamento."
        }
      },
      {
        "module": "redirection",
        "title": {
          "fr": "Attendre une décision",
          "it": "Attendere una decisione"
        },
        "detail": {
          "fr": "Le choix du client ouvre la réservation ; une exception alerte l’équipe.",
          "it": "La scelta del cliente avvia la prenotazione; un’eccezione avvisa la squadra."
        }
      },
      {
        "module": "livraison",
        "title": {
          "fr": "Confirmer la visite",
          "it": "Confermare la visita"
        },
        "detail": {
          "fr": "Le créneau choisi apparaît dans le calendrier simulé.",
          "it": "L’orario scelto appare nel calendario simulato."
        }
      }
    ],
    "demo": {
      "fr": {
        "Demande": "Remplacement d’un robinet",
        "Durée prévue": "90 minutes",
        "Calendrier d’exemple": "Deux créneaux occupés",
        "Propositions": "Trois créneaux disponibles",
        "Choix du client": "Deuxième proposition"
      },
      "it": {
        "Richiesta": "Sostituzione di un rubinetto",
        "Durata prevista": "90 minuti",
        "Calendario d’esempio": "Due fasce occupate",
        "Proposte": "Tre orari disponibili",
        "Scelta del cliente": "Seconda proposta"
      }
    },
    "outcome": {
      "fr": "Le créneau choisi est réservé dans l’exemple. Sans disponibilité ou sans réponse, le dossier reste visible pour l’équipe.",
      "it": "L’orario scelto viene prenotato nell’esempio. Senza disponibilità o risposta, la richiesta resta visibile alla squadra."
    },
    "limitation": {
      "fr": "Les disponibilités, le choix et les messages sont fictifs. Aucun rendez-vous réel n’est pris et aucune notification ne part.",
      "it": "Disponibilità, scelta e messaggi sono fittizi. Non viene prenotato alcun appuntamento reale e non viene inviata alcuna notifica."
    }
  },
  {
    "id": "quotes",
    "slug": {
      "fr": "pre-devis-apres-appel",
      "it": "preventivo-dopo-chiamata"
    },
    "title": {
      "fr": "De l’appel au pré-devis.",
      "it": "Dalla chiamata al preventivo."
    },
    "category": {
      "fr": "Préparation commerciale",
      "it": "Preparazione commerciale"
    },
    "summary": {
      "fr": "Les notes d’un échange deviennent une proposition organisée. Vous vérifiez le périmètre et le prix avant de l’envoyer.",
      "it": "Gli appunti di una conversazione diventano una proposta ordinata. Verificate contenuto e prezzo prima di inviarla."
    },
    "source": {
      "url": "https://n8n.io/workflows/12285-generate-client-quotes-from-call-transcripts-with-claudegpt-google-drive-and-pandadoc/",
      "author": "Hugo Le Poole",
      "title": "Generate client quotes from call transcripts with Claude/GPT, Google Drive, and PandaDoc"
    },
    "input": {
      "fr": "Une transcription d’appel et un catalogue de prestations défini par l’entreprise.",
      "it": "La trascrizione di una chiamata e un catalogo di servizi definito dall’impresa."
    },
    "output": {
      "fr": "Un pré-devis qui réunit le besoin, les prestations retenues et les points à confirmer.",
      "it": "Una bozza di preventivo con richiesta, servizi previsti e punti da confermare."
    },
    "check": {
      "fr": "Le responsable valide ou renvoie le document en correction. Une estimation incertaine n’est pas envoyée toute seule.",
      "it": "Il responsabile approva il documento o chiede una correzione. Una stima incerta non viene inviata da sola."
    },
    "tools": [
      {
        "id": "drive",
        "label": "Google Drive"
      },
      {
        "id": "calendar",
        "label": "Google Calendar"
      },
      {
        "id": "ai",
        "label": "Claude / GPT"
      },
      {
        "id": "pandadoc",
        "label": "PandaDoc"
      },
      {
        "id": "slack",
        "label": "Slack"
      },
      {
        "id": "gmail",
        "label": "Gmail"
      }
    ],
    "nodes": [
      {
        "id": "transcript",
        "app": "drive",
        "label": {
          "fr": "Notes d’appel",
          "it": "Appunti della chiamata"
        },
        "x": 80,
        "y": 165
      },
      {
        "id": "context",
        "app": "calendar",
        "label": {
          "fr": "Contexte du rendez-vous",
          "it": "Contesto della visita"
        },
        "x": 80,
        "y": 45
      },
      {
        "id": "analyse",
        "app": "ai",
        "label": {
          "fr": "Comprendre le besoin",
          "it": "Capire la richiesta"
        },
        "x": 265,
        "y": 165
      },
      {
        "id": "scope",
        "app": "ai",
        "label": {
          "fr": "Préparer le périmètre",
          "it": "Preparare il contenuto"
        },
        "x": 450,
        "y": 65
      },
      {
        "id": "catalogue",
        "app": "ai",
        "label": {
          "fr": "Consulter le catalogue",
          "it": "Consultare il catalogo"
        },
        "x": 450,
        "y": 270
      },
      {
        "id": "draft",
        "app": "pandadoc",
        "label": {
          "fr": "Assembler le pré-devis",
          "it": "Creare la bozza"
        },
        "x": 635,
        "y": 165
      },
      {
        "id": "review",
        "app": "slack",
        "label": {
          "fr": "Votre accord",
          "it": "La vostra approvazione"
        },
        "x": 805,
        "y": 165
      },
      {
        "id": "send",
        "app": "gmail",
        "label": {
          "fr": "Préparer l’envoi",
          "it": "Preparare l’invio"
        },
        "x": 925,
        "y": 65
      },
      {
        "id": "revision",
        "app": "slack",
        "label": {
          "fr": "À corriger",
          "it": "Da correggere"
        },
        "x": 925,
        "y": 275
      }
    ],
    "edges": [
      {
        "from": "transcript",
        "to": "analyse",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "context",
        "to": "analyse",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "analyse",
        "to": "scope",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "analyse",
        "to": "catalogue",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "scope",
        "to": "draft",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "catalogue",
        "to": "draft",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "draft",
        "to": "review",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "review",
        "to": "send",
        "label": {
          "fr": "Validé",
          "it": "Approvato"
        }
      },
      {
        "from": "review",
        "to": "revision",
        "label": {
          "fr": "À reprendre",
          "it": "Da rivedere"
        }
      }
    ],
    "stages": [
      {
        "module": "reception",
        "title": {
          "fr": "Rassembler l’échange",
          "it": "Riunire la conversazione"
        },
        "detail": {
          "fr": "La transcription et le contexte du rendez-vous sont associés.",
          "it": "La trascrizione viene associata al contesto dell’appuntamento."
        }
      },
      {
        "module": "analyse",
        "title": {
          "fr": "Relever le besoin",
          "it": "Individuare la richiesta"
        },
        "detail": {
          "fr": "Les prestations attendues et les précisions manquantes sont séparées.",
          "it": "I servizi richiesti e i dettagli mancanti vengono distinti."
        }
      },
      {
        "module": "transformation",
        "title": {
          "fr": "Composer un pré-devis",
          "it": "Comporre una bozza"
        },
        "detail": {
          "fr": "Le catalogue d’exemple fournit les éléments de la proposition.",
          "it": "Il catalogo d’esempio fornisce le voci della proposta."
        }
      },
      {
        "module": "redirection",
        "title": {
          "fr": "Vous laisser relire",
          "it": "Lasciarvi la verifica"
        },
        "detail": {
          "fr": "Vous approuvez le document ou demandez une correction.",
          "it": "Approvate il documento oppure chiedete una correzione."
        }
      },
      {
        "module": "livraison",
        "title": {
          "fr": "Préparer la proposition",
          "it": "Preparare la proposta"
        },
        "detail": {
          "fr": "La version approuvée est prête à partir dans l’exemple.",
          "it": "La versione approvata è pronta per l’invio nell’esempio."
        }
      }
    ],
    "demo": {
      "fr": {
        "Note d’appel": "Bibliothèque sur mesure, avec pose",
        "Catalogue": "Prestations de démonstration",
        "À confirmer": "Dimensions et finition",
        "Document": "Pré-devis à relire",
        "Décision illustrée": "Validation du responsable"
      },
      "it": {
        "Appunto della chiamata": "Libreria su misura, con montaggio",
        "Catalogo": "Servizi dimostrativi",
        "Da confermare": "Misure e finitura",
        "Documento": "Bozza da verificare",
        "Decisione d’esempio": "Approvazione del responsabile"
      }
    },
    "outcome": {
      "fr": "Le brouillon rassemble les informations utiles. La branche choisie montre une proposition approuvée ou un document à reprendre.",
      "it": "La bozza riunisce le informazioni utili. Il percorso scelto mostra una proposta approvata oppure un documento da rivedere."
    },
    "limitation": {
      "fr": "Catalogue et transcription fictifs. La simulation ne fixe pas vos prix, ne crée pas de contrat et n’envoie aucun devis réel.",
      "it": "Catalogo e trascrizione fittizi. La simulazione non stabilisce i vostri prezzi, non crea contratti e non invia preventivi reali."
    }
  },
  {
    "id": "deadlines",
    "slug": {
      "fr": "suivi-dossiers-echeances",
      "it": "monitoraggio-documenti-scadenze"
    },
    "title": {
      "fr": "Les échéances sortent des dossiers.",
      "it": "Le scadenze escono dai documenti."
    },
    "category": {
      "fr": "Suivi administratif",
      "it": "Monitoraggio amministrativo"
    },
    "summary": {
      "fr": "Un document classé ne devrait pas emporter ses dates importantes avec lui. Elles rejoignent un registre et un calendrier, avec un contrôle si la lecture est incertaine.",
      "it": "Archiviare un documento non dovrebbe far sparire le date importanti. Passano in un registro e in agenda, con una verifica se la lettura è incerta."
    },
    "source": {
      "url": "https://n8n.io/workflows/9328-extract-legal-contract-data-and-send-alerts-with-vlm-run-google-workspace-and-slack/",
      "author": "Shahrear",
      "title": "Extract legal contract data & send alerts with VLM run, Google Workspace & Slack"
    },
    "input": {
      "fr": "Un contrat ou un document de suivi contenant des dates à retrouver.",
      "it": "Un contratto o un documento amministrativo con date da ritrovare."
    },
    "output": {
      "fr": "Une fiche classée, des dates lisibles et les rappels configurés par votre équipe.",
      "it": "Una scheda archiviata, date leggibili e promemoria configurati dalla squadra."
    },
    "check": {
      "fr": "Une date manquante attend votre confirmation. La démonstration n’interprète pas la portée juridique du document.",
      "it": "Una data mancante aspetta la vostra conferma. La dimostrazione non interpreta gli effetti giuridici del documento."
    },
    "tools": [
      {
        "id": "drive",
        "label": "Google Drive"
      },
      {
        "id": "ai",
        "label": "VLM Run"
      },
      {
        "id": "sheets",
        "label": "Google Sheets"
      },
      {
        "id": "calendar",
        "label": "Google Calendar"
      },
      {
        "id": "slack",
        "label": "Slack"
      }
    ],
    "nodes": [
      {
        "id": "document",
        "app": "drive",
        "label": {
          "fr": "Document déposé",
          "it": "Documento caricato"
        },
        "x": 90,
        "y": 165
      },
      {
        "id": "extract",
        "app": "ai",
        "label": {
          "fr": "Relever les dates",
          "it": "Leggere le date"
        },
        "x": 275,
        "y": 165
      },
      {
        "id": "normalise",
        "app": "ai",
        "label": {
          "fr": "Structurer la fiche",
          "it": "Ordinare la scheda"
        },
        "x": 460,
        "y": 165
      },
      {
        "id": "register",
        "app": "sheets",
        "label": {
          "fr": "Mettre au registre",
          "it": "Aggiornare il registro"
        },
        "x": 650,
        "y": 165
      },
      {
        "id": "review",
        "app": "slack",
        "label": {
          "fr": "Date à confirmer",
          "it": "Data da confermare"
        },
        "x": 460,
        "y": 280
      },
      {
        "id": "calendar",
        "app": "calendar",
        "label": {
          "fr": "Créer le rappel",
          "it": "Creare il promemoria"
        },
        "x": 870,
        "y": 55
      },
      {
        "id": "notify",
        "app": "slack",
        "label": {
          "fr": "Informer l’équipe",
          "it": "Avvisare la squadra"
        },
        "x": 870,
        "y": 165
      },
      {
        "id": "archive",
        "app": "drive",
        "label": {
          "fr": "Classer le document",
          "it": "Archiviare il documento"
        },
        "x": 870,
        "y": 280
      }
    ],
    "edges": [
      {
        "from": "document",
        "to": "extract",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "extract",
        "to": "normalise",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "normalise",
        "to": "register",
        "label": {
          "fr": "Date lisible",
          "it": "Data leggibile"
        }
      },
      {
        "from": "normalise",
        "to": "review",
        "label": {
          "fr": "Information manquante",
          "it": "Dato mancante"
        }
      },
      {
        "from": "review",
        "to": "register",
        "label": {
          "fr": "Après confirmation",
          "it": "Dopo la conferma"
        }
      },
      {
        "from": "register",
        "to": "calendar",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "register",
        "to": "notify",
        "label": {
          "fr": "",
          "it": ""
        }
      },
      {
        "from": "register",
        "to": "archive",
        "label": {
          "fr": "",
          "it": ""
        }
      }
    ],
    "stages": [
      {
        "module": "reception",
        "title": {
          "fr": "Recevoir le document",
          "it": "Ricevere il documento"
        },
        "detail": {
          "fr": "Le dépôt dans un dossier lance le parcours d’exemple.",
          "it": "Il caricamento in una cartella avvia il percorso d’esempio."
        }
      },
      {
        "module": "analyse",
        "title": {
          "fr": "Retrouver les dates",
          "it": "Ritrovare le date"
        },
        "detail": {
          "fr": "Le document est lu pour relever ses références et échéances.",
          "it": "Il documento viene letto per individuarne riferimenti e scadenze."
        }
      },
      {
        "module": "transformation",
        "title": {
          "fr": "Préparer une fiche",
          "it": "Preparare una scheda"
        },
        "detail": {
          "fr": "Les informations sont rangées dans des champs distincts.",
          "it": "Le informazioni vengono ordinate in campi distinti."
        }
      },
      {
        "module": "redirection",
        "title": {
          "fr": "Confirmer ce qui manque",
          "it": "Confermare i dati mancanti"
        },
        "detail": {
          "fr": "Une date incertaine attend une vérification humaine.",
          "it": "Una data incerta aspetta una verifica umana."
        }
      },
      {
        "module": "livraison",
        "title": {
          "fr": "Classer et rappeler",
          "it": "Archiviare e ricordare"
        },
        "detail": {
          "fr": "Le registre, le rappel et l’information de l’équipe se séparent.",
          "it": "Registro, promemoria e avviso alla squadra seguono percorsi separati."
        }
      }
    ],
    "demo": {
      "fr": {
        "Document": "Contrat de maintenance fictif",
        "Référence": "DOS-DEMO-028",
        "Échéance indiquée": "31 mars 2027",
        "Rappel d’exemple": "1er mars 2027",
        "Contrôle": "Date à confirmer avant activation"
      },
      "it": {
        "Documento": "Contratto di manutenzione fittizio",
        "Riferimento": "PRAT-DEMO-028",
        "Scadenza indicata": "31 marzo 2027",
        "Promemoria d’esempio": "1 marzo 2027",
        "Verifica": "Data da confermare prima dell’attivazione"
      }
    },
    "outcome": {
      "fr": "Les dates de l’exemple deviennent visibles dans le suivi. Une information manquante reste en attente plutôt que de créer un rappel incertain.",
      "it": "Le date d’esempio diventano visibili nel registro. Un dato mancante resta in attesa, evitando un promemoria incerto."
    },
    "limitation": {
      "fr": "Données fictives et contrôle humain ajouté pour cette adaptation. Aucun document réel n’est analysé ; aucun rappel n’est créé dans votre agenda.",
      "it": "Dati fittizi e verifica umana aggiunta per questo adattamento. Nessun documento reale viene analizzato e nessun promemoria viene creato nella vostra agenda."
    }
  }
];
