## ADDED Requirements

### Requirement: Monorepo Turborepo initialisé avec pnpm workspaces
Le projet SHALL être structuré comme un monorepo Turborepo avec pnpm workspaces contenant `apps/web` (Next.js 15) et `apps/ai-service` (FastAPI scaffold), ainsi que les packages partagés `packages/ui` et `packages/db`.

#### Scenario: Structure de dossiers conforme
- **WHEN** le monorepo est initialisé
- **THEN** les dossiers `apps/web/`, `apps/ai-service/`, `packages/ui/`, `packages/db/` existent à la racine

#### Scenario: Pipeline Turborepo fonctionnel
- **WHEN** `pnpm turbo build` est exécuté depuis la racine
- **THEN** Turborepo exécute les builds dans l'ordre des dépendances sans erreur

### Requirement: Configuration TypeScript strict dans apps/web
L'application web SHALL utiliser TypeScript en mode strict (`"strict": true`) avec les options `noUncheckedIndexedAccess` et `exactOptionalPropertyTypes` activées.

#### Scenario: Compilation TypeScript sans erreur
- **WHEN** `pnpm type-check` est exécuté
- **THEN** `tsc --noEmit` se termine avec code de sortie 0

#### Scenario: Rejet d'un type implicite `any`
- **WHEN** une variable est déclarée sans type et TypeScript ne peut pas l'inférer
- **THEN** la compilation échoue avec une erreur TS7006

### Requirement: ESLint et Prettier configurés
Le projet SHALL avoir ESLint (config Next.js + TypeScript) et Prettier configurés avec un fichier `.prettierrc` à la racine.

#### Scenario: Lint sans erreur sur le code généré
- **WHEN** `pnpm lint` est exécuté sur `apps/web/`
- **THEN** ESLint retourne 0 warnings et 0 errors sur le code scaffoldé

#### Scenario: Format Prettier cohérent
- **WHEN** `pnpm format --check` est exécuté
- **THEN** tous les fichiers source respectent les règles Prettier (pas de diff)

### Requirement: Variables d'environnement documentées
Le projet SHALL fournir un fichier `.env.example` à la racine de `apps/web/` listant toutes les variables requises avec des valeurs placeholder et commentaires.

#### Scenario: Variables requises présentes dans .env.example
- **WHEN** le fichier `.env.example` est lu
- **THEN** il contient `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, et `NEXT_PUBLIC_TRPC_URL`

### Requirement: CI GitHub Actions minimal
Le projet SHALL avoir un workflow GitHub Actions `.github/workflows/ci.yml` qui exécute lint et type-check sur chaque push et pull request.

#### Scenario: CI s'exécute sur push main
- **WHEN** un commit est poussé sur la branche `main`
- **THEN** le workflow CI est déclenché et exécute `lint` puis `type-check`

#### Scenario: CI échoue si lint errors
- **WHEN** le code contient des erreurs ESLint
- **THEN** le job CI échoue avec un code de sortie non-zéro
