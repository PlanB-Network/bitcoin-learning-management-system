/// <reference types="mocha" />

import assert from 'node:assert';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { createPostgresClient } from '@blms/database';
import express, { Router } from 'express';

import type { Dependencies } from '#src/dependencies.js';

import { createRestMentorRoutes } from './mentor.js';

// Initialise the module-level `sql` helper. No connection is opened: the fake
// client below never executes a query.
createPostgresClient({
  database: 'test',
  host: '127.0.0.1',
  password: 'test',
  port: 1,
  username: 'test',
});

interface FakeQuery {
  strings?: readonly string[];
  args?: readonly unknown[];
}

const isFakeQuery = (value: unknown): value is FakeQuery =>
  !!value && typeof value === 'object' && 'strings' in value;

const flatten = (query: FakeQuery): { text: string; args: unknown[] } => {
  const parts = [...(query.strings ?? [])];
  const args: unknown[] = [];
  for (const arg of query.args ?? []) {
    if (isFakeQuery(arg)) {
      const nested = flatten(arg);
      parts.push(nested.text);
      args.push(...nested.args);
    } else {
      args.push(arg);
    }
  }
  return { args, text: parts.join('?') };
};

// Asks the mentor a question about chapter `chapter-1`, whose course requires
// a payment; `hasPaid` decides what the paywall check answers. Returns the
// queries that read the text of that chapter.
const askAboutChapter = async (hasPaid: boolean) => {
  const chapterReads: string[] = [];

  const postgres = {
    exec: async (query: FakeQuery) => {
      const { text, args } = flatten(query);
      if (text.includes('raw_content') && args.includes('chapter-1')) {
        chapterReads.push(text);
      }
      if (text.includes('AS allowed')) {
        return [{ allowed: hasPaid, id: 'course-1' }];
      }
      return [];
    },
  };

  const typesense = {
    collections: () => ({
      documents: () => ({
        search: async () => ({
          found: 0,
          hits: [],
          page: 1,
          search_time_ms: 1,
        }),
      }),
    }),
  };

  const dependencies = {
    config: { groq: { apiKey: 'test' } },
    postgres,
    typesense,
  } as unknown as Dependencies;

  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    // Test double: a fixed logged-in session replaces the session middleware.
    Object.assign(req, { log: () => {}, session: { uid: 'uid-alice' } });
    next();
  });
  const router = Router();
  createRestMentorRoutes(dependencies, router);
  app.use('/api', router);

  const server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address() as AddressInfo;

  // The LLM call is answered locally; requests to the test app go through.
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: object) =>
    String(input).startsWith('https://api.groq.com')
      ? new Response('data: [DONE]\n\n')
      : realFetch(input, init)) as typeof fetch;

  try {
    const res = await realFetch(`http://127.0.0.1:${port}/api/mentor/stream`, {
      body: JSON.stringify({ chapterId: 'chapter-1', question: 'Summarise' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    await res.text();
  } finally {
    globalThis.fetch = realFetch;
    server.close();
  }

  return chapterReads;
};

describe('REST mentor routes: paid chapters', () => {
  it('does not read a paid chapter for a student who has not paid', async () => {
    const reads = await askAboutChapter(false);

    assert.deepEqual(reads, [], 'the mentor read the text of a paid chapter');
  });

  it('reads the chapter for a student who has access', async () => {
    const reads = await askAboutChapter(true);

    assert.equal(reads.length, 1);
  });
});
