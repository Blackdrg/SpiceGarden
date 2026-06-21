FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/*/package*.json ./packages/
RUN npm ci
COPY ../../apps/backend .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/src/main.js"]