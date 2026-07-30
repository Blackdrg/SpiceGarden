# Stage 1: Build
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/*/package*.json ./packages/

# Install root dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the backend application
WORKDIR /app/apps/backend
RUN npm run build

# Stage 2: Production
FROM node:20-slim AS production

# Install curl for healthcheck and create non-root user
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN groupadd -r nodejs && useradd -r -u 1001 -g nodejs nodejs

# Set working directory
WORKDIR /app

# Copy only backend dependencies and dist from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:3001/health || exit 1

# Start the application
CMD ["node", "dist/src/main.js"]