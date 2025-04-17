ARG BASE_IMAGE=blms-base
ARG NODE_VERSION=22.13.0-alpine3.20

FROM node:$NODE_VERSION AS base
FROM $BASE_IMAGE AS blms-base

################################################
#
#          prune
#
FROM blms-base AS prune

## Prune the base build to only include the API
RUN pnpm turbo prune "@blms/api" --docker

################################################
#
#          installer
#
FROM blms-base AS installer

WORKDIR /app

## Copy pruned install resources
COPY --from=prune /prepare/out/json/ .

### Log for troubleshooting. There should be files in the directory when there's a cache hit
RUN echo -e "PNPM contents before install:\n$(du -h -d2 ${PNPM_HOME})"

RUN pnpm install --frozen-lockfile

## Copy pruned sources
COPY --from=prune /prepare/out/full/ .
COPY --from=blms-base /prepare/turbo.json /prepare/tsconfig.json .

### Log for troubleshooting. There should be files in the directory when there's a cache hit
RUN echo -e "Turbo local cache before build:\n$(du -h -d2 .turbo)"

## Build the pruned project and its dependencies
RUN --mount=type=cache,id=turbo-api,target=.turbo,sharing=locked pnpm turbo build

RUN pnpm install --frozen-lockfile --production

################################################
#
#          runner (final image for api)
#
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
