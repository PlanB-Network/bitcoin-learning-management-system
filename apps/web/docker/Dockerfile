ARG NODE_VERSION

FROM node:$NODE_VERSION AS base

FROM base AS builder

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update

# Set working directory
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install --location=global pnpm@9
RUN pnpm add --global turbo@2

COPY . .
RUN turbo prune "@sovereign-university/web" --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer

RUN apk add --no-cache -U \
    libc6-compat \
    python3 \
    g++ \
    make \
    cmake \
    findutils \
    shadow

RUN apk update

RUN npm install --location=global pnpm@9

WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Check the version of @tanstack/react-router
RUN echo "Checking version of @tanstack/react-router:"
RUN echo $(pnpm list @tanstack/react-router --filter=@sovereign-university/web)

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json tsconfig.json ./

RUN pnpm turbo build --filter="@sovereign-university/web"...

# Final image
FROM nginx:alpine AS runner

COPY --from=installer /app/apps/web/dist /usr/share/nginx/html
COPY --from=installer /app/apps/web/docker/nginx.conf /etc/nginx/conf.d/default.conf
