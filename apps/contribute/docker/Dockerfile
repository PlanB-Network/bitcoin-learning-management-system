ARG BASE_IMAGE=blms-base

FROM $BASE_IMAGE AS blms-base

################################################
#
#          runner (final image for contribute)
#
FROM nginx:alpine AS runner

COPY --from=blms-base /prepare/apps/contribute/dist /usr/share/nginx/html
COPY --from=blms-base /prepare/apps/contribute/docker/nginx.conf /etc/nginx/nginx.conf
