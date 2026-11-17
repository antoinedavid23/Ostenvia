# Ostenvia

Code source du site [ostenvia.com](https://ostenvia.com), en français et en italien : 58 pages, simulateur, démonstrations, histoires, réservation Calendly, formulaire de contact et guide Ostie.

Import du 17 novembre 2026, correspondant à la révision du site `v41` (`9dd56091-f452-43fa-aebe-3ba350e04692`).

## Démarrage

Prérequis : Node.js 20 ou supérieur et npm. Le fichier `.nvmrc` propose Node.js 22.

```sh
npm ci
npm run build
npm run check
npm test
npm run preview
```

La prévisualisation est disponible sur **http://127.0.0.1:8092/**. Le dossier `dist/` est généré par le build et reste hors de Git. Les images, polices, logos, icônes et vidéos nécessaires sont inclus dans `public/`.

Les tests du formulaire et du guide contrôlent des requêtes invalides ; ils n’envoient pas d’e-mail et ne prennent pas de rendez-vous.

## Organisation

| Dossier ou fichier | Rôle |
| --- | --- |
| `content/` | Textes, routes et données FR/IT. |
| `scripts/` | Génération des pages, composants, illustrations, vérifications et tests. |
| `public/` | Styles, interactions, médias, polices et ressources servies au navigateur. |
| `src/isometric-factory.js` | Source de l’animation Three.js. |
| `src/site-worker.mjs` | Worker du site : fichiers statiques et redirections. |
| `src/worker.mjs` | API du formulaire de contact et d’Ostie. |
| `wrangler.jsonc` | Configuration du Worker `ostenvia`. |
| `wrangler.api.jsonc` | Configuration séparée du Worker `ostenvia-api`. |
| `docs/source-manifest.json` | Inventaire et empreintes des 199 fichiers source/configuration importés. |

## Reconstruire les ressources

L’animation isométrique compilée est déjà incluse. Pour la reconstruire depuis son code source :

```sh
npm run build:factory
npm run build
```

Les favicons approuvés sont inclus. `scripts/build-favicons.mjs` permet de les régénérer depuis le SVG ; ce script optionnel demande le module `sharp`, ou un chemin vers ce module dans `OSTENVIA_SHARP_MODULE`.

Les scripts `prepare-media.mjs`, `prepare-refined-clips.mjs` et `finalize-media-requests.mjs` sont les outils historiques de préparation des médias. Ils utilisent un dossier local `media-jobs/`, dont les données de suivi et réponses des fournisseurs ne sont pas publiées. Leurs médias finaux sont tous inclus dans `public/` ; ces outils ne sont pas nécessaires au build du site.

## Hébergement et API

Le site utilise Cloudflare Workers. Le Worker du site et celui de l’API se déploient séparément ; les routes, domaines et paramètres de compte restent à configurer dans Cloudflare.

```sh
npx wrangler@4.158.0 deploy --keep-vars
```

L’API utilise les bindings `EMAIL` et `AI`, ainsi que la variable serveur `CONTACT_DESTINATION` pour la destination du formulaire. Ces paramètres se configurent dans Cloudflare, avec les autorisations d’envoi nécessaires. En prévisualisation locale, l’envoi d’e-mails n’est pas configuré et Ostie utilise sa réponse de secours.

Les identifiants Cloudflare, clés, jetons et fichiers d’environnement ne font pas partie du dépôt. Le fichier `.gitignore` protège aussi les caches, dépendances installées, sorties de build et dossiers de travail.

## Périmètre de l’import

Les dossiers applicatifs `content/`, `scripts/`, `src/` et `public/`, ainsi que `package.json` et `wrangler.jsonc`, sont intégralement importés. Le verrou npm et la configuration API sont ajoutés ; quatre scripts sont adaptés pour fonctionner depuis ce dépôt, sans dépendre de dossiers voisins.

Les captures de contrôle, journaux de sessions, documents internes, anciennes versions, fichiers de suivi des générations et caches sont exclus. Le dépôt contient le code et les médias nécessaires au site ; les comptes, connexions et données conservées par Calendly, Cloudflare ou les fournisseurs de médias restent dans ces services.

Les ressources de marque fournies sont conservées. Les licences des bibliothèques tierces restent présentes avec les ressources correspondantes ; aucune nouvelle licence de redistribution des contenus Ostenvia n’est accordée par cet import.
