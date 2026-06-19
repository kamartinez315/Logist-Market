# ─────────────────────────────────────────
# Stage 1: Build the React/Vite frontend
# ─────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files and install deps
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Backend runtime
# ─────────────────────────────────────────
FROM node:20-alpine AS backend

WORKDIR /app/backend

# Copy backend package files and install production deps
COPY package*.json ./
RUN npm ci

# Copy backend source
COPY src/ ./src/
COPY tsconfig.json ./

# Copy built frontend from Stage 1 into public/
COPY --from=frontend-builder /app/frontend/dist ./public

# Expose port (Railway injects $PORT, default 3000)
EXPOSE 3000

# Start the backend with tsx (runs TypeScript directly)
CMD ["npx", "tsx", "src/index.ts"]
