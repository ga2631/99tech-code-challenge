# ==========================================
# Stage 1: Build & Compile TypeScript
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (better-sqlite3 C++ bindings)
RUN apk add --no-cache python3 make g++

COPY package*.json ./

# Use npm install to work seamlessly with or without an existing package-lock.json
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# Remove development dependencies to keep production node_modules minimal
RUN npm prune --omit=dev

# ==========================================
# Stage 2: Production Runtime
# ==========================================
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/database.sqlite

# Install runtime dependencies for SQLite
RUN apk add --no-cache sqlite-libs

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Create persistent data directory with proper node permissions
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
