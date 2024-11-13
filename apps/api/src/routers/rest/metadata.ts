import type { Router } from 'express';

import { createGetMetadata } from '@blms/service-content';

import type { Dependencies } from '#src/dependencies.js';

// Encode a string to url-safe base64
const b64enc = (value: string) => btoa(encodeURIComponent(value));

export const createRestMetadataRoutes = (
  dependencies: Dependencies,
  router: Router,
) => {
  const getMetadata = createGetMetadata(dependencies);

  // curl "localhost:3000/api/metadata?uri=/" -I
  router.get('/metadata', async (req, res) => {
    try {
      const proto = (req.headers['x-forwarded-proto'] as string) ?? 'http';
      const host = req.headers['host'] as string;

      const url = new URL(`${proto}://${host}${req.query.uri as string}`);
      const parts = url.pathname.split('/').filter(Boolean);

      console.log(`Metadata query`, url.toString());
      const metadata = await getMetadata(parts);
      const imageUrl = dependencies.config.domainUrl + metadata.image;

      res.setHeader('X-Title', b64enc(metadata.title));
      res.setHeader('X-Description', b64enc(metadata.description));
      res.setHeader('X-Locale', metadata.lang);
      res.setHeader('X-Image', imageUrl);
      res.setHeader('X-Type', 'website');

      res.status(204).end();
    } catch (error) {
      console.error('Error resolving metadata', error);
      res.status(204).end();
    }
  });

  return router;
};
