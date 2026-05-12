# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Prune dev deps
RUN npm ci --omit=dev

# Runtime stage
FROM node:22-alpine AS runtime
WORKDIR /app

RUN addgroup -g 1001 -S plantz && adduser -S -u 1001 -G plantz plantz

COPY --from=builder --chown=plantz:plantz /app/build ./build
COPY --from=builder --chown=plantz:plantz /app/node_modules ./node_modules
COPY --from=builder --chown=plantz:plantz /app/package.json ./

RUN mkdir -p /data && chown plantz:plantz /data

USER plantz

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data
ENV BODY_SIZE_LIMIT=52428800

EXPOSE 3000

CMD ["node", "build"]
