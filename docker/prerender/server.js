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
    '--remote-debugging-address=127.0.0.1',
    '--remote-debugging-port=9222',
    '--js-flags=--max-old-space-size=512',
  ],
  logRequests: true,
  pageLoadTimeout: 10000,
  waitAfterLastRequest: 500,
});

// Strip <script> tags but preserve JSON-LD (application/ld+json) so structured
// data markup survives prerender output. Replaces prerender.removeScriptTags().
server.use({
  pageLoaded: (req, res, next) => {
    if (req.prerender.content) {
      req.prerender.content = req.prerender.content.replace(
        /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
        (match, attrs) =>
          /type\s*=\s*["']application\/ld\+json["']/i.test(attrs) ? match : '',
      );
    }
    next();
  },
});
server.use(prerender.httpHeaders());
server.use(require('./cache-plugin'));

// Healthcheck endpoint — returns 200 without rendering
server.use({
  requestReceived: (req, res, next) => {
    if (req.prerender.url === 'healthz') {
      res.send(200, 'ok');
    } else {
      next();
    }
  },
});

server.start();
