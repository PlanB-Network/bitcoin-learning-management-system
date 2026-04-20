FROM node:24-alpine

RUN apk add --no-cache chromium tini curl \
 && addgroup -S prerender && adduser -S -G prerender prerender

ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PORT=3000

WORKDIR /app
COPY package.json server.js cache-plugin.js ./
RUN npm install --production && npm cache clean --force \
 && chown -R prerender:prerender /app

USER prerender
EXPOSE 3000
ENTRYPOINT ["tini", "--"]
CMD ["node", "server.js"]
