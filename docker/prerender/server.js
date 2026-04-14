const prerender = require('prerender');

const server = prerender({
  chromeLocation: '/usr/bin/chromium-browser',
  chromeFlags: [
    '--no-sandbox',
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-zygote',
    '--disable-extensions',
    '--disable-background-networking',
    '--remote-debugging-port=9222',
    '--js-flags=--max-old-space-size=512',
  ],
  logRequests: true,
  pageLoadTimeout: 10000,
  waitAfterLastRequest: 500,
});

server.use(require('./cache-plugin'));
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());

server.start();
