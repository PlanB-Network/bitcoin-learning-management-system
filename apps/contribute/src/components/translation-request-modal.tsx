import { Button } from '@blms/ui';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import WorldIcon from '#src/assets/icons/world.svg';
import PlanBLogoBlack from '#src/assets/logo/planb_logo_horizontal_black_orangepill_gradient.svg';
import { getLanguageName } from '#src/utils/i18n.ts';

interface TranslationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  courseTopic: string;
  originalLanguage: string;
  targetLanguage: string;
  hasEnglishTranslation: boolean;
  isRequested: boolean;
  isRequesting: boolean;
  onSendRequest: () => void;
}

export const TranslationRequestModal = ({
  isOpen,
  onClose,
  courseName,
  courseTopic,
  originalLanguage,
  targetLanguage,
  hasEnglishTranslation,
  isRequested,
  isRequesting,
  onSendRequest,
}: TranslationRequestModalProps): JSX.Element | null => {
  const { t } = useTranslation();

  // Do not render anything if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>

        {/* Logo and header */}
        <div className="flex flex-col items-center mb-[40px]">
          <img
            src={PlanBLogoBlack}
            alt="Plan B Network"
            className="h-8 mb-[60px]"
          />
          <h2 className="text-orange-500 text-lg font-medium">
            {t('translate.modal.requestToProofreadCourse')}
          </h2>
          <img
            src={WorldIcon}
            alt="World icon"
            className="w-[60px] h-[60px] mt-4 mb-2"
          />
          <p className="text-gray-700 text-center">
            {t('translate.modal.doYouWantToSendRequest')}
          </p>
        </div>

        {/* Course details */}
        <div className="bg-gray-100 rounded-lg p-4 mb-[40px]">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-700 font-medium">
                  {t('translate.modal.course')}:
                </span>
                <span className="text-gray-800 ml-2">{courseName}</span>
              </div>
              <span className="bg-orange-100 text-xs rounded px-1 py-0.5 text-orange-800">
                {courseTopic}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">
                {t('translate.modal.originalLanguage')}:
              </span>
              <span className="text-gray-800">
                {getLanguageName(originalLanguage)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">
                {t('translate.modal.languageToProofread')}:
              </span>
              <span className="text-gray-800">
                {getLanguageName(targetLanguage)}
              </span>
            </div>

            {/* English availability badge */}
            <div className="flex">
              <span
                className={`inline-flex items-center gap-1 text-xs rounded px-2 py-0.5 ${
                  hasEnglishTranslation
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-200'
                }`}
                style={hasEnglishTranslation ? undefined : { color: '#4D4D4D' }}
              >
                {hasEnglishTranslation && (
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {hasEnglishTranslation
                  ? t('translate.modal.englishContentIncluded')
                  : t('translate.modal.englishContentNotIncluded', {
                      defaultValue: 'English version unavailable',
                    })}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3">
          {isRequested ? (
            <>
              <button
                type="button"
                className="flex-1 bg-green-100 text-green-800 py-2 px-4 rounded border border-green-300"
                disabled
              >
                {t('translate.modal.requestSentSuccess')}
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                onClick={onClose}
              >
                {t('translate.modal.close')}
              </button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="primary"
                size="m"
                className="flex-1"
                onClick={onSendRequest}
                disabled={isRequesting}
              >
                {isRequesting
                  ? t('translate.requesting')
                  : t('translate.modal.sendRequest')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="m"
                className="flex-1 bg-white"
                onClick={onClose}
                disabled={isRequesting}
              >
                {t('translate.modal.cancel')}
              </Button>
            </>
          )}
        </div>

        {/* Info message */}
        <p className="mt-4 text-sm text-center" style={{ color: '#808080' }}>
          {t('translate.modal.onceRequestApproved')}
        </p>
      </div>
    </div>
  );
};

export default TranslationRequestModal;
