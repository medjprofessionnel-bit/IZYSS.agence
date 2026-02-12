## ADDED Requirements

### Requirement: Better Auth installé et configuré
L'application SHALL avoir Better Auth installé avec le Prisma adapter et une configuration initiale dans `apps/web/lib/auth.ts` définissant les 4 rôles : `admin`, `recruiter`, `candidate`, `manager`.

#### Scenario: Module auth importable sans erreur
- **WHEN** `apps/web/lib/auth.ts` est importé dans un Server Component
- **THEN** l'import se résout sans erreur TypeScript ni erreur de runtime

#### Scenario: Configuration des rôles RBAC
- **WHEN** la configuration Better Auth est initialisée
- **THEN** les rôles `admin`, `recruiter`, `candidate`, `manager` sont définis dans la config

### Requirement: Utilisateur mock "Sophie" en MVP
En l'absence d'authentification réelle, l'application SHALL utiliser un utilisateur hardcodé "Sophie" de "TalentStaff Lyon" avec le rôle `recruiter` via un helper `getSession()` mock.

#### Scenario: getSession() retourne l'utilisateur mock
- **WHEN** `getSession()` est appelé dans un Server Component
- **THEN** il retourne `{ user: { name: "Sophie", agency: "TalentStaff Lyon", role: "recruiter" } }`

#### Scenario: Commentaire TODO visible sur le mock
- **WHEN** le fichier `apps/web/lib/auth.ts` est lu
- **THEN** il contient un commentaire `// TODO: Remove mock auth` sur la fonction mock

### Requirement: Middleware de protection des routes (structure ready)
L'application SHALL avoir un fichier `apps/web/middleware.ts` configuré pour protéger les routes `/dashboard`, `/candidats`, `/missions`, `/contrats`, avec redirection vers `/login` si non authentifié — mais bypassé en MVP.

#### Scenario: Middleware existe et est valide TypeScript
- **WHEN** `tsc --noEmit` est exécuté
- **THEN** `middleware.ts` compile sans erreur

#### Scenario: Bypass MVP actif
- **WHEN** un utilisateur accède à `/dashboard` sans session
- **THEN** il n'est PAS redirigé vers `/login` (bypass actif en MVP)
