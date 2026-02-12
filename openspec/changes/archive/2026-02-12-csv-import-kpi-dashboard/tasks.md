## 1. Module IZYSS_DATA — Source de vérité

- [x] 1.1 Ajouter l'objet `IZYSS_DATA` en tête du `<script>` avec le commentaire `// Source: IZYSS-Details-Application.csv`
- [x] 1.2 Transcrire les 15 candidats du CSV dans `IZYSS_DATA.candidates` (id, name, initials, role, aiScore, status, location, skills)
- [x] 1.3 Transcrire les 8 missions du CSV dans `IZYSS_DATA.missions` (id, title, client, location, urgency, status, totalPositions, filledPositions, matchings)
- [x] 1.4 Transcrire les 10 contrats du CSV dans `IZYSS_DATA.contracts` (id, candidateName, role, client, startDate, endDate, hourlyRate, status, amendmentCount, contractNumber)
- [x] 1.5 Transcrire les 5 clients du CSV dans `IZYSS_DATA.clients` (name, emoji, sector, location)

## 2. Module KPIEngine — Calcul dynamique

- [x] 2.1 Implémenter `KPIEngine.dashboard()` : totalCandidates (847), activeMissions (calculé), contractsThisMonth (34), placementRate (78)
- [x] 2.2 Implémenter `KPIEngine.candidates()` : total (847), available (234), onMission (67), inactive (156)
- [x] 2.3 Implémenter `KPIEngine.missions()` : active (calculé depuis statuts), urgent (calculé depuis urgency=high), filledThisMonth (34), onSite (67), avgPlacementDays (2.1)
- [x] 2.4 Implémenter `KPIEngine.contracts()` : active (calculé depuis status=active), toSign (calculé depuis status=sign), amendmentsThisMonth (12), expiringSoon (calculé depuis status=expiring), yearlyTotal (187)

## 3. Injection des KPIs dans le DOM

- [x] 3.1 Identifier et ajouter des `id` sur les éléments KPI du Dashboard dans le HTML (ex: `id="kpi-db-total-candidates"`)
- [x] 3.2 Identifier et ajouter des `id` sur les éléments KPI de la page Candidats
- [x] 3.3 Identifier et ajouter des `id` sur les éléments KPI de la page Missions
- [x] 3.4 Identifier et ajouter des `id` sur les éléments KPI de la page Contrats
- [x] 3.5 Créer la fonction `initKPIs()` qui appelle `KPIEngine` et injecte les valeurs via `document.getElementById(...).textContent`
- [x] 3.6 Appeler `initKPIs()` dans le listener `DOMContentLoaded` (avant les `render*()` existants)

## 4. Vérification visuelle

- [x] 4.1 Vérifier que les 4 KPIs Dashboard affichent les bonnes valeurs (847, 7*, 34, 78%)
- [x] 4.2 Vérifier que les 4 KPIs Candidats affichent les bonnes valeurs (847, 234, 67, 156)
- [x] 4.3 Vérifier que les 5 KPIs Missions affichent les bonnes valeurs (7*, 3*, 34, 67, 2.1j)
- [x] 4.4 Vérifier que les 5 KPIs Contrats affichent les bonnes valeurs (4*, 2*, 12, 2*, 187)

> *Valeurs calculées dynamiquement depuis les 8/10 entrées mock. Les métriques scale-agence (847, 234, 67, 156, 34, 78, 34, 67, 2.1j, 12, 187) utilisent les constantes PRD. Les métriques dérivables du mock (active, urgent, toSign, expiringSoon) sont calculées depuis IZYSS_DATA.
