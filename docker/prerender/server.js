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

// removeScriptTags already preserves <script type="application/ld+json"> upstream,
// so no custom stripping is needed to keep structured data safe.
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());
server.use(require('./cache-plugin'));
server.use({
  beforeSend: (req, _res, next) => {
    req.prerender.headers = {
      ...(req.prerender.headers || {}),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    };
    next();
  },
});

// Healthcheck endpoint — only healthy when prerender still has a live Chrome connection
server.use({
  requestReceived: (req, res, next) => {
    if (req.prerender.url !== 'healthz') {
      return next();
    }

    if (req.server?.isBrowserConnected) {
      return res.send(200, 'ok');
    }

    return res.send(503, 'chrome-disconnected');
  },
});

server.start();
