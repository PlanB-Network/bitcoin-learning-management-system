import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

interface SectionCardProps {
  title: string;
  progress: number;
  isComingSoon?: boolean;
  linkTo?: string;
  linkParams?: Record<string, string>;
  buttonText?: string;
  className?: string;
}

export const SectionCard = ({
  title,
  progress,
  isComingSoon = false,
  linkTo,
  linkParams,
  buttonText,
  className = '',
}: SectionCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cardContent = (
    <div
      className={`relative rounded-lg overflow-hidden shadow-md ${isComingSoon ? '' : 'border-2 border-orange-500'} ${className}`}
    >
      {isComingSoon && (
        <>
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20" />
          <div className="absolute top-0 left-0 z-30 bg-white text-black px-4 py-1 m-3">
            <span className="font-bold text-sm">
              {t('translate.comingSoon')}
            </span>
          </div>
        </>
      )}

      <div className="bg-black text-white p-6 flex flex-col items-center justify-center">
        <div className="text-xl font-bold mb-2">PLAN ₿ NETWORK</div>
        <div className="text-3xl font-bold">{t('translate.translations')}</div>
      </div>

      <div className={`p-4 ${isComingSoon ? 'bg-white' : 'bg-gray-100'}`}>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">
            {t('translate.translationProgress')}
          </span>
          <span className="font-bold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-orange-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {!isComingSoon && linkTo && buttonText && (
          <button
            type="button"
            onClick={() => {
              if (linkTo && linkParams?.lang) {
                navigate({
                  to: linkTo.replace('$lang', linkParams.lang),
                });
              }
            }}
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-2 px-4 rounded transition-colors"
          >
            {buttonText} →
          </button>
        )}
      </div>
    </div>
  );

  return cardContent;
};
