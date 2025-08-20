import { t } from 'i18next';
import ReactPlayer from 'react-player';
import VideoSVG from '#src/assets/resources/video.svg?react';
import {
  doesVideoUrlWorkWithReactPlayer,
  fixEmbedUrl,
  isUrlFromValidVideoPlatform,
} from '#src/utils/misc.ts';

export const ImageVideoRenderer = ({
  header,
  src,
  alt,
}: {
  header: 'none' | 'logo' | 'text';
  src?: string;
  alt?: string;
}) => {
  if (!src) return null;

  if (isUrlFromValidVideoPlatform(src)) {
    return (
      <div className="mx-auto mb-2 max-w-full rounded-lg pb-6 md:pt-4 last:pb-0 last:md:pb-4">
        {header === 'logo' && (
          <div className="flex items-center">
            <VideoSVG className="mb-2 ml-4 size-10" />
            <div className="ml-2">
              <p className="text-lg font-medium text-blue-900">
                {t('words.video')}
              </p>
            </div>
          </div>
        )}

        {header === 'text' && (
          <div className=" flex items-center">
            <div className="ml-2">
              <p className="text-lg font-medium text-blue-900">
                {t('words.video')}
              </p>
            </div>
          </div>
        )}

        <div className="relative pt-[56.25%]">
          {doesVideoUrlWorkWithReactPlayer(src) ? (
            <ReactPlayer
              width={'100%'}
              height={'100%'}
              style={{ left: 0, position: 'absolute', top: 0 }}
              className="mx-auto mb-2 rounded-lg"
              controls={true}
              src={src}
            />
          ) : (
            <iframe
              width="100%"
              height="100%"
              style={{ left: 0, position: 'absolute', top: 0 }}
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
      className="mx-auto flex justify-center rounded-lg pb-6 md:pt-4 last:pb-0 last:md:pb-4"
      src={src}
      alt={alt}
    />
  );
};
