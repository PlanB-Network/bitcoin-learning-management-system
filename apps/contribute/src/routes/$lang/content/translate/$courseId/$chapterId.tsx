import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TranslationStatus } from '@blms/constants';
import Back15Icon from '#src/assets/icons/back_15.svg';
import BookClosedIcon from '#src/assets/icons/book_closed.svg';
import BreadcrumbArrowIcon from '#src/assets/icons/breadcrumb_navigation_arrow_orange.svg';
import CheckCircleGrayIcon from '#src/assets/icons/check_circle_gray.svg';
import CheckCircleOrangeIcon from '#src/assets/icons/check_circle_orange.svg';
import DroplistArrowIcon from '#src/assets/icons/droplist_arrow_balck.svg';
import Forward15Icon from '#src/assets/icons/forward_15.svg';
import OrangePill from '#src/assets/icons/orange_pill_color.svg';
import PlayIcon from '#src/assets/icons/play.svg';
import { PageLayout } from '#src/components/page-layout.tsx';
import { VideoGenerationModal } from '#src/components/video-generation-modal.tsx';
import { BackLink } from '#src/molecules/backlink.tsx';
import { trpcClient } from '#src/utils/trpc.ts';

export const Route = createFileRoute(
  '/$lang/content/translate/$courseId/$chapterId',
)({
  component: ChapterTranslationPage,
});

interface ChapterTranslationContext {
  courseId: string;
  courseIndex: string;
  courseName: string;
  partId: string;
  partIndex: number;
  partTitle: string;
  chapterId: string;
  chapterIndex: number;
  chapterTitle: string;
  translationStatus: string;
  chapterTranslationStatus: string;
}

