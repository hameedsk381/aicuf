FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install tsx for running migrations
RUN npm install -g tsx

# Copy public assets
COPY --from=builder /app/public ./public

# Set the correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy migration files and dependencies for production
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/lib/db ./lib/db
COPY --from=builder --chown=nextjs:nodejs /app/scripts/migrate.ts ./scripts/migrate.ts
# COPY --from=builder --chown=nextjs:nodejs /app/scripts/create-admin.ts ./scripts/create-admin.ts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy required node_modules for migrations (if not included in standalone)
# Standalone usually includes necessary dependencies, but we might need devDeps for migration scripts if they use ts-node or similar?
# The original dockerfile copied specific modules. Let's keep them if possible, but npm ci in runner might be cleaner if needed.
# However, standalone should have what's needed for the app.
# For migrations, we might need to copy node_modules from deps if they are not in standalone.
# But standalone puts node_modules in ./node_modules.
# Let's assume standalone is enough for the app.
# For the migration script `bun run scripts/migrate.ts`, we need to change it to use node/tsx/ts-node.
# The package.json has "db:migrate": "bun run scripts/migrate.ts". We need to update that too or run it with node.

# Copy entrypoint script
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
