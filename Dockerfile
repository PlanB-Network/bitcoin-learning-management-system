FROM node:22.10.0-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV DOCKER=true

RUN rm -f /etc/apt/apt.conf.d/docker-clean

RUN echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
  --mount=type=cache,target=/var/lib/apt,sharing=locked \
  apt update && apt install -y \
  netcat-traditional \
  build-essential \
  python3 \
  libcairo2-dev \
  pkg-config \
  libpixman-1-dev \
  libpango1.0-dev \
  cmake \
  rsync \
  git \
  curl

# https://nodejs.org/api/corepack.html
RUN corepack enable \
  && mkdir -p $PNPM_HOME \
  && chown -R node:node $PNPM_HOME \
  && mkdir -p /deploy \
  && chown -R node:node /deploy

WORKDIR /home/node

USER node

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json turbo.json .npmrc ./

RUN --mount=type=cache,uid=1000,gid=1000,id=pnpm,target=/pnpm/store pnpm fetch

COPY --chown=node:node packages ./packages
COPY --chown=node:node apps ./apps

RUN pnpm install --frozen-lockfile --prefer-offline --ignore-scripts

