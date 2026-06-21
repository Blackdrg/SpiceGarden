FROM node:20-alpine AS builder
WORKDIR /app
COPY ../../package*.json ./
COPY ../../apps/restaurant-dashboard/package*.json ./apps/restaurant-dashboard/
RUN npm ci
COPY ../../apps/restaurant-dashboard .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
ENV NODE_ENV=production
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]