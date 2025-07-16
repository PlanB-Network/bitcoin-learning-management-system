import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  CoursePartDetails,
  CourseResponse,
  JoinedCourseChapter,
  PartWithChapters,
} from '@blms/types';
import { ChaptersTable } from '@blms/ui';
import BreadcrumbArrowIcon from '#src/assets/icons/breadcrumb_navigation_arrow_orange.svg';
import { PageLayout } from '#src/components/page-layout.tsx';
import { BackLink } from '#src/molecules/backlink.tsx';
import { trpcClient } from '#src/utils/trpc.ts';

export const Route = createFileRoute('/$lang/content/translate/$courseId')({
  component: ProofreadCoursePage,
});

interface ChapterProgress {
  chapterId: string;
  chapterIndex: number;
  chapterTitle: string;
  partIndex: number;
  partId: string;
  totalSlides: number;
  completedSlides: number;
  inProgressSlides: number;
  todoSlides: number;
  status: 'completed' | 'in-progress' | 'not-started';
}

function ProofreadCoursePage() {
  const { t, i18n } = useTranslation();
  const params = Route.useParams();
  const { courseId } = params;
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [chapterProgress, setChapterProgress] = useState<ChapterProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if we have a chapterId in params (which means we're on a chapter route)
  const chapterId = 'chapterId' in params ? params.chapterId : undefined;
  const isOnChapterRoute = Boolean(chapterId);

  // Calculate progress using slide counts for more granular accuracy
  const totalChapters = chapterProgress.length;
  const completedChapters = chapterProgress.filter(
    (ch) => ch.status === 'completed',
  ).length;

  const totalStepsInCourse = chapterProgress.reduce(
    (sum, ch) => sum + ((ch as any).totalSteps ?? (ch.totalSlides || 0) * 3),
    0,
  );
  const completedStepsInCourse = chapterProgress.reduce(
    (sum, ch) =>
      sum + ((ch as any).validatedSteps ?? (ch.completedSlides || 0) * 3),
    0,
  );

  const progressPercentage =
    totalStepsInCourse > 0
      ? Math.round((completedStepsInCourse / totalStepsInCourse) * 100)
      : 0;

  // ALL useEffect hooks must be called every render
  useEffect(() => {
    document.title = `${t('translate.bitcoinTranslationCommunity')} | Plan ₿ Network`;
  }, [t]);

  useEffect(() => {
    // Only fetch data if we're not on a chapter route
    if (isOnChapterRoute) return;

    const fetchCourseData = async () => {
      try {
        setLoading(true);
        console.log('Fetching course data for:', { courseId, language: 'fr' });

        // Fetch course data and chapter progress in parallel
        const [courseData, progressData] = await Promise.all([
          trpcClient.content.getCourse.query({
            language: 'en',
            id: courseId,
          }),
          trpcClient.content.getCourseTranslationChapterProgress.query({
            courseId,
            language: 'fr', // Default to French for now
          }),
        ]);

        console.log('Course data received:', courseData);
        console.log('Progress data received:', progressData);

        if (courseData) {
          setCourse(courseData);
        }

        if (progressData) {
          setChapterProgress(progressData);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, isOnChapterRoute]);

  // ALL function definitions must be defined every render
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('words.completed', { defaultValue: 'Completed' });
      case 'in-progress':
        return t('words.inProgress', { defaultValue: 'In Progress' });
      case 'not-started':
        return t('words.notStarted', { defaultValue: 'Not Started' });
      default:
        return status;
    }
  };

  const handleChapterAction = (chapterId: string) => {
    console.log('Chapter action clicked for:', chapterId);
    console.log('Navigating to:', {
      to: '/$lang/content/translate/$courseId/$chapterId',
      params: {
        lang: i18n.language,
        courseId,
        chapterId,
      },
    });

    // Navigate to chapter translation page
    navigate({
      to: '/$lang/content/translate/$courseId/$chapterId',
      params: {
        lang: i18n.language,
        courseId,
        chapterId,
      },
    });
  };

  // Transform chapters data to CoursePartDetails format for ChaptersTable
  const transformedParts: CoursePartDetails[] =
    course?.parts?.map((part: PartWithChapters, partIndex: number) => ({
      partId: `part-${partIndex}`,
      partIndex: partIndex + 1,
      partTitle: part.title || `Part ${partIndex + 1}`,
      chapters:
        part.chapters?.map((chapter: JoinedCourseChapter) => {
          // Find matching progress data for this chapter
          const progressData = chapterProgress.find(
            (p) => p.chapterId === chapter?.chapterId,
          );

          return {
            chapterId: chapter?.chapterId || '',
            chapterIndex: chapter?.chapterIndex || 0,
            chapterTitle: chapter?.title || `Chapter ${chapter?.chapterIndex}`,
            status: progressData?.status || 'not-started',
            // Validation-step progress information for granular percentage display
            totalSteps:
              (progressData as any)?.totalSteps ??
              (progressData?.totalSlides ?? 0) * 3,
            validatedSteps:
              (progressData as any)?.validatedSteps ??
              (progressData?.completedSlides ?? 0) * 3,
            totalSlides: progressData?.totalSlides ?? 0,
            completedSlides: progressData?.completedSlides ?? 0,
            inProgressSlides: progressData?.inProgressSlides ?? 0,
            todoSlides: progressData?.todoSlides ?? 0,
          } as any; // Cast to allow additional fields beyond CourseChapterDetails
        }) || [],
    })) || [];

  // Debug logging
  console.log('ProofreadCoursePage params:', params);
  console.log('Current URL:', window.location.pathname);
  console.log('chapterId from params:', chapterId);
  console.log('isOnChapterRoute:', isOnChapterRoute);

  // If we're on a chapter route, just render the outlet
  if (isOnChapterRoute) {
    console.log('Rendering outlet for chapter route');
    return <Outlet />;
  }

  console.log('Rendering course page content');
  console.log('Transformed parts for ChaptersTable:', transformedParts);
  console.log('Number of parts:', transformedParts.length);
  console.log('Chapter progress data:', chapterProgress);

  if (loading) {
    return (
      <PageLayout
        title=""
        variant="light"
        footerVariant="light"
        className="flex justify-center items-center min-h-screen"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </PageLayout>
    );
  }

  if (!course) {
    return (
      <PageLayout
        title={t('translate.courseNotFound')}
        description={t('translate.courseNotFoundDescription')}
        variant="light"
        footerVariant="light"
      >
        <div className="text-center">
          <BackLink
            to="/$lang/content/translate"
            label={t('translate.backToCourses')}
            className="inline-flex items-center text-orange-500 hover:text-orange-600"
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      {/* Only show course content if we're not on a chapter route */}
      {!isOnChapterRoute && (
        <PageLayout
          variant="light"
          footerVariant="light"
          maxWidth="max-w-7xl"
          paddingXClasses="px-4"
        >
          {/* Navigation and Course Header */}
          <div className="flex flex-col gap-6 mb-8">
            {/* Back Navigation */}
            <div className="flex items-center gap-1 text-base">
              <img
                src={BreadcrumbArrowIcon}
                alt=""
                className="w-[8px] h-[12px]"
              />
              <Link
                to="/$lang/content/translate"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                {t('translate.backToSection', {
                  defaultValue: 'Back to courses',
                })}
              </Link>
              <img
                src={BreadcrumbArrowIcon}
                alt=""
                className="w-[8px] h-[12px]"
              />
              <span className="text-orange-500 font-medium">
                {course?.index?.toUpperCase() || courseId.toUpperCase()}
              </span>
            </div>

            {/* Course Header with Progress Card */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Course Title Section */}
              <div className="flex items-center gap-4">
                <div
                  className="text-gray-700 px-3 py-1 rounded text-sm font-medium"
                  style={{ backgroundColor: '#E5E5E5' }}
                >
                  {course?.index?.toUpperCase() || courseId.toUpperCase()}
                </div>
                <h2
                  className="text-gray-900 text-xl sm:text-2xl md:text-3xl lg:text-4xl"
                  style={{
                    fontFamily: 'Rubik, sans-serif',
                    fontWeight: 500,
                    lineHeight: '120%',
                  }}
                >
                  {course?.name || 'The Bitcoin Journey'}
                </h2>
              </div>

              {/* Progress Card */}
              <div className="flex-shrink-0 w-full lg:w-[300px]">
                <div className="w-full h-auto bg-[#F6F6F6] border border-[#E5E5E5] rounded-lg px-[10px] py-[4px] shadow-sm flex flex-col justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {t('translate.courseProofreadingProgress', {
                      defaultValue: 'Course proofreading progress',
                    })}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {completedChapters} of {totalChapters} chapters
                        completed
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters Table */}
          <ChaptersTable
            parts={transformedParts}
            onChapterAction={handleChapterAction}
            actionButtonText={t('translate.proofread', {
              defaultValue: 'Proofread',
            })}
            getStatusText={getStatusText}
            labels={{
              partTitle: (index: number, title: string) =>
                `${t('words.part', { defaultValue: 'Part' })} ${index}: ${title}`,
              chapterIndex: '#',
              chapterTitle: t('words.chapter', { defaultValue: 'Chapter' }),
              status: t('words.status', { defaultValue: 'Status' }),
              progress: t('words.progress', { defaultValue: 'Progress' }),
              actions: t('words.action', { defaultValue: 'Action' }),
              noChapters: t('translate.noCoursePartsFound', {
                defaultValue: 'No course parts found for proofreading',
              }),
              proofreadText: t('translate.proofread', {
                defaultValue: 'Proofread',
              }),
              resumeText: t('translate.resume', { defaultValue: 'Resume' }),
              reviewText: t('translate.review', { defaultValue: 'Review' }),
            }}
            className="mt-6"
          />
        </PageLayout>
      )}

      {/* Always render outlet for child routes */}
      <Outlet />
    </>
  );
}
