FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/delivery-partner/package*.json ./apps/delivery-partner/
COPY packages/shared/package*.json ./packages/shared/
RUN npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm install --legacy-peer-deps
COPY apps/delivery-partner/ ./apps/delivery-partner/
COPY packages/shared/ ./packages/shared/
ENV NODE_ENV=development
EXPOSE 3000
CMD ["sh", "-c", "npx expo start --web --port 3000"]
