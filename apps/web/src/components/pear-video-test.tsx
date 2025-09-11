import b4a from 'b4a';
import Hyperblobs from 'hyperblobs';
import { useEffect, useState } from 'react';
import { getPearInstance } from '../services/pear.js';

export const PearVideoTest = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setStatus('Getting Pear instance...');
        const { store, swarm } = await getPearInstance();

        const videoKey =
          '7ee3369e3c75e2df7df3e339146637d26b1d82a4db08f3b91306b13638778835';

        const blobId = {
          byteOffset: 40148919,
          blockOffset: 615,
          blockLength: 145,
          byteLength: 9464036,
        };

        const core = store!.get({ key: b4a.from(videoKey, 'hex') });
        await core.ready();

        swarm!.join(core.discoveryKey);

        const blobs = new Hyperblobs(core);

        setStatus('Waiting for blob...');
        const buf = await blobs.get(blobId, { wait: true, timeout: 30_000 });

        setStatus('Blob downloaded, creating URL...');
        const blob = new Blob([buf], { type: 'video/mp4' });
        const blobURL = URL.createObjectURL(blob);
        setVideoUrl(blobURL);
        setStatus('Video loaded!');
      } catch (err: any) {
        console.error('Error loading video', err);
        setStatus(`Failed to load video: ${err.message}`);
      }
    };

    loadVideo();
  }, []);

  return (
    <div>
      <h1>Pear Video Test</h1>
      <p>Status: {status}</p>
      {videoUrl ? (
        <video src={videoUrl} controls autoPlay>
          <track
            kind="captions"
            src=""
            srcLang="en"
            label="English captions"
            default
          />
        </video>
      ) : (
        <div>Loading video from the swarm...</div>
      )}
    </div>
  );
};
