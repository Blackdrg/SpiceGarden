FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/restaurant-dashboard/package*.json ./apps/restaurant-dashboard/
COPY packages/*/package*.json ./packages/
RUN npm ci
COPY apps/restaurant-dashboard ./apps/restaurant-dashboard
COPY packages ./packages
RUN npm --workspace @spicegarden/restaurant-dashboard run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/restaurant-dashboard/.next ./.next
COPY --from=builder /app/apps/restaurant-dashboard/public ./public
COPY --from=builder /app/apps/restaurant-dashboard/package*.json ./
ENV NODE_ENV=production
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]