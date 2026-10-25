/// <reference types="mocha" />

import assert from 'node:assert';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import express from 'express';

import { createRequestLogger } from './request-logger.js';

describe('request logger', () => {
  it('never writes the session id in the logs', async () => {
    const sessionId = 'Zk3c9Yv7QbLr2PxW8nTa5HdE1sJmGuKo';
    const lines: string[] = [];

    const app = express();
    app.use((req, _res, next) => {
      // Test double: a logged-in session replaces the session middleware.
      Object.assign(req, { session: { id: sessionId, uid: 'uid-alice' } });
      next();
    });
    app.use(createRequestLogger(true));
    app.get('/ping', (_req, res) => {
      res.send('pong');
    });

    const listening = Promise.withResolvers<void>();
    const server: Server = app.listen(0, '127.0.0.1', () =>
      listening.resolve(),
    );
    await listening.promise;
    const { port } = server.address() as AddressInfo;

    const realLog = console.log;
    console.log = (...args: unknown[]) => {
      lines.push(args.join(' '));
    };
    try {
      const res = await fetch(`http://127.0.0.1:${port}/ping`);
      await res.text();
      // The response-time line is written on 'finish'
      const finished = Promise.withResolvers<void>();
      setImmediate(finished.resolve);
      await finished.promise;
    } finally {
      console.log = realLog;
      server.close();
    }

    assert.ok(
      lines.some((line) => line.includes('uid=uid-alice')),
      'request lines still name the user',
    );
    assert.deepEqual(
      lines.filter((line) => line.includes(sessionId)),
      [],
      'the session id was logged',
    );
  });
});
