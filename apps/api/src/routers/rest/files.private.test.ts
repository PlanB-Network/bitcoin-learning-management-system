/// <reference types="mocha" />

import assert from 'node:assert';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Readable } from 'node:stream';

import { createPostgresClient } from '@blms/database';
import { NoSuchKey } from '@blms/s3';
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

interface FakeQuery {
  strings?: readonly string[];
  args?: readonly unknown[];
}

const isFakeQuery = (value: unknown): value is FakeQuery =>
  !!value && typeof value === 'object' && 'strings' in value;

// postgres.js nests fragments (sql`...` inside sql`...`): flatten them.
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

const sessions: Record<string, object> = {
  admin: { permissions: [], role: 'admin', uid: 'uid-admin' },
  alice: { permissions: null, role: 'student', uid: 'uid-alice' },
  bob: { permissions: null, role: 'student', uid: 'uid-bob' },
  careerAdmin: {
    permissions: ['admin:career'],
    role: 'admin',
    uid: 'uid-career-admin',
  },
  coordinator: { permissions: null, role: 'professor', uid: 'uid-prof-1' },
  otherProfessor: { permissions: null, role: 'professor', uid: 'uid-prof-2' },
};

const careerProfiles: Record<string, string> = {
  'uid-alice': 'profile-alice',
  'uid-bob': 'profile-bob',
};

const professorIds: Record<string, string> = {
  'uid-prof-1': 'professor-1',
  'uid-prof-2': 'professor-2',
};

// Alice was given assignment `assignment-1` in course `course-1`; Bob has no
// assignment. Professor 1 coordinates course-1.
const respond = (query: FakeQuery): unknown[] => {
  const { text, args } = flatten(query);

  if (text.includes('users.career_profiles')) {
    const id = careerProfiles[String(args[0])];
    return id ? [{ id }] : [];
  }

  if (text.includes('affected_assignment_id')) {
    const [uid, courseId] = args;
    return uid === 'uid-alice' && courseId === 'course-1'
      ? [
          {
            assignmentId: 'assignment-1',
            assignmentName: 'Essay Corp',
            username: 'Alice',
          },
        ]
      : [];
  }

  if (text.includes('content.course_professors')) {
    return args.includes('course-1') && args.includes('professor-1')
      ? [{ id: 'professor-1' }]
      : [];
  }

  if (text.includes('professor_id')) {
    return [{ professorId: professorIds[String(args[0])] ?? null }];
  }

  return [];
};

