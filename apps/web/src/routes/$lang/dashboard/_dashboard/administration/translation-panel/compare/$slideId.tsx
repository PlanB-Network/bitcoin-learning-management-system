import type { ChapterTranslationData } from '@blms/types';
import { Loader } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SubTabsSwitch } from '#src/components/ui/sub-tabs-switch.tsx';
import { ComparisonPngViewer } from '#src/routes/$lang/dashboard/_dashboard/administration/translation-panel/-components/comparison-png-viewer.tsx';
import { ComparisonTextViewer } from '#src/routes/$lang/dashboard/_dashboard/administration/translation-panel/-components/comparison-text-viewer.tsx';
import { trpcClient } from '#src/utils/trpc.js';
import { TranslationPanelHeader } from '../-components/translation-panel-header.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/translation-panel/compare/$slideId',
)({
  validateSearch: (search) => ({
    courseId: search.courseId as string,
    language: (search.language as string) ?? 'fr',
    chapterId: search.chapterId as string,
    partId: search.partId as string,
  }),
  component: PngComparisonPage,
});

function PngComparisonPage() {
  const { slideId } = Route.useParams();
  const { courseId, language, chapterId, partId } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [data, setData] = useState<ChapterTranslationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'presentations' | 'content'>(
    'presentations',
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Fetch slide data
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const slidesResp =
          await trpcClient.content.adminGetCourseTranslationSlides.query({
            courseId,
            language,
            chapterId,
          });

        if (!cancelled) {
          setData(slidesResp as ChapterTranslationData);
        }
      } catch (err) {
        console.error('Error loading comparison data', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [courseId, language, chapterId, slideId, partId]);

  // After data is loaded, fix the current slide index to the array position
  useEffect(() => {
    if (!data) return;
    const currentSlideArrayIndex = data.slides.findIndex(
      (slide) => slide.slideId === slideId,
    );
    if (currentSlideArrayIndex !== -1) {
      setCurrentSlideIndex(currentSlideArrayIndex);
    }
  }, [data, slideId]);

  // Navigate back to chapter, keep current slide number based on array position
  const handleBack = () => {
    const slideNumber = currentSlideIndex + 1; // Use array position like in $chapterId
    navigate({
      to: '/$lang/dashboard/administration/translation-panel/chapter/$chapterId',
      params: { chapterId },
      search: { courseId, language, slide: slideNumber },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-red-500">
        {t('errors.dataNotFound', { defaultValue: 'Data not found' })}
      </div>
    );
  }

  const currentSlide = data.slides.find((slide) => slide.slideId === slideId);

  if (!currentSlide) {
    return (
      <div className="text-center py-8 text-red-500">
        {t('translate.slideNotFound', { defaultValue: 'Slide not found' })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <TranslationPanelHeader activeTab="content" showTabs={false}>
        {/* Breadcrumb */}
        <button
          type="button"
          onClick={handleBack}
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
              {data.context.courseIndex}
            </span>
            <h1 className="title-large-sb-24px text-dashboardSectionTitle">
              {data.context.courseName}
            </h1>
          </div>

          {/* Right side: Chapter info */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-black">
              {data.context.partIndex}.{data.context.chapterIndex}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm font-bold text-black">
              {data.context.chapterTitle}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <SubTabsSwitch
          tabs={[
            {
              id: 'presentations',
              label: t('translate.presentations', {
                defaultValue: 'Presentations',
              }),
            },
            {
              id: 'content',
              label: t('translate.textContent', {
                defaultValue: 'Text Content',
              }),
            },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
          className="mb-1"
        />

        {/* Tab Content */}
        {activeTab === 'presentations' && currentSlide && (
          <div className="mt-2 space-y-6">
            {/* Original Version */}
            <div className="space-y-4">
              <ComparisonPngViewer
                courseId={courseId}
                language={(data.context as any).originalLanguage || 'en'}
                originalLanguage={
                  (data.context as any).originalLanguage || 'en'
                }
                partId={currentSlide.partId}
                chapterId={chapterId}
                slideId={currentSlide.slideId}
                fileName={currentSlide.pptResourcePath as string}
                displaySlideNumber={currentSlide.slideNumber}
                initialSlideNumber={currentSlideIndex + 1}
                forceType="original"
              />
            </div>

            {/* Translated Version */}
            <div className="space-y-4">
              <ComparisonPngViewer
                courseId={courseId}
                language={language}
                originalLanguage={
                  (data.context as any).originalLanguage || 'en'
                }
                partId={currentSlide.partId}
                chapterId={chapterId}
                slideId={currentSlide.slideId}
                fileName={currentSlide.pptResourcePath as string}
                displaySlideNumber={currentSlide.slideNumber}
                initialSlideNumber={currentSlideIndex + 1}
                forceType="translated"
              />
            </div>
          </div>
        )}

        {activeTab === 'content' && currentSlide && (
          <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Content */}
              <ComparisonTextViewer
                content={currentSlide.originalContent}
                language={(data.context as any).originalLanguage}
              />

              {/* Translated Content */}
              <ComparisonTextViewer
                content={currentSlide.translatedContent}
                language={language}
              />
            </div>
          </div>
        )}
      </TranslationPanelHeader>
    </div>
  );
}
