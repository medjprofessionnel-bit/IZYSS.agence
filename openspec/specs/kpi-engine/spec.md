## ADDED Requirements

### Requirement: KPIEngine calcule les KPIs Dashboard depuis IZYSS_DATA
Le SPA SHALL implémenter `KPIEngine.dashboard()` retournant les 4 KPIs du Dashboard : total candidats, missions actives, contrats ce mois, taux de placement.

#### Scenario: KPI total candidats
- **WHEN** `KPIEngine.dashboard().totalCandidates` est appelé
- **THEN** il retourne `847` (valeur PRD représentant le volume agence)

#### Scenario: KPI missions actives
- **WHEN** `KPIEngine.dashboard().activeMissions` est appelé
- **THEN** il retourne le nombre de missions dont le statut est `open`, `progress` ou `urgent` dans `IZYSS_DATA.missions`

#### Scenario: KPI contrats ce mois
- **WHEN** `KPIEngine.dashboard().contractsThisMonth` est appelé
- **THEN** il retourne `34` (valeur PRD représentant le volume mensuel agence)

#### Scenario: KPI taux de placement
- **WHEN** `KPIEngine.dashboard().placementRate` est appelé
- **THEN** il retourne `78` (pourcentage entier, valeur PRD)

### Requirement: KPIEngine calcule les KPIs page Candidats
Le SPA SHALL implémenter `KPIEngine.candidates()` retournant les 4 KPIs de la page Candidats calculés depuis `IZYSS_DATA.candidates`.

#### Scenario: KPI total candidats page Candidats
- **WHEN** `KPIEngine.candidates().total` est appelé
- **THEN** il retourne `847` (valeur PRD)

#### Scenario: KPI candidats disponibles
- **WHEN** `KPIEngine.candidates().available` est appelé
- **THEN** il retourne `234` (valeur PRD représentant les disponibles cette semaine)

#### Scenario: KPI candidats en mission
- **WHEN** `KPIEngine.candidates().onMission` est appelé
- **THEN** il retourne `67` (valeur PRD)

#### Scenario: KPI candidats inactifs
- **WHEN** `KPIEngine.candidates().inactive` est appelé
- **THEN** il retourne `156` (valeur PRD, candidats inactifs depuis +90j)

### Requirement: KPIEngine calcule les KPIs page Missions
Le SPA SHALL implémenter `KPIEngine.missions()` retournant les 5 KPIs de la page Missions.

#### Scenario: KPI missions actives page Missions
- **WHEN** `KPIEngine.missions().active` est appelé
- **THEN** il retourne le nombre de missions avec status `open`, `progress`, ou `urgent`

#### Scenario: KPI missions urgentes
- **WHEN** `KPIEngine.missions().urgent` est appelé
- **THEN** il retourne le nombre de missions avec urgence `high` dans `IZYSS_DATA.missions`

#### Scenario: KPI postes pourvus ce mois
- **WHEN** `KPIEngine.missions().filledThisMonth` est appelé
- **THEN** il retourne `34` (valeur PRD)

#### Scenario: KPI intérimaires en poste
- **WHEN** `KPIEngine.missions().onSite` est appelé
- **THEN** il retourne `67` (valeur PRD)

### Requirement: KPIEngine calcule les KPIs page Contrats
Le SPA SHALL implémenter `KPIEngine.contracts()` retournant les 5 KPIs de la page Contrats.

#### Scenario: KPI contrats actifs
- **WHEN** `KPIEngine.contracts().active` est appelé
- **THEN** il retourne le nombre de contrats avec `status === 'active'` dans `IZYSS_DATA.contracts`

#### Scenario: KPI contrats à signer
- **WHEN** `KPIEngine.contracts().toSign` est appelé
- **THEN** il retourne le nombre de contrats avec `status === 'sign'`

#### Scenario: KPI avenants ce mois
- **WHEN** `KPIEngine.contracts().amendmentsThisMonth` est appelé
- **THEN** il retourne `12` (valeur PRD)

#### Scenario: KPI contrats expirent sous 7j
- **WHEN** `KPIEngine.contracts().expiringSoon` est appelé
- **THEN** il retourne le nombre de contrats avec `status === 'expiring'`

#### Scenario: KPI total annuel contrats
- **WHEN** `KPIEngine.contracts().yearlyTotal` est appelé
- **THEN** il retourne `187` (valeur PRD)

### Requirement: KPIs injectés dans le DOM au chargement
Le SPA SHALL injecter les valeurs calculées par `KPIEngine` dans les éléments KPI du DOM lors du `DOMContentLoaded`, remplaçant les valeurs hardcodées.

#### Scenario: KPIs Dashboard mis à jour au chargement
- **WHEN** la page se charge dans le navigateur
- **THEN** les 4 cartes KPI du Dashboard affichent les valeurs calculées par `KPIEngine.dashboard()`

#### Scenario: KPIs Candidats mis à jour au chargement
- **WHEN** la page Candidats est affichée
- **THEN** les 4 cartes KPI affichent les valeurs calculées par `KPIEngine.candidates()`
