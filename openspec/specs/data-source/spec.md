## ADDED Requirements

### Requirement: Objet IZYSS_DATA global contenant toutes les données métier
Le SPA SHALL déclarer un objet global `IZYSS_DATA` en tête du bloc `<script>` contenant les tableaux `candidates` (15 entrées), `missions` (8 entrées), `contracts` (10 entrées) et `clients` (5 entrées) issus du fichier CSV IZYSS-Details-Application.csv.

#### Scenario: IZYSS_DATA accessible globalement
- **WHEN** le SPA est chargé dans le navigateur
- **THEN** `window.IZYSS_DATA` est défini et contient les propriétés `candidates`, `missions`, `contracts`, `clients`

#### Scenario: 15 candidats présents dans IZYSS_DATA
- **WHEN** `IZYSS_DATA.candidates` est accédé
- **THEN** il contient exactement 15 objets avec les champs `id`, `name`, `role`, `aiScore`, `status`, `location`, `skills`

#### Scenario: 8 missions présentes dans IZYSS_DATA
- **WHEN** `IZYSS_DATA.missions` est accédé
- **THEN** il contient exactement 8 objets avec les champs `id`, `title`, `client`, `location`, `urgency`, `status`, `totalPositions`, `filledPositions`

#### Scenario: 10 contrats présents dans IZYSS_DATA
- **WHEN** `IZYSS_DATA.contracts` est accédé
- **THEN** il contient exactement 10 objets avec les champs `id`, `candidateName`, `role`, `client`, `startDate`, `endDate`, `status`, `amendmentCount`, `contractNumber`

### Requirement: Commentaire de traçabilité sur IZYSS_DATA
Le code SHALL inclure un commentaire au-dessus de `IZYSS_DATA` indiquant la source CSV et la nécessité de mise à jour manuelle.

#### Scenario: Commentaire source visible dans le code
- **WHEN** le fichier `izyss-app.html` est lu
- **THEN** le bloc `IZYSS_DATA` est précédé du commentaire `// Source: IZYSS-Details-Application.csv`
