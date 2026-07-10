FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/super-admin/package*.json ./apps/super-admin/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/api-types/package*.json ./packages/api-types/
RUN npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm install --legacy-peer-deps
COPY apps/super-admin/ ./apps/super-admin/
COPY packages/shared/ ./packages/shared/
COPY packages/ui/ ./packages/ui/
COPY packages/api-types/ ./packages/api-types/
RUN npm --workspace @spicegarden/shared run build && npm --workspace @spicegarden/super-admin run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "node_modules/.bin/next", "start"]
