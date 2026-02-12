# CLAUDE.md — IZYSS

## Aperçu de l'objectif du projet

IZYSS est une plateforme SaaS IA pour agences d'intérim. L'application permet aux recruteurs de gérer leur CVthèque, leurs missions, leurs contrats et leurs relances candidats, avec des outils IA intégrés (matching, scoring CV, génération de contrats). Le MVP est une SPA mono-fichier (HTML/CSS/JS vanilla) servant de référence visuelle pixel-perfect avant le passage à Next.js 15.

## Aperçu de l'architecture globale

- **Frontend** : Next.js 15 (App Router, RSC/SSR) + TypeScript + Tailwind CSS + Shadcn/ui + TanStack Query + tRPC
- **Backend** : tRPC Router + Zod + Better Auth + Prisma (ORM)
- **Base de données** : Neon (PostgreSQL 16 serverless) + pgvector (matching IA)
- **Service IA** : FastAPI (Python 3.12) déployé sur Railway — Claude API (Anthropic) pour parsing CV, matching, génération de textes
- **Stockage** : Cloudflare R2 (CVs, documents)
- **Emails/SMS** : Brevo
- **Hébergement** : Vercel (Next.js) + Railway (FastAPI)

## Style visuel

- Interface claire et minimaliste
- Pas de mode sombre pour le MVP
- Design system : palette violet (#6C5CE7), fond clair (#F4F6FB), typographie DM Sans + Space Mono
- Composants récurrents : KPI cards, drawers 540-580px, modals centrées, toasts, score bars, pills/filtres

## Contraintes et Politiques

- **NE JAMAIS exposer les clés API au client** — toutes les clés (Anthropic, Brevo, R2, etc.) restent côté serveur dans les variables d'environnement
- Données mockées pour le MVP (pas de persistence) — à remplacer par des appels API/BDD en V1
- Pas d'authentification dans le MVP — l'utilisateur est "Sophie" de "TalentStaff Lyon"
- Localisation : tout en français, région Lyon/Rhône-Alpes

## Dépendances

- Préférer les composants existants (Shadcn/ui) plutôt que d'ajouter de nouvelles bibliothèques UI
- Ne pas ajouter de dépendances sans raison explicite

## Tests interface graphique

À la fin de chaque développement qui implique l'interface graphique :
- Tester avec **playwright-skill** pour valider que l'interface est responsive, fonctionnelle et répond au besoin développé

## Context7

Utiliser **toujours** Context7 (outils MCP `resolve-library-id` + `query-docs`) pour :
- La génération de code basée sur une bibliothèque
- Les étapes de configuration ou d'installation
- La documentation de bibliothèque/API

Ce comportement est automatique — pas besoin de le demander explicitement.

## Documentation

- Spécifications produit : [PRD.md](./PRD.md)
- Architecture technique : [ARCHITECTURE.md](./ARCHITECTURE.md)

## Langue des spécifications

Toutes les spécifications doivent être rédigées en **français**, y compris les specs OpenSpec (sections Purpose et Scenarios). Seuls les titres de Requirements doivent rester en anglais avec les mots-clés `SHALL`/`MUST` pour la validation OpenSpec.
