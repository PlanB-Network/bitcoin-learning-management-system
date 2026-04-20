/**
 * Stale-while-revalidate cache plugin for prerender.
 *
 * - Cache hit (fresh): serve immediately.
 * - Cache hit (stale, past TTL): serve stale content immediately,
 *   trigger a background re-render so next request gets fresh content.
 * - Cache miss: render normally, cache the result.
 *
 * Env vars:
 *   CACHE_MAXSIZE  — max entries (default 20000)
 *   CACHE_TTL      — fresh duration in seconds (default 86400 = 24h)
 */

const CACHE_MAXSIZE = Number.parseInt(process.env.CACHE_MAXSIZE, 10) || 20000;
const CACHE_TTL_MS =
  (Number.parseInt(process.env.CACHE_TTL, 10) || 86400) * 1000;

// Simple LRU via Map (insertion-order iteration, delete+re-set to refresh)
const cache = new Map(); // url → { content, createdAt }
const revalidating = new Set(); // urls currently being re-rendered

function evictIfNeeded() {
  while (cache.size > CACHE_MAXSIZE) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

module.exports = {
  requestReceived: (req, res, next) => {
    const url = req.prerender.url;

    // Bypass cache for background revalidation requests
    if (req.headers?.['x-cache-bypass']) {
      return next();
    }

    const entry = cache.get(url);

    if (!entry) return next();

    const age = Date.now() - entry.createdAt;
    const isFresh = age < CACHE_TTL_MS;

    // Serve cached content (fresh or stale)
    req.prerender.cacheHit = true;
    res.send(200, entry.content);

    // If stale, trigger background re-render
    if (!isFresh && !revalidating.has(url)) {
      revalidating.add(url);
      console.log(`[cache] stale-while-revalidate: ${url}`);

      const http = require('http');
      const port = process.env.PORT || 3000;
      const request = http.get(
        `http://localhost:${port}/${url}`,
        { headers: { 'x-cache-bypass': '1' } },
        (response) => {
          let body = '';
          response.on('data', (chunk) => {
            body += chunk;
          });
          response.on('end', () => {
            if (response.statusCode === 200 && body.length > 0) {
              cache.delete(url);
              cache.set(url, { content: body, createdAt: Date.now() });
              evictIfNeeded();
              console.log(`[cache] revalidated: ${url} (${body.length} bytes)`);
            }
            revalidating.delete(url);
          });
        },
      );
      request.on('error', () => revalidating.delete(url));
      request.setTimeout(30000, () => {
        request.destroy();
        revalidating.delete(url);
      });
    }
  },

  beforeSend: (req, _res, next) => {
    if (!req.prerender.cacheHit && req.prerender.statusCode === 200) {
      const url = req.prerender.url;
      cache.delete(url);
      cache.set(url, {
        content: req.prerender.content,
        createdAt: Date.now(),
      });
      evictIfNeeded();
    }
    next();
  },
};
