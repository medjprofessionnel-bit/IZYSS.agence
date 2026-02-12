## Context

IZYSS est une plateforme SaaS pour agences d'intérim. Le prototype actuel est une SPA HTML/CSS/JS vanilla avec données mock (15 candidats, 8 missions, 10 contrats, 5 clients). Il n'y a pas encore de codebase Next.js — ce change crée le socle technique complet à partir de zéro.

**Contraintes :**
- Stack imposée : Next.js 15 + TypeScript + Tailwind + Shadcn/ui + tRPC + Better Auth + Prisma + Neon
- Données mock à conserver dans un premier temps (pas de BDD réelle en MVP)
- Pas d'authentification fonctionnelle en MVP (utilisateur "Sophie" par défaut)
- Hébergement cible : Vercel (web) + Railway (ai-service)

## Goals / Non-Goals

**Goals:**
- Initialiser le monorepo Turborepo avec `apps/web` (Next.js 15) et `apps/ai-service` (FastAPI scaffold)
- Configurer TypeScript strict, ESLint, Prettier pour les deux apps
- Intégrer Tailwind CSS 3 + Shadcn/ui avec le design system IZYSS (violet #6C5CE7, DM Sans, Space Mono)
- Mettre en place Better Auth (sessions + RBAC 4 rôles) — structure ready, non activée en MVP
- Schéma Prisma initial : `users`, `candidates`, `jobs`, `missions`, `contracts` + pgvector
- Router tRPC 11 root + procédures CRUD basiques (candidates, jobs, missions)
- CI GitHub Actions minimal (lint + type-check)

**Non-Goals:**
- Implémentation des pages UI (fait dans un change séparé)
- Connexion réelle à la base de données Neon (MVP = mock data)
- Déploiement effectif sur Vercel/Railway
- Intégration IA réelle (Claude API, matching, scoring)
- Authentification fonctionnelle (Login/Register actif)

## Decisions

### D1 — Monorepo Turborepo avec pnpm workspaces

**Décision :** Turborepo + pnpm workspaces plutôt qu'un repo simple ou Nx.

**Rationale :** L'architecture cible sépare `apps/web` (Next.js) et `apps/ai-service` (FastAPI Python). Turborepo offre le cache de build, le pipeline de tasks, et la gestion des workspaces avec pnpm — standard dans l'écosystème Next.js. Nx est trop verbeux pour ce projet.

**Structure :**
```
izyss/
├── apps/
│   ├── web/          # Next.js 15
│   └── ai-service/   # FastAPI Python (scaffold uniquement)
├── packages/
│   ├── ui/           # Composants Shadcn/ui partagés
│   └── db/           # Prisma client + schéma
├── turbo.json
└── package.json
```

### D2 — Next.js 15 App Router avec TypeScript strict

**Décision :** App Router (pas Pages Router) + `tsconfig` strict.

**Rationale :** App Router est le standard Next.js 15 avec RSC/SSR natif. Le mode strict TypeScript est imposé par ARCHITECTURE.md pour éviter les bugs silencieux. Les Server Components réduisent le JS côté client — essentiel pour les performances des pages tableau (candidats, missions, contrats).

### D3 — Better Auth pour l'authentification

**Décision :** Better Auth plutôt que NextAuth v5 ou Clerk.

**Rationale :** Better Auth est type-safe, supporte Prisma adapter nativement, et offre RBAC intégré (admin/recruiter/candidate/manager). NextAuth v5 est encore en beta et moins stable. Clerk est trop coûteux pour un SaaS B2B. En MVP, Better Auth est installé mais le middleware de protection de routes est bypassé (utilisateur "Sophie" hardcodé).

**Rôles RBAC :**
- `admin` : accès total
- `recruiter` : gestion CVthèque, missions, contrats, relances
- `candidate` : accès portail candidat uniquement
- `manager` : supervision agence

### D4 — Prisma + Neon (PostgreSQL 16 serverless)

**Décision :** Prisma ORM avec Neon comme provider PostgreSQL.

**Rationale :** Neon offre le serverless PostgreSQL avec branching (dev/prod séparés), pgvector natif pour le futur matching IA, et un free tier généreux. Prisma est le standard de facto avec Next.js pour le type-safety end-to-end. PlanetScale a abandonné son free tier.

**Modèles initiaux :** `User`, `Candidate`, `Job`, `Mission`, `Contract`

### D5 — tRPC 11 avec TanStack Query

**Décision :** tRPC 11 (serverless-ready) + TanStack Query v5 pour le data fetching côté client.

**Rationale :** tRPC assure la type-safety end-to-end sans génération de code (contrairement à GraphQL). Compatible App Router via `@trpc/next`. TanStack Query gère le cache, les mutations, et le state serveur côté client — pas besoin de Zustand ou Redux.

### D6 — Tailwind CSS 3 + Shadcn/ui (pas v4)

**Décision :** Tailwind CSS 3 (pas v4) + Shadcn/ui.

**Rationale :** Tailwind v4 est en beta et Shadcn/ui n'est pas encore fully compatible. Tailwind 3 est stable et battle-tested. Shadcn/ui fournit des composants accessibles (Radix UI) qui s'intègrent parfaitement avec le design system IZYSS. Le thème CSS sera configuré avec les variables du design system (--accent: #6C5CE7, etc.).

## Risks / Trade-offs

- **[Risque] Mock data vs API** : Les données mock sont en dur dans les Server Components / tRPC procedures. Quand l'API réelle sera branchée, il faudra remplacer les mocks un par un. → *Mitigation* : Isoler les mocks dans des fichiers `_mock/` dédiés par domaine (candidates, missions, contracts) pour faciliter le remplacement.

- **[Risque] Turborepo cold start** : Premier build sans cache peut être lent en CI. → *Mitigation* : Configurer Turborepo Remote Cache via Vercel dès le début.

- **[Risque] Better Auth MVP bypass** : Le bypass d'authentification (utilisateur hardcodé) ne doit pas traîner en production. → *Mitigation* : Documenter clairement les fichiers à modifier avec un commentaire `// TODO: Remove mock auth`.

- **[Trade-off] FastAPI scaffold minimal** : `apps/ai-service` sera un scaffold Python sans logique réelle en MVP (juste `main.py` + `requirements.txt`). Ça crée une fausse impression de complétion. → *Acceptable* : Clairement marqué "scaffold" dans le README.

## Migration Plan

1. Initialiser le monorepo depuis zéro (pas de migration de code existant)
2. Créer `apps/web` avec `create-next-app` (App Router + TypeScript)
3. Installer et configurer Tailwind 3 + Shadcn/ui + thème IZYSS
4. Installer Better Auth + Prisma + configurer le schéma
5. Installer tRPC + TanStack Query
6. Créer `apps/ai-service` scaffold FastAPI (Python)
7. Configurer Turborepo pipeline (`build`, `lint`, `type-check`)
8. Configurer GitHub Actions CI
9. Documenter `.env.example`

**Rollback :** Le prototype HTML/vanilla reste intact dans le repo — aucune migration de code, seulement ajout de nouveau code.

## Open Questions

- **Neon connection string** : La `DATABASE_URL` doit être fournie par l'utilisateur (compte Neon requis). En MVP, Prisma peut tourner avec `prisma generate` seulement (pas de `migrate dev`) si pas de BDD.
- **Version Node** : Confirmer Node 20 LTS sur les environnements de déploiement (Vercel supporte Node 20 nativement).
