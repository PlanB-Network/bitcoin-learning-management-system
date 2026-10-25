/// <reference types="mocha" />

import assert from 'node:assert';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Readable } from 'node:stream';

import { createPostgresClient } from '@blms/database';
import express, { Router } from 'express';

import type { Dependencies } from '#src/dependencies.js';

import { createRestFilesRoutes } from './files.js';

// Initialise the module-level `sql` helper. No connection is opened: the fake
// client below never executes a query.
createPostgresClient({
  database: 'test',
  host: '127.0.0.1',
  password: 'test',
  port: 1,
  username: 'test',
});

const startApp = async () => {
  const s3 = {
    upload: async (_key: string, stream: Readable) => {
      for await (const _chunk of stream) {
        // drain
      }
    },
  };

  // The caller owns career profile `profile-1`, the target of the CV uploads
  const postgres = { exec: async () => [{ id: 'profile-1' }] };

  const dependencies = {
    config: { opentimestamps: { armoredKey: '' } },
    postgres,
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

  return { base: `http://127.0.0.1:${port}/api`, server };
};

// Before the fix these requests threw inside formidable's callback: mocha
// reports that uncaught exception as a failure; in production it stopped the
// API process.
describe('REST files routes: invalid uploads', () => {
  it('answers 400 to a picture upload with two files', async () => {
    const { base, server } = await startApp();
    try {
      const form = new FormData();
      form.append('file', new Blob(['a'], { type: 'image/png' }), 'a.png');
      form.append('file', new Blob(['b'], { type: 'image/png' }), 'b.png');

      const res = await fetch(`${base}/user-file/profile-picture`, {
        body: form,
        method: 'POST',
        signal: AbortSignal.timeout(5000),
      });
      await res.arrayBuffer();

      assert.equal(res.status, 400);
    } finally {
      server.close();
    }
  });

  it('answers 400 to a CV upload without a file', async () => {
    const { base, server } = await startApp();
    try {
      const form = new FormData();
      form.append('other', 'value');

      const res = await fetch(`${base}/career/cvs/profile-1`, {
        body: form,
        method: 'POST',
        signal: AbortSignal.timeout(5000),
      });
      await res.arrayBuffer();

      assert.equal(res.status, 400);
    } finally {
      server.close();
    }
  });

  it('answers 400 to a CV upload that is not a PDF', async () => {
    const { base, server } = await startApp();
    try {
      const form = new FormData();
      form.append(
        'file',
        new Blob(['<html>'], { type: 'text/html' }),
        'cv.html',
      );

      const res = await fetch(`${base}/career/cvs/profile-1`, {
        body: form,
        method: 'POST',
        signal: AbortSignal.timeout(5000),
      });
      await res.arrayBuffer();

      assert.equal(res.status, 400);
    } finally {
      server.close();
    }
  });
});
