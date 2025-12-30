import { VideoProvider, type VideoSourceType } from '@blms/constants';
import {
  CollapsibleDropdown,
  Loader,
  SegmentedControl,
  SegmentedControlItem,
} from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import type React from 'react';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { TbVideo } from 'react-icons/tb';
import ReactPlayer from 'react-player';
import { fixEmbedUrl } from '#src/utils/misc.ts';
import { trpc } from '#src/utils/trpc.ts';
import { isPearApp } from '../env.ts';

export const VideoSelector = ({
  videoId,
  language,
  header,
}: {
  videoId: string;
  language: string;
  header: 'none' | 'logo' | 'text';
}) => {
  const {
    data: _videos,
    isLoading,
    error,
  } = useQuery(
    trpc.content.getVideos.queryOptions(
      {
        id: videoId,
        language: language,
      },
      {
        enabled: !!videoId,
      },
    ),
  );

  const videos = useMemo(() => {
    if (!_videos) {
      return [];
    }

    let filteredVideos = _videos;
    if (!_videos.find((v) => v.language === language)) {
      filteredVideos = _videos.filter((v) => v.language === 'en');
    }

    if (!isPearApp) {
      return filteredVideos;
    }

    const pearsVideos = [];

    for (const video of filteredVideos) {
      if (video.provider === VideoProvider.Peertube) {
        pearsVideos.push({
          ...video,
          provider: VideoProvider.Pears,
        });
      }
    }

    console.log('Augmented videos:', [...pearsVideos, ...filteredVideos]);

    return [...pearsVideos, ...filteredVideos];
  }, [_videos]);

  const providers = useMemo(
    () => Array.from(new Set(videos?.map((v) => v.provider) ?? [])),
    [videos],
  );

  const firstVideo = videos?.[0];

  const [selectedProvider, setSelectedProvider] = useState(
    firstVideo?.provider || providers[0] || '',
  );

  const sourceTypes = useMemo(
    () =>
      Array.from(
        new Set(
          videos
            ?.filter((v) => v.provider === selectedProvider)
            .map((v) => v.sourceType) ?? [],
        ),
      ),
    [videos, selectedProvider],
  );

  const [selectedSourceType, setSelectedSourceType] = useState(
    firstVideo?.sourceType || sourceTypes[0] || '',
  );

  const selectedVideo = useMemo(
    () =>
      videos?.find(
        (v) =>
          v.provider === selectedProvider &&
          v.sourceType === selectedSourceType,
      ) ||
      videos?.find((v) => v.provider === selectedProvider) ||
      firstVideo,
    [videos, selectedProvider, selectedSourceType, firstVideo],
  );

  useEffect(() => {
    if (firstVideo) {
      setSelectedProvider(firstVideo.provider);
      setSelectedSourceType(firstVideo.sourceType);
    }
  }, [firstVideo]);

  useEffect(() => {
    if (sourceTypes.length > 0 && !sourceTypes.includes(selectedSourceType)) {
      setSelectedSourceType(sourceTypes[0]);
    }
  }, [sourceTypes, selectedSourceType]);

  if (isLoading) {
    return <Loader variant="black" size={'m'} />;
  }

  if (error) {
    console.error('Failed to load video:', error);
    return (
      <div className="my-4 text-center text-red-500">Error loading video.</div>
    );
  }

  if (!videos || videos.length === 0) {
    return null;
  }

  const handleProviderChange = (provider: string) =>
    setSelectedProvider(provider as any);
  const handleSourceTypeChange = (lang: VideoSourceType) =>
    setSelectedSourceType(lang);

  return (
    <div className="mb-8">
      <div>
        {selectedVideo ? (
          <DisplayVideo
            idFromProvider={selectedVideo.idFromProvider!}
            provider={selectedVideo.provider}
            title={selectedVideo.id}
          />
        ) : (
          <div className="my-4 text-center text-gray-500">No video found.</div>
        )}
        {videos.length > 1 ? (
          <CollapsibleSelectorPart
            providers={providers}
            sourceTypes={sourceTypes}
            selectedProvider={selectedProvider}
            selectedSourceType={selectedSourceType}
            onProviderChange={handleProviderChange}
            onSourceTypeChange={handleSourceTypeChange}
          />
        ) : null}
      </div>
    </div>
  );
};

