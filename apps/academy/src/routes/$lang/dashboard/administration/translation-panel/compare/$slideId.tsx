import type { ChapterTranslationData } from '@blms/types';
import { Loader } from '@blms/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SubTabsSwitch } from '#src/components/ui/sub-tabs-switch.tsx';
import { useTranslationPanelNavigation } from '#src/hooks/use-translation-panel-navigation.ts';
import { ComparisonContent } from '#src/routes/$lang/dashboard/administration/translation-panel/-components/comparison-content.tsx';
import { ComparisonHeader } from '#src/routes/$lang/dashboard/administration/translation-panel/-components/comparison-header.tsx';
import {
  findSlideById,
  findSlideIndexById,
  getOriginalLanguage,
} from '#src/utils/translation-panel.ts';
import { trpcClient } from '#src/utils/trpc.js';
import { TranslationPanelHeader } from '../-components/translation-panel-header.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/administration/translation-panel/compare/$slideId',
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
  const { courseId, language, chapterId } = Route.useSearch();
  const { t } = useTranslation();
  const { navigateToChapter } = useTranslationPanelNavigation({
    courseId,
    language,
  });

  const [data, setData] = useState<ChapterTranslationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'presentations' | 'content'>(
    'presentations',
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Memoized computations
  const currentSlide = useMemo(() => {
    return data ? findSlideById(data.slides, slideId) : null;
  }, [data, slideId]);

  const originalLanguage = useMemo(() => {
    return data ? getOriginalLanguage(data.context) : 'en';
  }, [data]);

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
  }, [courseId, language, chapterId]);

  // After data is loaded, fix the current slide index to the array position
  useEffect(() => {
    if (!data) return;
    const slideArrayIndex = findSlideIndexById(data.slides, slideId);
    if (slideArrayIndex !== -1) {
      setCurrentSlideIndex(slideArrayIndex);
    }
  }, [data, slideId]);

  const handleBack = () => {
    const slideNumber = currentSlideIndex + 1;
    navigateToChapter(chapterId, slideNumber);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'presentations' | 'content');
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

  // currentSlide is now computed via useMemo

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
        <ComparisonHeader
          onBack={handleBack}
          courseIndex={data.context.courseIndex}
          courseName={data.context.courseName}
          partIndex={data.context.partIndex}
          chapterIndex={data.context.chapterIndex}
          chapterTitle={data.context.chapterTitle}
        />

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
          onChange={handleTabChange}
          className="mb-1"
        />

        {/* Tab Content */}
        <ComparisonContent
          activeTab={activeTab}
          currentSlide={currentSlide}
          courseId={courseId}
          language={language}
          originalLanguage={originalLanguage}
          chapterId={chapterId}
          currentSlideIndex={currentSlideIndex}
        />
      </TranslationPanelHeader>
    </div>
  );
}
