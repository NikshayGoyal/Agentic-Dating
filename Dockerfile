FROM node:20-slim AS base

WORKDIR /app

# Install build dependencies for native C++ modules
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install dependencies based on package-lock.json
COPY package*.json ./
RUN npm ci

# Copy source code and pre-seeded database
COPY . .
RUN chmod -R 777 /app

# Build the Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npx", "next", "start", "-H", "0.0.0.0"]