const CollapsibleSelectorPart = ({
  providers,
  sourceTypes,
  selectedProvider,
  selectedSourceType,
  onProviderChange,
  onSourceTypeChange,
}: {
  providers: string[];
  sourceTypes: VideoSourceType[];
  selectedProvider: string;
  selectedSourceType: string;
  onProviderChange: (provider: string) => void;
  onSourceTypeChange: (language: VideoSourceType) => void;
}) => (
  <CollapsibleDropdown
    title="Video preferences"
    className="border-b border-l border-r rounded-t-none rounded-b-[12px] border-neutral-200"
    variant="dark"
    defaultOpen={false}
    icon={<TbVideo />}
  >
    <div className="flex flex-col gap-2 my-4">
      {providers.length > 1 ? (
        <div className="flex justify-between items-center">
          <span className="mr-2 label-small-12px md:subtitle-medium-16px">
            {t('videoSelector.player.player')}
          </span>

          <div className="flex flex-row gap-2">
            <SegmentedControl variant="outline" defaultValue={selectedProvider}>
              {providers.map((provider) => (
                <SegmentedControlItem
                  value={provider}
                  key={provider}
                  onClick={() => onProviderChange(provider)}
                >
                  <p className="px-4">
                    {t(`videoSelector.player.${provider}`)}
                  </p>
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>
        </div>
      ) : null}

      {sourceTypes.length > 0 ? (
        <div className="flex justify-between items-center">
          <span className="mr-2 label-small-12px md:subtitle-medium-16px">
            {t('videoSelector.language.language')}
          </span>
          <SegmentedControl
            variant="outline"
            defaultValue={selectedSourceType}
            value={selectedSourceType}
          >
            {sourceTypes.map((sourceType) => (
              <SegmentedControlItem
                value={sourceType}
                key={sourceType}
                onClick={() => onSourceTypeChange(sourceType)}
              >
                <p className="px-4">
                  {t(`videoSelector.language.${sourceType}`)}
                </p>
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>
      ) : null}
    </div>
  </CollapsibleDropdown>
);

function DisplayVideo({
  provider,
  idFromProvider,
  title,
}: {
  provider: VideoProvider;
  idFromProvider: string | null;
  title?: string;
}): React.ReactElement | null {
  if (!idFromProvider) return null;

  switch (provider) {
    case VideoProvider.Youtube: {
      const youtubeUrl = `https://www.youtu.be/${idFromProvider}`;

      return (
        <div className="relative pt-[56.25%]">
          <ReactPlayer
            width={'100%'}
            height={'100%'}
            style={{ left: 0, position: 'absolute', top: 0 }}
            className="mx-auto mb-2 rounded-lg"
            controls={true}
            src={fixEmbedUrl(youtubeUrl)}
          />
        </div>
      );
    }
    case VideoProvider.Rumble: {
      const rumbleUrl = `https://rumble.com/embed/${idFromProvider}`;

      return (
        <div className="relative pt-[56.25%]">
          <iframe
            width="100%"
            height="100%"
            style={{ left: 0, position: 'absolute', top: 0 }}
            className="mx-auto mb-2 rounded-lg"
            src={fixEmbedUrl(rumbleUrl)}
            title={title}
            allowFullScreen
          />
        </div>
      );
    }
    case VideoProvider.Peertube: {
      const peertubeUrl = `https://peertube.planb.network/videos/embed/${idFromProvider}`;

      return (
        <div className="relative pt-[56.25%]">
          <iframe
            width="100%"
            height="100%"
            style={{ left: 0, position: 'absolute', top: 0 }}
            className="mx-auto mb-2 rounded-lg"
            src={fixEmbedUrl(peertubeUrl)}
            title={title}
            allowFullScreen
          />
        </div>
      );
    }
    case VideoProvider.Pears: {
      const videoKey = `/videos/${idFromProvider}/master.m3u8`;

      if (!isPearApp) {
        return (
          <div className="my-4 text-center text-red-500">
            Pears videos are only available in the Pears app.
          </div>
        );
      }

      const PearVideoPlayer = lazy(() =>
        import('./pear-video-player.tsx').then((mod) => ({
          default: mod.PearVideoPlayer,
        })),
      );

      return (
        <div className="">
          <Suspense fallback={<div>Loading...</div>}>
            <PearVideoPlayer videoKey={videoKey} />
          </Suspense>
        </div>
      );
    }
    default:
      return null;
  }
}
