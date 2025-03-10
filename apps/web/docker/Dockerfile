ARG GITHUB_SHA

# Final image (blms-base image is defined in the /docker-bake.hcl)
FROM nginx:alpine AS runner

COPY --from=blms-base /app/apps/web/dist /usr/share/nginx/html
COPY --from=blms-base /app/apps/web/docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=blms-base /app/apps/web/docker/decode.js /etc/nginx/decode.js
