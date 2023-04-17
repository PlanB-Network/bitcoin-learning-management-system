import { createExpressMiddleware } from '@trpc/server/adapters/express';
import dotenv from 'dotenv';
import express, { json } from 'express';
import {
  createOpenApiExpressMiddleware,
  generateOpenApiDocument,
} from 'trpc-openapi';

import { appRouter, createContext } from '@sovereign-academy/api-server';

dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(json());

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

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'The Sovereign Academy API',
  version: '0.0.1',
  baseUrl: `http://${host}:${port}/api`,
});

const server = app.listen(port, host, () => {
  console.log(`[ ready ] listening on http://${host}:${port}`);
});

server.on('error', console.error);
