import { Button } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import { TbPhotoVideo, TbPlayerPlay } from 'react-icons/tb';
import ReactPlayer from 'react-player';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import {
  doesVideoUrlWorkWithReactPlayer,
  fixEmbedUrl,
  isLiveBigBlueButtonUrl,
  isPlaybackBigBlueButtonUrl,
} from '#src/utils/misc.ts';

export const VideoRenderer = ({ src, alt }: { src: string; alt?: string }) => {
  if (isLiveBigBlueButtonUrl(src)) {
    return <BBBJoinLiveSection src={src} />;
  }

  if (isPlaybackBigBlueButtonUrl(src)) {
    return <BBBSeeRecordingSection src={src} />;
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

const BBBJoinLiveSection = ({ src }: { src: string }) => {
  const { t } = useTranslation();
  const isMobile = useSmaller('md');

  const handleJoinClick = () => {
    window.open(src, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleJoinClick}
      className="flex flex-col w-full group cursor-pointer items-center my-6 bg-neutral-50 p-5 rounded-2xl border border-neutral-100"
    >
      <div className="relative w-full flex flex-col items-center gap-4 bg-background-static p-3 rounded-2xl">
        {/* Background */}
        <div className="flex flex-row gap-5 absolute mt-7 w-full h-7/10 px-6">
          <div className="w-20 md:w-36 h-full bg-[#EDEDED] rounded-2xl" />
          <div className="w-full h-full bg-[#EDEDED] rounded-2xl" />
        </div>
        {/* Live class badge */}
        <div className="flex items-center gap-2">
          <span className="size-[12px] rounded-full bg-orange-500 border-2 border-orange-100" />
          <span className="body-base text-orange-500 ">
            {t('courses.chapter.live.title')}
          </span>
        </div>
        {/* Video placeholder with play icon */}
        <div className="h-40 flex items-center z-10">
          <div className="size-12 md:size-24 rounded-full bg-white group-hover:bg-orange-500 border-4 md:border-8 border-orange-50 flex items-center justify-center">
            <TbPlayerPlay className="size-8 md:size-12 text-orange-500 fill-orange-500 group-hover:text-white group-hover:fill-white transition-colors" />
          </div>
        </div>
        {/* CTA button */}
        <Button
          type="button"
          size={isMobile ? 's' : 'm'}
          onClick={handleJoinClick}
          className="bg-orange-500! text-white! z-10"
        >
          {t('courses.chapter.live.joinLive')}
        </Button>
        {/* Subtitle */}
        <p className="body-extra-small text-neutral-600 text-center z-10">
          {t('courses.chapter.live.redirectNotice')}
        </p>
      </div>
    </button>
  );
};

const BBBSeeRecordingSection = ({ src }: { src: string }) => {
  const { t } = useTranslation();
  const isMobile = useSmaller('md');

  const handleJoinClick = () => {
    window.open(src, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleJoinClick}
      className="flex flex-col w-full group cursor-pointer items-center my-6 bg-neutral-50 p-5 rounded-2xl border border-neutral-100"
    >
      <div className="relative w-full flex flex-col items-center gap-4 bg-background-static p-3 rounded-2xl">
        {/* Background */}
        <div className="flex flex-row gap-5 absolute mt-7 w-full h-7/10 px-6">
          <div className="w-20 md:w-36 h-full bg-[#EDEDED] rounded-2xl" />
          <div className="w-full h-full bg-[#EDEDED] rounded-2xl" />
        </div>
        {/* Recording badge */}
        <div className="flex items-center gap-2">
          <TbPhotoVideo className="size-5 text-neutral-500" />
          <span className="body-base text-neutral-500 ">
            {t('courses.chapter.recorded')}
          </span>
        </div>
        {/* Video placeholder with play icon */}
        <div className="h-40 flex items-center z-10">
          <div className="size-12 md:size-24 rounded-full bg-white group-hover:bg-orange-500 border-4 md:border-8 border-orange-50 flex items-center justify-center">
            <TbPlayerPlay className="size-8 md:size-12 text-orange-500 fill-orange-500 group-hover:text-white group-hover:fill-white transition-colors" />
          </div>
        </div>
        {/* CTA button */}
        <Button
          type="button"
          size={isMobile ? 's' : 'm'}
          onClick={handleJoinClick}
          className="bg-orange-500! text-white! z-10"
        >
          {t('courses.chapter.watchRecording')}
        </Button>
        {/* Subtitle */}
        <p className="body-extra-small text-neutral-600 text-center z-10">
          {t('courses.chapter.live.redirectNotice')}
        </p>
      </div>
    </button>
  );
};
