FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/super-admin/package*.json ./apps/super-admin/
COPY packages/*/package*.json ./packages/
RUN npm ci
COPY apps/super-admin ./apps/super-admin
COPY packages ./packages
RUN npm --workspace @spicegarden/super-admin run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/super-admin/.next ./.next
COPY --from=builder /app/apps/super-admin/public ./public
COPY --from=builder /app/apps/super-admin/package*.json ./
ENV NODE_ENV=production
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]