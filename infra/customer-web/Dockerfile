FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/customer-web/package*.json ./apps/customer-web/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/api-types/package*.json ./packages/api-types/
COPY apps/customer-mobile/package*.json ./apps/customer-mobile/
RUN apk add --no-cache python3 make g++ && npm config set fetch-retries 10 && npm config set fetch-retry-mintimeout 60000 && npm config set fetch-retry-maxtimeout 600000 && npm config set fetch-timeout 600000 && npm install --legacy-peer-deps
COPY apps/customer-web/ ./apps/customer-web/
COPY packages/shared/ ./packages/shared/
COPY packages/ui/ ./packages/ui/
COPY packages/api-types/ ./packages/api-types/
RUN npm --workspace @spicegarden/shared run build && npm --workspace @spicegarden/customer-web run build

FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/customer-web/.next ./apps/customer-web/.next
COPY --from=builder --chown=nodejs:nodejs /app/apps/customer-web/public ./apps/customer-web/public
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/customer-web/package*.json ./apps/customer-web/
ENV NODE_ENV=production
USER nodejs
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD node -e "require('http').get('http://localhost:3002/', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1))"
CMD ["node", "node_modules/.bin/next", "start", "-p", "3002", "apps/customer-web"]
