import { createExpressMiddleware } from '@trpc/server/adapters/express';
import cors from 'cors';
import express from 'express';
import { createOpenApiExpressMiddleware } from 'trpc-openapi';

import { appRouter, createContext } from '@sovereign-academy/api-server';

import { Dependencies } from './dependencies';

/* const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'The Sovereign Academy API',
  version: '0.0.1',
  baseUrl: `http://${host}:${port}/api`,
}); */

export const startServer = async (dependencies: Dependencies, port = 3000) => {
  const app = express();

  // Parse JSON bodies
  app.use(express.json());

  // Enable cors
  app.use(cors({ origin: 'http://localhost:5555' }));

  // Basic request logger
  app.use((req, _res, next) => {
    console.log('➡️ ', req.method, req.path);
    next();
  });

  // Register tRPC routes
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: (opts) => createContext(opts, dependencies),
    })
  );

  // Register REST (OpenAPI) routes
  app.use(
    '/api',
    createOpenApiExpressMiddleware({
      router: appRouter,
      createContext: (opts) => createContext(opts, dependencies),
      onError:
        process.env.NODE_ENV === 'development'
          ? ({ req, error }) => {
              console.error(
                `❌ OpenAPI failed on ${req.url ?? '<no-path>'}: ${
                  error.message
                }`
              );
            }
          : undefined,
    })
  );

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
