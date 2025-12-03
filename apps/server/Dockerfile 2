# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client with dummy DATABASE_URL (for type generation only)
# Prisma can generate client without actual database connection
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy necessary files from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Copy node_modules (Prisma Client will be regenerated at runtime with correct DATABASE_URL)
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
# Remove generated Prisma Client to force regeneration with correct DATABASE_URL
RUN rm -rf ./node_modules/.prisma || true

# Generate Prisma Client at runtime (needs DATABASE_URL from environment)
USER nestjs

EXPOSE 3001

ENV PORT 3001

# Generate Prisma Client and start the server
# Regenerate Prisma Client with correct DATABASE_URL from environment
CMD npx prisma generate --schema=./prisma/schema.prisma && node dist/src/main.js

