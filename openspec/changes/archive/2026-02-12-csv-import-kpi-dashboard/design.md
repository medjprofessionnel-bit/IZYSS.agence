## Context

Le SPA IZYSS (`izyss-app.html`) est un fichier HTML mono-fichier (~252KB, ~4000 lignes) avec des données mock hardcodées directement dans le JS. Les KPIs affichés (ex: "847 candidats", "12 missions actives") sont des chaînes statiques dans le HTML et ne correspondent pas aux données des tableaux JS. Le fichier CSV `IZYSS-Details-Application.csv` est la source de vérité définie par le product owner.

**État actuel :** Valeurs KPI hardcodées dans le HTML et les fonctions `render*()`, sans lien avec les objets de données.

**Contrainte principale :** JS vanilla pur, mono-fichier, pas de module bundler, pas de fetch/import dynamique.

## Goals / Non-Goals

**Goals:**
- Centraliser toutes les données métier dans un objet `IZYSS_DATA` en tête du `<script>`
- Implémenter un moteur `KPIEngine` qui calcule les KPIs de chaque page depuis `IZYSS_DATA`
- Remplacer toutes les valeurs KPI hardcodées dans le HTML et le JS par des appels à `KPIEngine`
- Les KPIs restent visuellement identiques (même composants, mêmes couleurs)

**Non-Goals:**
- Parser le fichier CSV directement dans le navigateur (les données sont transcrites manuellement dans `IZYSS_DATA`)
- Persistance des données (tout reste en mémoire)
- Modification du design system ou des composants UI
- Ajout de nouvelles pages ou fonctionnalités au-delà des KPIs

## Decisions

### D1 — Objet `IZYSS_DATA` global comme source de vérité

**Décision :** Un objet JS global `const IZYSS_DATA = { candidates: [...], missions: [...], contracts: [...], clients: [...] }` placé en tête du bloc `<script>`, avant toutes les autres déclarations.

**Rationale :** Dans un fichier mono-fichier JS vanilla, l'approche la plus simple et maintenable est un objet global. Pas de module ES6 (pas de bundler), pas de localStorage (pas de persistence nécessaire), pas de fetch (pas de serveur). L'objet global est accessible par toutes les fonctions existantes sans refactoring majeur.

**Données à intégrer depuis le CSV :**
- 15 candidats avec : id, nom, initiales, rôle, score IA, statut, localisation, compétences
- 8 missions avec : id, titre, client, lieu, urgence, statut, postes total/pourvus, matchings
- 10 contrats avec : id, candidat, rôle, client, dates, taux, statut, nb avenants, numéro
- 5 clients avec : nom, emoji, secteur, localisation

### D2 — Module `KPIEngine` pour le calcul dynamique

**Décision :** Un objet `const KPIEngine = { dashboard: () => {...}, candidates: () => {...}, missions: () => {...}, contracts: () => {...} }` qui lit `IZYSS_DATA` et retourne les valeurs KPI calculées.

**Rationale :** Séparer le calcul des KPIs de leur affichage permet de tester les calculs indépendamment et de mettre à jour facilement les valeurs si les données changent. Alternative rejetée : inliner les calculs dans chaque `render*()` → duplication et couplage fort.

**Calculs par page :**
- Dashboard : `candidates.length`, missions actives (status open/progress/urgent), contrats ce mois, taux placement
- Candidats : total, disponibles (status=dispo), en mission (status=mission), inactifs 90j (status=dormant+indispo)
- Missions : actives (open+progress+urgent), urgentes (urg=high), postes pourvus (sum filled), en poste (sum filled)
- Contrats : actifs (st=active), à signer (st=sign), avenants ce mois (sum aven.length), expirent 7j (st=expiring), total annuel

### D3 — Initialisation au `DOMContentLoaded`

**Décision :** Appeler `KPIEngine` et injecter les valeurs KPI dans le DOM via `textContent` sur les éléments KPI au `DOMContentLoaded`, avant le premier `render*()`.

**Rationale :** Garantit que le DOM est prêt avant l'injection. Les fonctions `render*()` existantes restent inchangées — seuls les éléments KPI statiques dans le HTML sont mis à jour.

## Risks / Trade-offs

- **[Risque] Désynchronisation CSV → IZYSS_DATA** : Si le CSV évolue, les données dans `IZYSS_DATA` doivent être mises à jour manuellement. → *Mitigation* : Commentaire `// Source: IZYSS-Details-Application.csv — mise à jour manuelle requise` au-dessus de `IZYSS_DATA`.

- **[Trade-off] Transcription manuelle des données** : Les 15+8+10 entrées du CSV sont transcrites à la main dans `IZYSS_DATA`. Risque d'erreur de saisie. → *Acceptable pour le MVP* : Les données sont vérifiables visuellement dans l'interface.

- **[Trade-off] KPIs calculés ≠ KPIs affichés dans le prototype** : Les KPIs calculés depuis les 10 contrats réels seront différents de "34 actifs" (valeur historique). → *Décision* : Utiliser les valeurs du PRD (hardcodées comme valeurs cibles) pour les KPIs non dérivables des 10 entrées mock (ex: "34 contrats ce mois" → la valeur reste 34 car elle représente le volume total de l'agence, pas juste les 10 affichés).
