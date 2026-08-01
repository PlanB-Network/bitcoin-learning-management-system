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

// prerender@5.21.6 stops Chrome with a bare SIGINT and then waits for the
// child's 'close' event to respawn it. Chrome ignores SIGINT often enough that
// no 'close' ever fires: isBrowserConnected stays false and every render waits
// 20s then 504s, until the next scheduled recycle 10 minutes later. Escalate to
// SIGKILL so a kill always produces a close, and therefore always a respawn.
const KILL_GRACE_MS =
  Number.parseInt(process.env.CHROME_KILL_GRACE_MS, 10) || 5000;
const browser = server.browser;
const gracefulKill = browser.kill.bind(browser);

browser.kill = function killWithEscalation() {
  const child = browser.chromeChild;
  gracefulKill();
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  const escalation = setTimeout(() => {
    if (child.exitCode === null && child.signalCode === null) {
      console.log(
        `[chrome] SIGINT ignored after ${KILL_GRACE_MS}ms, sending SIGKILL`,
      );
      child.kill('SIGKILL');
    }
  }, KILL_GRACE_MS);
  escalation.unref();
  child.once('close', () => clearTimeout(escalation));
};

// Healthcheck endpoint — registered first so no other plugin (notably the cache)
// can answer it. Only healthy when prerender still has a live Chrome connection.
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

server.start();
