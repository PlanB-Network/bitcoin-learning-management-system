ARG NODE_VERSION=22.13.0-alpine3.20

FROM node:$NODE_VERSION AS base

#
# pnpm
#
FROM base AS pnpm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install --location=global pnpm@10

RUN apk update
RUN apk add --no-cache libc6-compat

#
#
#
FROM blms-base AS prune

RUN pnpm turbo prune "@blms/api" --docker


#
#
#
FROM pnpm AS installer

WORKDIR /app

COPY --from=prune /app/out/json/ .

RUN --mount=type=cache,id=pnpm,sharing=locked,target=/pnpm,ro \
  pnpm install --frozen-lockfile

## Copy pruned sources
COPY --from=prune /app/out/full/ .
COPY turbo.json tsconfig.json .

## Build the pruned project and its dependencies
RUN --mount=type=cache,id=turbo,sharing=locked,target=.turbo,ro \
  pnpm turbo build

RUN --mount=type=cache,id=pnpm,sharing=locked,target=/pnpm,ro \
  pnpm install --frozen-lockfile --production --ignore-scripts

#
#
# Final image
FROM base AS runner

ENV HOST=0.0.0.0
ENV PORT=3000

RUN apk add --no-cache -U \
    fontconfig \
    texmf-dist \
    font-noto-all \
    python3 \
    git \
    cairo \
    pango \
    curl \
    shadow

WORKDIR /app

# Install custom fonts
## https://github.com/jlandure/alpine-chrome/issues/155#issuecomment-771256273
RUN  mkdir -p /usr/share/fonts/ibm-plex \
  && curl https://raw.githubusercontent.com/IBM/plex/refs/heads/master/packages/plex-sans/fonts/complete/ttf/IBMPlexSans-Regular.ttf \
      -o /usr/share/fonts/ibm-plex/IBMPlexSans-Regular.ttf \
  && curl https://raw.githubusercontent.com/IBM/plex/refs/heads/master/packages/plex-sans/fonts/complete/ttf/IBMPlexSans-Medium.ttf \
      -o /usr/share/fonts/ibm-plex/IBMPlexSans-Medium.ttf \
  && curl https://raw.githubusercontent.com/IBM/plex/refs/heads/master/packages/plex-sans/fonts/complete/ttf/IBMPlexSans-SemiBold.ttf \
      -o /usr/share/fonts/ibm-plex/IBMPlexSans-SemiBold.ttf

# Don't run production as root
USER node

COPY --from=installer /app .

CMD node apps/api/dist/src/index.js
