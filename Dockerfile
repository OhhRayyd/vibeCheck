FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --omit=dev=false

# Copy source and compile
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

CMD ["node", "dist/index.js"]
