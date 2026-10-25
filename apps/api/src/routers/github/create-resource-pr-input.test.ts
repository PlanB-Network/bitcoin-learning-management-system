/// <reference types="mocha" />

import assert from 'node:assert';

import { createResourcePRSchema } from '@blms/schemas';

// services/github/pr.ts writes `resources/<type>/<title>/<language>.yml` to the
// content repository with the bot token.
const input = {
  description: 'A book',
  language: 'en',
  title: 'Mastering Bitcoin',
  type: 'books',
};

describe('github.createResourcePR input', () => {
  it('refuses a language that is not a language code', () => {
    for (const language of [
      '../../../.github/workflows/build',
      'en/../../x',
      'en.yml',
      '',
    ]) {
      assert.equal(
        createResourcePRSchema.safeParse({ ...input, language }).success,
        false,
        language,
      );
    }
  });

  it('accepts the language codes of the platform', () => {
    for (const language of ['en', 'fr', 'nbno', 'zhhans', 'zh-Hans']) {
      assert.equal(
        createResourcePRSchema.safeParse({ ...input, language }).success,
        true,
        language,
      );
    }
  });
});
