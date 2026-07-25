# ScholarPilot AI — Backend

Backend for **ScholarPilot AI**, the AI copilot for studying abroad. This repository holds the **API + workers + scraping engine** (NestJS) and the internal **Admin Dashboard** (Next.js). The student-facing app lives in [`ScholarPilot-AI`](https://github.com/SmRafialam/ScholarPilot-AI-).

---

## Monorepo layout

```
ScholarPilot-AI-Backend/
├── api/                 # NestJS — REST API, business services, workers, scrapers
│   ├── prisma/          # Prisma schema & migrations (PostgreSQL)
│   └── src/
│       ├── prisma/      # PrismaService (global)
│       ├── modules/     # feature modules (auth, profile, university, ...)
│       ├── common/      # guards, filters, interceptors, decorators
│       └── config/      # typed env config
├── admin/               # Next.js — internal admin dashboard
└── docker-compose.yml   # Postgres · Redis · Qdrant · Meilisearch · MinIO (all free)
```

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | NestJS 11 (TypeScript) |
| ORM / DB | Prisma 6 · PostgreSQL 16 |
| Queue / cache | Redis · BullMQ |
| Vector DB | Qdrant |
| Search | Meilisearch |
| Object storage | MinIO (S3-compatible) / AWS S3 |
| Scraping | Playwright · Cheerio |
| AI | Claude · OpenAI · Gemini (via provider-agnostic gateway) |
| Admin UI | Next.js 16 · Tailwind v4 |

> **Dev is 100% free / self-hosted** via Docker. Only AI API calls incur usage cost.

## Architecture principles

- **Clean Architecture** — `Action/Controller → Service → Repository → Prisma`
- **SOLID**, repository pattern, dependency injection
- No hardcoded values — everything via validated env config
- Heavy work (scraping, embeddings, AI batch) runs on **BullMQ workers**, never blocking the API

## Getting Started

```bash
# 1. Start infrastructure (needs Docker Desktop running)
docker compose up -d

# 2. API
cd api
cp .env.example .env
npm install
npm run db:migrate      # creates the schema in Postgres
npm run start:dev       # http://localhost:4000/api/v1

# 3. Admin dashboard
cd ../admin
npm install
npm run dev             # http://localhost:3200
```

## API scripts (`api/`)

| Command | Description |
|---|---|
| `npm run start:dev` | API in watch mode |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run test` | Unit tests |

## Build progress (module by module)

- [x] Step 1 — Product Architecture
- [x] Step 2 — Database Design (Prisma schema, ~40 models)
- [x] Step 3 — Folder Structure & infra foundation
- [ ] Step 4 — Authentication
- [ ] Step 5 — Student Profile
- [ ] Step 6–8 — University / Scholarship / Professor engines
- [ ] Step 9 — Scraper architecture
- [ ] Step 10–11 — AI Matching Engine & Application Assistant
- [ ] Step 12–13 — Document & Email generators
- [ ] Step 14–20 — Dashboard, Tracker, Admin, Payments, Notifications, Deploy, Tests

---

© 2026 ScholarPilot AI
