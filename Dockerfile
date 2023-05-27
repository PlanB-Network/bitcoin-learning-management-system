FROM docker.io/node:18.15.0-alpine3.17

RUN apk add -U \
     python3 \
     g++ \
     make \
     cmake \
     git 

RUN npm install --global pnpm@7

WORKDIR /app

# Try to cache the node-gyp stuff
RUN pnpm add argon2@0.30.3
RUN rm -rf pnpm-lock.yaml package.json

COPY pnpm-lock.yaml ./
COPY patches ./patches

RUN pnpm fetch

COPY package.json pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

RUN apk del python3 cmake make g++

COPY . .