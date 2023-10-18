import createCors from 'cors';
import type { NextFunction, Request, Response } from 'express';

export const createCorsMiddleware = () => {
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? new Set([`https://${process.env.DOMAIN}`])
      : new Set(['http://localhost:4200']);

  const cors = createCors({
    credentials: true,
    exposedHeaders: ['Set-Cookie', 'Cookie', 'set-cookie'],
    origin: (origin, callback) => {
      if (origin && allowedOrigins.has(origin)) {
        callback(null, true);
      } else if (origin) {
        console.error(
          `Rejected origin ${origin} (not in allowed origins: ${Array.from(
            allowedOrigins,
          ).join(', ')})`,
        );

        callback(new Error('Not allowed by CORS'));
      } else {
        callback(null, true);
      }
    },
  });

  return (request: Request, response: Response, next: NextFunction) => {
    cors(request, response, next);
  };
};
