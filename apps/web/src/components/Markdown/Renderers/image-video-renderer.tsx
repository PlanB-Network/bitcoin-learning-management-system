import VideoSVG from '../../../assets/resources/video.svg?react';
import { ReactPlayer } from '../../react-player.tsx';

const fixEmbedUrl = (src: string) => {
  if (src.includes('embed')) {
    return src;
  }

  switch (true) {
    case src.includes('youtu.be'): {
      return src.replace('youtu.be/', 'youtube.com/embed/');
    }
    case src.includes('youtube.com/live/'): {
      return src.replace('youtube.com/live/', 'youtube.com/embed/');
    }
    case src.includes('youtube.com'): {
      return src.replace('youtube.com/', 'youtube.com/embed/');
    }
    case src.includes('peertube.planb.network'): {
      return src.replace(
        'peertube.planb.network/videos/',
        'peertube.planb.network/videos/embed/',
      );
    }
    case src.includes('makertube.net'): {
      return src.replace('makertube.net/w/', 'makertube.net/videos/embed/');
    }
    default: {
      return src;
    }
  }
};

export const ImageVideoRenderer = ({
  header,
  src,
  alt,
}: { header: 'none' | 'logo' | 'text'; src?: string; alt?: string }) => {
  if (!src) return null;

  if (
    src.includes('youtube.com') ||
    src.includes('youtu.be') ||
    src?.includes('rumble.com')
  ) {
    return (
      <div className="mx-auto mb-2 max-w-full rounded-lg pb-6">
        {header === 'logo' && (
          <div className="flex items-center">
            <VideoSVG className="mb-2 ml-4 size-10" />
            <div className="ml-2">
              <p className="text-lg font-medium text-blue-900">Video</p>
            </div>
          </div>
        )}

        {header === 'text' && (
          <div className=" flex items-center">
            <div className="ml-2">
              <p className="text-lg font-medium text-blue-900">Video</p>
            </div>
          </div>
        )}

        <div className="relative pt-[56.25%]">
          {src?.includes('youtube.com') || src?.includes('youtu.be') ? (
            <ReactPlayer
              width={'100%'}
              height={'100%'}
              style={{ position: 'absolute', top: 0, left: 0 }}
              className="mx-auto mb-2 rounded-lg"
              controls={true}
              url={src}
              src={alt}
            />
          ) : (
            <iframe
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              className="mx-auto mb-2 rounded-lg"
              src={fixEmbedUrl(src)}
              title={alt}
              allowFullScreen
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <img
      className="mx-auto flex justify-center rounded-lg pb-6"
      src={src}
      alt={alt}
    />
  );
};
