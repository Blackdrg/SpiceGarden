FROM node:20-alpine AS builder
WORKDIR /app
COPY ../../package*.json ./
COPY ../../apps/super-admin/package*.json ./apps/super-admin/
RUN npm ci
COPY ../../apps/super-admin .
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