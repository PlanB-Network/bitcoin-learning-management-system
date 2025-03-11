ARG BASE_IMAGE=blms-base

FROM $BASE_IMAGE AS blms-base

################################################
#
#          runner (final image for web)
#
FROM nginx:alpine AS runner

COPY --from=blms-base /prepare/apps/web/dist /usr/share/nginx/html
COPY --from=blms-base /prepare/apps/web/docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=blms-base /prepare/apps/web/docker/decode.js /etc/nginx/decode.js
