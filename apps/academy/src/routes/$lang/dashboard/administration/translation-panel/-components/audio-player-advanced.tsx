import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import Back15Icon from '#src/assets/icons/back_15.svg';
import Forward15Icon from '#src/assets/icons/forward_15.svg';
import PauseIcon from '#src/assets/icons/pause.svg';
import PlayIcon from '#src/assets/icons/play.svg';

interface AudioPlayerProps {
  courseId: string;
  language: string;
  partId: string;
  chapterId: string;
  slideId: string;
  /** Optional file base name (e.g. 1.1_0). If not provided we fall back to slideId. */
  fileName?: string;
  /** If provided we skip URL construction and use this directly */
  audioResourcePath?: string | null;
  /** Callback after user validated the audio (noop by default) */
  onValidate?: () => void;
}

// Build the API URL that proxies the audio through the backend instead of exposing the raw S3 bucket.
const buildAudioApiUrl = (
  courseId: string,
  partId: string,
  chapterId: string,
  slideId: string,
  fileName: string,
  lang: string,
): string => {
  // New schema: /api/translation-downloads/audio/<courseId>/<lang>/<partId>/<chapterId>/<slideId>/<fileName>`
  return `/api/translation-downloads/audio/${courseId}/${lang}/${partId}/${chapterId}/${slideId}/${fileName}`;
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  courseId,
  language,
  partId,
  chapterId,
  slideId,
  fileName,
  audioResourcePath,
  onValidate = () => {},
}) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [exists, setExists] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playbackRates = [1, 1.5, 2] as const;
  const [playbackRateIndex, setPlaybackRateIndex] = useState(0);
  const playbackRate = playbackRates[playbackRateIndex];
  const progressBarRef = useRef<HTMLButtonElement | null>(null);
  const BAR_WIDTH = 6; // px
  const BAR_GAP = 2; // px

  const [numBars, setNumBars] = useState(0);
  const [rawHeights, setRawHeights] = useState<number[] | null>(null);

  const displayHeights = React.useMemo(() => {
    if (!rawHeights || numBars === 0) return [] as number[];

    const groupSize = rawHeights.length / numBars;
    const heights: number[] = [];
    for (let i = 0; i < numBars; i++) {
      const idx = Math.floor(i * groupSize);
      heights.push(rawHeights[idx] ?? 20);
    }
    return heights;
  }, [rawHeights, numBars]);

  const placeholderHeights = React.useMemo(() => {
    // Uniform bars while waveform is loading
    if (numBars === 0) return [] as number[];
    return Array.from({ length: numBars }, () => 20);
  }, [numBars]);

  // Determine how many bars fit in the available width
  useLayoutEffect(() => {
    if (!progressBarRef.current) return;

    const computeBars = () => {
      const width = progressBarRef.current!.clientWidth;
      const bars = Math.max(
        10,
        Math.floor((width + BAR_GAP) / (BAR_WIDTH + BAR_GAP)),
      );
      setNumBars(bars);
    };

    computeBars();

    const ro = new ResizeObserver(computeBars);
    ro.observe(progressBarRef.current);

    return () => ro.disconnect();
  }, []);

  // Build audio URL early so hooks below can use it safely
  const url = React.useMemo(() => {
    // If we receive a direct resource path (S3-style) we still proxy it via our audio download API
    if (audioResourcePath) {
      // audioResourcePath is authoritative. Example:
      // contribute/<courseId>/<lang>/<partId>/<chapterId>/<slideId>/audio/<base>.(mp3|m4a)
      const segments = audioResourcePath.split('/');
      if (segments.length >= 8) {
        const [_, courseIdS3, langS3, partIdS3, chapterIdS3, slideIdS3] =
          segments;
        const fileWithExt = segments[segments.length - 1];
        const base = fileWithExt.replace(/\.(mp3|m4a)$/i, '');
        return buildAudioApiUrl(
          courseIdS3,
          partIdS3,
          chapterIdS3,
          slideIdS3,
          base,
          langS3,
        );
      }
      // Fallback to old behaviour if parsing fails
    }
    const _file = fileName ?? slideId;
    return buildAudioApiUrl(
      courseId,
      partId,
      chapterId,
      slideId,
      _file,
      language,
    );
  }, [
    audioResourcePath,
    courseId,
    partId,
    chapterId,
    slideId,
    fileName,
    language,
  ]);

  // Fetch & decode audio ONCE to build a high-resolution amplitude array.
  useEffect(() => {
    if (exists !== true || duration === 0 || rawHeights) return;

    let cancelled = false;

    const generateWaveform = async () => {
      try {
        // Fetch the full audio file as an ArrayBuffer
        const resp = await fetch(url);
        if (!resp.ok) {
          console.warn('Audio file not accessible for waveform generation');
          return;
        }

        const arrayBuffer = await resp.arrayBuffer();

        const AudioContextClass: typeof AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();

        const audioBuf = await audioCtx.decodeAudioData(arrayBuffer);

        const channelData = audioBuf.getChannelData(0); // first channel

        const TARGET_RAW_BARS = 400; // high-res baseline
        const samplesPerRawBar = Math.max(
          1,
          Math.floor(channelData.length / TARGET_RAW_BARS),
        );

        const tmp: number[] = [];
        for (let i = 0; i < TARGET_RAW_BARS; i++) {
          const start = i * samplesPerRawBar;
          let sum = 0;
          for (let j = 0; j < samplesPerRawBar; j++) {
            sum += Math.abs(channelData[start + j] || 0);
          }
          const avg = sum / samplesPerRawBar;
          tmp.push(avg);
        }

        // Normalize 0-1 amplitudes to 10-40 px range once
        const max = Math.max(...tmp) || 1;
        const normalized = tmp.map((v) => 10 + (v / max) * 30);

        if (!cancelled) setRawHeights(normalized);

        audioCtx.close();
      } catch (err) {
        console.error('Failed to generate waveform', err);
      }
    };

    generateWaveform();

    return () => {
      cancelled = true;
    };
  }, [exists, duration, url, rawHeights]);

  // Probe file existence
  useEffect(() => {
    let cancelled = false;
    setExists(null);

    fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } })
      .then((res) => !cancelled && setExists(res.ok))
      .catch((error) => {
        console.error('Error checking audio file existence:', error);
        !cancelled && setExists(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  // Load audio when exists
  useEffect(() => {
    if (exists !== true) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(url);
    } else {
      audioRef.current.src = url;
    }

    // Apply the current playback rate whenever a new Audio object is created
    audioRef.current.playbackRate = playbackRate;

    const audio = audioRef.current;

    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      onValidate();
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, [exists, url]);

  // Update playback rate on the underlying audio element whenever it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const seek = (delta: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(duration, audioRef.current.currentTime + delta),
    );
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!audioRef.current || !progressBarRef.current || duration === 0) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    const newTime = percent * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Allow keyboard interaction with the progress bar for accessibility
  const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!exists) return;

    switch (e.key) {
      case 'ArrowLeft':
        seek(-5);
        e.preventDefault();
        break;
      case 'ArrowRight':
        seek(5);
        e.preventDefault();
        break;
      case ' ':
      case 'Enter':
        togglePlay();
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  const formatTime = useCallback((sec: number) => {
    if (!Number.isFinite(sec)) return '00:00';
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const cyclePlaybackRate = () => {
    setPlaybackRateIndex((prev) => (prev + 1) % playbackRates.length);
  };

  return (
    <div className="flex flex-col items-center gap-4 px-[10px]">
      {/* Audio Player Container */}
      <div
        className="rounded-lg p-4 w-full"
        style={{ backgroundColor: '#FDF1E8', border: '1px solid #FF5C00' }}
      >
        {/* Controls */}
        <div className="flex items-center gap-4 mb-3">
          {exists ? (
            <button
              type="button"
              className="focus:outline-none"
              onClick={togglePlay}
            >
              <img
                src={isPlaying ? PauseIcon : PlayIcon}
                alt={
                  isPlaying
                    ? t('translate.pause', { defaultValue: 'Pause' })
                    : t('translate.play', { defaultValue: 'Play' })
                }
                className="w-[34px] h-[35px]"
              />
            </button>
          ) : (
            <img
              src={PlayIcon}
              alt={t('translate.play', { defaultValue: 'Play' })}
              className="w-[34px] h-[35px] opacity-30"
            />
          )}

          {/* Waveform progress bar */}
          <button
            type="button"
            className="flex-1 flex items-center h-[40px] cursor-pointer min-w-0 overflow-hidden bg-transparent p-0 border-0"
            style={{ gap: `${BAR_GAP}px` }}
            ref={progressBarRef}
            onClick={handleProgressClick}
            onKeyDown={handleProgressKeyDown}
            disabled={!exists}
          >
            {(rawHeights ? displayHeights : placeholderHeights).map(
              (h, idx) => {
                const progressRatio = duration ? currentTime / duration : 0;
                const globalPosStart = idx / numBars;
                const globalPosEnd = (idx + 1) / numBars;

                // Determine fill fraction for this bar: 0-1
                let fill = 0;
                if (progressRatio <= globalPosStart) fill = 0;
                else if (progressRatio >= globalPosEnd) fill = 1;
                else fill = (progressRatio - globalPosStart) * numBars; // 0-1 within bar

                return (
                  <div
                    key={`bar-${globalPosStart}`}
                    className={`relative rounded-md overflow-hidden ${rawHeights ? 'bg-gray-400' : 'bg-gray-300'}`}
                    style={{
                      height: `${h}px`,
                      pointerEvents: 'none',
                      width: `${BAR_WIDTH}px`,
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-orange-500"
                      style={{ width: `${fill * 100}%` }}
                    />
                  </div>
                );
              },
            )}
          </button>
          <span className="text-sm text-gray-600">
            {`${formatTime(currentTime)} / ${formatTime(duration)}`}
          </span>
        </div>

        {/* Secondary controls */}
        <div className="flex items-center justify-center gap-5 mt-4">
          <button
            type="button"
            className="focus:outline-none"
            onClick={() => seek(-15)}
            disabled={!exists}
          >
            <img
              src={Back15Icon}
              alt={t('translate.rewind15Seconds', {
                defaultValue: 'Rewind 15 seconds',
              })}
              className="w-[22px] h-[23.5px]"
            />
          </button>
          <button
            type="button"
            onClick={cyclePlaybackRate}
            disabled={!exists}
            className="text-sm font-medium text-gray-900 focus:outline-none"
            title={t('translate.changeSpeed', {
              defaultValue: 'Change playback speed',
            })}
          >
            {playbackRate}x
          </button>
          <button
            type="button"
            className="focus:outline-none"
            onClick={() => seek(15)}
            disabled={!exists}
          >
            <img
              src={Forward15Icon}
              alt={t('translate.forward15Seconds', {
                defaultValue: 'Forward 15 seconds',
              })}
              className="w-[22px] h-[23.5px]"
            />
          </button>
        </div>
      </div>
    </div>
  );
};
