import { useTranslation } from 'react-i18next';

interface ComparisonHeaderProps {
  onBack: () => void;
  courseIndex: string;
  courseName: string;
  partIndex: number;
  chapterIndex: number;
  chapterTitle: string;
}

export function ComparisonHeader({
  onBack,
  courseIndex,
  courseName,
  partIndex,
  chapterIndex,
  chapterTitle,
}: ComparisonHeaderProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm mb-6"
      >
        ←{' '}
        {t('translate.comparison.backToChapter', {
          defaultValue: 'Back to chapter',
        })}
      </button>

      {/* Course and Chapter Header */}
      <div className="flex items-center justify-between mb-6">
        {/* Left side: Course info */}
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-800 rounded-md uppercase">
            {courseIndex}
          </span>
          <h1 className="title-large-sb-24px text-dashboardSectionTitle">
            {courseName}
          </h1>
        </div>

        {/* Right side: Chapter info */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-black">
            {partIndex}.{chapterIndex}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-sm font-bold text-black">{chapterTitle}</span>
        </div>
      </div>
    </>
  );
}
