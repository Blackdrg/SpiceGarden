FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
COPY apps/super-admin/package*.json ./apps/super-admin/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/api-types/package*.json ./packages/api-types/
RUN npm config set fetch-retries 10 && npm config set fetch-retry-mintimeout 60000 && npm config set fetch-retry-maxtimeout 600000 && npm config set fetch-timeout 600000 && npm install --legacy-peer-deps
COPY apps/super-admin/ ./apps/super-admin/
COPY packages/shared/ ./packages/shared/
COPY packages/ui/ ./packages/ui/
COPY packages/api-types/ ./packages/api-types/
RUN npm --workspace @spicegarden/shared run build && npm --workspace @spicegarden/super-admin run build

FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/super-admin/.next ./apps/super-admin/.next
COPY --from=builder --chown=nodejs:nodejs /app/apps/super-admin/public ./apps/super-admin/public
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/super-admin/package*.json ./apps/super-admin/
ENV NODE_ENV=production
USER nodejs
EXPOSE 3004
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD node -e "require('http').get('http://localhost:3004', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"
CMD ["node", "node_modules/.bin/next", "start", "-p", "3004", "apps/super-admin"]
