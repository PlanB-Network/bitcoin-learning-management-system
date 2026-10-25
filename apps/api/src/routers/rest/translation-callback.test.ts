/// <reference types="mocha" />

import assert from 'node:assert';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Readable } from 'node:stream';

import { createPostgresClient } from '@blms/database';
import express, { json, Router } from 'express';

import type { Dependencies } from '#src/dependencies.js';

import { createRestTranslationDownloadRoutes } from './translation-downloads.js';

// Initialise the module-level `sql` helper; postgres.js connects lazily and
// the fake client below never executes a query.
createPostgresClient({
  database: 'test',
  host: '127.0.0.1',
  password: 'test',
  port: 1,
  username: 'test',
});

const startApp = async (session: { uid?: string; role?: string }) => {
  const uploads: string[] = [];
  const outboundFetches: string[] = [];

  const s3 = {
    upload: async (key: string, stream: Readable) => {
      for await (const _chunk of stream) {
        // drain
      }
      uploads.push(key);
    },
  };

  // Every slide lookup finds the slide.
  const postgres = {
    exec: async () => [
      {
        ppt_resource_path:
          'contribute/course-1/fr/part-1/chapter-1/slide-1/pptx/1.1_0.pptx',
        slide_id: 'slide-1',
      },
    ],
  };

  const dependencies = { postgres, s3 } as unknown as Dependencies;

  const app = express();
  app.use(json());
  app.use((req, _res, next) => {
    // Test double: a fixed session replaces the session middleware.
    Object.assign(req, { log: () => {}, session: { ...session } });
    next();
  });

  const router = Router();
  await createRestTranslationDownloadRoutes(dependencies, router);
  app.use('/api', router);

  const server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}/api`;

  // Calls to the OnlyOffice Document Server are recorded and answered here.
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    const url = input instanceof Request ? input.url : input.toString();
    if (url.startsWith(base)) {
      return realFetch(input, init);
    }
    outboundFetches.push(url);
    return new Response(new Uint8Array([0x50, 0x4b, 0x03, 0x04]));
  }) as typeof fetch;

  const stop = () => {
    globalThis.fetch = realFetch;
    server.close();
  };

  return { base, outboundFetches, stop, uploads };
};

const savedDocument = {
  status: 2,
  url: 'http://onlyoffice.example/cache/files/key/output.pptx',
};

const postJson = (url: string, body: unknown) =>
  fetch(url, {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

describe('REST translation downloads: OnlyOffice callback', () => {
  it('refuses a callback without a token, whatever its query says', async () => {
    const { base, outboundFetches, stop, uploads } = await startApp({});
    try {
      const query = new URLSearchParams({
        chapterId: 'chapter-1',
        courseId: 'course-1',
        fileName: 'a',
        language: 'fr',
        partId: 'part-1',
        slideId: 'slide-1',
      });

      const res = await postJson(
        `${base}/translation-downloads/pptx-callback?${query}`,
        savedDocument,
      );
      await res.arrayBuffer();

      assert.equal(res.status, 403);
      assert.deepEqual(uploads, [], 'nothing may be written to S3');
      assert.deepEqual(outboundFetches, []);
    } finally {
      stop();
    }
  });

  it('refuses a callback with an unknown token', async () => {
    const { base, stop, uploads } = await startApp({});
    try {
      const res = await postJson(
        `${base}/translation-downloads/pptx-callback?token=forged`,
        savedDocument,
      );
      await res.arrayBuffer();

      assert.equal(res.status, 403);
      assert.deepEqual(uploads, []);
    } finally {
      stop();
    }
  });

  it('saves only the proofread copy of the slide the token was issued for', async () => {
    const { base, stop, uploads } = await startApp({
      role: 'contributor',
      uid: 'uid-translator',
    });
    try {
      const tokenResponse = await postJson(
        `${base}/translation-downloads/pptx-callback-token`,
        {
          chapterId: 'chapter-1',
          courseId: 'course-1',
          language: 'fr',
          partId: 'part-1',
          slideId: 'slide-1',
        },
      );
      const { token } = (await tokenResponse.json()) as { token: string };

      // Query parameters naming another location are ignored
      const res = await postJson(
        `${base}/translation-downloads/pptx-callback?token=${token}&partId=other&courseId=other`,
        savedDocument,
      );
      await res.arrayBuffer();

      assert.equal(res.status, 200);
      assert.deepEqual(uploads, [
        'contribute/course-1/fr/part-1/chapter-1/slide-1/pptx/1.1_0-proofread.pptx',
      ]);
    } finally {
      stop();
    }
  });

  it('refuses to issue a token for ids that are not single path segments', async () => {
    const { base, stop } = await startApp({
      role: 'contributor',
      uid: 'uid-translator',
    });
    try {
      const res = await postJson(
        `${base}/translation-downloads/pptx-callback-token`,
        {
          chapterId: 'chapter-1',
          courseId: 'course-1',
          language: 'fr',
          partId: '../../../cvs',
          slideId: 'slide-1',
        },
      );
      await res.arrayBuffer();

      assert.equal(res.status, 400);
    } finally {
      stop();
    }
  });
});
