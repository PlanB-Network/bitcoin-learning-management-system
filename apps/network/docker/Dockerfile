ARG BASE_IMAGE=blms-base

FROM $BASE_IMAGE AS blms-base

################################################
#
#          runner (final image for network)
#
FROM nginx:alpine AS runner

COPY --from=blms-base /prepare/apps/network/dist /usr/share/nginx/html
COPY --from=blms-base /prepare/apps/network/docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=blms-base /prepare/apps/network/docker/decode.js /etc/nginx/decode.js
