/// <reference types="mocha" />

import assert from 'node:assert';

import { createPostgresClient } from '@blms/database';

import type { Dependencies } from './dependencies.js';
import { createGetMetadata } from './metadata.js';

describe('createGetMetadata', () => {
  before(() => {
    // postgres.js connects lazily: building a query never opens a socket
    createPostgresClient({
      database: 'x',
      host: '127.0.0.1',
      password: 'x',
      port: 1,
      username: 'x',
    });
  });

  it('HTML-escapes every field that nginx injects into the page head', async () => {
    // Any educator content lookup returns fields written by a user.
    const postgres = {
      exec: async () => [
        {
          cover: '"><script>alert(2)</script>',
          description: 'x" onmouseover="alert(3)',
          language: '"><script>alert(4)</script>',
          title: '</title><script>alert(1)</script>',
        },
      ],
    };
    const getMetadata = createGetMetadata({
      postgres,
    } as unknown as Dependencies);

    const metadata = await getMetadata([
      'en',
      'educator-content',
      '6f1c1c3e-3d6e-4a51-9a4e-2f0e7b1d2c3a',
    ]);

    for (const value of Object.values(metadata)) {
      assert.doesNotMatch(value, /[<>"']/, `unescaped value: ${value}`);
    }
    assert.equal(
      metadata.title,
      '&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;',
    );
  });

  it('keeps plain titles intact', async () => {
    const postgres = {
      exec: async () => [
        { description: 'Desc', language: 'fr', title: 'Plan B' },
      ],
    };
    const getMetadata = createGetMetadata({
      postgres,
    } as unknown as Dependencies);

    const metadata = await getMetadata([
      'fr',
      'educator-content',
      '6f1c1c3e-3d6e-4a51-9a4e-2f0e7b1d2c3a',
    ]);

    assert.equal(metadata.title, 'Plan B');
    assert.equal(metadata.lang, 'fr');
  });
});
