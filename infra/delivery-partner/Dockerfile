FROM node:20-alpine AS builder
WORKDIR /app
COPY ../../package*.json ./
COPY ../../apps/delivery-partner/package*.json ./apps/delivery-partner/
RUN npm ci
COPY ../../apps/delivery-partner .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]