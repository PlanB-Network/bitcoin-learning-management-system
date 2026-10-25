import { createHash, randomUUID } from 'node:crypto';

import type { RequestHandler } from 'express';

export const genRequestId = () => randomUUID().replace(/-/g, '').slice(0, 16);

/**
 * Basic request logger, and sets the request ID.
 *
 * With `requestLogging`, each line also carries the client IP, the user and a
 * short hash of the session id: enough to follow one session through the
 * logs, useless to replay it. The session id itself is a bearer credential.
 */
export const createRequestLogger =
  (requestLogging: boolean): RequestHandler =>
  (req, res, next) => {
    const path = req.path;
    const method = req.method;
    const sessionId = req.session?.id || '';
    const uid = req.session?.uid || '';
    const ip =
      req.header('cf-connecting-ip') ||
      req.header('x-real-ip') ||
      req.header('x-forwarded-for') ||
      req.ip;
    const sessionTag =
      requestLogging && uid
        ? createHash('sha256').update(sessionId).digest('hex').slice(0, 12)
        : '';

    req.id ||= req.header('x-request-id') || genRequestId();
    req.log = (...a: unknown[]) =>
      console.log(
        `[request] ${req.id}${requestLogging ? `|ip=${ip}${uid && `|session=${sessionTag}|uid=${uid}`}` : ''}`,
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
  };
