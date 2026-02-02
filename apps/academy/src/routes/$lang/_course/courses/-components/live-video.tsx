import { useTranslation } from 'react-i18next';

import { VideoRenderer } from '#src/components/video-renderer.tsx';

interface LiveVideoProps {
  url: string;
  chatUrl: string | null;
  displayVideo: boolean;
}

export const LiveVideo = ({ url, chatUrl, displayVideo }: LiveVideoProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-orange-400 text-2xl">
        {t('courses.chapter.live.title')}
      </p>
      {!displayVideo && (
        <p className="text-neutral-600">
          {t('courses.chapter.live.stayTuned')}
        </p>
      )}
      {url && displayVideo && (
        <div className="flex flex-col gap-6 w-full items-center">
          <div className="relative w-full aspect-video">
            <VideoRenderer src={url} alt="Live" />
          </div>
          {chatUrl && (
            <iframe
              src={chatUrl}
              title="Chat"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              className="w-full p-2 rounded-2xl border border-orange-50 shadow-course-navigation"
              height="331px"
            />
          )}
        </div>
      )}
    </div>
  );
};
