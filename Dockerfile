# =============================================================================
# Dockerfile — Sportz UI (Next.js)
# =============================================================================
#
# Three stages:
#   deps    — install ALL dependencies (cached unless package*.json changes)
#   builder — compile the app with `next build` → produces .next/standalone/
#   runner  — copy ONLY the standalone server + static assets. No npm install.
#
# Note: the `npm ci` caching comes from COPYing package*.json before the source
# (same trick as the backend), NOT from having a separate `deps` stage — this
# could be done in two stages too. The real difference from the backend is that
# `npm ci` runs ONCE here: `output: 'standalone'` pre-bundles the needed deps
# into .next/standalone, so the runner installs nothing. The backend instead
# runs `npm ci` twice (builder + a prod-only install in the runner). The
# separate `deps` stage is just the Next.js template convention.
#
# Build (with the API URLs baked in — see the ARG note below):
#   docker build \
#     --build-arg NEXT_PUBLIC_API_URL=https://sportz-api.onrender.com \
#     --build-arg NEXT_PUBLIC_WS_URL=wss://sportz-api.onrender.com/ws \
#     -t sportz-ui .
# Run:
#   docker run -p 3000:3000 sportz-ui
# =============================================================================


# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Copy manifests first so this layer is cached independently of source changes.
COPY package*.json ./

# Install everything (devDeps included — Next needs them to build).
RUN npm ci


# ── Stage 2: builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Reuse the installed node_modules from the deps stage.
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source.
COPY . .

# --- BUILD-TIME ENVIRONMENT (the key difference from the backend) -------------
# NEXT_PUBLIC_* values are INLINED into the JS bundle during `next build`, not
# read at runtime. So they must exist NOW, at build time. We declare them as
# build args and promote them to env vars the build can see.
# Pass them with --build-arg (see header). If omitted, they're empty strings.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_APP_VERSION=0.1.0
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION

# Don't send Next.js telemetry from CI/Docker builds.
ENV NEXT_TELEMETRY_DISABLED=1

# Opt INTO output:'standalone' (next.config gates it on this). Only the Docker
# build wants standalone; `next start` elsewhere must not get it.
ENV DOCKER_BUILD=1

# Compile. With output:'standalone' this emits .next/standalone/ (server.js +
# pruned node_modules) plus the usual .next/static/.
# NOTE: Sentry's withSentryConfig runs here. Source-map UPLOAD needs
# SENTRY_AUTH_TOKEN, but the build succeeds without it (silent:true) — uploads
# are simply skipped, which is fine for a learning image.
RUN npm run build


# ── Stage 3: runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# The standalone server.js binds to localhost by default. In a container that's
# unreachable from outside — same lesson as the backend's HOST=0.0.0.0. Bind to
# all interfaces, on port 3000.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Non-root user — limits blast radius, exactly like the backend image.
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# --- The three things to copy (standalone leaves two of them behind) ----------
# 1. The standalone server + pruned deps. This is the bulk of the app.
#    --chown hands ownership to the non-root user as we copy.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 2. Static assets — NOT included in standalone; without this, no CSS/JS chunks.
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# 3. Public assets (favicon, images) — also NOT included in standalone.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# server.js is what `output: standalone` generated — NOT `next start`.
CMD ["node", "server.js"]
