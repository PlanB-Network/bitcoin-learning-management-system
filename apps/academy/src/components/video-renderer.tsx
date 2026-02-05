import { Button } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player';
import {
  doesVideoUrlWorkWithReactPlayer,
  fixEmbedUrl,
  isLiveBigBlueButtonUrl,
  isPlaybackBigBlueButtonUrl,
} from '#src/utils/misc.ts';

const BBBJoinLiveButton = ({ src }: { src: string }) => {
  const { t } = useTranslation();

  const handleJoinClick = () => {
    window.open(src, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center justify-center my-6">
      <Button type="button" onClick={handleJoinClick}>
        {t('courses.chapter.live.joinLive')}
      </Button>
    </div>
  );
};

const BBBSeeRecordingButton = ({ src }: { src: string }) => {
  const { t } = useTranslation();

  const handleJoinClick = () => {
    window.open(src, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center justify-center my-6">
      <Button type="button" onClick={handleJoinClick}>
        {t('courses.chapter.watchRecording')}
      </Button>
    </div>
  );
};

export const VideoRenderer = ({ src, alt }: { src: string; alt?: string }) => {
  if (isLiveBigBlueButtonUrl(src)) {
    return <BBBJoinLiveButton src={src} />;
  }

  if (isPlaybackBigBlueButtonUrl(src)) {
    return <BBBSeeRecordingButton src={src} />;
  }

  return (
    <>
      {doesVideoUrlWorkWithReactPlayer(src) ? (
        <div className="relative pt-[56.25%]">
          <ReactPlayer
            width={'100%'}
            height={'100%'}
            style={{ left: 0, position: 'absolute', top: 0 }}
            className="mx-auto mb-2 rounded-lg"
            controls={true}
            src={fixEmbedUrl(src)}
          />
        </div>
      ) : (
        <div className="relative pt-[56.25%]">
          <iframe
            width="100%"
            height="100%"
            style={{ left: 0, position: 'absolute', top: 0 }}
            className="mx-auto mb-2 rounded-lg"
            src={fixEmbedUrl(src)}
            title={alt}
            allowFullScreen
          />
        </div>
      )}
    </>
  );
};
