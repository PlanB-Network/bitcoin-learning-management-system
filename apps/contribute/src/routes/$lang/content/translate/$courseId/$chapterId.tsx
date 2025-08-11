import { TranslationStatus } from '@blms/constants';
import { Button } from '@blms/ui';
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BookClosedIcon from '#src/assets/icons/book_closed.svg';
import BreadcrumbArrowIcon from '#src/assets/icons/breadcrumb_navigation_arrow_orange.svg';
import CheckCircleGrayIcon from '#src/assets/icons/check_circle_gray.svg';
import CheckCircleOrangeIcon from '#src/assets/icons/check_circle_orange.svg';
// DroplistArrowIcon moved inside TranscriptionEditor component
import OrangePill from '#src/assets/icons/orange_pill_color.svg';

import { PageLayout } from '#src/components/page-layout.tsx';
import { AudioPlayer } from '#src/components/translation/audio-player.tsx';
import { ValidatedPptEditor } from '#src/components/translation/validated-ppt-editor.tsx';
import { LanguageDropdown } from '#src/components/ui/language-dropdown.tsx';
import { LoadingSpinner } from '#src/components/ui/loading-spinner.tsx';
import { ValidationCheckbox } from '#src/components/ui/validation-checkbox.tsx';
import { VideoGenerationModal } from '#src/components/video-generation-modal.tsx';
import { useTranscriptAvailability } from '#src/hooks/useTranscriptAvailability.ts';
import { BackLink } from '#src/molecules/backlink.tsx';
import { getLanguageName } from '#src/utils/i18n.ts';
import { buildPptxUrl } from '#src/utils/index.ts';
import { getDefaultTranscriptLanguageCode } from '#src/utils/language-utils.ts';
import { trpcClient } from '#src/utils/trpc.ts';

