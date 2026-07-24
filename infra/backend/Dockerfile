FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache python3 make g++ && npm config set fetch-retries 10 && npm config set fetch-retry-mintimeout 60000 && npm config set fetch-retry-maxtimeout 600000 && npm config set fetch-timeout 600000
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/api-types/package*.json ./packages/api-types/
RUN npm install --legacy-peer-deps
COPY apps/backend/ ./apps/backend/
COPY packages/shared/ ./packages/shared/
COPY packages/api-types/ ./packages/api-types/
RUN npm --workspace @spicegarden/shared run build && npm --workspace @spicegarden/backend run build

FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
ENV NODE_ENV=production
USER nodejs
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=30s CMD node -e "require('http').get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"
CMD ["node", "apps/backend/dist/src/main.js"]
