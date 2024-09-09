#!/usr/bin/env bash
# Script to run the web app through the nginx server in order to test the nginx configuration

set -e

scriptpath="$( cd "$(dirname "$0")" ; pwd -P )"

docker run --rm \
  -p 8181:80 \
  --name nginx-dev \
  -v ${scriptpath}/dist:/usr/share/nginx/html:ro \
  -v ${scriptpath}/docker/decode.js:/etc/nginx/decode.js:ro \
  -v ${scriptpath}/docker/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine

# docker network create cf-tunnel-network
# docker network connect cf-tunnel-network nginx-dev
# docker run --rm --name cf-tunnel-dev --network cf-tunnel-network cloudflare/cloudflared:latest tunnel --no-autoupdate run --token $CF_TUNNEL_TOKEN
