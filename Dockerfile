FROM node:22-alpine AS builder

ARG WEBSITE_VERSION="v.dev"

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN echo "PUBLIC_WEBSITE_VERSION="$WEBSITE_VERSION >> build.env
RUN npm run build
RUN npm prune --production

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY entrypoint.sh /entrypoint.sh
COPY migrations .
COPY server.js .
COPY migrator.js .
COPY package.json .

HEALTHCHECK  --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

EXPOSE 3000
ENV NODE_ENV=production
ENTRYPOINT [ "/entrypoint.sh" ]

