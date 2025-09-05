// import b4a from 'b4a';

// import Hyperblobs from 'hyperblobs';
// import Hyperswarm from 'hyperswarm';
import path from 'bare-path';
import Corestore from 'corestore';

export const PearVideoTest = async () => {
  // const key = '';
  // const blobJson = '';
  const blobUrl = '';

  if (window.Pear) {
    const store = new Corestore(
      path.join(window.Pear.config.storage, 'storage'),
    );
    await store.ready();
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
