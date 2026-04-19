FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
ARG APP_VERSION
ARG NEXT_PUBLIC_GIT_HASH
ARG APP_BASE_PATH
ENV APP_VERSION=${APP_VERSION}
ENV NEXT_PUBLIC_GIT_HASH=${NEXT_PUBLIC_GIT_HASH}
ENV APP_BASE_PATH=${APP_BASE_PATH}
ENV DATA_PATH=/tmp/build/data
ENV AUTH_USERNAME=build-user
ENV AUTH_PASSWORD=build-password
ENV NEXTAUTH_SECRET=build-secret-build-secret-build-secret-1234
ENV NEXTAUTH_URL=http://127.0.0.1:3000${APP_BASE_PATH}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p /tmp/build/data \
  && npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV APP_ROOT_PATH=/app

RUN addgroup -S -g 1001 nodejs \
  && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.agents/skills ./.agents/skills
COPY --from=builder /app/AGENTS.md ./AGENTS.md
COPY --from=builder /app/references ./references

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
