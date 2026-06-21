FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/delivery-partner/package*.json ./apps/delivery-partner/
COPY packages/*/package*.json ./packages/
RUN npm ci
COPY apps/delivery-partner ./apps/delivery-partner
COPY packages ./packages
RUN npm --workspace @spicegarden/delivery-partner run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/delivery-partner/dist ./dist
COPY --from=builder /app/apps/delivery-partner/package*.json ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]