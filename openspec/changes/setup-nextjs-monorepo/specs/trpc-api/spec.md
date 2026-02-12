## ADDED Requirements

### Requirement: Router tRPC 11 root configuré
L'application SHALL avoir un router tRPC root dans `apps/web/server/trpc.ts` avec un contexte incluant la session utilisateur, et des routers séparés pour `candidates`, `jobs` et `missions`.

#### Scenario: Import du router tRPC sans erreur
- **WHEN** `apps/web/server/trpc.ts` est importé
- **THEN** il se résout sans erreur TypeScript

#### Scenario: Router root merge les sub-routers
- **WHEN** le `appRouter` est inspecté
- **THEN** il contient les namespaces `candidates`, `jobs`, et `missions`

### Requirement: Procédures CRUD candidates (mock data)
Le router `candidates` SHALL exposer des procédures tRPC retournant les 15 candidats mock du CSV IZYSS : `list` (tous les candidats), `getById` (un candidat par ID), avec types Zod validés.

#### Scenario: candidates.list retourne 15 candidats
- **WHEN** la procédure `candidates.list` est appelée
- **THEN** elle retourne un tableau de 15 objets candidats avec les champs `id`, `name`, `role`, `aiScore`, `status`, `location`, `skills`

#### Scenario: candidates.getById retourne le bon candidat
- **WHEN** la procédure `candidates.getById` est appelée avec `id: 1`
- **THEN** elle retourne l'objet `{ id: 1, name: "Marc Lefèvre", role: "Cariste CACES 3", aiScore: 92, status: "Disponible" }`

#### Scenario: candidates.getById avec ID inexistant
- **WHEN** la procédure `candidates.getById` est appelée avec un ID qui n'existe pas (ex: 999)
- **THEN** elle lève une erreur tRPC `NOT_FOUND`

### Requirement: Procédures CRUD missions (mock data)
Le router `missions` SHALL exposer des procédures `list` et `getById` retournant les 8 missions mock du CSV IZYSS, avec les champs complets.

#### Scenario: missions.list retourne 8 missions
- **WHEN** la procédure `missions.list` est appelée
- **THEN** elle retourne un tableau de 8 objets mission avec `id`, `title`, `client`, `location`, `urgency`, `status`, `totalPositions`, `filledPositions`

### Requirement: Intégration TanStack Query côté client
L'application SHALL avoir le provider tRPC + TanStack Query configuré dans `apps/web/app/providers.tsx` pour les Client Components.

#### Scenario: Provider tRPC présent dans le layout root
- **WHEN** `apps/web/app/layout.tsx` est lu
- **THEN** il inclut `<Providers>` qui wraps `<TRPCReactProvider>` et `<QueryClientProvider>`

#### Scenario: Hook useTRPC utilisable dans un Client Component
- **WHEN** un Client Component utilise `const trpc = useTRPC()` et appelle `trpc.candidates.list.useQuery()`
- **THEN** le hook se résout avec les données mock sans erreur TypeScript

### Requirement: Route handler Next.js pour tRPC
L'application SHALL avoir une route handler Next.js App Router dans `apps/web/app/api/trpc/[trpc]/route.ts` qui expose l'API tRPC via HTTP.

#### Scenario: Route tRPC accessible via GET
- **WHEN** `GET /api/trpc/candidates.list` est appelé
- **THEN** le serveur répond avec les données JSON des candidats (status 200)
