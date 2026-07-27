FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
COPY apps/delivery-partner/package*.json ./apps/delivery-partner/
COPY packages/shared/package*.json ./packages/shared/
RUN npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm install --legacy-peer-deps
COPY apps/delivery-partner/ ./apps/delivery-partner/
COPY packages/shared/ ./packages/shared/
RUN npm --workspace @spicegarden/shared run build 2>/dev/null || true

FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/delivery-partner ./apps/delivery-partner
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared ./packages/shared
COPY --from=builder --chown=nodejs:nodejs /app/apps/delivery-partner/package*.json ./apps/delivery-partner/
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/package*.json ./packages/shared/
ENV NODE_ENV=production
USER nodejs
EXPOSE 3005
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD node -e "require('http').get('http://localhost:3005', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"
CMD ["npx", "expo", "start", "--web", "--port", "3005"]
