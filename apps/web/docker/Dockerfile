FROM docker.io/nginx:alpine

COPY dist/apps/web /usr/share/nginx/html
COPY apps/web/docker/nginx.conf /etc/nginx/conf.d/default.conf
