import { VideoProvider, type VideoSourceType } from '@blms/constants';
import { Button, CollapsibleDropdown, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { TbVideo } from 'react-icons/tb';
import ReactPlayer from 'react-player';
import { trpc } from '#src/utils/trpc.ts';
import { fixEmbedUrl } from './Markdown/conference-markdown-body.tsx';

export const VideoSelector = ({
  videoId,
  language,
}: {
  videoId: string;
  language: string;
}) => {
  const {
    data: videos,
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

  const providers = useMemo(
    () => Array.from(new Set(videos?.map((v) => v.provider) ?? [])),
    [videos],
  );

  const sourceTypes = useMemo(
    () => Array.from(new Set(videos?.map((v) => v.sourceType) ?? [])),
    [videos],
  );

  const firstVideo = videos?.[0];

  const [selectedProvider, setSelectedProvider] = useState(
    firstVideo?.provider || providers[0] || '',
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

  React.useEffect(() => {
    if (firstVideo) {
      setSelectedProvider(firstVideo.provider);
      setSelectedSourceType(firstVideo.sourceType);
    }
  }, [firstVideo]);

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
    return (
      <div className="my-4 text-center text-gray-500">No video found.</div>
    );
  }

  const handleProviderChange = (provider: string) =>
    setSelectedProvider(provider as any);
  const handleSourceTypeChange = (lang: VideoSourceType) =>
    setSelectedSourceType(lang);

  return (
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
    className="border-b border-l border-r rounded-t-none rounded-b-[12px] border-newGray-4"
    variant="dark"
    defaultOpen={false}
    icon={<TbVideo />}
  >
    <div className="flex flex-col gap-2 my-4">
      <div className="flex justify-between">
        <span className="mr-2 subtitle-medium-16px">Player</span>
        <div className="flex flex-row gap-2">
          {providers.map((provider) => (
            <Button
              key={provider}
              type="button"
              className={`${
                selectedProvider === provider
                  ? 'bg-newGray-4 text-white'
                  : 'bg-white text-newBlack-4 border-newGray-4'
              }`}
              onClick={() => onProviderChange(provider)}
              disabled={selectedProvider === provider}
            >
              {provider}
            </Button>
          ))}
        </div>
      </div>
      {sourceTypes.length > 1 ? (
        <div className="flex justify-between">
          <span className="mr-2 subtitle-medium-16px">Language</span>
          <div className="flex flex-row gap-2">
            {sourceTypes.map((sourceType) => (
              <Button
                key={sourceType}
                type="button"
                className={`${
                  selectedSourceType === sourceType
                    ? 'bg-newGray-4 text-white'
                    : 'bg-white text-newBlack-4 border-newGray-4'
                }`}
                onClick={() => onSourceTypeChange(sourceType)}
                disabled={selectedSourceType === sourceType}
              >
                {sourceType}
              </Button>
            ))}
          </div>
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
      const peertubeUrl = `https://peertube.planb.network/${idFromProvider}`;

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
    default:
      return null;
  }
}