interface CourseTranslationSlide {
  courseId: string;
  language: string;
  partId: string;
  chapterId: string;
  slideId: string;
  pptResourcePath: string | null;
  audioResourcePath: string | null;
  originalContent: string | null;
  translatedContent: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChapterTranslationData {
  context: ChapterTranslationContext;
  slides: CourseTranslationSlide[];
}

function ChapterTranslationPage() {
  const { t, i18n } = useTranslation();
  const { courseId, chapterId } = Route.useParams();
  const navigate = useNavigate();
  const [chapterData, setChapterData] = useState<ChapterTranslationData | null>(
    null,
  );
  const [courseData, setCourseData] = useState<any>(null);
  const [totalChapters, setTotalChapters] = useState<number>(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track validation states for the current slide
  const [validationStates, setValidationStates] = useState({
    presentationValidated: false,
    transcriptionValidated: false,
    audioValidated: false,
  });

  // Video generation modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoGenerationProgress, setVideoGenerationProgress] = useState(0);

  // Get target language - for now, default to French
  const targetLanguage = 'fr';

  // Check if all validations are complete for the current slide
  const allValidationsComplete =
    validationStates.presentationValidated &&
    validationStates.transcriptionValidated &&
    validationStates.audioValidated;

  // Check if this is the last slide
  const isLastSlide = chapterData
    ? currentSlideIndex === chapterData.slides.length - 1
    : false;

  // Check if this is the last chapter in the course
  const isLastChapter = React.useMemo(() => {
    if (!courseData || !chapterData) return false;

    const allChapters = courseData.parts.flatMap((part: any) => part.chapters);
    const currentChapterIndex = allChapters.findIndex(
      (chapter: any) => chapter.chapterId === chapterId,
    );

    return currentChapterIndex === allChapters.length - 1;
  }, [courseData, chapterData, chapterId]);

  // Check if this is the last slide of the entire course (last slide of the last chapter)
  const isLastSlideOfCourse = isLastSlide && isLastChapter;

  // Calculate the overall chapter number (across the whole course)
  const overallChapterNumber = React.useMemo(() => {
    if (!courseData) return 0;
    const chaptersInCourse = courseData.parts.flatMap(
      (part: any) => part.chapters,
    );
    const index = chaptersInCourse.findIndex(
      (ch: any) => ch.chapterId === chapterId,
    );
    return index >= 0 ? index + 1 : 0; // 1-based index, 0 if not found
  }, [courseData, chapterId]);

  // Calculate the last chapter index of every part to create visual grouping in progress bar
  const partEndIndexes = React.useMemo(() => {
    if (!courseData) return [] as number[];
    let cumulative = 0;
    return courseData.parts.map((part: any) => {
      cumulative += part.chapters?.length || 0;
      return cumulative - 1; // zero-based index of last chapter in this part
    });
  }, [courseData]);

  // Reset validation states when slide index changes
  useEffect(() => {
    setValidationStates({
      presentationValidated: false,
      transcriptionValidated: false,
      audioValidated: false,
    });
  }, [currentSlideIndex]);

  // Scroll to top when slide changes
  useEffect(() => {
    // Small delay to ensure DOM has updated before scrolling
    setTimeout(() => {
      // Use multiple methods to ensure scroll works
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 10);
  }, [currentSlideIndex]);

  useEffect(() => {
    document.title = `${t('translate.chapterTranslation')} | Plan ₿ Network`;
  }, [t]);

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching chapter data for:', {
          courseId,
          chapterId,
          targetLanguage,
        });

        // Fetch both chapter data and course data in parallel
        const [chapterData, courseData] = await Promise.all([
          trpcClient.content.getCourseTranslationSlides.query({
            courseId,
            language: targetLanguage,
            chapterId,
          }),
          trpcClient.content.getCourse.query({
            language: 'en',
            id: courseId,
          }),
        ]);

        console.log('Chapter data received:', chapterData);
        console.log('Course data received:', courseData);

        setChapterData(chapterData);
        setCourseData(courseData);

        // Calculate total chapters from course data
        if (courseData?.parts) {
          const totalChaptersCount = courseData.parts.reduce(
            (total, part) => total + (part.chapters?.length || 0),
            0,
          );
          setTotalChapters(totalChaptersCount);
          console.log('Total chapters calculated:', totalChaptersCount);
        }
      } catch (error) {
        console.error('Error fetching chapter translation data:', error);
        setError(
          error instanceof Error ? error.message : 'Unknown error occurred',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [courseId, chapterId, targetLanguage]);

  const handleTranslationChange = (
    slideId: string,
    translatedContent: string,
  ) => {
    if (!chapterData) return;

    setChapterData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        slides: prev.slides.map((slide) =>
          slide.slideId === slideId ? { ...slide, translatedContent } : slide,
        ),
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!chapterData || !hasUnsavedChanges) return;

    try {
      const currentSlide = chapterData.slides[currentSlideIndex];
      if (!currentSlide) return;

      await trpcClient.content.updateCourseTranslationSlide.mutate({
        courseId,
        language: targetLanguage,
        chapterId,
        slideId: currentSlide.slideId,
        translatedContent: currentSlide.translatedContent || '',
        status: TranslationStatus.InProgress,
      });

      setHasUnsavedChanges(false);
      console.log('Changes saved successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleValidatePresentation = () => {
    console.log('Validate presentation clicked');
    setValidationStates((prev) => ({ ...prev, presentationValidated: true }));
    // TODO: Implement presentation validation
  };

  const handleGenerateAudio = () => {
    console.log('Generate audio clicked');
    // TODO: Implement audio generation
  };

  const handleValidateTranscription = async () => {
    console.log('Validate transcription clicked');

    if (!chapterData) {
      console.error('No chapter data available');
      return;
    }

    const currentSlide = chapterData.slides[currentSlideIndex];
    if (!currentSlide) {
      console.error('No current slide data available');
      return;
    }

    try {
      // Save the translated content to the database
      await trpcClient.content.updateCourseTranslationSlide.mutate({
        courseId,
        language: targetLanguage,
        chapterId,
        slideId: currentSlide.slideId,
        translatedContent: currentSlide.translatedContent || '',
        status: TranslationStatus.InProgress,
      });

      // Mark transcription as validated
      setValidationStates((prev) => ({
        ...prev,
        transcriptionValidated: true,
      }));

      // Clear unsaved changes flag since we just saved
      setHasUnsavedChanges(false);

      console.log('Transcription validated and saved successfully');
    } catch (error) {
      console.error('Error saving transcription:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleValidateAudio = () => {
    console.log('Validate audio clicked');
    setValidationStates((prev) => ({ ...prev, audioValidated: true }));
    // TODO: Implement audio validation
  };

  const handleNextSlide = () => {
    if (!chapterData || !courseData) return;

    // If there are more slides in the current chapter, just go to the next one
    if (currentSlideIndex < chapterData.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      // Reset validation states for the new slide
      setValidationStates({
        presentationValidated: false,
        transcriptionValidated: false,
        audioValidated: false,
      });
      return;
    }

    // We are on the last slide of the current chapter
    // Determine if there is a next chapter in the course
    const allChapters = courseData.parts.flatMap((part: any) =>
      part.chapters.map((chapter: any) => ({
        ...chapter,
        partIndex: part.partIndex,
        partId: part.partId,
      })),
    );

    const currentChapterIndex = allChapters.findIndex(
      (chapter: any) => chapter.chapterId === chapterId,
    );

    if (
      currentChapterIndex >= 0 &&
      currentChapterIndex < allChapters.length - 1
    ) {
      // Navigate to the first slide of the next chapter
      const nextChapter = allChapters[currentChapterIndex + 1];
      navigate({
        to: '/$lang/content/translate/$courseId/$chapterId',
        params: {
          lang: i18n.language,
          courseId,
          chapterId: nextChapter.chapterId,
        },
      });
    }
    // If there is no next chapter, do nothing here. The UI will offer to create the video.
  };

  const handleCreateVideo = async () => {
    console.log('Create video clicked');
    setIsVideoModalOpen(true);
    setVideoGenerationProgress(0);

    // Simulate video generation progress
    simulateVideoGeneration();

    // TODO: Replace with actual API call when endpoint is ready
    // try {
    //   await trpcClient.content.generateVideo.mutate({
    //     courseId,
    //     chapterId,
    //     language: targetLanguage,
    //   });
    // } catch (error) {
    //   console.error('Error generating video:', error);
    // }
  };

  const simulateVideoGeneration = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15; // Random progress increments
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setVideoGenerationProgress(Math.floor(progress));
    }, 1000);
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setVideoGenerationProgress(0);
  };

  const handleNextChapter = async () => {
    console.log('Next chapter clicked');

    if (!courseData || !chapterData) {
      console.log('No course or chapter data available');
      return;
    }

    // Find all chapters in the course
    const allChapters = courseData.parts.flatMap((part: any) =>
      part.chapters.map((chapter: any) => ({
        ...chapter,
        partIndex: part.partIndex,
        partId: part.partId,
      })),
    );

    // Find current chapter position
    const currentChapterIndex = allChapters.findIndex(
      (chapter: any) => chapter.chapterId === chapterId,
    );

    console.log('Current chapter index:', currentChapterIndex);
    console.log('Total chapters:', allChapters.length);

    // Check if there's a next chapter
    if (
      currentChapterIndex >= 0 &&
      currentChapterIndex < allChapters.length - 1
    ) {
      const nextChapter = allChapters[currentChapterIndex + 1];
      console.log('Next chapter:', nextChapter);

      // Navigate to the next chapter's first slide
      navigate({
        to: '/$lang/content/translate/$courseId/$chapterId',
        params: {
          lang: i18n.language,
          courseId,
          chapterId: nextChapter.chapterId,
        },
      });
    } else {
      console.log(
        'This is the last chapter, navigating back to course overview',
      );
      // If this is the last chapter, go back to course overview
      navigate({
        to: '/$lang/content/translate/$courseId',
        params: {
          lang: i18n.language,
          courseId,
        },
      });
    }

    // Close the modal
    setIsVideoModalOpen(false);
    setVideoGenerationProgress(0);
  };

  if (loading) {
    return (
      <PageLayout
        title=""
        variant="light"
        footerVariant="light"
        className="flex justify-center items-center min-h-screen"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        <div className="mt-4 text-gray-600">Loading chapter data...</div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title="Error"
        variant="light"
        footerVariant="light"
        className="flex justify-center items-center min-h-screen"
      >
        <div className="text-center">
          <div className="text-red-600 mb-4">
            Error loading chapter: {error}
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </PageLayout>
    );
  }

  if (!chapterData) {
    return (
      <PageLayout
        title={t('translate.chapterNotFound')}
        description={t('translate.chapterNotFoundDescription')}
        variant="light"
        footerVariant="light"
      >
        <div className="text-center">
          <div className="mb-4">No chapter data found</div>
          <BackLink
            to="/$lang/content/translate/$courseId"
            label={t('translate.backToCourse')}
            className="inline-flex items-center text-orange-500 hover:text-orange-600"
          />
        </div>
      </PageLayout>
    );
  }

  const currentSlide = chapterData.slides[currentSlideIndex];

  return (
    <PageLayout
      variant="light"
      footerVariant="light"
      maxWidth="max-w-7xl"
      paddingXClasses="px-4 md:px-8"
    >
      {/* Main Content Header */}
      <div className="text-center mb-10 mt-10">
        <p className="text-orange-500 text-base font-medium mb-2">
          {t('translate.bridgingLanguageGaps', {
            defaultValue: 'Bridging language gaps, one video at a time',
          })}
        </p>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          {t('translate.bitcoinTranslationCommunity', {
            defaultValue: 'Bitcoin Proofreading Community',
          })}
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto mb-8">
          {t('translate.joinOurProofreaders', {
            defaultValue:
              'Join our proofreading team to make Bitcoin education accessible worldwide. You can help more people engage with the ecosystem and find their path to freedom!',
          })}
        </p>
      </div>

      {/* Navigation and Course Header */}
      <div className="flex flex-col gap-10 mb-10">
        {/* Back Navigation */}
        <div className="flex items-center gap-1 text-base">
          <img src={BreadcrumbArrowIcon} alt="" className="w-[8px] h-[12px]" />
          <Link
            to="/$lang/content/translate/$courseId"
            params={{ courseId }}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            {chapterData.context.courseIndex?.toUpperCase()}
          </Link>
          <img src={BreadcrumbArrowIcon} alt="" className="w-[8px] h-[12px]" />
          <span className="text-orange-500 font-medium">
            {`${chapterData.context.partIndex}.${chapterData.context.chapterIndex} ${chapterData.context.chapterTitle}`}
          </span>
        </div>

        {/* Course Header */}
        <div className="flex items-center gap-4">
          <div
            className="text-gray-700 px-3 py-1 rounded text-sm font-medium"
            style={{ backgroundColor: '#E5E5E5' }}
          >
            {chapterData.context.courseIndex?.toUpperCase()}
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {chapterData.context.courseName}
          </h2>
          <span className="ml-auto text-sm font-medium text-gray-900 text-right">
            {`${chapterData.context.partIndex}.${chapterData.context.chapterIndex} ${chapterData.context.chapterTitle}`}
          </span>
        </div>

        {/* Progress Cards - Full Width */}
        <div className="flex flex-col gap-6">
          {/* Course Progress by Chapters */}
          <div
            style={{
              backgroundColor: '#FDF1E8',
              border: '1px solid #FF5C00',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {/* Book icon */}
            <div className="flex-shrink-0">
              <img
                src={BookClosedIcon}
                alt="Course icon"
                className="w-[60px] h-[60px]"
              />
            </div>

            {/* Progress text and bar container */}
            <div className="flex-1 flex flex-col gap-3">
              {/* Progress text */}
              <div className="flex items-center gap-2">
                <img
                  src={
                    isLastChapter ? CheckCircleOrangeIcon : CheckCircleGrayIcon
                  }
                  alt="progress icon"
                  className="w-[14px] h-[14px]"
                />
                <span
                  className={`text-sm font-normal ${
                    isLastChapter ? 'text-[#853000]' : 'text-[#808080]'
                  }`}
                >
                  {t('translate.progress', { defaultValue: 'Progress' })} :{' '}
                  {overallChapterNumber}/{totalChapters}{' '}
                  {t('translate.chapters', { defaultValue: 'Chapters' })}
                </span>
              </div>

              {/* Segmented progress bar */}
              {/* Added gap between segments for improved readability */}
              <div className="flex items-center relative h-4 gap-[3px]">
                {totalChapters > 0 &&
                  Array.from({ length: totalChapters }, (_, chapterIndex) => {
                    const isCompleted = chapterIndex + 1 < overallChapterNumber;
                    const isCurrent = chapterIndex + 1 === overallChapterNumber;
                    const isFirst = chapterIndex === 0;
                    const isLast = chapterIndex === totalChapters - 1;

                    return (
                      <div
                        className={`relative flex grow overflow-visible ${
                          partEndIndexes.includes(chapterIndex) && !isLast
                            ? 'mr-[15px]'
                            : ''
                        }`}
                        key={`progress-chapter-${chapterIndex + 1}`}
                      >
                        <div
                          className={`h-4 w-1/2 ${
                            isCompleted || isCurrent
                              ? 'bg-orange-500'
                              : 'bg-gray-300'
                          } ${isFirst ? 'rounded-l-full' : ''}`}
                        />
                        <div
                          className={`h-4 w-1/2 ${
                            isCompleted ? 'bg-orange-400' : 'bg-gray-300'
                          } ${isLast ? 'rounded-r-full' : ''}`}
                        />
                        {isCurrent && (
                          <img
                            src={OrangePill}
                            className="absolute inset-0 bottom-0 left-0 m-auto h-8 w-full"
                            alt="Progress pill"
                          />
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Slide Progress within Chapter */}
          <div className="flex flex-col gap-2">
            {/* Progress text with bullet */}
            <div className="flex items-center gap-2">
              <img
                src={isLastSlide ? CheckCircleOrangeIcon : CheckCircleGrayIcon}
                alt="progress icon"
                className="w-[14px] h-[14px]"
              />
              <span
                className={`text-sm font-normal ${
                  isLastSlide ? 'text-[#853000]' : 'text-[#808080]'
                }`}
              >
                {t('translate.progress', { defaultValue: 'Progress' })} :{' '}
                {currentSlideIndex + 1}/{chapterData.slides.length}{' '}
                {t('translate.slides', { defaultValue: 'Slides' })}
              </span>
            </div>

            {/* Segmented slide progress bar */}
            <div className="flex items-center gap-1 h-[6px]">
              {chapterData.slides.map((slide, slideIndex) => {
                const isCompleted = slideIndex < currentSlideIndex;
                const isCurrent = slideIndex === currentSlideIndex;
                const isFirst = slideIndex === 0;
                const isLast = slideIndex === chapterData.slides.length - 1;

                return (
                  <div
                    key={`slide-progress-${slide.slideId}`}
                    className={`h-[6px] flex-1 rounded-full ${
                      isCompleted
                        ? 'bg-orange-400'
                        : isCurrent
                          ? 'bg-orange-500'
                          : 'bg-[#E5E5E5]'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Course Presentation Section */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-5 text-gray-900">
          {t('translate.coursePresentation', {
            defaultValue: 'Course presentation',
          })}
        </h3>
        <p className="text-gray-600 mb-10">
          {t('translate.reviewAndEditSlides', {
            defaultValue:
              "Review and edit each slide, making the necessary adjustments. Once you're finished, select 'Validate Presentation' to save your changes.",
          })}
        </p>

        {/* Grey Container for the entire editor */}
        <div
          style={{
            backgroundColor: '#F5F5F5',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0px 1px 1px 0px #00000040',
          }}
        >
          {/* Language Toggle */}
          <div className="mb-5">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900">
                {t('translate.originalLanguage', {
                  defaultValue: 'Original language',
                })}
              </span>
              <span className="text-orange-500">Français</span>
              <span className="text-gray-400">⇄</span>
              <span className="text-sm font-medium text-gray-900">
                {t('translate.translateTo', { defaultValue: 'Translate to' })}
              </span>
              <span className="text-orange-500">Italiano</span>
              <button
                type="button"
                className="ml-auto border border-[#F97316] bg-gray-100 text-[#F97316] px-4 py-1 rounded-[8px] text-sm hover:bg-orange-50 transition-colors"
              >
                {t('translate.enVersion', { defaultValue: 'EN version' })}
              </button>
            </div>
          </div>

          {/* YouTube Video Embed */}
          <div className="mb-6">
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/qBaVzibTptM"
              title="Course Presentation Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="rounded-lg"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges}
              className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('translate.saveChanges', { defaultValue: 'Save changes' })}
            </button>
            <button
              type="button"
              onClick={handleValidatePresentation}
              className="flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0"
            >
              <div
                className={`w-6 h-6 border-2 rounded-[4px] flex items-center justify-center ${
                  validationStates.presentationValidated
                    ? 'bg-orange-500 border-orange-500'
                    : 'bg-transparent border-gray-400'
                }`}
              >
                {validationStates.presentationValidated && (
                  <span className="text-white text-sm">✓</span>
                )}
              </div>
              <span className="text-gray-900 font-medium">
                {t('translate.validatePresentationPPT', {
                  defaultValue: 'Validate presentation PPT',
                })}
                <span className="ml-1 font-medium" style={{ color: '#ef4444' }}>
                  *
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Review Transcription & Generate Audio Section */}
      <div className="mt-10 mb-10">
        <h3 className="text-xl font-bold mb-5 text-gray-900">
          {t('translate.reviewTranscriptionGenerateAudio', {
            defaultValue: 'Review transcription & generate audio',
          })}
        </h3>
        <p className="text-gray-600 mb-10">
          {t('translate.reviewTranscriptionInstructions', {
            defaultValue:
              "First, check the transcription of the lecture in your language and add your changes. Then, click on 'Generate Audio' to create an audio version of it. After the audio is generated, listen to it and ensure its accuracy. If the audio is fluid and comprehensible, click on the 'Validate Audio' option. Instead, if you need to make further adjustments, you can change the text and regenerate the audio for a maximum of three times.",
          })}
        </p>

        {/* Grey Container for the transcription editor */}
        <div
          style={{
            backgroundColor: '#F5F5F5',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0px 1px 1px 0px #00000040',
          }}
        >
          {/* Language Toggle */}
          <div className="mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <span className="text-sm font-medium text-gray-900">
                  {t('translate.language', { defaultValue: 'Language' })}
                </span>
                {/* Custom select with left arrow */}
                <div className="relative">
                  <select className="appearance-none bg-white border border-[#CCCCCC] rounded-[10px] text-sm text-orange-500 w-[225px] h-[34px] pl-8 pr-3 py-1">
                    <option>English</option>
                  </select>
                  {/* Black arrow icon */}
                  <img
                    src={DroplistArrowIcon}
                    alt=""
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[11px] h-[7px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400">⇄</span>
                <span className="text-sm font-normal text-gray-900">
                  {t('translate.translateTo', { defaultValue: 'Translate to' })}
                </span>
                <span className="text-orange-500">Italiano</span>
              </div>

              <button
                type="button"
                className="bg-orange-100 text-orange-600 px-3 py-1 rounded text-sm"
              >
                {t('translate.limitTries', { defaultValue: 'Limit 2/3 tries' })}
              </button>
            </div>
          </div>

          {/* Side-by-side Translation Text Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Original Content */}
            <div className="bg-white rounded-lg p-4 min-h-[200px]">
              <div className="text-sm leading-relaxed text-gray-900">
                {currentSlide?.originalContent ||
                  'The second characteristic of a hash function is its resistance to forgery, or the so-called avalanche effect. This characteristic can be observed in a hash function if a small change to the input message results in a radical change to the output hash. If we return to our example with the input plan B and the function chat 256, we have seen that the hash generated is as follows: 24 F1 B ending in B 688. If we modify the input very slightly, this time using plan B with a lower-case B instead of the upper-case B, then the simple change of character will completely modify the output hash of chat 256. As you can see on the diagram, the axe that was 24 F1 at the start has beco...'}
              </div>
            </div>

            {/* Translated Content */}
            <div className="bg-white rounded-lg p-4 min-h-[200px]">
              <textarea
                value={currentSlide?.translatedContent || ''}
                onChange={(e) =>
                  currentSlide &&
                  handleTranslationChange(currentSlide.slideId, e.target.value)
                }
                placeholder={t('translate.enterTranslation', {
                  defaultValue: 'Enter your translation here...',
                })}
                className="w-full h-full min-h-[160px] border-0 resize-none focus:outline-none text-sm leading-relaxed bg-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleGenerateAudio}
                className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
              >
                {t('translate.generateAudio', {
                  defaultValue: 'Generate audio',
                })}
              </button>
              <button
                type="button"
                onClick={handleValidateTranscription}
                className="border border-gray-300 bg-white text-gray-700 px-6 py-2 rounded hover:bg-gray-50"
              >
                {t('translate.editTranscript', {
                  defaultValue: 'Edit transcript',
                })}
              </button>
            </div>
            <button
              type="button"
              onClick={handleValidateTranscription}
              className="flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0"
            >
              <div
                className={`w-6 h-6 border-2 rounded-[4px] flex items-center justify-center ${
                  validationStates.transcriptionValidated
                    ? 'bg-orange-500 border-orange-500'
                    : 'bg-transparent border-gray-400'
                }`}
              >
                {validationStates.transcriptionValidated && (
                  <span className="text-white text-sm">✓</span>
                )}
              </div>
              <span className="text-gray-900 font-medium">
                {t('translate.validateTranscription', {
                  defaultValue: 'Validate transcription',
                })}
                <span className="ml-1 font-medium" style={{ color: '#ef4444' }}>
                  *
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Audio Player, Validate Audio & Instructions Section */}
        <div className="flex flex-col items-center gap-[10px] px-[10px] mt-10">
          {/* Audio Player Placeholder */}
          <div
            className="rounded-lg p-4 w-full"
            style={{
              backgroundColor: '#FDF1E8',
              border: '1px solid #FF5C00',
            }}
          >
            {/* Main controls - Play button, progress bar, time */}
            <div className="flex items-center gap-4 mb-3">
              <button type="button" className="focus:outline-none">
                <img src={PlayIcon} alt="Play" className="w-[34px] h-[35px]" />
              </button>
              <div className="flex-1">
                <div className="bg-orange-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full"
                    style={{ width: '45%' }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600">0:45</span>
            </div>

            {/* Secondary controls - Rewind 15s, Speed, Forward 15s */}
            <div className="flex items-center justify-center gap-5 mt-4">
              {/* Rewind 15s */}
              <button type="button" className="focus:outline-none">
                <img
                  src={Back15Icon}
                  alt="Rewind 15 seconds"
                  className="w-[18px] h-[19.32px]"
                />
              </button>

              {/* Playback speed */}
              <span className="text-sm text-gray-900">1x</span>

              {/* Forward 15s */}
              <button type="button" className="focus:outline-none">
                <img
                  src={Forward15Icon}
                  alt="Forward 15 seconds"
                  className="w-[18px] h-[19.32px]"
                />
              </button>
            </div>
          </div>

          {/* Validate Audio Section */}
          <div className="flex flex-col items-center gap-[10px]">
            <button
              type="button"
              onClick={handleValidateAudio}
              className="flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0"
            >
              <div
                className={`w-6 h-6 border-2 rounded-[4px] flex items-center justify-center ${
                  validationStates.audioValidated
                    ? 'bg-orange-500 border-orange-500'
                    : 'bg-transparent border-gray-400'
                }`}
              >
                {validationStates.audioValidated && (
                  <span className="text-white text-sm">✓</span>
                )}
              </div>
              <span className="text-gray-900 font-medium">
                {t('translate.validateAudio', {
                  defaultValue: 'Validate audio',
                })}
                <span className="ml-1 font-medium" style={{ color: '#ef4444' }}>
                  *
                </span>
              </span>
            </button>
            <p className="text-orange-600 text-sm text-center">
              {t('translate.reviewInstructions', {
                defaultValue:
                  'Review the transcription, make any necessary corrections, and then generate the audio.',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Action Button - Next Slide or Create Video */}
      {chapterData && (
        <div className="flex justify-end">
          {isLastSlideOfCourse ? (
            <button
              type="button"
              onClick={handleCreateVideo}
              disabled={!allValidationsComplete}
              className={`px-6 py-2 rounded flex items-center gap-2 transition-colors ${
                allValidationsComplete
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={
                !allValidationsComplete
                  ? t('translate.completeAllValidations', {
                      defaultValue:
                        'Please complete all validations before proceeding',
                    })
                  : ''
              }
            >
              {t('translate.createVideo', { defaultValue: 'Create video' })}
              <span>✓</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextSlide}
              disabled={!allValidationsComplete}
              className={`px-6 py-2 rounded flex items-center gap-2 transition-colors ${
                allValidationsComplete
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={
                !allValidationsComplete
                  ? t('translate.completeAllValidations', {
                      defaultValue:
                        'Please complete all validations before proceeding to the next slide',
                    })
                  : ''
              }
            >
              {t('translate.nextSlide', { defaultValue: 'Next slide' })}
              <span>→</span>
            </button>
          )}
        </div>
      )}

      {/* Video Generation Modal */}
      <VideoGenerationModal
        isOpen={isVideoModalOpen}
        onClose={handleCloseVideoModal}
        progress={videoGenerationProgress}
        onNextChapter={handleNextChapter}
        isLastChapter={isLastChapter}
      />
    </PageLayout>
  );
}