export const Route = createFileRoute(
  '/$lang/content/translate/$courseId/$chapterId',
)({
  component: ChapterTranslationPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      targetLanguage: search.targetLanguage as string,
      startAtLastSlide: search.startAtLastSlide as boolean,
    };
  },
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
  audioTries?: number;
  pptResourcePath: string | null;
  audioResourcePath: string | null;
  originalContent: string | null;
  translatedContent: string | null;
  professorName?: string | null;
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
  const searchParams = Route.useSearch();
  const location = useLocation();
  const isCompareRoute = location.pathname.includes('/compare/');

  const navigate = useNavigate();
  const [chapterData, setChapterData] = useState<ChapterTranslationData | null>(
    null,
  );
  const [courseData, setCourseData] = useState<any>(null);
  const [totalChapters, setTotalChapters] = useState<number>(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Note: fileBaseName is no longer used for file URLs but kept for audio generation API compatibility
  const fileBaseName = React.useMemo(() => {
    if (!chapterData) return '';
    const partIdx = chapterData.context.partIndex;
    const chapIdx = chapterData.context.chapterIndex;
    const slide = chapterData.slides?.[currentSlideIndex];
    if (!slide) return '';
    // Convert 1-based slideNumber from database to 0-based for filename
    const slideIdx = slide.slideNumber
      ? slide.slideNumber - 1
      : currentSlideIndex;
    return `${partIdx}.${chapIdx}_${slideIdx}`;
  }, [chapterData, currentSlideIndex]);

  // Track validation states for the current slide
  const [validationStates, setValidationStates] = useState({
    presentationValidated: false,
    transcriptionValidated: false,
    audioValidated: false,
  });

  // Track PPT validation changes per slide during current session
  const [pptValidationChanges, setPptValidationChanges] = useState<
    Record<string, boolean>
  >({});

  // Track PPT saving loading state to prevent premature navigation
  const [pptSaving, setPptSaving] = useState(false);

  // -----------------------------
  // Audio generation attempts per slide (max 3)
  // -----------------------------
  const MAX_AUDIO_TRIES = 3;

  // Track audio generation attempts for the current slide. We rely on the
  // database's `audio_tries` column instead of any client-side storage.
  const [audioAttempts, setAudioAttempts] = useState<number>(0);
  const [audioGenerating, setAudioGenerating] = useState(false);
  const [audioVersion, setAudioVersion] = useState(0);

  // ----------------------------
  // Original transcript language selector (same logic as compare view)
  // ----------------------------

  const [
    selectedOriginalTranscriptLanguage,
    setSelectedOriginalTranscriptLanguage,
  ] = useState<string>('');
  const {
    options: transcriptLanguageAvailability,
    loading: transcriptLanguagesLoading,
  } = useTranscriptAvailability({
    courseId,
    partId: chapterData?.slides?.[currentSlideIndex]?.partId ?? '',
    chapterId,
    slideId: chapterData?.slides?.[currentSlideIndex]?.slideId ?? '',
    originalLanguage: courseData?.originalLanguage ?? 'en',
  });
  const [transcriptContentCache, setTranscriptContentCache] = useState<
    Record<string, string | null>
  >({});

  // Determine default transcript language using shared logic
  const transcriptDefaultCode = React.useMemo(() => {
    return getDefaultTranscriptLanguageCode(
      transcriptLanguageAvailability,
      courseData?.originalLanguage ?? 'en',
    );
  }, [transcriptLanguageAvailability, courseData]);

  // Removed redundant helper function – replaced by shared hook

  // Load attempts whenever slide changes
  useEffect(() => {
    if (!chapterData) return;
    const slide = chapterData.slides[currentSlideIndex];
    if (!slide) return;

    // Initialise attempts from the database field only – no cookie/sessionStorage fallback
    const fromDb = slide.audioTries ?? 0;
    setAudioAttempts(fromDb);
  }, [chapterData, currentSlideIndex]);

  // Video generation modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoGenerationProgress, setVideoGenerationProgress] = useState(0);

  // Get target language from route params or localStorage (aligned with slideIndex.tsx)
  const targetLanguage =
    searchParams?.targetLanguage ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('targetLanguage')
      : null) ||
    'fr';
  // Determine original & target language names for display
  const originalLanguageCode = courseData?.originalLanguage ?? 'en';
  const originalLanguageName = getLanguageName(originalLanguageCode);
  const targetLanguageName = getLanguageName(targetLanguage);

  // Determine if an English version exists – for now assume true when original language is not English
  const hasEnglishVersion = originalLanguageCode.toLowerCase() !== 'en';
  const versionLabel = hasEnglishVersion
    ? 'EN version'
    : `${originalLanguageCode.toUpperCase()} version`;

  // Check if all validations are complete for the current slide and PPT is not being saved
  const allValidationsComplete =
    validationStates.presentationValidated &&
    validationStates.transcriptionValidated &&
    validationStates.audioValidated &&
    !pptSaving;

  // Check if this is the last slide
  const isLastSlide = chapterData
    ? currentSlideIndex === chapterData.slides.length - 1
    : false;

  // Check if this is the first slide
  const isFirstSlide = currentSlideIndex === 0;

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

  // Find first incomplete slide when chapter data loads initially
  useEffect(() => {
    if (!chapterData || !initialLoad) return;

    // Check if we should start at the last slide (coming from previous chapter navigation)
    if (searchParams?.startAtLastSlide) {
      console.log('Starting at last slide (from previous chapter navigation)');
      setCurrentSlideIndex(chapterData.slides.length - 1);
      setInitialLoad(false);
      return;
    }

    // Find first slide that doesn't have all validations complete
    const firstIncompleteSlideIndex = chapterData.slides.findIndex((slide) => {
      return !(
        slide.pptValidated &&
        slide.transcriptionValidated &&
        slide.audioValidated
      );
    });

    // If we found an incomplete slide and it's not the first one, navigate to it
    if (firstIncompleteSlideIndex > 0) {
      console.log(
        `Starting at first incomplete slide: ${firstIncompleteSlideIndex + 1}/${chapterData.slides.length}`,
      );
      setCurrentSlideIndex(firstIncompleteSlideIndex);
    } else if (firstIncompleteSlideIndex === -1) {
      // All slides are complete, start at the last slide
      console.log('All slides are complete, starting at last slide');
      setCurrentSlideIndex(chapterData.slides.length - 1);
    }
    // If firstIncompleteSlideIndex === 0, we're already at the right slide

    setInitialLoad(false);
  }, [chapterData, initialLoad, searchParams?.startAtLastSlide]);

  // Track the current slide ID to detect when we actually change slides
  const [previousSlideId, setPreviousSlideId] = useState<string | null>(null);

  // Sync validation states with current slide data only when slide actually changes
  useEffect(() => {
    if (!chapterData) return;
    const slide = chapterData.slides[currentSlideIndex];
    if (!slide) return;

    // Only update validation states if this is a new slide or first load
    if (slide.slideId !== previousSlideId) {
      setValidationStates({
        presentationValidated: slide.pptValidated ?? false,
        transcriptionValidated: slide.transcriptionValidated ?? false,
        audioValidated: slide.audioValidated ?? false,
      });
      setPreviousSlideId(slide.slideId);

      // Reset source transcript cache when slide changes
      setTranscriptContentCache({});
    }
  }, [chapterData, currentSlideIndex, previousSlideId]);

  // Transcript language availability now handled by useTranscriptAvailability – legacy effect removed

  // ----------------------------
  // Load transcript content for selected language
  // ----------------------------
  useEffect(() => {
    const loadTranscriptContent = async () => {
      const effective =
        selectedOriginalTranscriptLanguage || transcriptDefaultCode;
      if (!effective) return;
      if (!chapterData) return;

      const lang = effective;
      const slide = chapterData.slides[currentSlideIndex];
      if (!slide) return;

      if (Object.hasOwn(transcriptContentCache, lang)) return;

      if (lang === (courseData?.originalLanguage ?? 'en')) {
        setTranscriptContentCache((prev) => ({
          ...prev,
          [lang]: slide.originalContent,
        }));
        return;
      }

      try {
        const resp = await trpcClient.content.getCourseTranslationSlides.query({
          courseId,
          language: lang,
          chapterId,
        });
        const otherSlide = resp?.slides?.[currentSlideIndex];
        setTranscriptContentCache((prev) => ({
          ...prev,
          // For target languages show AI generated content to proofread
          [lang]: (otherSlide as any)?.aiTranslatedContent ?? null,
        }));
      } catch (err) {
        console.warn('Could not load transcript content', err);
        setTranscriptContentCache((prev) => ({ ...prev, [lang]: null }));
      }
    };

    loadTranscriptContent();
  }, [
    selectedOriginalTranscriptLanguage,
    transcriptDefaultCode,
    currentSlideIndex,
    courseId,
    chapterId,
    transcriptContentCache,
    chapterData,
  ]);

  const effectiveTranscriptLang =
    selectedOriginalTranscriptLanguage || transcriptDefaultCode || '';
  const displayedOriginalTranscript =
    effectiveTranscriptLang === (courseData?.originalLanguage ?? 'en')
      ? chapterData?.slides?.[currentSlideIndex]?.originalContent
      : transcriptContentCache[effectiveTranscriptLang];

  // Initialize transcript language selection when availability is ready
  useEffect(() => {
    if (
      !selectedOriginalTranscriptLanguage &&
      transcriptLanguageAvailability.length > 0 &&
      courseData
    ) {
      // Only select languages that are actually available, prioritize original language
      const originalCode = courseData.originalLanguage ?? 'en';
      const original = transcriptLanguageAvailability.find(
        (o) => o.code === originalCode && o.available,
      )?.code;
      const english = transcriptLanguageAvailability.find(
        (o) => o.code === 'en' && o.available,
      )?.code;
      const any = transcriptLanguageAvailability.find((o) => o.available)?.code;

      // Priority: original language first, then English, then any available
      const selectedCode = original || english || any || '';
      if (selectedCode) {
        setSelectedOriginalTranscriptLanguage(selectedCode);
      }
    }
  }, [
    transcriptLanguageAvailability,
    selectedOriginalTranscriptLanguage,
    courseData,
  ]);

  // Loading state for transcript content: when a non-original language is selected but not yet cached
  const selectedTranscriptIsOriginal =
    selectedOriginalTranscriptLanguage ===
    (courseData?.originalLanguage ?? 'en');
  const transcriptHasCacheEntry = selectedOriginalTranscriptLanguage
    ? Object.hasOwn(transcriptContentCache, selectedOriginalTranscriptLanguage)
    : false;
  const isTranscriptLoading = Boolean(
    (!selectedOriginalTranscriptLanguage ||
      (!selectedTranscriptIsOriginal && !transcriptHasCacheEntry)) &&
      !transcriptLanguagesLoading,
  );

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

  const fetchChapterData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setInitialLoad(true); // Reset initial load flag when fetching new chapter data

      // Fetch both chapter data and course data in parallel
      const [chapterDataResp, courseDataResp] = await Promise.all([
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

      setChapterData(chapterDataResp);
      setCourseData(courseDataResp);

      if (courseDataResp?.parts) {
        const totalChaptersCount = courseDataResp.parts.reduce(
          (total, part) => total + (part.chapters?.length || 0),
          0,
        );
        setTotalChapters(totalChaptersCount);
      }
    } catch (error) {
      console.error('Error fetching chapter translation data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [courseId, chapterId, targetLanguage]);

  // Initial fetch & when route params change
  useEffect(() => {
    if (!isCompareRoute) {
      fetchChapterData();
    }
  }, [fetchChapterData, isCompareRoute]);

  // Set slide status to under_review when user starts working on a ready_for_review slide
  useEffect(() => {
    const setSlideUnderReview = async () => {
      if (!chapterData || isCompareRoute) return;

      const currentSlide = chapterData.slides[currentSlideIndex];
      if (!currentSlide || currentSlide.status !== 'ready_for_review') return;

      try {
        await trpcClient.content.updateCourseTranslationSlide.mutate({
          courseId,
          language: targetLanguage,
          chapterId,
          slideId: currentSlide.slideId,
          status: TranslationStatus.UnderReview,
        } as any);

        // Update local state to reflect the change
        setChapterData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            slides: prev.slides.map((slide) =>
              slide.slideId === currentSlide.slideId
                ? { ...slide, status: TranslationStatus.UnderReview }
                : slide,
            ),
          };
        });
      } catch (error) {
        console.error('Error setting slide to under_review:', error);
      }
    };

    setSlideUnderReview();
  }, [
    chapterData,
    currentSlideIndex,
    courseId,
    targetLanguage,
    chapterId,
    isCompareRoute,
  ]);

  const handleTranslationChange = (
    slideId: string,
    translatedContent: string,
  ) => {
    if (!chapterData) return;

    let previouslyTranscriptionValidated = false;
    let previouslyAudioValidated = false;
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
                  previouslyTranscriptionValidated =
                    slide.transcriptionValidated ?? false;
                  return false;
                })(),
                audioValidated: (() => {
                  previouslyAudioValidated = slide.audioValidated ?? false;
                  return false;
                })(),
              }
            : slide,
        ),
      };
    });

    // Reflect immediately in checkbox UI, but preserve presentationValidated
    setValidationStates((prev) => ({
      ...prev,
      transcriptionValidated: false,
      audioValidated: false,
    }));

    // If the transcript or audio was previously validated, immediately mark them unvalidated in DB
    // Also reset audio tries since the transcription has changed
    // Explicitly maintain under_review status while contributor is working
    if (previouslyTranscriptionValidated || previouslyAudioValidated) {
      trpcClient.content.updateCourseTranslationSlide
        .mutate({
          courseId,
          language: targetLanguage,
          chapterId,
          slideId,
          transcriptionValidated: false,
          audioValidated: false,
          status: TranslationStatus.UnderReview,
        } as any)
        .catch((err) =>
          console.error('Error auto-unvalidating transcript and audio', err),
        );
    }
  };

  const _handleValidatePresentation = async () => {
    console.log('Validate presentation clicked');

    if (!chapterData) return;
    const currentSlide = chapterData.slides[currentSlideIndex];
    if (!currentSlide) return;

    try {
      console.log('Starting presentation validation process...');

      // Update the validation state in the database
      console.log('Updating database validation state...');
      await trpcClient.content.updateCourseTranslationSlide.mutate({
        courseId,
        language: targetLanguage,
        chapterId,
        slideId: currentSlide.slideId,
        pptValidated: true,
        status: TranslationStatus.UnderReview,
      } as any);

      // Update local state
      setValidationStates((prev) => ({ ...prev, presentationValidated: true }));
      console.log('Presentation validation completed successfully');
    } catch (error) {
      console.error('Error validating presentation:', error);
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
          professor: currentSlide.professorName || undefined,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to start audio generation');
      }

      const data = await response.json();
      console.log('Audio generation task started:', data);

      // Increment attempt count & persist
      const newAttempts = audioAttempts + 1;

      // Mark audio as unvalidated in DB immediately and store attempts
      // Explicitly maintain under_review status while contributor is working
      try {
        await trpcClient.content.updateCourseTranslationSlide.mutate({
          courseId,
          language: targetLanguage,
          chapterId,
          slideId: currentSlide.slideId,
          audioValidated: false,
          audioTries: newAttempts,
          status: TranslationStatus.UnderReview,
        } as any);
      } catch (err) {
        console.warn('Failed to mark audio unvalidated', err);
      }

      // Update local attempts state (no persistence to cookies / sessionStorage)
      setAudioAttempts(newAttempts);

      const toolkitTaskId = data.toolkitTask?.task_id;

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
        status: TranslationStatus.UnderReview,
        transcriptionValidated: true,
      } as any);

      setValidationStates((prev) => ({
        ...prev,
        transcriptionValidated: true,
      }));

      // setHasUnsavedChanges(false); // removed unused state

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
        status: TranslationStatus.UnderReview,
      } as any);
    } catch (error) {
      console.error('Error validating audio:', error);
    }
  };

  const handleNextSlide = async () => {
    if (!chapterData || !courseData) return;

    const currentSlide = chapterData.slides[currentSlideIndex];

    // Mark current slide as reviewed if all validations are complete and status is under_review
    if (
      currentSlide &&
      allValidationsComplete &&
      currentSlide.status === 'under_review'
    ) {
      try {
        await trpcClient.content.updateCourseTranslationSlide.mutate({
          courseId,
          language: targetLanguage,
          chapterId,
          slideId: currentSlide.slideId,
          status: TranslationStatus.Reviewed,
        } as any);

        // Update local state to reflect the change
        setChapterData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            slides: prev.slides.map((slide) =>
              slide.slideId === currentSlide.slideId
                ? { ...slide, status: TranslationStatus.Reviewed }
                : slide,
            ),
          };
        });
      } catch (error) {
        console.error('Error marking slide as reviewed:', error);
      }
    }

    // Generate PNG image for the current slide only if PPT was re-validated during this session
    // Run in background without blocking navigation
    const shouldGeneratePng =
      pptValidationChanges[currentSlide.slideId] === true;

    if (shouldGeneratePng) {
      console.log(
        'Starting PNG generation in background (PPT was re-validated)...',
      );

      // Run PNG generation in background without awaiting
      fetch('/api/translation-downloads/generate-png', {
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
          language: targetLanguage,
        }),
      })
        .then(async (pngResponse) => {
          if (pngResponse.ok) {
            const pngResult = await pngResponse.json();
            console.log('PNG generation successful:', pngResult);
          } else {
            console.warn('PNG generation failed:', await pngResponse.text());
          }
        })
        .catch((error) => {
          console.error('Error generating PNG:', error);
        });
    } else {
      console.log(
        'Skipping PNG generation - PPT was not re-validated during this session',
      );
    }

    // If there are more slides in the current chapter, just go to the next one
    if (currentSlideIndex < chapterData.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      // Reset validation states for the new slide
      setValidationStates({
        presentationValidated: false,
        transcriptionValidated: false,
        audioValidated: false,
      });

      // Clear the PPT validation change tracking for the previous slide
      if (currentSlide) {
        setPptValidationChanges((prev) => {
          const updated = { ...prev };
          delete updated[currentSlide.slideId];
          return updated;
        });
      }
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

  const handlePreviousSlide = () => {
    if (!chapterData) return;

    // If there are previous slides in the current chapter, just go to the previous one
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      return;
    }

    // We are on the first slide of the current chapter
    // Determine if there is a previous chapter in the course
    if (!courseData) return;

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

    if (currentChapterIndex > 0) {
      // Navigate to the last slide of the previous chapter
      const previousChapter = allChapters[currentChapterIndex - 1];
      navigate({
        to: '/$lang/content/translate/$courseId/$chapterId',
        params: {
          lang: i18n.language,
          courseId,
          chapterId: previousChapter.chapterId,
        },
        search: { startAtLastSlide: true }, // Add a search param to indicate starting at last slide
      });
    }
    // If there is no previous chapter, do nothing (first slide of first chapter)
  };

  const handleCreateVideo = async () => {
    if (!chapterData) return;

    const currentSlide = chapterData.slides[currentSlideIndex];

    // Mark current slide as reviewed if all validations are complete and status is under_review
    if (
      currentSlide &&
      allValidationsComplete &&
      currentSlide.status === 'under_review'
    ) {
      try {
        await trpcClient.content.updateCourseTranslationSlide.mutate({
          courseId,
          language: targetLanguage,
          chapterId,
          slideId: currentSlide.slideId,
          status: TranslationStatus.Reviewed,
        } as any);

        // Update local state to reflect the change
        setChapterData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            slides: prev.slides.map((slide) =>
              slide.slideId === currentSlide.slideId
                ? { ...slide, status: TranslationStatus.Reviewed }
                : slide,
            ),
          };
        });
      } catch (error) {
        console.error('Error marking slide as reviewed:', error);
      }
    }

    // If this is the last slide of the last chapter, mark the translation assignment as completed
    if (isLastSlideOfCourse) {
      try {
        await trpcClient.user.translation.completeTranslation.mutate({
          courseId,
          language: targetLanguage,
        });
        console.log('Translation assignment marked as completed');
      } catch (error) {
        console.error(
          'Error marking translation assignment as completed:',
          error,
        );
        // Don't block video generation if this fails
      }
    }

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
        // No task id returned – cannot track progress.
        console.warn(
          'No toolkit task id returned – unable to track video progress.',
        );
      }
    } catch (err) {
      console.error('Error generating video', err);
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

  // Removed simulateVideoGeneration – progress will no longer be faked on errors.

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
        <LoadingSpinner size="md" />
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
                const _isCompleted = slideIndex < currentSlideIndex;
                const _isCurrent = slideIndex === currentSlideIndex;

                return (
                  <div
                    key={`slide-progress-${slide.slideId}`}
                    className={`h-[6px] flex-1 rounded-full ${
                      _isCompleted
                        ? 'bg-orange-400'
                        : _isCurrent
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

        {currentSlide && (
          <ValidatedPptEditor
            courseId={courseId}
            chapterId={chapterId}
            slideId={currentSlide.slideId}
            partId={currentSlide.partId}
            fileName="proofread"
            language={targetLanguage}
            validated={validationStates.presentationValidated}
            onValidationChange={(validated) => {
              setValidationStates((prev) => ({
                ...prev,
                presentationValidated: validated,
              }));

              // Track that PPT validation was changed during this session for this slide
              if (currentSlide) {
                setPptValidationChanges((prev) => ({
                  ...prev,
                  [currentSlide.slideId]: true,
                }));
              }
            }}
            fileUrl={buildPptxUrl(
              courseId,
              targetLanguage,
              currentSlide.partId,
              chapterId,
              currentSlide.slideId,
            )}
            showLanguageHeader={false}
            showValidationCheckbox={true}
            className="mt-10"
            headerContent={
              <div className="flex items-center justify-between">
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
                    {t('translate.translateTo', {
                      defaultValue: 'Translate to',
                    })}
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
            }
            rightComponent={
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
            onLoadingStateChange={setPptSaving}
          />
        )}
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

        <div
          style={{
            backgroundColor: '#F5F5F5',
            border: '1px solid #CCCCCC',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0px 1px 1px 0px #00000040',
          }}
        >
          {/* Language Toggle */}
          <div className="mb-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4">
              {/* Source language selector */}
              <div className="flex items-center gap-[10px]">
                <span
                  className="text-base sm:text-lg md:text-xl font-semibold text-gray-900"
                  style={{ fontFamily: 'Rubik, sans-serif' }}
                >
                  {t('translate.language', { defaultValue: 'Language' })}
                </span>
                <LanguageDropdown
                  options={transcriptLanguageAvailability ?? []}
                  loading={transcriptLanguagesLoading}
                  value={
                    selectedOriginalTranscriptLanguage ||
                    transcriptDefaultCode ||
                    ''
                  }
                  onChange={(code: string) => {
                    const availability = transcriptLanguageAvailability.find(
                      (l) => l.code === code,
                    );
                    if (availability?.available) {
                      setSelectedOriginalTranscriptLanguage(code);
                    }
                  }}
                  selectClassName="w-full sm:w-[225px]"
                />
              </div>
              {/* Target language information (visible only on large screens) */}
              <div className="hidden lg:flex items-center gap-2 lg:justify-start justify-start">
                <span className="text-gray-400">⇄</span>
                <span
                  className="text-base sm:text-lg md:text-xl font-semibold text-gray-900"
                  style={{ fontFamily: 'Rubik, sans-serif' }}
                >
                  {t('translate.translateTo', { defaultValue: 'Translate to' })}
                </span>
                <span className="text-orange-500 text-base sm:text-lg md:text-xl">
                  {targetLanguageName}
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-side Translation Text Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Original Content */}
            <div
              className="bg-white rounded-lg p-4 min-h-[200px]"
              style={{ border: '1px solid #CCCCCC' }}
            >
              <div className="text-sm leading-relaxed text-gray-900 whitespace-pre-line">
                {isTranscriptLoading
                  ? t('translate.loadingTranscription', {
                      defaultValue: 'Loading transcription…',
                    })
                  : displayedOriginalTranscript ||
                    t('translate.noTranscriptionAvailable', {
                      defaultValue: 'No transcription available',
                    })}
              </div>
            </div>

            {/* Target language information (visible on small screens, outside the box) */}
            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-gray-400">⇄</span>
              <span
                className="text-base font-semibold text-gray-900"
                style={{ fontFamily: 'Rubik, sans-serif' }}
              >
                {t('translate.translateTo', { defaultValue: 'Translate to' })}
              </span>
              <span className="text-orange-500 text-base">
                {targetLanguageName}
              </span>
            </div>

            {/* Translated Content */}
            <div
              className="bg-white rounded-lg p-4 min-h-[200px]"
              style={{ border: '1px solid #CCCCCC' }}
            >
              <textarea
                value={currentSlide?.translatedContent || ''}
                onChange={(e) =>
                  currentSlide &&
                  handleTranslationChange(currentSlide.slideId, e.target.value)
                }
                placeholder={t('translate.enterTranslation', {
                  defaultValue: 'Enter your translation here...',
                })}
                className="w-full h-full min-h-[160px] border-0 resize-none focus:outline-none text-sm leading-relaxed bg-transparent text-gray-900 textarea-scrollbar"
                style={{ width: 'calc(100% + 18px)', marginRight: '-18px' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-4 md:gap-6">
            {/* Left group: Generate audio + tries label */}
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <Button
                onClick={handleGenerateAudio}
                size="m"
                variant="primary"
                disabled={
                  audioAttempts >= MAX_AUDIO_TRIES ||
                  !validationStates.transcriptionValidated
                }
                className={`shadow-[0_2px_3px_rgba(0,0,0,0.25)] flex gap-[10px] text-sm sm:text-base md:text-lg leading-none font-medium ${
                  audioAttempts >= MAX_AUDIO_TRIES ||
                  !validationStates.transcriptionValidated
                    ? 'opacity-60 cursor-not-allowed'
                    : ''
                }`}
              >
                {t('translate.generateAudio', {
                  defaultValue: 'Generate audio',
                })}
              </Button>
              <span className="text-orange-600 text-sm md:self-center">
                {audioAttempts >= MAX_AUDIO_TRIES
                  ? 'You have no more tries'
                  : `Limit ${audioAttempts}/${MAX_AUDIO_TRIES} tries`}
              </span>
            </div>

            <ValidationCheckbox
              checked={validationStates.transcriptionValidated}
              onToggle={handleValidateTranscription}
              label={t('translate.validateTranscription', {
                defaultValue: 'Validate transcription',
              })}
            />
          </div>
        </div>

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

        {currentSlide?.slideId && (
          <AudioPlayer
            courseId={courseId}
            partId={currentSlide.partId}
            chapterId={chapterId}
            slideId={currentSlide.slideId}
            language={targetLanguage}
            validated={validationStates.audioValidated}
            onValidate={handleValidateAudio}
            generating={audioGenerating}
            version={audioVersion}
            audioResourcePath={currentSlide.audioResourcePath}
          />
        )}
      </div>

      {/* Action Buttons - Previous and Next Slide or Create Video */}
      {chapterData && (
        <div className="flex justify-between items-center">
          {/* Previous Slide Button */}
          <div className="flex justify-start">
            {!isFirstSlide && (
              <Button
                onClick={handlePreviousSlide}
                size="m"
                variant="outline"
                className="shadow-[0_2px_3px_rgba(0,0,0,0.25)] flex gap-[10px] text-[18px] leading-[18px] font-medium text-orange-500 border-orange-500 bg-transparent hover:bg-orange-50"
              >
                <span>←</span>
                {t('translate.previousSlide', {
                  defaultValue: 'Previous slide',
                })}
              </Button>
            )}
          </div>

          {/* Next Slide or Create Video Button */}
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
