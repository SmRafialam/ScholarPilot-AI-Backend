# ---- Builder ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build
# Compile the seed script to plain JS so the runner (no ts-node) can execute it on demand.
RUN npx tsc prisma/seed.ts --outDir dist/seedgen --rootDir prisma \
    --module commonjs --target ES2021 --moduleResolution node \
    --esModuleInterop --skipLibCheck

# ---- Runner ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=builder /app/dist ./dist
EXPOSE 4000
# Apply migrations, optionally (re)seed the catalog when RUN_SEED=true, then start the API.
CMD ["sh", "-c", "npx prisma migrate deploy && if [ \"$RUN_SEED\" = \"true\" ]; then echo 'Seeding catalog...' && node dist/seedgen/seed.js; fi && node dist/main"]
