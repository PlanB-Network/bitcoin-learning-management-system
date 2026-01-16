import { useTranslation } from 'react-i18next';

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export function SlideNavigation({
  currentSlide,
  totalSlides,
  onPrevious,
  onNext,
  disabled = false,
}: SlideNavigationProps) {
  const { t } = useTranslation();

  if (totalSlides <= 1) {
    return null;
  }

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide >= totalSlides - 1;

  return (
    <div className="mt-8 flex justify-between items-center bg-white border rounded-lg p-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={disabled || isFirstSlide}
        className="flex items-center space-x-2 px-4 py-2 text-sm text-orange-600 hover:text-orange-700 disabled:text-neutral-500 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>
            {t('translate.slideNavigation.previous', {
              defaultValue: 'Previous',
            })}
          </title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>
          {t('translate.slideNavigation.previous', {
            defaultValue: 'Previous',
          })}
        </span>
      </button>

      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-neutral-900">
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={disabled || isLastSlide}
        className="flex items-center space-x-2 px-4 py-2 text-sm text-orange-600 hover:text-orange-700 disabled:text-neutral-500 transition-colors"
      >
        <span>
          {t('translate.slideNavigation.next', { defaultValue: 'Next' })}
        </span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <title>
            {t('translate.slideNavigation.next', {
              defaultValue: 'Next',
            })}
          </title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
