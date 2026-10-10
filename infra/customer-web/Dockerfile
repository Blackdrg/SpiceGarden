FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/customer-web/package*.json ./apps/customer-web/
COPY packages/shared/package*.json ./packages/shared/
COPY apps/customer-mobile/package*.json ./apps/customer-mobile/
RUN npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm install --legacy-peer-deps
COPY apps/customer-web/ ./apps/customer-web/
COPY apps/customer-mobile/ ./apps/customer-mobile/
COPY packages/shared/ ./packages/shared/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/api-types/package*.json ./packages/api-types/
RUN npm --workspace @spicegarden/shared run build && npm --workspace @spicegarden/customer-web run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "node_modules/.bin/next", "start"]
