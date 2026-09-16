# Production image for Cloud Run service acashi-web (devo-holding, us-west1).
# Next.js standalone output. Cloud Run sets PORT; default 8080.
FROM node:22-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV GOOGLE_CLOUD_PROJECT=devo-holding
ENV GCP_PROJECT=devo-holding

RUN mkdir -p public .next && chown node:node public .next

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

EXPOSE 8080
USER node

# Cloud Run injects PORT and sets HOSTNAME to the instance id. Next.js standalone
# binds to HOSTNAME, so force 0.0.0.0 at start.
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]
