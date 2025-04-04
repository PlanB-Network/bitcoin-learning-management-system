import type React from 'react';
import { ReactPlayer } from '#src/components/react-player.tsx';
import { trpc } from '#src/utils/trpc.ts';

interface VideoPlayerWrapperProps {
  videoId: string;
  language: string;
}

export const VideoPlayerWrapper: React.FC<VideoPlayerWrapperProps> = ({
  videoId,
  language,
}) => {
  const {
    data: video,
    isLoading,
    error,
  } = trpc.content.getVideo.useQuery(
    {
      id: videoId,
      language: language,
    },
    {
      enabled: !!videoId,
    },
  );

  if (isLoading) {
    return <div className="my-4 text-center">Loading video...</div>;
  }

  if (error) {
    console.error('Failed to load video:', error);
    return (
      <div className="my-4 text-center text-red-500">Error loading video.</div>
    );
  }

  if (video?.idFromProvider && video.provider === 'youtube') {
    const youtubeUrl = `https://www.youtu.be/${video.idFromProvider}`;

    return (
      <div className="relative pt-[56.25%]">
        <ReactPlayer
          width={'100%'}
          height={'100%'}
          style={{ position: 'absolute', top: 0, left: 0 }}
          className="mx-auto mb-2 rounded-lg"
          controls={true}
          url={youtubeUrl}
        />
      </div>
    );
  }

  return null;
};
