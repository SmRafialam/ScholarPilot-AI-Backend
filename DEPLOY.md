# Deployment Guide — ScholarPilot AI

All tooling is free-tier friendly. You deploy from **your own** accounts.

## Architecture in production

```
Vercel  ──  Frontend (Next.js, ScholarPilot-AI repo)
Railway ──  API (this repo, api/ Dockerfile) + Postgres + Redis
          + Qdrant / Meilisearch / object storage as managed add-ons
```

---

## 1. Backend API → Railway (Docker)

1. Create a Railway project, add **PostgreSQL** and **Redis** plugins.
2. New service → Deploy from GitHub → this repo, root directory `api/` (uses `api/Dockerfile`).
3. Set environment variables (see `api/.env.example`) — at minimum:
   - `DATABASE_URL` (from Railway Postgres), `REDIS_HOST`, `REDIS_PORT`
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (strong random values)
   - `OPENAI_API_KEY`
   - `FRONTEND_URL`, `ADMIN_URL` (your deployed URLs, for CORS)
4. The container runs `prisma migrate deploy` on start, then boots the API on port `4000`.

## 2. Frontend → Vercel

1. Import the [`ScholarPilot-AI`](https://github.com/SmRafialam/ScholarPilot-AI-) repo into Vercel (zero-config Next.js).
2. Set env var `NEXT_PUBLIC_API_URL` = `https://<your-railway-api>/api/v1`.
3. Deploy. Add your Vercel domain to the API's `FRONTEND_URL` for CORS.

## 3. Admin dashboard → Vercel

Deploy `admin/` as a second Vercel project; set its API URL and add its domain to `ADMIN_URL`.

## 4. CI

`.github/workflows/ci.yml` runs **build + tests** on every push / PR to `main`.

## 5. Secrets checklist

- [ ] `OPENAI_API_KEY` (rotate the dev key before production)
- [ ] `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (for Google login)
- [ ] `SMTP_*` (for real verification / reset emails)
- [ ] `STRIPE_SECRET_KEY` (to enable checkout — Step 17 is scaffolded, gated on this)

> Never commit `.env`. It is gitignored.

---

## Local development

```bash
docker compose up -d          # Postgres, Redis, Qdrant, Meilisearch, MinIO
cd api && npm ci && npm run db:migrate && npm run db:seed
npm run build && npm run start:prod   # stable; or npm run start:dev for watch
```
