# ─────────────────────────────────────────
# Stage 1: Build the React/Vite frontend
# ─────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies
COPY kmarket.example/package*.json ./
RUN npm ci

# Copy source and build
COPY kmarket.example/ ./
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Build & run the backend
# ─────────────────────────────────────────
FROM node:20-alpine AS backend

WORKDIR /app/backend

# Install backend dependencies
COPY kmarket-backend/package*.json ./
RUN npm ci

# Copy backend source files
COPY kmarket-backend/src/ ./src/
COPY kmarket-backend/tsconfig.json ./

# Copy compiled frontend into public/ so the backend serves it
COPY --from=frontend-builder /app/frontend/dist ./public

# Railway injects $PORT at runtime — default to 3000
EXPOSE 3000

# Use tsx to run TypeScript directly (no tsc compile step needed)
CMD ["npx", "tsx", "src/index.ts"]
