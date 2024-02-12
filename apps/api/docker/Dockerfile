FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN apk add -U \
    python3 \
    g++ \
    make \
    cmake \
    git \
    findutils \
    shadow

RUN npm install --location=global pnpm@8.6 

RUN addgroup --system api && \
    adduser --system -G api api

COPY dist/apps/api api
RUN chown -R api:api .

# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN pnpm --prefix api install --prod

CMD [ "node", "api" ]
