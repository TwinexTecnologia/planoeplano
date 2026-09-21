# Build: 1) Install + 2) Build dist deps (Stage 3) Runtime node_modules slim

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY packages ./packages
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
RUN npm install --no-audit --no-fund --include=dev

# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .
RUN npm run prisma:generate
RUN npm run build:backend

# ---------- Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV BACKEND_PORT=10000

# Instala apenas runtime deps da aplicação (sem devDeps, menor imagem final)
COPY package*.json ./
COPY packages ./packages
COPY apps/backend/package.json ./apps/backend/
RUN npm install --no-audit --no-fund --omit=dev

# Copia build + schema + build do Nest
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/apps/backend/node_modules/.prisma ./apps/backend/node_modules/.prisma
COPY --from=builder /app/apps/backend/node_modules/@prisma ./apps/backend/node_modules/@prisma

WORKDIR /app/apps/backend

EXPOSE 10000

# Boot: aplica migrations (prisma migrate deploy) + seed (idempotente) + start NestJS
CMD ["sh", "-c", "cd /app && npx --yes prisma@latest migrate deploy --schema=apps/backend/prisma/schema.prisma && (npm run seed || echo 'Seed ja rodou, ignorando erro') && cd apps/backend && node dist/main"]
