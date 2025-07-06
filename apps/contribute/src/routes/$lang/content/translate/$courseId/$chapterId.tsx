import { TranslationStatus } from '@blms/constants';
import { Button } from '@blms/ui';
import {
  Link,
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import BookClosedIcon from '#src/assets/icons/book_closed.svg';
import BreadcrumbArrowIcon from '#src/assets/icons/breadcrumb_navigation_arrow_orange.svg';
import CheckCircleGrayIcon from '#src/assets/icons/check_circle_gray.svg';
import CheckCircleOrangeIcon from '#src/assets/icons/check_circle_orange.svg';
// DroplistArrowIcon moved inside TranscriptionEditor component
import OrangePill from '#src/assets/icons/orange_pill_color.svg';

import { PageLayout } from '#src/components/page-layout.tsx';
import { AudioPlayer } from '#src/components/translation/audio-player.tsx';
import {
  OnlyOfficeSlideEditor,
  type OnlyOfficeSlideEditorRef,
} from '#src/components/translation/onlyoffice-slide-editor.tsx';
import { PptLinkSection } from '#src/components/translation/ppt-link.tsx';
import { TranscriptionEditor } from '#src/components/translation/transcription-editor.tsx';
import { VideoGenerationModal } from '#src/components/video-generation-modal.tsx';

import { BackLink } from '#src/molecules/backlink.tsx';
import { getLanguageName } from '#src/utils/i18n.ts';
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
  slideNumber?: number;
  pptValidated?: boolean;
  transcriptionValidated?: boolean;
  audioValidated?: boolean;
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
  const location = useLocation();
  const isCompareRoute = location.pathname.includes('/compare/');

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

  // Base file name (e.g. 1.1_0) used for PPTX/Audio resources – must be computed on every render
  const fileBaseName = React.useMemo(() => {
    if (!chapterData) return '';
    const partIdx = chapterData.context.partIndex;
    const chapIdx = chapterData.context.chapterIndex;
    const slide = chapterData.slides?.[currentSlideIndex];
    if (!slide) return '';
    const slideIdx = slide.slideNumber ?? currentSlideIndex; // slide index is already 0-based in storage
    return `${partIdx}.${chapIdx}_${slideIdx}`;
  }, [chapterData, currentSlideIndex]);

  // Track validation states for the current slide
  const [validationStates, setValidationStates] = useState({
    presentationValidated: false,
    transcriptionValidated: false,
    audioValidated: false,
  });

  // -----------------------------
  // Audio generation attempts per slide (max 3)
  // -----------------------------
  const MAX_AUDIO_TRIES = 3;

  const getAttemptKey = (slideId: string) =>
    `audioAttempts_${courseId}_${chapterId}_${slideId}`;

  const [audioAttempts, setAudioAttempts] = useState<number>(0);
  const [audioGenerating, setAudioGenerating] = useState(false);
  const [audioVersion, setAudioVersion] = useState(0);

  // Load attempts whenever slide changes
  useEffect(() => {
    if (!chapterData) return;
    const slide = chapterData.slides[currentSlideIndex];
    if (!slide) return;

    const saved = Number(
      sessionStorage.getItem(getAttemptKey(slide.slideId)) ?? '0',
    );
    setAudioAttempts(Number.isFinite(saved) ? saved : 0);
  }, [chapterData, currentSlideIndex]);

  // Video generation modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoGenerationProgress, setVideoGenerationProgress] = useState(0);

  // OnlyOffice editor ref for manual saving
  const onlyOfficeEditorRef = useRef<OnlyOfficeSlideEditorRef>(null);

  // Get target language - for now, default to French
  const targetLanguage = 'fr';
  // Determine original & target language names for display
  const originalLanguageCode = courseData?.originalLanguage ?? 'en';
  const originalLanguageName = getLanguageName(originalLanguageCode);
  const targetLanguageName = getLanguageName(targetLanguage);

  // Determine if an English version exists – for now assume true when original language is not English
  const hasEnglishVersion = originalLanguageCode.toLowerCase() !== 'en';
  const versionLabel = hasEnglishVersion
    ? 'EN version'
    : `${originalLanguageCode.toUpperCase()} version`;

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

  // Sync validation states with current slide data
  useEffect(() => {
    if (!chapterData) return;
    const slide = chapterData.slides[currentSlideIndex];
    if (!slide) return;
    setValidationStates({
      presentationValidated: slide.pptValidated ?? false,
      transcriptionValidated: slide.transcriptionValidated ?? false,
      audioValidated: slide.audioValidated ?? false,
    });
  }, [chapterData, currentSlideIndex]);

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

    let previouslyValidated = false;
    setChapterData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        slides: prev.slides.map((slide) =>
          slide.slideId === slideId
            ? {
                ...slide,
                translatedContent,
                transcriptionValidated: (() => {
                  previouslyValidated = slide.transcriptionValidated ?? false;
                  return false;
                })(),
              }
            : slide,
        ),
      };
    });

    // Reflect immediately in checkbox UI
    setValidationStates((prev) => ({
      ...prev,
      transcriptionValidated: false,
    }));

    // If the transcript was previously validated, immediately mark it unvalidated in DB
    if (previouslyValidated) {
      trpcClient.content.updateCourseTranslationSlide
        .mutate({
          courseId,
          language: targetLanguage,
          chapterId,
          slideId,
          transcriptionValidated: false,
        } as any)
        .catch((err) =>
          console.error('Error auto-unvalidating transcript', err),
        );
    }

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
        transcriptionValidated: false,
      } as any);

      setHasUnsavedChanges(false);
      console.log('Changes saved successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleValidatePresentation = async () => {
    console.log('Validate presentation clicked');

    if (!chapterData) return;
    const currentSlide = chapterData.slides[currentSlideIndex];
    if (!currentSlide) return;

    try {
      console.log('Starting presentation validation process...');

      // First, save the current document using OnlyOffice
      if (onlyOfficeEditorRef.current) {
        console.log('Triggering OnlyOffice save...');
        await onlyOfficeEditorRef.current.saveDocument();
        console.log('OnlyOffice save completed');
      } else {
        console.warn('OnlyOffice editor ref not available');
      }

      // Then update the validation state in the database
      console.log('Updating database validation state...');
      await trpcClient.content.updateCourseTranslationSlide.mutate({
        courseId,
        language: targetLanguage,
        chapterId,
        slideId: currentSlide.slideId,
        pptValidated: true,
      } as any);

      // Update local state
      setValidationStates((prev) => ({ ...prev, presentationValidated: true }));
      console.log('Presentation validation completed successfully');
    } catch (error) {
      console.error('Error validating presentation:', error);
    }
  };

  // Handle document modification (auto-uncheck validation)
  const handleDocumentModified = async () => {
    console.log('Document modified - unchecking validation');

    if (!chapterData) return;
    const currentSlide = chapterData.slides[currentSlideIndex];
    if (!currentSlide) return;

    try {
      // Update database to mark as unvalidated
      await trpcClient.content.updateCourseTranslationSlide.mutate({
        courseId,
        language: targetLanguage,
        chapterId,
        slideId: currentSlide.slideId,
        pptValidated: false,
      } as any);

      // Update local state
      setValidationStates((prev) => ({
        ...prev,
        presentationValidated: false,
      }));
    } catch (error) {
      console.error('Error updating validation state:', error);
    }
  };

  const handleGenerateAudio = async () => {
    if (audioAttempts >= MAX_AUDIO_TRIES) return;

    console.log('Generate audio clicked');

    if (!chapterData) return;
    const currentSlide = chapterData.slides[currentSlideIndex];
    if (!currentSlide) return;

    try {
      const response = await fetch('/api/translation-audio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          partId: currentSlide.partId,
          chapterId,
          slideId: currentSlide.slideId,
          fileName: fileBaseName,
          language: targetLanguage,
          text: currentSlide.translatedContent || '',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to start audio generation');
      }

      const data = await response.json();
      console.log('Audio generation task started:', data);

      // Mark audio as unvalidated in DB immediately
      try {
        await trpcClient.content.updateCourseTranslationSlide.mutate({
          courseId,
          language: targetLanguage,
          chapterId,
          slideId: currentSlide.slideId,
          audioValidated: false,
        } as any);
      } catch (err) {
        console.warn('Failed to mark audio unvalidated', err);
      }

      const toolkitTaskId = data.toolkitTask?.task_id;

      // Increment attempt count & persist
      const newAttempts = audioAttempts + 1;
      setAudioAttempts(newAttempts);
      sessionStorage.setItem(
        getAttemptKey(currentSlide.slideId),
        String(newAttempts),
      );

      // Start polling Language-Toolkit status if task_id present
      if (toolkitTaskId) {
        setAudioGenerating(true);

        const pollStart = Date.now();

        const poll = async () => {
          try {
            const statResp = await fetch(
              `/api/translation-audio/tasks/${toolkitTaskId}`,
              {
                credentials: 'include',
              },
            );
            if (!statResp.ok) throw new Error('Status fetch failed');
            const stat = await statResp.json();

            if (stat.status === 'completed') {
              setAudioGenerating(false);
              setAudioVersion(Date.now()); // bust cache
              return; // stop polling
            }
          } catch (err) {
            console.error('Polling error', err);
          }

          if (Date.now() - pollStart < 2 * 60 * 1000) {
            setTimeout(poll, 3000);
          } else {
            setAudioGenerating(false);
            console.warn('Audio generation timeout');
          }
        };

        setTimeout(poll, 3000);
      }

      // Optimistically reset validation until user reviews the new audio
      setValidationStates((prev) => ({ ...prev, audioValidated: false }));
    } catch (error) {
      console.error('Error generating audio:', error);
    }
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
      await trpcClient.content.updateCourseTranslationSlide.mutate({
        courseId,
        language: targetLanguage,
        chapterId,
        slideId: currentSlide.slideId,
        translatedContent: currentSlide.translatedContent || '',
        status: TranslationStatus.InProgress,
        transcriptionValidated: true,
      } as any);

      setValidationStates((prev) => ({
        ...prev,
        transcriptionValidated: true,
      }));

      setHasUnsavedChanges(false);

      console.log('Transcription validated and saved successfully');
    } catch (error) {
      console.error('Error saving transcription:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleValidateAudio = async () => {
    console.log('Validate audio clicked');
    setValidationStates((prev) => ({ ...prev, audioValidated: true }));

    if (!chapterData) return;
    const currentSlide = chapterData.slides[currentSlideIndex];
    if (!currentSlide) return;

    try {
      await trpcClient.content.updateCourseTranslationSlide.mutate({
        courseId,
        language: targetLanguage,
        chapterId,
        slideId: currentSlide.slideId,
        audioValidated: true,
      } as any);
    } catch (error) {
      console.error('Error validating audio:', error);
    }
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
    setIsVideoModalOpen(true);
    setVideoGenerationProgress(0);

    try {
      const resp = await trpcClient.content.generateCourseVideo.mutate({
        courseId,
        language: targetLanguage,
      });

      const { toolkitTask, accessToken } = resp as any;
      if (toolkitTask?.task_id) {
        pollToolkitTask(toolkitTask.task_id, accessToken);
      } else {
        // Fallback to simulated progress if no task id
        simulateVideoGeneration();
      }
    } catch (err) {
      console.error('Error generating video', err);
      // fallback
      simulateVideoGeneration();
    }
  };

  const pollToolkitTask = (taskId: string, accessToken: string) => {
    const toolkitUrl =
      import.meta.env.VITE_LANG_TOOLKIT_URL ?? 'http://localhost:8000';
    let pollCount = 0;
    const maxPolls = 120; // 10 minutes max polling (5s intervals)

    const interval = setInterval(async () => {
      pollCount++;
      try {
        const res = await fetch(`${toolkitUrl}/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) throw new Error(`Status: ${res.status}`);

        const data = await res.json();
        console.log('Task status:', data);

        if (data.status === 'completed') {
          setVideoGenerationProgress(100);
          clearInterval(interval);
          console.log('Video generation completed successfully');
        } else if (data.status === 'failed') {
          clearInterval(interval);
          console.error('Toolkit task failed', data.error);
          // You might want to show an error message to the user here
        } else if (data.status === 'running' || data.status === 'pending') {
          // Update progress based on messages or progress field
          if (data.progress) {
            // Try to extract percentage from progress message
            const match = /([0-9]+)%/.exec(data.progress);
            if (match) {
              setVideoGenerationProgress(Number(match[1]));
            } else {
              // If no percentage, estimate based on time elapsed
              const estimatedProgress = Math.min(
                90,
                (pollCount / maxPolls) * 100,
              );
              setVideoGenerationProgress(estimatedProgress);
            }
          } else {
            // Estimate progress based on polling count
            const estimatedProgress = Math.min(
              90,
              (pollCount / maxPolls) * 100,
            );
            setVideoGenerationProgress(estimatedProgress);
          }
        }

        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          clearInterval(interval);
          console.warn('Video generation timeout - stopped polling');
        }
      } catch (e) {
        console.error('Polling error', e);
        if (pollCount >= 3) {
          // Stop after 3 consecutive errors
          clearInterval(interval);
          console.error('Too many polling errors, stopping');
        }
      }
    }, 5000);
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

  if (!isCompareRoute && loading) {
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

  if (!isCompareRoute && error) {
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

  if (!isCompareRoute && !chapterData) {
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

  const currentSlide = chapterData?.slides?.[currentSlideIndex];

  if (isCompareRoute) {
    return <Outlet />;
  }

  return (
    <PageLayout
      variant="light"
      footerVariant="light"
      maxWidth="max-w-7xl"
      paddingXClasses="px-4"
    >
      {/* Main Content Header */}
      <div className="text-center mb-10 mt-10">
        <p className="text-orange-500 text-base font-medium mb-2">
          {t('translate.bridgingLanguageGaps', {
            defaultValue: 'Bridging language gaps, one video at a time',
          })}
        </p>
        <h1
          className="mb-4 text-gray-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
          style={{
            fontFamily: 'Rubik, sans-serif',
            fontWeight: 400,
            lineHeight: '117%',
          }}
        >
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
            {chapterData?.context.courseIndex?.toUpperCase()}
          </Link>
          <img src={BreadcrumbArrowIcon} alt="" className="w-[8px] h-[12px]" />
          <span className="text-orange-500 font-medium">
            {chapterData
              ? `${chapterData.context.partIndex}.${chapterData.context.chapterIndex} ${chapterData.context.chapterTitle}`
              : ''}
          </span>
        </div>

        {/* Course Header */}
        <div className="flex items-center gap-4">
          <div
            className="text-gray-700 px-3 py-1 rounded text-sm font-medium"
            style={{ backgroundColor: '#E5E5E5' }}
          >
            {chapterData?.context.courseIndex?.toUpperCase()}
          </div>
          <h2
            className="text-gray-900 text-xl sm:text-2xl md:text-3xl lg:text-4xl"
            style={{
              fontFamily: 'Rubik, sans-serif',
              fontWeight: 500,
              lineHeight: '120%',
            }}
          >
            {chapterData?.context.courseName}
          </h2>
          <span className="ml-auto text-sm font-medium text-gray-900 text-right">
            {chapterData
              ? `${chapterData.context.partIndex}.${chapterData.context.chapterIndex} ${chapterData.context.chapterTitle}`
              : ''}
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
                {currentSlideIndex + 1}/{chapterData!.slides.length}{' '}
                {t('translate.slides', { defaultValue: 'Slides' })}
              </span>
            </div>

            {/* Segmented slide progress bar */}
            <div className="flex items-center gap-1 h-[6px]">
              {chapterData!.slides.map((slide, slideIndex) => {
                const isCompleted = slideIndex < currentSlideIndex;
                const isCurrent = slideIndex === currentSlideIndex;
                const isFirst = slideIndex === 0;
                const isLast = slideIndex === chapterData!.slides.length - 1;

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
        <h3
          className="mb-5 text-gray-900 font-semibold text-[24px]"
          style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
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

        {/* --- ONLYOFFICE (Beta) Duplicate Editor --- */}
        <div
          style={{
            backgroundColor: '#F5F5F5',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0px 1px 1px 0px #00000040',
            marginTop: '40px',
          }}
        >
          {/* OnlyOffice header removed per UI request */}
          {/* Language info header (inside PPT box) */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-[10px]">
              <span
                className="text-base sm:text-lg md:text-xl font-semibold text-gray-900"
                style={{ fontFamily: 'Rubik, sans-serif' }}
              >
                {t('translate.originalLanguage', {
                  defaultValue: 'Language',
                })}
              </span>
              <span
                className="text-orange-500 text-base sm:text-lg md:text-xl"
                style={{ fontFamily: 'Rubik, sans-serif' }}
              >
                {originalLanguageName}
              </span>
              <span className="text-gray-400">⇄</span>
              <span
                className="text-base sm:text-lg md:text-xl font-semibold text-gray-900"
                style={{ fontFamily: 'Rubik, sans-serif' }}
              >
                {t('translate.translateTo', { defaultValue: 'Translate to' })}
              </span>
              <span
                className="text-orange-500 text-base sm:text-lg md:text-xl"
                style={{ fontFamily: 'Rubik, sans-serif' }}
              >
                {targetLanguageName}
              </span>
            </div>
            <Link
              to="/$lang/content/translate/$courseId/$chapterId/compare/$slideIndex"
              params={{
                lang: i18n.language,
                courseId,
                chapterId,
                slideIndex: String(currentSlideIndex),
              }}
              className="hidden md:block"
            >
              <Button
                type="button"
                variant="outline"
                size="s"
                className="text-orange-500 border-orange-500 bg-transparent hover:bg-orange-50"
              >
                {versionLabel}
              </Button>
            </Link>
          </div>

          <div className="mb-6">
            <OnlyOfficeSlideEditor
              ref={onlyOfficeEditorRef}
              fileUrl={
                currentSlide
                  ? `/api/translation-downloads/pptx/${courseId}/${targetLanguage}/${currentSlide.partId}/${chapterId}/${currentSlide.slideId}/${fileBaseName}`
                  : null
              }
              className="w-full"
              onDocumentModified={handleDocumentModified}
              courseId={courseId}
              partId={currentSlide?.partId}
              chapterId={chapterId}
              slideId={currentSlide?.slideId}
              fileName={fileBaseName}
              language={targetLanguage}
            />
          </div>

          <PptLinkSection
            courseId={courseId}
            partId={currentSlide?.partId ?? ''}
            chapterId={chapterId}
            slideId={currentSlide?.slideId ?? ''}
            fileName={fileBaseName}
            language={targetLanguage}
            onValidate={handleValidatePresentation}
            validated={validationStates.presentationValidated}
            leftComponent={
              <Link
                to="/$lang/content/translate/$courseId/$chapterId/compare/$slideIndex"
                params={{
                  lang: i18n.language,
                  courseId,
                  chapterId,
                  slideIndex: String(currentSlideIndex),
                }}
                className="md:hidden"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="s"
                  className="text-orange-500 border-orange-500 bg-transparent hover:bg-orange-50"
                >
                  {versionLabel}
                </Button>
              </Link>
            }
          />
        </div>
      </div>

      {/* Review Transcription & Generate Audio Section */}
      <div className="mt-10 mb-10">
        <h3
          className="mb-5 text-gray-900 font-semibold text-[24px]"
          style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
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

        <TranscriptionEditor
          originalContent={currentSlide?.originalContent || ''}
          translatedContent={currentSlide?.translatedContent || ''}
          onTranslationChange={(value) =>
            currentSlide && handleTranslationChange(currentSlide.slideId, value)
          }
          onGenerateAudio={handleGenerateAudio}
          onValidateTranscription={handleValidateTranscription}
          transcriptionValidated={validationStates.transcriptionValidated}
          generateDisabled={audioAttempts >= MAX_AUDIO_TRIES}
          triesLabel={
            audioAttempts >= MAX_AUDIO_TRIES
              ? 'You have no more tries'
              : `Limit ${audioAttempts}/${MAX_AUDIO_TRIES} tries`
          }
        />

        {/* Max tries reached notice */}
        {audioAttempts >= MAX_AUDIO_TRIES && (
          <p
            className="my-10 text-center text-base leading-[150%] font-normal tracking-[0.15px]"
            style={{ color: '#FF5C00' }}
          >
            {t('translate.maxAudioTriesReached', {
              defaultValue:
                'You’ve reached the maximum number of audio generations. To request an additional attempt, please contact the coordinator.',
            })}
          </p>
        )}

        <AudioPlayer
          courseId={courseId}
          partId={currentSlide?.partId ?? ''}
          chapterId={chapterId}
          slideId={currentSlide?.slideId ?? ''}
          fileName={fileBaseName}
          language={targetLanguage}
          validated={validationStates.audioValidated}
          onValidate={handleValidateAudio}
          generating={audioGenerating}
          version={audioVersion}
        />
      </div>

      {/* Action Button - Next Slide or Create Video */}
      {chapterData && (
        <div className="flex justify-end">
          {isLastSlideOfCourse ? (
            <Button
              onClick={handleCreateVideo}
              disabled={!allValidationsComplete}
              size="m"
              variant="primary"
              className="shadow-[0_2px_3px_rgba(0,0,0,0.25)] flex gap-[10px] text-[18px] leading-[18px] font-medium"
              title={
                !allValidationsComplete
                  ? t('translate.completeAllValidations', {
                      defaultValue:
                        'Please complete all validations before proceeding',
                    })
                  : undefined
              }
            >
              {t('translate.createVideo', { defaultValue: 'Create video' })}
              <span>✓</span>
            </Button>
          ) : (
            <Button
              onClick={handleNextSlide}
              disabled={!allValidationsComplete}
              size="m"
              variant="primary"
              className="shadow-[0_2px_3px_rgba(0,0,0,0.25)] flex gap-[10px] text-[18px] leading-[18px] font-medium"
              title={
                !allValidationsComplete
                  ? t('translate.completeAllValidations', {
                      defaultValue:
                        'Please complete all validations before proceeding to the next slide',
                    })
                  : undefined
              }
            >
              {t('translate.nextSlide', { defaultValue: 'Next slide' })}
              <span>→</span>
            </Button>
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
