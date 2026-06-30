FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm ci
RUN npm --workspace @spicegarden/shared run build && npm --workspace @spicegarden/delivery-partner run build
ENV NODE_ENV=development
EXPOSE 3000
CMD ["sh", "-c", "npx expo start --web --port 3000"]
