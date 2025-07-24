import { useTranslation } from 'react-i18next';

import ArrowRightIcon from '#src/assets/icons/arrow_right.svg';
import CrossIcon from '#src/assets/icons/cross_black.svg';
import SandClockIcon from '#src/assets/icons/sand_clock.svg';
import PlanBLogoBlack from '#src/assets/logo/planb_logo_horizontal_black_orangepill_gradient.svg';

interface VideoGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: number;
  onNextChapter: () => void;
  isLastChapter?: boolean;
}

export const VideoGenerationModal = ({
  isOpen,
  onClose,
  progress,
  onNextChapter,
  isLastChapter = false,
}: VideoGenerationModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Logo and Close */}
        <div className="flex flex-col items-center gap-[20px] mb-[60px]">
          <button
            type="button"
            className="self-end focus:outline-none"
            onClick={onClose}
          >
            <img src={CrossIcon} alt="Close" className="w-3 h-3" />
          </button>
          <img src={PlanBLogoBlack} alt="Plan B Network" className="h-8" />
        </div>

        {/* Completion sentence */}
        <div className="flex justify-center mb-[40px]">
          <h2 className="text-orange-500 text-lg font-medium text-center">
            {t('translate.videoGeneration.completed', {
              defaultValue:
                'Great job! Thank you for proofreading this course!',
            })}
          </h2>
        </div>

        {/* Video generation icon and progress */}
        <div className="flex flex-col items-center gap-[40px] mb-[60px]">
          <h3 className="text-gray-900 font-medium text-center">
            {t('translate.videoGeneration.title', {
              defaultValue: 'Video generation',
            })}
          </h3>
          {/* Sand clock icon */}
          <div>
            <img
              src={SandClockIcon}
              alt="Generating video"
              className="w-[60px] h-[61px]"
            />
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress text */}
          <p className="text-orange-500 font-medium">
            {progress}%{' '}
            {t('translate.videoGeneration.progress', {
              defaultValue: 'progress',
            })}
          </p>

          {/* Status message */}
          <p className="text-gray-600 text-center text-sm">
            {t('translate.videoGeneration.completedMessage', {
              defaultValue:
                'No need to wait! Feel free to review the next course now.',
            })}
          </p>
        </div>

        {/* Action button */}
        <div className="flex justify-center">
          <button
            type="button"
            className="bg-[#FF5C00] text-white h-[52px] px-[18px] py-[14px] rounded-[16px] flex items-center gap-[10px] shadow-[0_2px_3px_rgba(0,0,0,0.25)] hover:bg-orange-600 transition-colors"
            onClick={onNextChapter}
          >
            {isLastChapter
              ? t('translate.videoGeneration.backToCourse', {
                  defaultValue: 'Back to course',
                })
              : t('translate.videoGeneration.nextChapter', {
                  defaultValue: 'Next chapter',
                })}
            <img src={ArrowRightIcon} alt="" className="w-[23px] h-[11px]" />
          </button>
        </div>
      </div>
    </div>
  );
};
