import type {
  FragmentLoaderContext,
  Loader,
  LoaderCallbacks,
  LoaderConfiguration,
  LoaderResponse,
  LoaderStats,
  PlaylistLoaderContext,
} from 'hls.js';

import Hls from 'hls.js';

import { useEffect, useRef, useState } from 'react';
import { getPearInstance } from '../services/pear.ts';

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
const createPearPlaylistLoaderClass = (drive: any) => {
  // The class is now defined inside the factory.
  // It has access to 'drive' from its parent scope (closure).
  return class PearPlaylistLoader implements Loader<PlaylistLoaderContext> {
    public context: PlaylistLoaderContext | null = null;
    public stats: LoaderStats = createStats();

    public load(
      context: PlaylistLoaderContext,
      _config: LoaderConfiguration,
      callbacks: LoaderCallbacks<PlaylistLoaderContext>,
    ) {
      const url = new URL(context.url);

      console.log('PearPlaylistLoader: Loading', { context });

      console.log(
        `PearPlaylistLoader: Loading key ${url.pathname} from Pear Drive`,
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
            data: buffer.toString(),
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
  };
};

/**
 * Factory that creates and returns the Loader class.
 * @param drive The Pear drive instance.
 * @returns The Loader class built with dependencies in closure.
 */
const createPearFragmentLoaderClass = (drive: any) => {
  return class PearFragmentLoader implements Loader<FragmentLoaderContext> {
    public context: FragmentLoaderContext | null = null;
    public stats: LoaderStats = createStats();

    public load(
      context: FragmentLoaderContext,
      _config: LoaderConfiguration,
      callbacks: LoaderCallbacks<FragmentLoaderContext>,
    ) {
      const url = new URL(context.url);
      const key = url.pathname;

      const start = context.rangeStart || 0;
      const end = context.rangeEnd || 0;
      const length = end - start || undefined; // Full read if end not specified

      console.log(
        `PearFragmentLoader: Loading ${key} from Pear Drive,`,
        `range: ${length ? `(${start}-${end} length: ${length})` : 'full'}`,
      );

      // Get the entry for the given pathname
      drive // Use 'drive' from closure
        // Get the entry to find the blob key
        .entry(key)
        // Get the specific blob using the entry's blob key
        .then((entry: any) => {
          if (!entry?.value?.blob) {
            throw new Error(`No entry or blob found for key ${key}`);
          }

          return drive
            .getBlobs()
            .then((blobs: any) =>
              blobs.get(
                entry.value.blob,
                length ? { start, length } : undefined,
              ),
            );
        })
        .then((buffer: Buffer | null) => {
          if (buffer === null) {
            throw new Error('Buffer is null.');
          }

          const response: LoaderResponse = {
            url: context.url,
            data: buffer,
          };

          callbacks.onSuccess(response, this.stats, context, undefined);
        })
        .catch((err: any) => {
          console.error(
            `PearFragmentLoader Error: Failed to load key ${url.pathname}`,
            err,
          );
          callbacks.onError(err, context, {}, this.stats);
        });

      return; // Exit after setting up the stream
    }

    public destroy() {}
    public abort() {}
  };
};

export const PearVideoPlayer = ({ videoKey }: PearVideoTestProps) => {
  const [status, setStatus] = useState<string | null>('Initializing...');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Quality levels for HLS
  const [levels, setLevels] = useState<any[]>([]); // Quality levels
  const hlsRef = useRef<Hls | null>(null);

  // Load video
  useEffect(() => {
    let hls: Hls | null = null;

    const ac = new AbortController();
    const signal = ac.signal;

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

          // If the component was unmounted while we were waiting
          if (signal.aborted) return;

          setStatus('Initializing HLS player...');
          console.info('Initializing HLS player...');

          hls = new Hls({
            pLoader: createPearPlaylistLoaderClass(drive),
            fLoader: createPearFragmentLoaderClass(drive),
            debug: false,
          });

          hlsRef.current = hls;

          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            setStatus('Media attached, loading video...');
            console.info('Media attached, loading video...');
            hls?.loadSource(`pears://${videoKey}`);
          });

          hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
            // setStatus('Video ready. Starting playback...');
            setStatus(null);
            console.info('Video ready. Starting playback...', { data });
            setLevels(data.levels); // Store quality levels
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

          // If the component was unmounted while we were waiting
          if (signal.aborted) return;

          setStatus('Downloading video file...');
          console.info('Downloading video with key:', videoKey);

          const buf = await drive.get(videoKey);

          // If the component was unmounted while we were waiting
          if (signal.aborted) return;

          console.info(`Video file ${videoKey} downloaded, size:`, buf.length);

          setStatus('Blob downloaded, creating URL...');

          // We need to check this again in case the component unmounted
          if (videoRef.current) {
            const blob = new Blob([buf], { type: 'video/mp4' });
            videoRef.current.src = URL.createObjectURL(blob);
            setStatus('Video loaded!');
          } else {
            console.warn(
              'Video downloaded, but component was unmounted before playback.',
            );
          }
        } catch (err: any) {
          console.error('Error loading video', err);
          setStatus(`Failed to load video: ${err.message}`);
        }
      };

      loadVideo();
    }

    // Return cleanup function to abort if unmounted
    return () => {
      // This function runs when the component unmounts
      console.log('Cleanup: aborting fetch.');
      ac.abort(); // Cancel the async operation
    };
  }, [videoKey]);

  const handleLevelChange = (levelIndex: number) => {
    if (hlsRef.current) {
      console.log(`Manually switching to level ${levelIndex}`);
      hlsRef.current.currentLevel = levelIndex; // Setter
    }
  };

  return (
    <div>
      <video ref={videoRef} controls autoPlay style={{ width: '800px' }}>
        <track
          kind="captions"
          src=""
          srcLang="en"
          label="English captions"
          default
        />
      </video>

      {status && (
        <div className="p-2 border-x border-newGray-4">Status: {status}</div>
      )}

      {/* Quality selector */}
      {levels.length > 1 && (
        <div className="border-x border-newGray-4 p-2 flex gap-2 items-center">
          <span>Quality:</span>

          <select
            onChange={(e) =>
              handleLevelChange(Number.parseInt(e.target.value, 10))
            }
          >
            <option value={-1}>Auto</option>
            {levels.map((level, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: test
              <option key={index} value={index}>
                {level.height}p ({Math.round(level.bitrate / 1000)} kbps)
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
