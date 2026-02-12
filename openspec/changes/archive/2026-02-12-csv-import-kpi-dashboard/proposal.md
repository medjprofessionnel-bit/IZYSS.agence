## Why

Le MVP IZYSS affiche des KPIs avec des valeurs hardcodées non reliées aux données métier réelles définies dans le CSV de référence. Il faut synchroniser les KPIs de toutes les pages avec les données du fichier `IZYSS-Details-Application.csv` et les exposer comme source de vérité unique dans le SPA.

## What Changes

- Intégration des données CSV comme source de vérité dans le SPA HTML/JS vanilla
- Calcul dynamique des KPIs macro du Dashboard depuis les données réelles (candidats, missions, contrats)
- Synchronisation des KPIs de la page Candidats avec les données réelles (847 total, 234 disponibles, 67 en mission, 156 inactifs)
- Synchronisation des KPIs de la page Missions (12 actives, 5 urgentes, 34 pourvus, 67 en poste)
- Synchronisation des KPIs de la page Contrats (34 actifs, 6 à signer, 12 avenants, 5 expirent, 187 annuel)
- Remplacement des valeurs hardcodées par un module de données centralisé (`IZYSS_DATA`)

## Capabilities

### New Capabilities

- `data-source`: Module JS centralisé `IZYSS_DATA` qui contient toutes les données métier du CSV (candidats, missions, contrats, clients) comme source de vérité unique
- `kpi-engine`: Fonctions de calcul des KPIs macro dérivées dynamiquement depuis `IZYSS_DATA` pour toutes les pages (Dashboard, Candidats, Missions, Contrats)

### Modified Capabilities

_(aucune — les KPIs existants restent visuellement identiques, seules les valeurs sont calculées dynamiquement)_

## Impact

- **Fichier** : `izyss-app.html` — remplacement des valeurs KPI hardcodées par des appels aux fonctions de calcul
- **Nouveau module** : objet `IZYSS_DATA` en tête du `<script>` avec les tableaux `candidates`, `missions`, `contracts`, `clients`
- **Données** : 15 candidats, 8 missions, 10 contrats, 5 clients issus du CSV IZYSS-Details-Application.csv
- **Aucune dépendance externe** : JS vanilla pur, pas de bibliothèque supplémentaire
