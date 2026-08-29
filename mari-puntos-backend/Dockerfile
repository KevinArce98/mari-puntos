FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
RUN corepack enable
WORKDIR /app

# ── deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY mari-puntos-backend/package.json ./mari-puntos-backend/package.json
COPY mari-puntos-app/package.json ./mari-puntos-app/package.json
COPY mari-puntos-website/package.json ./mari-puntos-website/package.json
RUN pnpm install --frozen-lockfile --filter "mari-puntos-backend..."

# ── build ─────────────────────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app ./
COPY mari-puntos-backend ./mari-puntos-backend
COPY mari-puntos-backend/.env* ./mari-puntos-backend/
RUN pnpm --filter mari-puntos-backend build

# ── production deps only ───────────────────────────────────────────────────────
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY mari-puntos-backend/package.json ./mari-puntos-backend/package.json
COPY mari-puntos-app/package.json ./mari-puntos-app/package.json
COPY mari-puntos-website/package.json ./mari-puntos-website/package.json
RUN pnpm install --frozen-lockfile --prod --filter "mari-puntos-backend..."

# ── runtime ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=prod-deps /app ./
COPY --from=build /app/mari-puntos-backend/dist ./mari-puntos-backend/dist

WORKDIR /app/mari-puntos-backend

EXPOSE 3001

# Run migrations (advisory-locked) then start server
CMD ["sh", "-c", "node dist/scripts/migrate.js && node dist/server.js"]
