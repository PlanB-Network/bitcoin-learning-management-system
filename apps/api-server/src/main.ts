/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as path from 'path';

import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express from 'express';
import {
  createOpenApiExpressMiddleware,
  generateOpenApiDocument,
} from 'trpc-openapi';

import { appRouter, createContext } from '@sovereign-academy/api';

// Import OpenAPI types due to a nasty pnpm/TypeScript bug
// See https://github.com/microsoft/TypeScript/issues/47663#issuecomment-1270716220
import type {} from 'openapi-types';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use((req, _res, next) => {
  // Basic request logger
  console.log('⬅️ ', req.method, req.path, req.body ?? req.query);

  next();
});

app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.use(
  '/api',
  createOpenApiExpressMiddleware({
    router: appRouter,
    createContext,
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ req, error }) => {
            console.error(
              `❌ OpenAPI failed on ${req.url ?? '<no-path>'}: ${error.message}`
            );
          }
        : undefined,
  })
);

const port = process.env.PORT || 3333;

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'The Sovereign Academy API',
  version: '0.0.1',
  baseUrl: `http://localhost:${port}/api`,
});

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
