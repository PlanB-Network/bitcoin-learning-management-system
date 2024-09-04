#!/usr/bin/env bash
# Script to run the web app through the nginx server in order to test the nginx configuration

set -e

scriptpath="$( cd "$(dirname "$0")" ; pwd -P )"

docker run --rm \
  -p 8181:80 \
  --name nginx-dev \
  -v ${scriptpath}/dist:/usr/share/nginx/html:ro \
  -v ${scriptpath}/docker/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine
