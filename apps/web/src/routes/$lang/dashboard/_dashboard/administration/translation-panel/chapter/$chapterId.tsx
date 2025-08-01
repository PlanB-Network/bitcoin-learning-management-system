import type { ChapterTranslationData, CourseDetails } from '@blms/types';
import { Loader } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EnhancedContributorCard } from '#src/routes/$lang/dashboard/_dashboard/administration/translation-panel/-components/enhanced-contributor-card.tsx';
import { TranslationAudioSection } from '#src/routes/$lang/dashboard/_dashboard/administration/translation-panel/-components/translation-audio-section.tsx';
import { PngViewer } from '#src/routes/$lang/dashboard/_dashboard/administration/translation-panel/-components/translation-png-viewer.tsx';
import { TranslationTextViewer } from '#src/routes/$lang/dashboard/_dashboard/administration/translation-panel/-components/translation-text-viewer.tsx';
import { trpcClient } from '#src/utils/trpc.js';
import { TranslationPanelHeader } from '../-components/translation-panel-header.tsx';

// ------------------
// Route
// ------------------
export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/translation-panel/chapter/$chapterId',
)({
  validateSearch: (search) => ({
    courseId: search.courseId as string,
    language: search.language as string,
    // optional current slide number (1-based)
    slide: (search.slide as string | undefined) ?? undefined,
  }),
  component: ChapterDetailsPage,
});

