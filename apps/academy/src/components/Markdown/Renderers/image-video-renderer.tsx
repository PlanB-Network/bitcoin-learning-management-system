import { useEffect, useState } from 'react';
import { VideoRenderer } from '#src/components/video-renderer.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { isUrlFromValidVideoPlatform } from '#src/utils/misc.ts';

export const ImageVideoRenderer = ({
  src,
  alt,
}: {
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
        <div className="relative pt-[56.25%]">
          <VideoRenderer src={src} alt={alt} />
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
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60"
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
