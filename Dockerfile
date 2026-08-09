# The server needs the repo checkout and nothing else: dependencies are
# vendored, so there is no install step and no network access at build time.
FROM node:22-slim

WORKDIR /app
COPY . .

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# PORT is read from the environment; hosts that inject their own override this.
CMD ["node", "server/index.mjs"]
