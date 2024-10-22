ARG NODE_VERSION

FROM node:$NODE_VERSION AS base

FROM base AS builder

RUN apk update
RUN apk add --no-cache libc6-compat
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.

# Set working directory
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install --location=global pnpm@9
RUN pnpm add --global turbo@2

COPY . .
RUN turbo prune "@blms/api" --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer

RUN apk update
RUN apk add --no-cache -U \
    libc6-compat \
    python3 \
    g++ \
    make \
    cmake \
    findutils \
    cairo-dev \
    pango-dev \
    shadow
RUN npm install --location=global pnpm@9
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json tsconfig.json ./
RUN pnpm turbo build --filter="@blms/api"...

# Final image
FROM base AS runner

ENV HOST=0.0.0.0
ENV PORT=3000

RUN apk add --no-cache -U \
    python3 \
    git \
    cairo \
    pango \
    shadow

WORKDIR /app

# Don't run production as root
USER node

COPY --from=installer /app .
CMD node apps/api/dist/src/index.js
