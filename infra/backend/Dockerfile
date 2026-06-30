FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared/package*.json ./packages/shared/
RUN npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm install --workspaces --include-workspace-root
COPY . .
RUN cp -r apps/*/node_modules/* node_modules/ 2>/dev/null; ls node_modules | grep ioredis
RUN npm --workspace @spicegarden/shared run build && npm --workspace @spicegarden/backend run build
ENV NODE_ENV=production
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=30s CMD node -e "require('http').get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"
CMD ["node", "apps/backend/dist/src/main.js"]
