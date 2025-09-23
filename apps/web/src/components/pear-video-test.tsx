import type {
  FragmentLoaderContext,
  LoaderCallbacks,
  LoaderResponse,
  LoaderStats,
  PlaylistLoaderContext,
} from 'hls.js';

import Hls from 'hls.js';

import { useEffect, useRef, useState } from 'react';
import { getPearInstance } from '../services/pear.js';

interface PearVideoTestProps {
  videoKey: string;
}

const createStats = (): LoaderStats => ({
  aborted: false,
  loaded: 0,
  retry: 0,
  total: 0,
  chunkCount: 0,
  bwEstimate: 0,
  loading: {
    first: 0,
    start: 0,
    end: 0,
  },
  parsing: {
    start: 0,
    end: 0,
  },
  buffering: {
    first: 0,
    start: 0,
    end: 0,
  },
});

/**
 * Factory that creates and returns the Loader class.
 * @param drive The Pear drive instance.
 * @returns The Loader class built with dependencies in closure.
 */
const createPearLoaderClass = (drive: any, turnToString: boolean) => {
  // The class is now defined inside the factory.
  // It has access to 'drive' from its parent scope (closure).
  class PearAssetLoader<
    C extends FragmentLoaderContext | PlaylistLoaderContext,
  > {
    public context: C | null = null;
    public stats: LoaderStats = createStats();

    public load(context: C, _config: any, callbacks: LoaderCallbacks<C>) {
      const url = new URL(context.url);

      const start = context.rangeStart || 0;
      const end = context.rangeEnd || undefined;

      // Handle range requests
      if (start && typeof end === 'number' && end > start) {
        console.log(
          `PearAssetLoader: Loading key ${url.pathname} from Pear Drive (${start}-${end})`,
        );

        const rs = drive.createReadStream(url.pathname, {
          start,
          end: end - 1,
        });

        const chunks: Buffer[] = [];
        let loaded = 0;

        rs.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
          loaded += chunk.length;
          this.stats.loaded = loaded;
        });

        rs.on('end', () => {
          const buffer = Buffer.concat(chunks);

          const response: LoaderResponse = {
            url: context.url,
            data: turnToString ? buffer.toString() : buffer,
          };

          callbacks.onSuccess(response, this.stats, context, undefined);
        });

        rs.on('error', (err: any) => {
          console.error(
            `PearAssetLoader Error: Failed to load key ${url.pathname}`,
            err,
          );
          callbacks.onError(err, context, {}, this.stats);
        });

        return; // Exit after setting up the stream
      }

      console.log(
        `PearAssetLoader: Loading key ${url.pathname} from Pear Drive`,
      );

      // Full read if no rangeStart / rangeEnd specified
      drive
        .get(url.pathname) // Use 'drive' from closure
        .then((buffer: Buffer | null) => {
          if (buffer === null) {
            throw new Error('Buffer is null.');
          }

          const response: LoaderResponse = {
            url: context.url,
            data: turnToString ? buffer.toString() : buffer,
          };

          callbacks.onSuccess(response, this.stats, context, undefined);
        })
        .catch((err: any) => {
          console.error(
            `PearAssetLoader Error: Failed to load key ${url.pathname}`,
            err,
          );
          callbacks.onError(err, context, {}, this.stats);
        });
    }

    public destroy() {}
    public abort() {}
  }

  return PearAssetLoader; // The factory returns the class itself
};

export const PearVideoTest = ({ videoKey }: PearVideoTestProps) => {
  const [status, setStatus] = useState<string>('Initializing...');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load video
  useEffect(() => {
    let hls: Hls | null = null;

    // If the video is an m3u8 playlist (HLS)
    if (videoKey.endsWith('.m3u8')) {
      const loadHlsVideo = async () => {
        if (!videoRef.current || !Hls.isSupported()) {
          setStatus('HLS is not supported or video element is not ready.');
          console.error('HLS is not supported or video element is not ready.');
          return;
        }

        try {
          setStatus('HLS Mode: Getting Pear instance...');
          console.info('Getting Pear instance...');

          const { drive } = await getPearInstance();

          setStatus('Initializing HLS player...');
          console.info('Initializing HLS player...');

          hls = new Hls({
            pLoader: createPearLoaderClass(drive, true),
            fLoader: createPearLoaderClass(drive, false),
            // progressive: true,
            debug: false,
          });

          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            setStatus('Media attached, loading video...');
            console.info('Media attached, loading video...');
            hls?.loadSource(`pears://${videoKey}`);
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setStatus('Video ready. Starting playback...');
            console.info('Video ready. Starting playback...');
            videoRef.current?.play();
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              setStatus(`HLS Error: ${data.details}`);
              console.error('HLS Fatal Error:', data);
            } else {
              console.warn('HLS Non-Fatal Error:', data);
            }
          });
        } catch (err: any) {
          console.error('Error loading HLS video', err);
          setStatus(`Failed to load HLS video: ${err.message}`);
        }
      };
      loadHlsVideo();
    }

    // Load mp4 video
    else {
      const loadVideo = async () => {
        if (!videoRef.current) {
          return;
        }

        try {
          setStatus('Getting Pear instance...');
          console.info('Getting Pear instance...');
          const { drive } = await getPearInstance();

          setStatus('Downloading video file...');
          console.info('Downloading video with key:', videoKey);

          const buf = await drive.get(videoKey);

          console.info(`Video file ${videoKey} downloaded, size:`, buf.length);

          setStatus('Blob downloaded, creating URL...');
          const blob = new Blob([buf], { type: 'video/mp4' });
          videoRef.current.src = URL.createObjectURL(blob);
          setStatus('Video loaded!');
        } catch (err: any) {
          console.error('Error loading video', err);
          setStatus(`Failed to load video: ${err.message}`);
        }
      };

      loadVideo();
    }
  }, [videoKey]);

  return (
    <div>
      <h1>Pear Video Test</h1>
      <p>Status: {status}</p>

      <video ref={videoRef} controls autoPlay style={{ width: '800px' }}>
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
