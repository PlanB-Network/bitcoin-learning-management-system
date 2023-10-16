import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express, { Router } from 'express';
import { createOpenApiExpressMiddleware } from 'trpc-openapi';

import { appRouter, createContext } from '@sovereign-university/api/server';

import { Dependencies } from './dependencies';
import { createCorsMiddleware } from './middlewares/cors';
import { createCookieSessionMiddleware } from './middlewares/session/cookie';

/* const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'The Sovereign University API',
  version: '0.0.1',
  baseUrl: `http://${host}:${port}/api`,
}); */

export const startServer = async (dependencies: Dependencies, port = 3000) => {
  const app = express();
  const router = Router();

  // Parse JSON bodies
  app.use(express.json());

  // Enable cors
  app.use(createCorsMiddleware());

  app.use(createCookieSessionMiddleware(dependencies));

  // Basic request logger
  app.use((req, _res, next) => {
    console.log('➡️ ', req.method, req.path);
    next();
  });

  // Register tRPC routes
  router.use(
    '/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: (opts) => createContext(opts, dependencies),
    }),
  );

  // Register REST (OpenAPI) routes
  router.use(
    '/',
    createOpenApiExpressMiddleware({
      router: appRouter,
      createContext: (opts) => createContext(opts, dependencies),
      onError:
        process.env.NODE_ENV === 'development'
          ? ({ req, error }) => {
              console.error(
                `❌ OpenAPI failed on ${req.url ?? '<no-path>'}: ${
                  error.message
                }`,
              );
            }
          : undefined,
    }),
  );

  if (process.env.NODE_ENV === 'development') {
    app.use('/api', router);
  } else {
    app.use('/', router);
  }

  const server = app.listen(port, '0.0.0.0');

  server.on('error', console.error);

  return new Promise<typeof server>((resolve, reject) => {
    server.on('listening', () => {
      console.log(`[ ready ] listening on port ${port}`);
      resolve(server);
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
};
