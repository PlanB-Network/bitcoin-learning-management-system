FROM docker.io/node:18.16.1-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update && \
    apt-get install -y netcat-traditional rsync python3 build-essential cmake git

# https://nodejs.org/api/corepack.html
RUN corepack enable && \
    mkdir -p $PNPM_HOME && chown -R node:node $PNPM_HOME

# Try to cache the node-gyp stuff
RUN pnpm add argon2@0.31.0

WORKDIR /home/node

USER node

COPY --chown=node:node package.json pnpm-lock.yaml .npmrc nx.json tsconfig.base.json ./
COPY --chown=node:node patches ./patches

RUN --mount=type=cache,uid=1000,gid=1000,id=l2clear,target=/pnpm/store pnpm fetch

COPY --chown=node:node libs ./libs
COPY --chown=node:node apps ./apps

RUN pnpm install --frozen-lockfile --prefer-offline --ignore-scripts