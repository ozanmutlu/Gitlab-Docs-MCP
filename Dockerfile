FROM node:20.18.2-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY data/gitlab-docs/ ./data/gitlab-docs/

RUN npm ci && npm run build

FROM node:20.18.2-alpine

LABEL org.opencontainers.image.title="GitLab Docs MCP Server" \
      org.opencontainers.image.description="Model Context Protocol server for GitLab documentation search" \
      org.opencontainers.image.vendor="Ozan Mutlu" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.source="https://github.com/ozanmutlu/Gitlab-Docs-MCP" \
      org.opencontainers.image.documentation="https://github.com/ozanmutlu/Gitlab-Docs-MCP/blob/master/README.md"

RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 -G nodejs mcp

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data/gitlab-docs ./data/gitlab-docs

RUN chown -R mcp:nodejs /app

USER mcp

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
