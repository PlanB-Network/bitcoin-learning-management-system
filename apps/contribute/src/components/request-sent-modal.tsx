import { useTranslation } from 'react-i18next';

import CrossIcon from '#src/assets/icons/cross_black.svg';
import ThumbUpOrangeIcon from '#src/assets/icons/thumb_up_orange.svg?react';
import PlanBLogoBlack from '#src/assets/logo/planb_logo_horizontal_black_orangepill_gradient.svg';

interface RequestSentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestSentModal = ({
  isOpen,
  onClose,
}: RequestSentModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative flex flex-col items-center">
        {/* Close button */}
        <button
          type="button"
          className="self-end focus:outline-none mb-[20px]"
          onClick={onClose}
        >
          <img src={CrossIcon} alt="Close" className="w-3 h-3" />
        </button>
        {/* Logo */}
        <img
          src={PlanBLogoBlack}
          alt="Plan B Network"
          className="h-8 mb-[40px]"
        />

        {/* Success text */}
        <h2 className="text-orange-500 text-lg font-medium text-center mb-[40px]">
          {t('translate.modal.requestSentSuccess', {
            defaultValue: 'Your proofreading request was sent',
          })}
        </h2>

        {/* Thumb up icon */}
        <ThumbUpOrangeIcon
          className="w-[60px] h-[61px] mb-[60px]"
          style={{ fill: '#FF5C00' }}
        />

        {/* Close button bottom */}
        <button
          type="button"
          className="border border-orange-500 text-orange-500 h-[52px] px-[18px] py-[14px] rounded-[16px] flex items-center gap-[10px] hover:bg-orange-50 transition-colors"
          onClick={onClose}
        >
          {t('words.close', { defaultValue: 'Close' })}
        </button>
      </div>
    </div>
  );
};
