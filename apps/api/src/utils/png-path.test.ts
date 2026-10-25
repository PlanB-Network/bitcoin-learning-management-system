/// <reference types="mocha" />

import assert from 'node:assert';

import {
  buildTranslatedPngKey,
  buildTranslatedProofreadPngKey,
} from './png-path.js';

// apps/api/src/routers/rest/png-viewer.ts passes the client-supplied
// ppt_resource_path to these builders and streams the resulting S3 key.
describe('translated PNG key builders', () => {
  it('refuse paths that are not slide presentations', () => {
    for (const path of [
      'cvs/1234',
      'certificates/abc.pdf',
      'contribute/../cvs/1234/pptx/a.pptx',
      'contribute/c1/pptx/a.pptx/pptx/b.pptx',
      'contribute/c1/fr/notes.txt',
    ]) {
      assert.throws(() => buildTranslatedProofreadPngKey(path), path);
      assert.throws(() => buildTranslatedPngKey(path), path);
    }
  });

  it('build the keys of slide PNGs', () => {
    const path = 'contribute/c1/fr/p1/ch1/s1/pptx/1.1_0.pptx';
    assert.equal(
      buildTranslatedProofreadPngKey(path),
      'contribute/c1/fr/p1/ch1/s1/png/1.1_0-proofread.png',
    );
    assert.equal(
      buildTranslatedPngKey(path),
      'contribute/c1/fr/p1/ch1/s1/png/1.1_0.png',
    );
  });
});
