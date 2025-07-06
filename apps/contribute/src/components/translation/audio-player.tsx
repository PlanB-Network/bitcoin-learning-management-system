import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import { useTranslation } from 'react-i18next';

import Back15Icon from '#src/assets/icons/back_15.svg';
import CampaignIcon from '#src/assets/icons/campaign.svg';
import Forward15Icon from '#src/assets/icons/forward_15.svg';
import PauseIcon from '#src/assets/icons/pause.svg';
import PlayIcon from '#src/assets/icons/play.svg';

interface AudioPlayerProps {
  courseId: string;
  partId: string;
  chapterId: string;
  slideId: string;
  fileName: string;
  language: string;
  onValidate: () => void;
  validated: boolean;
  generating?: boolean;
  version?: number;
}

// Build the API URL that proxies the audio through the backend instead of exposing the raw S3 bucket.
const buildAudioApiUrl = (
  courseId: string,
  partId: string,
  chapterId: string,
  slideId: string,
  fileName: string,
  lang: string,
  version?: number,
): string => {
  // New schema: /api/translation-downloads/audio/<courseId>/<lang>/<partId>/<chapterId>/<slideId>/<fileName>`
  const base = `/api/translation-downloads/audio/${courseId}/${lang}/${partId}/${chapterId}/${slideId}/${fileName}`;
  return version ? `${base}?v=${version}` : base;
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  courseId,
  partId,
  chapterId,
  slideId,
  fileName,
  language,
  onValidate,
  validated,
  generating = false,
  version = 0,
}) => {
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
  const url = buildAudioApiUrl(
    courseId,
    partId,
    chapterId,
    slideId,
    fileName,
    language,
    version,
  );

  // Fetch & decode audio ONCE to build a high-resolution amplitude array.
  useEffect(() => {
    if (exists !== true || duration === 0 || rawHeights) return;

    let cancelled = false;

    const generateWaveform = async () => {
      try {
        // Fetch the full audio file as an ArrayBuffer
        const resp = await fetch(url);
        if (!resp.ok) return;

        const arrayBuffer = await resp.arrayBuffer();

        const AudioContextClass: typeof AudioContext =
          // @ts-ignore legacy Safari
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
  }, [exists, duration, url]);
  const { t } = useTranslation();

  // Probe file existence
  useEffect(() => {
    if (generating) {
      setExists(null);
      return; // wait until generation finished
    }
    let cancelled = false;
    setExists(null);

    fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } })
      .then((res) => !cancelled && setExists(res.ok))
      .catch(() => !cancelled && setExists(false));

    return () => {
      cancelled = true;
    };
  }, [url, generating]);

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
      if (!validated) {
        // Auto-validate once the user has listened to the full audio
        onValidate();
      }
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
      audioRef.current.play();
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
        // Seek backwards 5 seconds
        seek(-5);
        e.preventDefault();
        break;
      case 'ArrowRight':
        // Seek forwards 5 seconds
        seek(5);
        e.preventDefault();
        break;
      case ' ':
      case 'Enter':
        // Toggle play / pause
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
    <div className="flex flex-col items-center gap-4 px-[10px] mt-10">
      {generating && (
        <p className="text-sm text-gray-500 mb-2">
          {t('translate.generatingAudio', {
            defaultValue: 'Generating audio…',
          })}
        </p>
      )}
      {/* Status messages */}
      {exists === null && !generating && (
        <p className="text-sm text-gray-500 mb-2">
          {t('translate.checkingResource', {
            defaultValue: 'Checking audio resource…',
          })}
        </p>
      )}

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
                alt={isPlaying ? 'Pause' : 'Play'}
                className="w-[34px] h-[35px]"
              />
            </button>
          ) : (
            <img
              src={PlayIcon}
              alt="Play"
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
          {/* Rewind 15s */}
          <button
            type="button"
            className="focus:outline-none"
            onClick={() => seek(-15)}
            disabled={!exists}
          >
            <img
              src={Back15Icon}
              alt="Rewind 15 seconds"
              className="w-[22px] h-[23.5px]"
            />
          </button>
          {/* Playback speed toggle */}
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
          {/* Forward 15s */}
          <button
            type="button"
            className="focus:outline-none"
            onClick={() => seek(15)}
            disabled={!exists}
          >
            <img
              src={Forward15Icon}
              alt="Forward 15 seconds"
              className="w-[22px] h-[23.5px]"
            />
          </button>
        </div>

        {/* Download button removed */}
      </div>

      {/* Auto-validation indicator removed */}

      {/* Report issue button */}
      <a
        href="mailto:marjjhodl@proton.me?subject=Audio%20Translation%20Issue"
        className="inline-flex items-center gap-2 px-[18px] py-[14px] rounded-[10px] border border-[#FF5C00] text-[#FF5C00] leading-[18px] font-medium hover:bg-orange-50 focus:outline-none"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={CampaignIcon} alt="Report" className="w-[21px] h-[17px]" />
        {t('translate.reportIssue', { defaultValue: 'Report issue' })}
      </a>

      {/* Review instructions */}
      <p className="text-orange-600 text-base leading-[150%] tracking-[0.15px] text-center whitespace-pre-line">
        {t('translate.reviewInstructions')}
      </p>
    </div>
  );
};
