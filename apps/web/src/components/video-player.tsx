import { Loader } from '@blms/ui';
import type React from 'react';
import { ReactPlayer } from '#src/components/react-player.tsx';
import { trpc } from '#src/utils/trpc.ts';
import { fixEmbedUrl } from './Markdown/conference-markdown-body.tsx';

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
    return <Loader variant="black" size={'m'} />;
  }

  if (error) {
    console.error('Failed to load video:', error);
    // TODO test and translate
    return (
      <div className="my-4 text-center text-red-500">Error loading video.</div>
    );
  }

  if (video?.idFromProvider) {
    switch (video.provider) {
      case 'youtube': {
        const youtubeUrl = `https://www.youtu.be/${video.idFromProvider}`;

        return (
          <div className="relative pt-[56.25%]">
            <ReactPlayer
              width={'100%'}
              height={'100%'}
              style={{ position: 'absolute', top: 0, left: 0 }}
              className="mx-auto mb-2 rounded-lg"
              controls={true}
              url={fixEmbedUrl(youtubeUrl)}
            />
          </div>
        );
      }
      case 'rumble': {
        const rumbleUrl = `https://rumble.com/${video.idFromProvider}`;

        return (
          <div className="relative pt-[56.25%]">
            <iframe
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              className="mx-auto mb-2 rounded-lg"
              src={fixEmbedUrl(rumbleUrl)}
              title={video.id}
              allowFullScreen
            />
          </div>
        );
      }
      case 'peertube': {
        const peertubeUrl = `https://peertube.planb.network/${video.idFromProvider}`;

        return (
          <div className="relative pt-[56.25%]">
            <iframe
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              className="mx-auto mb-2 rounded-lg"
              src={fixEmbedUrl(peertubeUrl)}
              title={video.id}
              allowFullScreen
            />
          </div>
        );
      }
      default:
        return null;
    }
  }

  return null;
};
