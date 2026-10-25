/// <reference types="mocha" />

import assert from 'node:assert';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Readable } from 'node:stream';

import express, { Router } from 'express';

import type { Dependencies } from '#src/dependencies.js';

import { createRestFilesRoutes } from './files.js';

const startApp = async (storedContentType: string) => {
  const uploads: { key: string; contentType?: string }[] = [];

  const s3 = {
    getBlob: async () => null,
    getStream: async () => Readable.from(['<script>alert(1)</script>']),
    head: async () => ({ contentLength: 25, contentType: storedContentType }),
    upload: async (
      key: string,
      stream: Readable,
      options?: { contentType?: string },
    ) => {
      for await (const _chunk of stream) {
        // drain
      }
      uploads.push({ contentType: options?.contentType, key });
    },
  };

  const dependencies = {
    config: { opentimestamps: { armoredKey: '' } },
    s3,
  } as unknown as Dependencies;

  const app = express();
  app.use((req, _res, next) => {
    // Test double: a fixed logged-in session replaces the session middleware.
    Object.assign(req, { log: () => {}, session: { uid: 'uid-alice' } });
    next();
  });

  const router = Router();
  await createRestFilesRoutes(dependencies, router);
  app.use('/api', router);

  const server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address() as AddressInfo;

  return { base: `http://127.0.0.1:${port}/api`, server, uploads };
};

describe('REST files routes: serving user files', () => {
  it('never serves an uploaded HTML file as renderable content', async () => {
    const { base, server } = await startApp('text/html');
    try {
      const res = await fetch(
        `${base}/files/contribute/educator-content/x?fileName=a.html`,
      );
      await res.arrayBuffer();

      assert.equal(res.status, 200);
      assert.equal(res.headers.get('content-type'), 'application/octet-stream');
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
      assert.match(res.headers.get('content-disposition') ?? '', /^attachment/);
      assert.match(
        res.headers.get('content-security-policy') ?? '',
        /default-src 'none'; sandbox/,
      );
    } finally {
      server.close();
    }
  });

  it('still displays images inline, without sniffing', async () => {
    const { base, server } = await startApp('image/webp');
    try {
      const res = await fetch(`${base}/files/user-files/x`);
      await res.arrayBuffer();

      assert.equal(res.headers.get('content-type'), 'image/webp');
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
      assert.match(res.headers.get('content-disposition') ?? '', /^inline/);
    } finally {
      server.close();
    }
  });

  it('does not store the client-declared type of an educator file', async () => {
    const { base, server, uploads } = await startApp('text/html');
    try {
      const form = new FormData();
      form.append(
        'file',
        new Blob(['<script>alert(1)</script>'], { type: 'text/html' }),
        'a.html',
      );

      const res = await fetch(`${base}/educator-content/file`, {
        body: form,
        method: 'POST',
      });
      await res.arrayBuffer();

      assert.equal(res.status, 200);
      assert.deepEqual(
        uploads.map((upload) => upload.contentType),
        ['application/octet-stream'],
      );
    } finally {
      server.close();
    }
  });
});
