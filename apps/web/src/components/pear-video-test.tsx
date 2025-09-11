// import b4a from 'b4a';

import b4a from 'b4a';
import Corestore from 'corestore';
import Hyperblobs from 'hyperblobs';
import Hyperswarm from 'hyperswarm';
import path from 'path';

declare global {
  interface Window {
    PearTools: {
      Corestore: typeof Corestore;
      Hyperswarm: typeof Hyperswarm;
      Hyperblobs: typeof Hyperblobs;
      path: typeof path;
      b4a: typeof b4a;
    };
  }
}

window.PearTools = {
  Corestore,
  Hyperswarm,
  Hyperblobs,
  path,
  b4a,
};

export const PearVideoTest = async () => {
  // const key = '';
  // const blobJson = '';
  const blobUrl = '';

  const videoKey =
    '7ee3369e3c75e2df7df3e339146637d26b1d82a4db08f3b91306b13638778835';
  const blobId = {
    byteOffset: 26765946,
    blockOffset: 410,
    blockLength: 205,
    byteLength: 13382973,
  };

  console.log('PEAR VIDEO TEST', window.Pear?.config.storage, {
    videoKey,
    blobId,
  });

  if (window.Pear) {
    // const store = new Corestore(
    //   // path.join(window.Pear.config.storage, 'storage'),
    // );
    // await store.ready();
    // const swarm = new Hyperswarm();
    // const core = store.get({ key: b4a.from(key, 'hex') });
    // await core.ready();
    // const blobs = new Hyperblobs(core);
    // swarm.join(core.discoveryKey);
    // const blobId = JSON.parse(blobJson);
    // console.log('Waiting for blob...');
    // const buf = await blobs.get(blobId, { wait: true, timeout: 30_000 }); // 30s timeout
    // console.log('Blob downloaded');
    // const blob = new Blob([buf], { type: 'video/mp4' });
    // blobUrl = URL.createObjectURL(blob);
  }

  return (
    <div>
      PEAR!
      <video id="video" controls src={blobUrl}>
        <track
          kind="captions"
          src=""
          srcLang="en"
          label="English captions"
          default
        />
      </video>
    </div>
  );
};
