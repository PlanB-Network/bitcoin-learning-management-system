ARG BASE_IMAGE=blms-base

FROM $BASE_IMAGE AS blms-base

################################################
#
#          build
#
FROM blms-base AS builder

WORKDIR /prepare/packages/ui

RUN pnpm build-storybook

################################################
#
#          runner (final image for storybook)
#
FROM nginx:alpine AS runner

COPY --from=blms-base /prepare/packages/ui/docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /prepare/packages/ui/storybook-static /usr/share/nginx/html

RUN ls -lah /usr/share/nginx/html
