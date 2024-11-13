import type { Server } from 'node:http';

import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express, { Router, json } from 'express';

import type { Dependencies } from './dependencies.js';
import { createCookieSessionMiddleware } from './middlewares/session/cookie.js';
import { createRestRouter } from './routers/rest/index.js';
import { trpcRouter } from './routers/trpc-router.js';
import { createContext } from './trpc/index.js';

const routesWithRawBody = new Set([
  '/users/courses/payment/webhooks',
  '/users/events/payment/webhooks',
]);

export const startServer = async (dependencies: Dependencies, port = 3000) => {
  const app = express();
  const router = Router();

  // Parse JSON bodies
  app.use(
    json({
      verify: function (req, _res, buf) {
        // @ts-expect-error TODO: fix this?
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        if (routesWithRawBody.has(req.path) && buf?.length) {
          // @ts-expect-error TODO: fix this?
          req.rawBody = buf;
        }
      },
    }),
  );

  app.use(createCookieSessionMiddleware(dependencies));

  // Basic request logger
  app.use((req, _res, next) => {
    console.log('➡️', req.method, req.path);
    next();
  });

  // Register tRPC routes
  router.use(
    '/trpc',
    createExpressMiddleware({
      router: trpcRouter,
      createContext: (opts) => createContext(opts, dependencies),
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
      console.log(`[ ready ] listening on port ${port}`);
      resolve(server);
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
};
