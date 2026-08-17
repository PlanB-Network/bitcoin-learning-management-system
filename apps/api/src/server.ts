import type { Server } from 'node:http';

import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express, { type ErrorRequestHandler, json, Router } from 'express';
import { requestLogging } from './config.js';
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

  // Trust IP information from proxy (e.g. when behind Cloudflare)
  app.set('trust proxy', true);

  // Resource submissions include a base64-encoded cover image.
  app.use('/api/trpc/github.createResourcePR', json({ limit: '21mb' }));

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

  const handlePayloadTooLarge: ErrorRequestHandler = (
    error,
    req,
    res,
    next,
  ) => {
    if (error.type !== 'entity.too.large') {
      next(error);
      return;
    }

    req.id ||= req.header('x-request-id') || genRequestId();
    console.warn(
      `[request] ${req.id} BODY_TOO_LARGE ${req.method} ${req.path} content_length=${req.header('content-length') ?? 'unknown'}`,
    );
    res.status(413).json({
      error: {
        json: {
          message:
            'The cover image is too large. Use an image smaller than 15 MB.',
          code: -32600,
          data: { code: 'PAYLOAD_TOO_LARGE', httpStatus: 413 },
        },
      },
    });
  };

  // Basic request logger + Set request ID
  app.use((req, res, next) => {
    const path = req.path;
    const method = req.method;
    const sessionId = req.session?.id || '';
    const uid = req.session?.uid || '';
    const ip =
      req.header('cf-connecting-ip') ||
      req.header('x-real-ip') ||
      req.header('x-forwarded-for') ||
      req.ip;

    req.id ||= req.header('x-request-id') || genRequestId();
    req.log = (...a: any[]) =>
      console.log(
        `[request] ${req.id}${requestLogging ? `|ip=${ip}${uid && `|session=${sessionId}|uid=${uid}`}` : ''}`,
        ...a,
      );

    if (!path.includes('getUserNotifications')) {
      req.log(`${method} ${path}`);
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
  app.use(handlePayloadTooLarge);

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
