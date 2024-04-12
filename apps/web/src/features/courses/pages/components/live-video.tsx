import { useTranslation } from 'react-i18next';

interface LiveVideoProps {
  url: string;
  displayVideo: boolean;
}

export const LiveVideo = ({ url, displayVideo }: LiveVideoProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-newOrange-2 text-2xl">
        {t('courses.chapter.live.title')}
      </p>
      {!displayVideo && (
        <p className="text-newBlack-5">{t('courses.chapter.live.stayTuned')}</p>
      )}
      {url && displayVideo && (
        <iframe
          title={`Live`}
          className="w-full aspect-video"
          src={url}
          allowFullScreen={true}
          sandbox="allow-same-origin allow-scripts allow-popups"
        ></iframe>
      )}
    </div>
  );
};
