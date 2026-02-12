## Why

IZYSS n'a pas encore de codebase — seul un prototype HTML statique existe. Pour démarrer le MVP, il faut un socle technique opérationnel : monorepo Next.js 15 avec auth, base de données, couche API type-safe et structure de dossiers conforme à ARCHITECTURE.md.

## What Changes

- Initialisation du monorepo `izyss/` avec Turborepo (apps/web + apps/ai-service)
- Setup Next.js 15 App Router + TypeScript strict dans `apps/web/`
- Intégration Tailwind CSS 3 + Shadcn/ui (composants de base)
- Configuration Better Auth (sessions, RBAC : admin / recruiter / candidate / manager)
- Schéma Prisma initial : `users`, `candidates`, `jobs`, `missions`, `contracts`
- Extension pgvector activée sur Neon pour le futur matching IA
- Setup tRPC 11 (router root + procédures candidates, jobs, missions)
- Variables d'environnement documentées (`.env.example`)
- CI GitHub Actions minimal (lint + type-check)

## Capabilities

### New Capabilities

- `project-foundation`: Monorepo Turborepo, structure de dossiers, config TypeScript/ESLint/Prettier, scripts npm root
- `auth`: Authentification et sessions via Better Auth, RBAC 4 rôles, routes protégées middleware
- `database-schema`: Schéma Prisma complet (5 modèles), migrations initiales, client Prisma singleton, extension pgvector
- `trpc-api`: Router tRPC root, procédures CRUD basiques (candidates, jobs, missions), intégration TanStack Query côté client

### Modified Capabilities

_(aucune — greenfield)_

## Impact

- **Nouveau** : tout le répertoire `apps/web/` et `apps/ai-service/` (scaffolding uniquement pour ai-service)
- **Dépendances** : Node 20+, pnpm workspaces, Neon (PostgreSQL 16 + pgvector), Vercel (déploiement)
- **Environnement** : nécessite `DATABASE_URL` (Neon), `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`
- **Aucune API publique exposée** à ce stade — uniquement fondation interne
