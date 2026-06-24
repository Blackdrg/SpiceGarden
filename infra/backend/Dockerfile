FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/*/package*.json ./packages/
RUN npm ci
COPY apps/backend ./apps/backend
COPY packages ./packages
RUN npm --workspace @spicegarden/backend run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package*.json ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/src/main.js"]