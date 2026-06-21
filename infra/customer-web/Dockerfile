FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/customer-web/package*.json ./apps/customer-web/
COPY packages/*/package*.json ./packages/
RUN npm ci
COPY apps/customer-web ./apps/customer-web
COPY packages ./packages
RUN npm --workspace @spicegarden/customer-web run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/customer-web/.next ./.next
COPY --from=builder /app/apps/customer-web/public ./public
COPY --from=builder /app/apps/customer-web/package*.json ./
ENV NODE_ENV=production
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]