const startApp = async (objects: Record<string, string>) => {
  const uploads: string[] = [];

  const s3 = {
    getBlob: async () => null,
    getStream: async (rawKey: string) => {
      // Like the real client, which collapses repeated slashes
      const key = rawKey.replaceAll(/\/+/g, '/');
      if (!(key in objects)) {
        throw new NoSuchKey({ $metadata: {}, message: key });
      }
      return Readable.from([objects[key]]);
    },
    head: async () => ({ contentLength: 8, contentType: 'application/pdf' }),
    upload: async (key: string, stream: Readable) => {
      for await (const _chunk of stream) {
        // drain
      }
      uploads.push(key);
    },
  };

  const dependencies = {
    config: { opentimestamps: { armoredKey: '' } },
    postgres: { exec: async (query: FakeQuery) => respond(query) },
    s3,
  } as unknown as Dependencies;

  const app = express();
  app.use((req, _res, next) => {
    // Test double: the `x-test-user` header picks the session.
    const user = req.header('x-test-user');
    Object.assign(req, {
      log: () => {},
      session: user ? { ...sessions[user] } : {},
    });
    next();
  });

  const router = Router();
  await createRestFilesRoutes(dependencies, router);
  app.use('/api', router);
  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      const status =
        err && typeof err === 'object' && 'status' in err
          ? Number(err.status)
          : 500;
      res.status(status).end();
    },
  );

  const server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}/api`;

  const get = async (path: string, user?: string) => {
    const res = await fetch(`${base}${path}`, {
      headers: user ? { 'x-test-user': user } : {},
    });
    return { body: await res.text(), res };
  };

  const postPdf = async (path: string, user: string) => {
    const form = new FormData();
    form.append(
      'file',
      new Blob(['%PDF-1.4'], { type: 'application/pdf' }),
      'work.pdf',
    );
    const res = await fetch(`${base}${path}`, {
      body: form,
      headers: { 'x-test-user': user },
      method: 'POST',
    });
    await res.arrayBuffer();
    return res;
  };

  return { get, postPdf, server, uploads };
};

describe('REST files routes: CVs and submitted assignments', () => {
  it('serves a CV only to the owner of the profile and career admins', async () => {
    const app = await startApp({ 'cvs/profile-alice': '%PDF-alice' });
    try {
      const statuses = await Promise.all(
        [undefined, 'bob', 'admin', 'alice', 'careerAdmin'].map(
          async (user) =>
            (await app.get('/files/cvs/profile-alice', user)).res.status,
        ),
      );
      assert.deepEqual(statuses, [401, 403, 403, 200, 200]);

      const { res } = await app.get('/files/cvs/profile-alice', 'alice');
      assert.equal(res.headers.get('content-type'), 'application/pdf');
      assert.equal(res.headers.get('cache-control'), 'private, no-store');
    } finally {
      app.server.close();
    }
  });

  it("refuses a CV upload to another user's career profile", async () => {
    const app = await startApp({});
    try {
      const res = await app.postPdf('/career/cvs/profile-alice', 'bob');

      assert.equal(res.status, 403);
      assert.deepEqual(app.uploads, []);

      const own = await app.postPdf('/career/cvs/profile-bob', 'bob');
      assert.equal(own.status, 200);
      assert.deepEqual(app.uploads, ['cvs/profile-bob']);
    } finally {
      app.server.close();
    }
  });

  it('never serves a submitted assignment through the public file route', async () => {
    const app = await startApp({
      'course-assignments/course-1/submitted/essay-corp_alice.pdf': '%PDF',
      'course-assignments/course-1/submitted/assignment-1/uid-alice.pdf':
        '%PDF',
    });
    try {
      for (const path of [
        '/files/course-assignments/course-1/submitted/essay-corp_alice.pdf',
        '/files/course-assignments/course-1//submitted/essay-corp_alice.pdf',
        // fetch resolves a literal `..`; an encoded slash reaches the route
        '/files/course-assignments/course-1/x/..%2Fsubmitted/essay-corp_alice.pdf',
        '/files/course-assignments/course-1/submitted/assignment-1/uid-alice.pdf',
      ]) {
        const { res, body } = await app.get(path, 'bob');
        assert.notEqual(body, '%PDF', `served ${path}`);
        assert.equal(res.status, 404, path);
      }
    } finally {
      app.server.close();
    }
  });

  it("stores a submission under the caller's own assignment, whatever key the client sends", async () => {
    const app = await startApp({});
    try {
      const res = await app.postPdf(
        '/course-assignments/submit/course-1/essay-corp_bob.pdf',
        'alice',
      );

      assert.equal(res.status, 200);
      assert.deepEqual(app.uploads, [
        'course-assignments/course-1/submitted/assignment-1/uid-alice.pdf',
      ]);
    } finally {
      app.server.close();
    }
  });

  it('refuses a submission from a student without an assignment in the course', async () => {
    const app = await startApp({});
    try {
      const res = await app.postPdf(
        '/course-assignments/submit/course-1/essay-corp_alice.pdf',
        'bob',
      );

      assert.equal(res.status, 403);
      assert.deepEqual(app.uploads, []);
    } finally {
      app.server.close();
    }
  });

  it('lets the author, the course coordinators and admins read a submission, and nobody else', async () => {
    const app = await startApp({
      'course-assignments/course-1/submitted/assignment-1/uid-alice.pdf':
        '%PDF-alice',
    });
    try {
      const path = '/course-assignments/course-1/submissions/uid-alice';
      const results = await Promise.all(
        [
          undefined,
          'bob',
          'otherProfessor',
          'alice',
          'coordinator',
          'admin',
        ].map(async (user) => {
          const { res, body } = await app.get(path, user);
          return `${res.status} ${res.status === 200 ? body : ''}`.trim();
        }),
      );

      assert.deepEqual(results, [
        '401',
        '403',
        '403',
        '200 %PDF-alice',
        '200 %PDF-alice',
        '200 %PDF-alice',
      ]);
    } finally {
      app.server.close();
    }
  });

  it('still finds a submission stored under the name the academy chose before', async () => {
    const app = await startApp({
      'course-assignments/course-1/submitted/essay-corp_alice.pdf':
        '%PDF-legacy',
    });
    try {
      const { res, body } = await app.get(
        '/course-assignments/course-1/submissions/uid-alice',
        'coordinator',
      );

      assert.equal(res.status, 200);
      assert.equal(body, '%PDF-legacy');
    } finally {
      app.server.close();
    }
  });
});
