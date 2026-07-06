FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/restaurant-dashboard/package*.json ./apps/restaurant-dashboard/
COPY packages/shared/package*.json ./packages/shared/
RUN npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm install --legacy-peer-deps
COPY apps/restaurant-dashboard/ ./apps/restaurant-dashboard/
COPY packages/shared/ ./packages/shared/
RUN npm --workspace @spicegarden/shared run build && npm --workspace @spicegarden/restaurant-dashboard run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "node_modules/.bin/next", "start"]
