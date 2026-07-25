# ── Stage 1: Build ──────────────────────────────────────────────
# Build context: mini_app/ (project root)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy server package files and install ALL deps (devDeps needed for tsc + prisma)
COPY server/package*.json ./
RUN npm ci

# Copy source code and prisma schema
COPY server/prisma ./prisma
COPY server/src ./src
COPY server/tsconfig.json ./

# Generate Prisma client and compile TypeScript
RUN npx prisma generate
RUN npx tsc

# ── Stage 2: Production ─────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy server package files and install production deps only
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

# Copy prisma schema + generated client (needed at runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY server/prisma ./prisma

# Copy admin dashboard (served as static files via Express /admin route)
COPY admin ./admin

# Expose port
EXPOSE 3000

# Apply DB migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/start.js"]
