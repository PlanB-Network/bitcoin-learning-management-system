import { AssignmentStatus, TranslationStatus } from '@blms/constants';
import type {
  CoursePartDetails,
  CourseResponse,
  JoinedCourseChapter,
  PartWithChapters,
} from '@blms/types';
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BreadcrumbArrowIcon from '#src/assets/icons/breadcrumb_navigation_arrow_orange.svg';
import { ChaptersTable } from '#src/components/CourseDetails/chapters-table.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';
import { LoadingSpinner } from '#src/components/ui/loading-spinner.tsx';
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
  const [targetLanguage] = useState<string>(() => {
    return localStorage.getItem('targetLanguage') || 'fr';
  });

  // Check if we're on a chapter route by looking at the URL
  // TanStack Router doesn't pass child route params to parent, so check URL directly
  const location = useLocation();
  const urlSegments = location.pathname.split('/').filter(Boolean);
  // URL pattern: /:lang/content/translate/:courseId/:chapterId
  // So if we have 5+ segments and the 5th is a UUID, we're on chapter route
  const isOnChapterRoute = urlSegments.length >= 5 && urlSegments[4].length > 0;

  // Calculate progress using slide counts for more granular accuracy
  const totalChapters = chapterProgress.length;
  const completedChapters = chapterProgress.filter(
    (ch) => ch.status === 'completed',
  ).length;

  const progressPercentage =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
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
        console.log('Fetching course data for:', {
          courseId,
          language: targetLanguage,
        });

        // Fetch course data and chapter progress in parallel
        const [courseData, progressData] = await Promise.all([
          trpcClient.content.getCourse.query({
            language: 'en',
            id: courseId,
          }),
          trpcClient.content.getCourseTranslationChapterProgress.query({
            courseId,
            language: targetLanguage,
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

        // Check and update course translation status to "under_review" if needed
        await checkAndUpdateTranslationStatus();
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkAndUpdateTranslationStatus = async () => {
      try {
        // Check the user's translation assignment for this course/language
        const userAssignment =
          await trpcClient.user.translation.checkUserTranslationAssignment.query(
            {
              courseId,
              language: targetLanguage,
            },
          );

        console.log('Current user assignment:', userAssignment);

        // If user has an assignment with status "assigned", update it to "in_progress"
        // This marks that they've started proofreading
        if (
          userAssignment &&
          userAssignment.status === AssignmentStatus.Assigned
        ) {
          console.log(
            'Updating assignment status to in_progress and course status to under_review',
          );

          // Update both assignment status and course translation status
          await Promise.all([
            // Update assignment status to in_progress
            trpcClient.user.translation.startTranslation.mutate({
              courseId,
              language: targetLanguage,
            }),
            // Update course translation status to under_review
            trpcClient.content.updateCourseTranslationStatus.mutate({
              courseId,
              language: targetLanguage,
              status: TranslationStatus.UnderReview,
            }),
          ]);

          console.log(
            'Successfully updated assignment status to in_progress and course status to under_review',
          );
        }
      } catch (error) {
        console.error('Error checking/updating translation status:', error);
        // Don't block the page loading if status update fails
      }
    };

    fetchCourseData();
  }, [courseId, isOnChapterRoute, targetLanguage]);

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
  console.log('ProofreadCoursePage - isOnChapterRoute:', isOnChapterRoute);
  console.log('ProofreadCoursePage - URL:', location.pathname);

  // If we're on a chapter route, just render the outlet
  if (isOnChapterRoute) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <PageLayout
        title=""
        variant="light"
        footerVariant="light"
        className="flex justify-center items-center min-h-screen"
      >
        <LoadingSpinner size="md" />
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
                  className="text-neutral-700 px-3 py-1 rounded text-sm font-medium"
                  style={{ backgroundColor: '#E5E5E5' }}
                >
                  {course?.index?.toUpperCase() || courseId.toUpperCase()}
                </div>
                <h2
                  className="text-neutral-900 text-xl sm:text-2xl md:text-3xl lg:text-4xl"
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
                  <span className="text-sm font-medium text-neutral-900">
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
                      <span className="text-sm text-neutral-500">
                        {completedChapters} of {totalChapters} chapters
                        completed
                      </span>
                      <span className="text-sm font-medium text-neutral-900">
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
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
