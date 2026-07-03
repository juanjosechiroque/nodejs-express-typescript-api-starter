ARG NODE_IMAGE=node:24-slim

FROM ${NODE_IMAGE} AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY index.ts ./
COPY src ./src
RUN npm run build && npm prune --omit=dev && npm cache clean --force

FROM ${NODE_IMAGE} AS production

WORKDIR /app

RUN groupadd -r appuser && \
    useradd -r -g appuser -d /app -s /usr/sbin/nologin -c "app" appuser

COPY --from=build /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY --from=build /app/dist ./dist

RUN chown -R appuser:appuser /app

USER appuser

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/index.js"]
