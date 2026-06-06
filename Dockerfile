# ── Stage 1: builder ──────────────────────────────────────────────────────────
# Installs all dependencies (including devDeps) and compiles TypeScript.
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# ── Stage 2: runner ───────────────────────────────────────────────────────────
# Production image: only production deps, compiled JS, non-root user.
FROM node:22-alpine AS runner

WORKDIR /app

# Create a non-root user/group before any COPY or chown
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install production dependencies (recompiles native addons like bcrypt for Alpine)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Ensure the uploads directory exists with correct ownership
RUN mkdir -p uploads && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["node", "dist/main"]
