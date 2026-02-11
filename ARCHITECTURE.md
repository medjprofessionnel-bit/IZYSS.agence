# ARCHITECTURE — IZYSS

> SaaS IA pour agences d'intérim — Référence technique

---

## 1. Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                        UTILISATEURS                             │
│          Recruteurs · Candidats · Managers · Admins             │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────────┐
│                    VERCEL (Edge Network)                        │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  Next.js 15 App                         │   │
│   │                                                         │   │
│   │   ┌──────────────┐    ┌──────────────────────────────┐  │   │
│   │   │   App Router  │    │     tRPC Router               │  │   │
│   │   │  (RSC + SSR)  │    │   (type-safe API layer)      │  │   │
│   │   └──────┬───────┘    └──────────────┬───────────────┘  │   │
│   │          │                           │                   │   │
│   │   ┌──────▼───────────────────────────▼───────────────┐  │   │
│   │   │              Route Handlers / Middleware          │  │   │
│   │   │         Better Auth · Zod validation              │  │   │
│   │   └──────────────────────┬────────────────────────────┘  │   │
│   └──────────────────────────┼─────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
┌─────────────▼──┐  ┌──────────▼──────────┐  ┌─▼──────────────────┐
│  NEON (PG)     │  │  RAILWAY             │  │  CLOUDFLARE R2     │
│                │  │                      │  │                    │
│  PostgreSQL    │  │  FastAPI (Python)    │  │  Fichiers·CVs      │
│  + pgvector    │  │                      │  │  Documents         │
│                │  │  ┌────────────────┐  │  └────────────────────┘
│  Prisma ORM    │  │  │  Claude API    │  │
│                │  │  │  (Anthropic)   │  │
└────────────────┘  │  └────────────────┘  │
                    │                      │
                    │  Matching IA         │
                    │  Parsing CVs         │
                    │  Génération textes   │
                    └──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │       BREVO         │
                    │  Emails · SMS       │
                    │  Notifications      │
                    └─────────────────────┘
```

---

## 2. Stack par couche

### Frontend
| Technologie | Version | Rôle |
|---|---|---|
| Next.js | 15 (App Router) | Framework React full-stack, SSR/RSC |
| TypeScript | 5.x | Typage statique end-to-end |
| Tailwind CSS | 3.x | Styles utilitaires |
| Shadcn/ui | latest | Composants UI accessibles (Radix UI) |
| TanStack Query | 5.x | Cache serveur, mutations, synchronisation |
| tRPC | 11.x | Appels API type-safe sans codegen |

### Backend
| Technologie | Version | Rôle |
|---|---|---|
| Next.js Route Handlers | 15 | Endpoints REST / webhooks |
| tRPC Router | 11.x | Couche API principale (procédures) |
| Zod | 3.x | Validation des schémas, contrats d'API |
| Better Auth | latest | Authentification (sessions, OAuth, RBAC) |
| Prisma | 5.x | ORM type-safe, migrations, query builder |

### Base de données
| Technologie | Rôle |
|---|---|
| Neon (PostgreSQL 16) | Base principale serverless, auto-scaling |
| pgvector | Extension vectorielle pour le matching IA |

### Service IA (microservice isolé)
| Technologie | Rôle |
|---|---|
| FastAPI (Python 3.12) | API IA déployée sur Railway |
| Claude API (Anthropic) | LLM principal — `claude-opus-4-6` / `claude-sonnet-4-5-20250929` |
| LangChain / LlamaIndex | Orchestration RAG (optionnel V1+) |

### Services tiers
| Service | Rôle |
|---|---|
| Cloudflare R2 | Stockage CVs, documents, exports |
| Brevo | Emails transactionnels + SMS candidats |

### Infrastructure & Déploiement
| Service | Rôle |
|---|---|
| Vercel | Hébergement Next.js, Edge Functions, CI/CD |
| Railway | Hébergement FastAPI, containerisation Docker |
| GitHub | VCS, GitHub Actions pour CI |

---

## 3. Principes directeurs

### Type-safety de bout en bout
tRPC + Zod + Prisma forment une chaîne typée depuis la base de données jusqu'au composant React. Aucun contrat d'API non vérifié.

### Séparation IA / Métier
Le service FastAPI sur Railway est isolé du monorepo Next.js. Cela permet de scaler indépendamment la charge IA, de déployer en Python natif, et d'éviter les cold starts Vercel sur des traitements lourds.

### Serverless-first
Neon (PostgreSQL serverless) + Vercel Edge = scaling automatique sans gestion d'infrastructure. Coût nul à faible trafic (MVP).

### Données vectorielles intégrées
pgvector sur Neon évite un service vectoriel séparé (Pinecone, Weaviate). Les embeddings CVs/offres vivent dans la même base que les données métier.

### Auth centralisée avec RBAC
Better Auth gère les rôles : `admin`, `recruiter`, `candidate`, `manager`. Les policies sont appliquées au niveau tRPC middleware.

---

## 4. Feuille de route technique

### MVP (0 → 3 mois)
- [ ] Setup monorepo Next.js 15 + Prisma + Better Auth
- [ ] Schéma DB : `users`, `candidates`, `jobs`, `missions`, `contracts`
- [ ] CRUD recruteurs/candidats avec upload CV (R2)
- [ ] Service FastAPI minimal : parsing CV + matching simple
- [ ] Intégration Claude API pour extraction de compétences
- [ ] Dashboard recruteur (liste candidats, statuts missions)
- [ ] Emails transactionnels Brevo (confirmation inscription, placement)

### V1 (3 → 6 mois)
- [ ] Matching IA avancé avec pgvector (embeddings + scoring)
- [ ] Espace candidat autonome (profil, disponibilités, contrats)
- [ ] Génération automatique de contrats (intérim, CDD)
- [ ] Notifications SMS candidats via Brevo
- [ ] Tableau de bord analytique (taux de placement, délais)
- [ ] Multi-tenancy (plusieurs agences sur une instance)

### V2 (6 → 12 mois)
- [ ] Application mobile (React Native / Expo)
- [ ] Intégration ATS tiers (API bidirectionnelle)
- [ ] Chatbot candidat (Claude + RAG sur base documentaire)
- [ ] Module conformité légale (RGPD, archivage contrats)
- [ ] Marketplace de missions (portail candidat public)

---

## 5. Variables d'environnement

### Next.js (`.env.local`)
```env
# Base de données
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/izyss?sslmode=require"

