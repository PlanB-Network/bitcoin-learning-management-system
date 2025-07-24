import type { Server } from 'node:http';

import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express, { json, Router } from 'express';

import type { Dependencies } from './dependencies.js';
import { createCookieSessionMiddleware } from './middlewares/session.js';
import { createRestRouter } from './routers/rest/index.js';
import { trpcRouter } from './routers/trpc-router.js';
import { createContext } from './trpc/index.js';

const routesWithRawBody = new Set([
  '/users/courses/payment/webhooks',
  '/users/events/payment/webhooks',
  '/users/general/payment/webhooks',
  '/api/webhooks/stripe',
]);

export const startServer = async (dependencies: Dependencies, port = 3000) => {
  const app = express();
  const router = Router();

  // Parse JSON bodies
  app.use(
    json({
      verify: (req, _res, buf) => {
        // @ts-expect-error TODO: fix this?
        if (routesWithRawBody.has(req.path) && buf?.length) {
          // @ts-expect-error TODO: fix this?
          req.rawBody = buf;
        }
      },
    }),
  );

  app.use(createCookieSessionMiddleware(dependencies));

  const genRequestId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 16);

  // Basic request logger + Set request ID
  app.use((req, res, next) => {
    const path = req.path;
    const method = req.method;
    const sessionId = req.session?.id || '';

    req.id ||= req.header('x-request-id') || genRequestId();
    req.log = (...a: any[]) => console.log(`[request] ${req.id}`, ...a);

    if (!path.includes('getUserNotifications')) {
      req.log(`${method} ${path} (${req.ip}) session=${sessionId} `);
    }

    // Log response time
    const start = process.hrtime();
    res.on('finish', () => {
      const [s, ns] = process.hrtime(start);
      const len = res.get('Content-Length');
      const status = res.statusCode;

      if (!path.includes('getUserNotifications')) {
        req.log(
          `${method} ${path} took ${s * 1000 + ns / 1e6}ms (${status})${len ? `, ${len} bytes` : ''}`,
        );
      }
    });

    next();
  });

  // Register tRPC routes
  router.use(
    '/trpc',
    createExpressMiddleware({
      createContext: (opts) => createContext(opts, dependencies),
      router: trpcRouter,
    }),
  );

  const restRouter = await createRestRouter(dependencies);

  const baseRoute = '/api';
  app.use(baseRoute, router);
  app.use(baseRoute, restRouter);

  const server = app.listen(port, '0.0.0.0');

  server.on('error', console.error);

  return new Promise<Server>((resolve, reject) => {
    server.on('listening', () => {
      console.info(`[server] listening on port ${port}`);
      resolve(server);
    });

    server.on('error', (err) => reject(err));
  });
};
