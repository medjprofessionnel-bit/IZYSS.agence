## 1. Initialisation du monorepo Turborepo

- [ ] 1.1 Créer la structure racine du monorepo : `turbo.json`, `package.json` (pnpm workspaces), `.npmrc`, `.gitignore`
- [ ] 1.2 Configurer `turbo.json` avec le pipeline `build`, `lint`, `type-check`, `dev`
- [ ] 1.3 Créer `apps/web/` avec `create-next-app` (Next.js 15, App Router, TypeScript, Tailwind)
- [ ] 1.4 Créer `apps/ai-service/` scaffold FastAPI (`main.py`, `requirements.txt`, `README.md`)
- [ ] 1.5 Créer `packages/ui/` avec re-export des composants Shadcn/ui
- [ ] 1.6 Créer `packages/db/` avec Prisma (`schema.prisma`, client singleton, `index.ts`)

## 2. Configuration TypeScript, ESLint, Prettier

- [ ] 2.1 Configurer `tsconfig.json` strict dans `apps/web/` (`strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- [ ] 2.2 Configurer ESLint dans `apps/web/` (config Next.js + TypeScript rules)
- [ ] 2.3 Ajouter `.prettierrc` à la racine avec les règles de formatage (semi, singleQuote, tabWidth: 2)
- [ ] 2.4 Ajouter les scripts `lint`, `type-check`, `format` dans `package.json` racine via Turborepo

## 3. Design system IZYSS — Tailwind + Shadcn/ui

- [ ] 3.1 Configurer `tailwind.config.ts` avec les couleurs IZYSS (--accent: #6C5CE7, palettes complètes)
- [ ] 3.2 Ajouter les fonts Google Fonts (DM Sans, Space Mono) dans `apps/web/app/layout.tsx`
- [ ] 3.3 Initialiser Shadcn/ui dans `apps/web/` avec le thème IZYSS (violet comme couleur primaire)
- [ ] 3.4 Installer les composants Shadcn/ui de base : Button, Input, Badge, Card, Dialog, Drawer, Toast

## 4. Schéma Prisma + pgvector

- [ ] 4.1 Écrire le schéma Prisma dans `packages/db/schema.prisma` avec les modèles `User`, `Candidate`, `Job`, `Mission`, `Contract`
- [ ] 4.2 Activer l'extension pgvector (`previewFeatures = ["postgresqlExtensions"]`, `extensions = [vector]`)
- [ ] 4.3 Implémenter le client Prisma singleton dans `packages/db/src/client.ts` (pattern global dev)
- [ ] 4.4 Exporter le client et les types depuis `packages/db/index.ts`
- [ ] 4.5 Créer `.env.example` dans `apps/web/` avec `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_TRPC_URL`

## 5. Better Auth + session mock

- [ ] 5.1 Installer Better Auth dans `apps/web/` avec le Prisma adapter
- [ ] 5.2 Créer `apps/web/lib/auth.ts` avec la config Better Auth (4 rôles RBAC)
- [ ] 5.3 Créer le helper `getSession()` mock retournant Sophie de TalentStaff Lyon (avec commentaire `// TODO: Remove mock auth`)
- [ ] 5.4 Créer `apps/web/middleware.ts` avec la structure de protection des routes (bypass MVP actif)

## 6. Router tRPC 11 + data mock

- [ ] 6.1 Installer tRPC 11 + TanStack Query v5 dans `apps/web/`
- [ ] 6.2 Créer `apps/web/server/trpc.ts` (init tRPC, context avec session, procédures publiques)
- [ ] 6.3 Créer les données mock dans `apps/web/_mock/candidates.ts` (15 candidats du CSV IZYSS)
- [ ] 6.4 Créer les données mock dans `apps/web/_mock/missions.ts` (8 missions du CSV IZYSS)
- [ ] 6.5 Créer les données mock dans `apps/web/_mock/contracts.ts` (10 contrats du CSV IZYSS)
- [ ] 6.6 Créer le router `candidates` avec procédures `list` et `getById` (Zod validation)
- [ ] 6.7 Créer le router `missions` avec procédures `list` et `getById`
- [ ] 6.8 Créer le router `jobs` avec procédure `list`
- [ ] 6.9 Créer l'`appRouter` root dans `apps/web/server/root.ts` (merge des 3 routers)
- [ ] 6.10 Créer la route handler Next.js `apps/web/app/api/trpc/[trpc]/route.ts`
- [ ] 6.11 Créer `apps/web/app/providers.tsx` avec `TRPCReactProvider` + `QueryClientProvider`
- [ ] 6.12 Wrapper `apps/web/app/layout.tsx` avec `<Providers>`

## 7. CI GitHub Actions

- [ ] 7.1 Créer `.github/workflows/ci.yml` avec jobs `lint` et `type-check` (Node 20, pnpm, Turborepo)
- [ ] 7.2 Vérifier que le CI s'exécute sans erreur sur une PR de test