# Auth
BETTER_AUTH_SECRET="secret-32-chars-minimum"
BETTER_AUTH_URL="http://localhost:3000"

# Service IA
AI_SERVICE_URL="https://izyss-ai.railway.app"
AI_SERVICE_SECRET="shared-secret-key"

# Cloudflare R2
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="izyss-documents"
R2_PUBLIC_URL="https://documents.izyss.com"

# Brevo
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="noreply@izyss.com"
BREVO_SENDER_NAME="IZYSS"

# App
NEXT_PUBLIC_APP_URL="https://app.izyss.com"
NODE_ENV="development"
```

### FastAPI (Railway env vars)
```env
# Anthropic
ANTHROPIC_API_KEY="sk-ant-..."
CLAUDE_MODEL="claude-sonnet-4-5-20250929"

# Database (pour accès vectoriel direct)
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/izyss?sslmode=require"

# Sécurité inter-services
AI_SERVICE_SECRET="shared-secret-key"

# Config
ENVIRONMENT="production"
LOG_LEVEL="INFO"
```

---

## 6. Structure de projet recommandée

```
izyss/
├── apps/
│   ├── web/                          # Next.js 15
│   │   ├── app/
│   │   │   ├── (auth)/               # Login, register, reset
│   │   │   ├── (dashboard)/          # Interface recruteur
│   │   │   │   ├── candidates/
│   │   │   │   ├── jobs/
│   │   │   │   ├── missions/
│   │   │   │   └── analytics/
│   │   │   ├── (candidate)/          # Espace candidat
│   │   │   └── api/
│   │   │       ├── auth/             # Better Auth handler
│   │   │       ├── trpc/             # tRPC handler
│   │   │       └── webhooks/         # Brevo, R2 events
│   │   ├── components/
│   │   │   ├── ui/                   # Shadcn/ui components
│   │   │   └── features/             # Composants métier
│   │   ├── lib/
│   │   │   ├── auth.ts               # Better Auth config
│   │   │   ├── db.ts                 # Prisma client
│   │   │   ├── trpc/
│   │   │   │   ├── client.ts
│   │   │   │   ├── server.ts
│   │   │   │   └── router/
│   │   │   │       ├── index.ts      # Root router
│   │   │   │       ├── candidates.ts
│   │   │   │       ├── jobs.ts
│   │   │   │       └── missions.ts
│   │   │   └── validations/          # Schémas Zod partagés
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   │
│   └── ai-service/                   # FastAPI (Python)
│       ├── main.py
│       ├── routers/
│       │   ├── matching.py           # Matching candidat/offre
│       │   ├── parsing.py            # Parsing CVs
│       │   └── generation.py         # Génération textes
│       ├── services/
│       │   ├── claude_client.py      # Wrapper Anthropic SDK
│       │   ├── embeddings.py         # Calcul vecteurs
│       │   └── vector_store.py       # Queries pgvector
│       ├── models/                   # Pydantic schemas
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/
│   └── types/                        # Types partagés TS (optionnel)
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Tests + lint
│       └── deploy.yml                # Deploy Vercel + Railway
│
├── ARCHITECTURE.md                   # Ce fichier
├── PRD.md                            # Product Requirements
├── package.json                      # Root workspace
└── turbo.json                        # Turborepo config (si monorepo)
```

---

## 7. Flux de données clés

### Matching candidat ↔ offre
```
Recruteur crée offre → tRPC mutation
  → Prisma insert (jobs table)
  → Appel HTTP → FastAPI /matching
    → Claude API : extraction compétences requises
    → Calcul embedding offre (pgvector)
    → Query: SELECT candidates ORDER BY embedding <=> job_embedding
    → Retour: top-N candidats scorés
  → Réponse tRPC → UI TanStack Query update
```

### Upload et parsing CV
```
Candidat upload CV → tRPC mutation
  → Stream vers Cloudflare R2
  → URL R2 stockée en DB (Prisma)
  → Appel HTTP → FastAPI /parsing
    → Claude API : extraction structurée (nom, expériences, compétences)
    → Calcul embedding profil
    → UPDATE candidate SET profile_vector = [...], parsed_data = {...}
  → Notification email Brevo → candidat
```

---

*Dernière mise à jour : 2026-02-11*
