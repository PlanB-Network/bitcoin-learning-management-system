import { t } from 'i18next';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import VideoSVG from '#src/assets/resources/video.svg?react';
import { useSmaller } from '#src/hooks/use-smaller.ts';
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
  const isMobile = useSmaller('md') || window.innerWidth < 768;
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
          <div className="flex items-center">
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
    <>
      <button
        type="button"
        className="mx-auto flex justify-center rounded-lg pb-6 md:pt-4 last:pb-0 last:md:pb-4 p-0 bg-transparent border-0 cursor-zoom-in focus:outline-none"
        onClick={() => (isMobile ? undefined : setIsOpen(true))}
        aria-label={`Open image${alt ? `: ${alt}` : ''}`}
      >
        <img src={src} alt={alt} className="rounded-lg" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-[#042F6280]"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
          role="dialog"
          aria-label="Close image overlay"
        >
          <div className="relative m-2 md:m-5" role="dialog" aria-modal="true">
            <img
              src={src}
              alt={alt}
              className="mx-auto rounded-lg max-w-[min(1920px,100%)] max-h-[80vh] cursor-zoom-out bg-white"
            />
          </div>
        </div>
      )}
    </>
  );
};
