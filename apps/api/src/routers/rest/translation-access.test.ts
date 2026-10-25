/// <reference types="mocha" />

import assert from 'node:assert';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Readable } from 'node:stream';

import { createPostgresClient } from '@blms/database';
import express, { json, Router } from 'express';

import type { Dependencies } from '#src/dependencies.js';

import { createRestPngViewerRoutes } from './png-viewer.js';
import { createRestTranslationAudioRoutes } from './translation-audio.js';
import { createRestTranslationDownloadRoutes } from './translation-downloads.js';
import { createRestTranslationUploadRoutes } from './translation-uploads.js';

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
  const recorded = {
    deletes: [] as string[],
    outboundFetches: [] as string[],
    reads: [] as string[],
    uploads: [] as string[],
    writes: [] as string[],
  };

  const s3 = {
    delete: async (key: string) => {
      recorded.deletes.push(key);
    },
    getBlob: async () => null,
    getStream: async (key: string) => {
      recorded.reads.push(key);
      return null;
    },
    head: async (key: string) => {
      recorded.reads.push(key);
      return { contentLength: 1, contentType: 'application/pdf' };
    },
    list: async () => [],
    upload: async (key: string, stream: Readable) => {
      for await (const _chunk of stream) {
        // drain
      }
      recorded.uploads.push(key);
    },
  };

  // Every SELECT (job recovery at start-up included) sees an empty table;
  // writes are recorded.
  const postgres = {
    exec: async (query: { strings?: readonly string[] }) => {
      const text = (query.strings ?? []).join('?');
      if (/\b(INSERT|UPDATE|DELETE)\b/i.test(text)) {
        recorded.writes.push(text);
      }
      return [];
    },
  };

  const dependencies = {
    config: {},
    languageToolkit: {},
    postgres,
    s3,
  } as unknown as Dependencies;

  const app = express();
  app.use(json());
  app.use((req, _res, next) => {
    // Test double: a fixed session replaces the session middleware.
    Object.assign(req, { log: () => {}, session: { ...session } });
    next();
  });

  const router = Router();
  await createRestTranslationDownloadRoutes(dependencies, router);
  await createRestTranslationAudioRoutes(dependencies, router);
  await createRestTranslationUploadRoutes(dependencies, router);
  await createRestPngViewerRoutes(dependencies, router);
  app.use('/api', router);

  const server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}/api`;

  // Record outbound HTTP calls (Language Toolkit, ConvertAPI...).
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    const url = input instanceof Request ? input.url : input.toString();
    if (url.startsWith(base)) {
      return realFetch(input, init);
    }
    recorded.outboundFetches.push(url);
    if (url.includes('/token')) {
      return Response.json({ access_token: 'test-token' });
    }
    return Response.json({ task_id: 'task-1' });
  }) as typeof fetch;

  const stop = () => {
    globalThis.fetch = realFetch;
    server.close();
  };

  return { base, recorded, stop };
};

const student = { role: 'student', uid: 'uid-student' };
const contributor = { role: 'contributor', uid: 'uid-contributor' };

const postJson = (url: string, body: unknown) =>
  fetch(url, {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

describe('REST translation routes: access control', () => {
  it('refuses translation uploads from a student', async () => {
    const { base, recorded, stop } = await startApp(student);
    try {
      const form = new FormData();
      form.append('courseId', 'course-1');
      form.append('languages', '["fr"]');

      const res = await fetch(`${base}/upload-translation-files`, {
        body: form,
        method: 'POST',
      });
      await res.arrayBuffer();

      assert.equal(res.status, 403);
      assert.deepEqual(recorded.writes, []);
      assert.deepEqual(recorded.deletes, []);
    } finally {
      stop();
    }
  });

  it('refuses translation retries from a contributor', async () => {
    const { base, recorded, stop } = await startApp(contributor);
    try {
      const res = await postJson(`${base}/retry-translation/course-1`, {
        languages: ['fr'],
      });
      await res.arrayBuffer();

      assert.equal(res.status, 403);
      assert.deepEqual(recorded.writes, []);
    } finally {
      stop();
    }
  });

  it('refuses text-to-speech generation from a student', async () => {
    const { base, recorded, stop } = await startApp(student);
    try {
      const res = await postJson(`${base}/translation-audio/generate`, {
        chapterId: 'c',
        courseId: 'course-1',
        fileName: 'f',
        language: 'fr',
        partId: 'p',
        slideId: 's',
        text: 'any text in a professor voice',
      });
      await res.arrayBuffer();

      assert.equal(res.status, 403);
      assert.deepEqual(recorded.outboundFetches, []);
    } finally {
      stop();
    }
  });

  it('refuses proofread copies from a student', async () => {
    const { base, recorded, stop } = await startApp(student);
    try {
      const res = await postJson(
        `${base}/translation-downloads/pptx-create-proofread-copy`,
        {
          chapterId: 'c',
          courseId: 'course-1',
          fileName: 'f',
          language: 'fr',
          partId: 'p',
          slideId: 's',
        },
      );
      await res.arrayBuffer();

      assert.equal(res.status, 403);
      assert.deepEqual(recorded.uploads, []);
    } finally {
      stop();
    }
  });

  it('refuses the PNG viewer to a student', async () => {
    const { base, recorded, stop } = await startApp(student);
    try {
      const res = await fetch(
        `${base}/png-viewer/translated/course-1/fr/p/c/s/${encodeURIComponent('cvs/profile-1')}/1`,
      );
      await res.arrayBuffer();

      assert.equal(res.status, 403);
      assert.deepEqual(recorded.reads, []);
    } finally {
      stop();
    }
  });

  it('does not let the translated PNG viewer read objects outside slides', async () => {
    const { base, recorded, stop } = await startApp(contributor);
    try {
      for (const fileName of ['cvs/profile-1', 'contribute/../cvs/profile-1']) {
        const res = await fetch(
          `${base}/png-viewer/translated/course-1/fr/p/c/s/${encodeURIComponent(fileName)}/1`,
        );
        await res.arrayBuffer();

        assert.equal(res.status, 400, fileName);
      }
      assert.deepEqual(recorded.reads, []);
    } finally {
      stop();
    }
  });
});