function ChapterDetailsPage() {
  const { chapterId } = Route.useParams();
  const { courseId, language, slide } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [data, setData] = useState<ChapterTranslationData | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(
    null,
  );
  const [slideIndex, setSlideIndex] = useState(() => {
    const num = Number(slide);
    return isNaN(num) || num <= 0 ? 0 : num - 1;
  });

  // Compute base file name (e.g. 1.2_0) that matches naming convention for audio/PPTX resources
  const fileBaseName = React.useMemo(() => {
    if (!data) return '';
    const partIdx = data.context.partIndex;
    const chapIdx = data.context.chapterIndex;
    const current = data.slides?.[slideIndex];
    if (!current) return '';
    const idx = current.slideNumber ? current.slideNumber - 1 : slideIndex;
    return `${partIdx}.${chapIdx}_${idx}`;
  }, [data, slideIndex]);
  const [loading, setLoading] = useState(true);
  // Removed pngAvailability state - passed directly to PngViewer

  // Fetch data
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [slidesResp, courseResp] = await Promise.all([
          trpcClient.content.adminGetCourseTranslationSlides.query({
            courseId,
            language,
            chapterId,
          }),
          trpcClient.content.getCourseDetails.query({
            id: courseId,
            language,
          }),
        ]);
        if (!cancelled) {
          setData(slidesResp as ChapterTranslationData);
          // courseResp is already in the correct CourseTranslationDetailsServiceResponse format
          const adaptedCourseDetails: CourseDetails = {
            id: courseResp.id,
            index: courseResp.index,
            courseName: courseResp.courseName,
            translationStatus: courseResp.translationStatus,
            assigneeDisplayName: courseResp.assigneeDisplayName,
            progress: courseResp.progress,
            totalChapters: courseResp.totalChapters,
            completedChapters: courseResp.completedChapters,
            parts: courseResp.parts,
          };
          setCourseDetails(adaptedCourseDetails);
        }
      } catch (err) {
        console.error('Error loading chapter details', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [courseId, language, chapterId]);

  // Removed PNG availability fetch - PngViewer handles this internally

  useEffect(() => {
    const num = Number(slide);
    setSlideIndex(isNaN(num) || num <= 0 ? 0 : num - 1);
  }, [data, slide]);

  // Removed pngAvailability effect - no longer needed

  // Breadcrumb back to course
  const handleBack = () => {
    navigate({
      to: '/$lang/dashboard/administration/translation-panel/course/$courseId',
      params: { courseId },
      search: { language },
    });
  };

  // Navigate to comparison page
  const handleCompare = () => {
    const currentSlide = data?.slides?.[slideIndex];
    if (currentSlide) {
      navigate({
        to: '/$lang/dashboard/administration/translation-panel/compare/$slideId',
        params: { slideId: currentSlide.slideId },
        search: { courseId, language, chapterId, partId: currentSlide.partId },
      });
    }
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

  const currentSlide = data?.slides?.[slideIndex];

  // Find current chapter status and creation date
  const currentChapter = courseDetails?.parts
    ?.flatMap((part) => part.chapters)
    ?.find((chapter) => chapter.chapterId === chapterId);

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <TranslationPanelHeader
        activeTab="content"
        showTabs={false}
        customTitle={data?.context?.chapterTitle}
      >
        {/* Course Index Navigation */}
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm"
        >
          <svg
            width="8"
            height="12"
            viewBox="0 0 8 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>
              {t('translate.backToCourse', { defaultValue: 'Back to course' })}
            </title>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.910737 6.58917C0.754511 6.43289 0.666748 6.22097 0.666748 6C0.666748 5.77903 0.754511 5.56711 0.910737 5.41083L5.6249 0.696668C5.70178 0.617076 5.79373 0.553591 5.8954 0.509916C5.99707 0.466242 6.10642 0.443254 6.21707 0.442292C6.32772 0.441331 6.43745 0.462416 6.53986 0.504316C6.64228 0.546217 6.73532 0.608095 6.81357 0.686339C6.89181 0.764583 6.95369 0.857626 6.99559 0.960039C7.03749 1.06245 7.05857 1.17219 7.05761 1.28284C7.05665 1.39348 7.03366 1.50283 6.98999 1.6045C6.94631 1.70617 6.88283 1.79813 6.80324 1.875L2.67824 6L6.80324 10.125C6.95504 10.2822 7.03903 10.4927 7.03713 10.7112C7.03523 10.9297 6.94759 11.1387 6.79309 11.2932C6.63858 11.4477 6.42957 11.5353 6.21107 11.5372C5.99257 11.5391 5.78207 11.4551 5.6249 11.3033L0.910737 6.58917Z"
              fill="#FF5C00"
            />
          </svg>
          {data?.context?.courseIndex.toUpperCase()}
        </button>

        {/* Chapter Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mt-4">
          {courseDetails?.courseName || data?.context?.courseName}
        </h1>

        {/* Contributor Card - Full Width */}
        <div className="mt-6">
          <EnhancedContributorCard
            displayName={courseDetails?.assigneeDisplayName}
            username={null}
            status={
              currentChapter?.status || data.context.chapterTranslationStatus
            }
            createdAt={
              currentChapter?.updatedAt
                ? currentChapter.updatedAt.toISOString()
                : null
            }
            language={language}
            originalLanguage={(data.context as any).originalLanguage}
            courseName={courseDetails?.courseName}
            onCompare={handleCompare}
            canCompare={true}
          />
        </div>

        {/* PNG Viewer - Interface slides */}
        {currentSlide && currentSlide.pptResourcePath && (
          <div className="mt-6">
            <PngViewer
              courseId={courseId}
              language={language}
              originalLanguage={(data.context as any).originalLanguage}
              partId={currentSlide.partId}
              chapterId={chapterId}
              slideId={currentSlide.slideId}
              fileName={currentSlide.pptResourcePath as string}
              displaySlideNumber={slideIndex + 1}
              totalSlidesOverride={data.slides.length}
              // Use the position of the slide in the array instead of the DB slideNumber
              // to guarantee the correct PNG suffix (_1, _2, etc.) when navigating
              initialSlideNumber={slideIndex + 1}
            />
          </div>
        )}

        {/* Content Section */}
        {currentSlide && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Content Section */}
            <TranslationTextViewer
              originalLanguage={(data.context as any).originalLanguage}
              targetLanguage={language}
              originalContent={currentSlide.originalContent}
            />

            {/* Audio Section */}
            <TranslationAudioSection
              courseId={courseId}
              language={language}
              partId={currentSlide.partId}
              chapterId={chapterId}
              slideId={currentSlide.slideId}
              fileName={fileBaseName}
              audioResourcePath={currentSlide.audioResourcePath}
            />
          </div>
        )}

        {/* Navigation Buttons - Bottom of Page */}
        {data && data.slides.length > 1 && (
          <div className="mt-8 flex justify-between items-center bg-white border rounded-lg p-4">
            <button
              type="button"
              onClick={() => setSlideIndex((prev) => Math.max(prev - 1, 0))}
              disabled={slideIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-orange-600 hover:text-orange-700 disabled:text-gray-400 transition-colors"
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
              <span className="text-sm font-medium text-gray-900">
                {slideIndex + 1} / {data.slides.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setSlideIndex((prev) =>
                  prev < data.slides.length - 1 ? prev + 1 : prev,
                )
              }
              disabled={slideIndex >= data.slides.length - 1}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-orange-600 hover:text-orange-700 disabled:text-gray-400 transition-colors"
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
        )}
      </TranslationPanelHeader>
    </div>
  );
}
