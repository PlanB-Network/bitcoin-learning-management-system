FROM docker.io/node:lts-alpine

RUN apk add -U \
     python3 \
     g++ \
     make \
     cmake 

WORKDIR /app

COPY . .

RUN npm install --global pnpm@7

RUN pnpm install --frozen-lockfile