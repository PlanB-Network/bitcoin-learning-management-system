FROM node:24

WORKDIR /usr/src/app

COPY package*.json ./

RUN  npm ci

COPY peertube-sync.js ./peertube-sync.js

CMD ["node", "peertube-sync.js"]
