import { useEffect, useState } from 'react';
import { getPearInstance } from '../services/pear.js';

interface PearVideoTestProps {
  videoKey: string;
}

export const PearVideoTest = ({ videoKey }: PearVideoTestProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setStatus('Getting Pear instance...');
        console.info('Getting Pear instance...');
        const { drive } = await getPearInstance();

        setStatus('Downloading video file...');
        console.info('Downloading video with key:', videoKey);

        const buf = await drive.get(videoKey);

        console.info('Video file downloaded, size:', buf.length);

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
