## ADDED Requirements

### Requirement: Schéma Prisma avec 5 modèles métier
Le package `packages/db` SHALL contenir un schéma Prisma avec les modèles `User`, `Candidate`, `Job`, `Mission`, `Contract` et le provider `postgresql` (Neon).

#### Scenario: Génération Prisma client sans erreur
- **WHEN** `pnpm prisma generate` est exécuté dans `packages/db/`
- **THEN** le client Prisma est généré sans erreur avec tous les modèles disponibles

#### Scenario: Modèle Candidate contient les champs requis
- **WHEN** le schéma `Candidate` est lu
- **THEN** il contient au minimum : `id`, `name`, `role`, `aiScore`, `status`, `location`, `skills`, `createdAt`

#### Scenario: Modèle Mission contient les champs requis
- **WHEN** le schéma `Mission` est lu
- **THEN** il contient au minimum : `id`, `title`, `client`, `location`, `urgency`, `status`, `totalPositions`, `filledPositions`, `requiredSkills`, `startDate`, `endDate`

#### Scenario: Modèle Contract contient les champs requis
- **WHEN** le schéma `Contract` est lu
- **THEN** il contient au minimum : `id`, `candidateId`, `role`, `client`, `location`, `startDate`, `endDate`, `hourlyRate`, `status`, `contractNumber`, `amendmentCount`

### Requirement: Extension pgvector activée
Le schéma Prisma SHALL inclure `postgresTechnicalSchemaExtensions = ["vector"]` via Prisma preview features pour activer pgvector sur Neon.

#### Scenario: Extension vector dans le schéma
- **WHEN** le fichier `schema.prisma` est lu
- **THEN** il contient `previewFeatures = ["postgresqlExtensions"]` et `extensions = [vector]`

### Requirement: Client Prisma singleton exporté
Le package `packages/db` SHALL exporter un singleton Prisma client (`db`) qui évite les instanciations multiples en développement Next.js.

#### Scenario: Import du client Prisma depuis packages/db
- **WHEN** `import { db } from "@izyss/db"` est utilisé dans `apps/web`
- **THEN** l'import se résout sans erreur TypeScript

#### Scenario: Pas de multiples instances en développement
- **WHEN** le module est importé plusieurs fois en mode dev Next.js
- **THEN** un seul client Prisma est instancié (pattern global singleton)
