import { TranslationStatus } from '@blms/constants';
import { Button } from '@blms/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BreadcrumbArrowIcon from '#src/assets/icons/breadcrumb_navigation_arrow_orange.svg';
// DroplistArrowIcon no longer needed after migration to LanguageDropdown
import { PageLayout } from '#src/components/page-layout.tsx';
import { ValidatedPptEditor } from '#src/components/translation/validated-ppt-editor.tsx';
import { LanguageDropdown } from '#src/components/ui/language-dropdown.tsx';
import { LoadingSpinner } from '#src/components/ui/loading-spinner.tsx';
import { ValidationCheckbox } from '#src/components/ui/validation-checkbox.tsx';
import { useLanguageAvailability } from '#src/hooks/useLanguageAvailability.ts';
import { useTranscriptAvailability } from '#src/hooks/useTranscriptAvailability.ts';
import { getLanguageName } from '#src/utils/i18n.ts';
import { buildPptxUrl, buildTranslationFileUrl } from '#src/utils/index.ts';
import { trpcClient } from '#src/utils/trpc.ts';

export const Route = createFileRoute(
  '/$lang/content/translate/$courseId/$chapterId/compare/$slideIndex',
)({
  component: CompareSlidePage,
});

// ------------------
// Local Types – duplicated from parent translation page for convenience
// ------------------
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
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChapterTranslationData {
  context: ChapterTranslationContext;
  slides: CourseTranslationSlide[];
}

// NEW: Interface to track language availability
interface LanguageAvailability {
  code: string;
  name: string;
  available: boolean;
}

function CompareSlidePage() {
  const { t } = useTranslation();
  const { courseId, chapterId, slideIndex, lang } = Route.useParams();

  const [chapterData, setChapterData] = useState<ChapterTranslationData | null>(
    null,
  );
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'presentation' | 'transcription'>(
    'presentation',
  );
  const [selectedOriginalLanguage, setSelectedOriginalLanguage] =
    useState<string>('');
  // replace state for language availability with new hook output
  const { options: languageAvailability, loading: languagesLoading } =
    useLanguageAvailability({
      courseId,
      partId: chapterData?.slides?.[Number(slideIndex)]?.partId ?? '',
      chapterId,
      slideId: chapterData?.slides?.[Number(slideIndex)]?.slideId ?? '',
      originalLanguage: courseData?.originalLanguage ?? 'en',
    });
  // ----------------------------
  // State for transcript language selection
  // ----------------------------
  const [
    selectedOriginalTranscriptLanguage,
    setSelectedOriginalTranscriptLanguage,
  ] = useState<string>('');
  // Transcript language availability via shared hook
  const {
    options: transcriptLanguageAvailability,
    loading: transcriptLanguagesLoading,
  } = useTranscriptAvailability({
    courseId,
    partId: chapterData?.slides?.[Number(slideIndex)]?.partId ?? '',
    chapterId,
    slideId: chapterData?.slides?.[Number(slideIndex)]?.slideId ?? '',
    originalLanguage: courseData?.originalLanguage ?? 'en',
  });
  const [transcriptContentCache, setTranscriptContentCache] = useState<
    Record<string, string | null>
  >({});

  // ----------------------------
  // Target transcription editing & validation state
  // ----------------------------
  const [translatedText, setTranslatedText] = useState<string>('');
  const [transcriptionValidated, setTranscriptionValidated] =
    useState<boolean>(false);
  // setHasUnsavedChanges state removed – following setter calls commented out
  /* setHasUnsavedChanges(false); */

  // PPT validation state for the second editor
  const [pptValidated, setPptValidated] = useState<boolean>(false);

  // Track PPT saving loading state to prevent premature navigation
  const [pptSaving, setPptSaving] = useState(false);

  // PNG loading state
  const [pngLoading, setPngLoading] = useState(true);
  const [pngError, setPngError] = useState<string | null>(null);

  const numericSlideIndex = Number(slideIndex);
  const targetLanguage =
    Route.useSearch()?.targetLanguage ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('targetLanguage')
      : null) ||
    'fr';

  // Removed redundant helper functions now superseded by shared hooks

  // Transcript language availability now provided by useTranscriptAvailability – removed legacy effect

  // ----------------------------
  // Load transcript content for selected language
  // ----------------------------
  useEffect(() => {
    const loadTranscriptContent = async () => {
      if (!selectedOriginalTranscriptLanguage) return;

      const lang = selectedOriginalTranscriptLanguage;
      const slideRef = chapterData?.slides?.[numericSlideIndex];

      if (!slideRef) return;

      if (Object.hasOwn(transcriptContentCache, lang)) return;

      if (lang === (courseData?.originalLanguage ?? 'en')) {
        setTranscriptContentCache((prev) => ({
          ...prev,
          [lang]: slideRef.originalContent,
        }));
        return;
      }

      try {
        const resp = await trpcClient.content.getCourseTranslationSlides.query({
          courseId,
          language: lang,
          chapterId,
        });
        const slide = resp?.slides?.[numericSlideIndex];
        setTranscriptContentCache((prev) => ({
          ...prev,
          [lang]: slide?.translatedContent ?? null,
        }));
      } catch (err) {
        console.warn('Could not load transcript content', err);
        setTranscriptContentCache((prev) => ({ ...prev, [lang]: null }));
      }
    };
    loadTranscriptContent();
  }, [
    selectedOriginalTranscriptLanguage,
    numericSlideIndex,
    courseId,
    chapterId,
    courseData,
    transcriptContentCache,
    chapterData?.slides?.[numericSlideIndex]?.slideId,
    chapterData?.slides?.[numericSlideIndex],
  ]);

  // Compute derived values once we have data
  const currentSlide = chapterData?.slides?.[numericSlideIndex];

  // Initialise translated transcription state whenever slide changes
  useEffect(() => {
    if (currentSlide) {
      setTranslatedText(currentSlide.translatedContent ?? '');
      setTranscriptionValidated(currentSlide.transcriptionValidated ?? false);
      setPptValidated(currentSlide.pptValidated ?? false);
      // setHasUnsavedChanges(false); // removed unused state
    }
  }, [currentSlide]);

  // ----------------------------
  // Handlers for translated transcription
  // ----------------------------
  const handleTranslatedChange = (value: string) => {
    if (!currentSlide) return;

    const wasTranscriptionValidated = transcriptionValidated;
    const wasAudioValidated = currentSlide.audioValidated ?? false;

    setTranslatedText(value);
    // setHasUnsavedChanges(true); // removed unused state

    // Update local chapterData so UI reflects edits immediately
    setChapterData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        slides: prev.slides.map((s) =>
          s.slideId === currentSlide.slideId
            ? {
                ...s,
                translatedContent: value,
                transcriptionValidated: false,
                audioValidated: false,
              }
            : s,
        ),
      };
    });

    if (wasTranscriptionValidated || wasAudioValidated) {
      setTranscriptionValidated(false);
      // Immediately mark both transcription and audio as unvalidated in DB
      // Explicitly maintain under_review status while contributor is working
      trpcClient.content.updateCourseTranslationSlide
        .mutate({
          courseId,
          language: targetLanguage,
          chapterId,
          slideId: currentSlide.slideId,
          transcriptionValidated: false,
          audioValidated: false,
          status: TranslationStatus.UnderReview,
        } as any)
        .catch((err) =>
          console.error('Error auto-unvalidating transcript and audio', err),
        );
    }
  };

  const handleValidateTranscription = async () => {
    if (!currentSlide) return;
    try {
      await trpcClient.content.updateCourseTranslationSlide.mutate({
        courseId,
        language: targetLanguage,
        chapterId,
        slideId: currentSlide.slideId,
        translatedContent: translatedText,
        status: TranslationStatus.UnderReview,
        transcriptionValidated: true,
      } as any);

      setTranscriptionValidated(true);
      // setHasUnsavedChanges(false); // removed unused state

      // Sync local state
      setChapterData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          slides: prev.slides.map((s) =>
            s.slideId === currentSlide.slideId
              ? {
                  ...s,
                  translatedContent: translatedText,
                  transcriptionValidated: true,
                }
              : s,
          ),
        };
      });
    } catch (err) {
      console.error('Error validating transcription', err);
    }
  };

  // Determine transcript to display based on selection
  const displayedOriginalTranscript =
    selectedOriginalTranscriptLanguage ===
    (courseData?.originalLanguage ?? 'en')
      ? currentSlide?.originalContent
      : transcriptContentCache[selectedOriginalTranscriptLanguage];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [chapterResp, courseResp] = await Promise.all([
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

        setChapterData(chapterResp);
        setCourseData(courseResp);

        if (courseResp?.parts) {
          // previously computed total chapters; removed unused state
        }
      } catch (err) {
        console.error('Error fetching compare page data', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, chapterId, targetLanguage]);

  // Original language handling
  const originalLanguageCode = courseData?.originalLanguage ?? 'en';
  const _hasEnglishVersion = originalLanguageCode.toLowerCase() !== 'en';

  // Get available languages from the languageAvailability state
  const availableLanguages = languageAvailability.filter((l) => l.available);

  // Initialize selected language when data loads
  React.useEffect(() => {
    if (courseData && availableLanguages.length > 0) {
      // Check if current selection is available, if not, reset it
      const currentSelectionAvailable =
        selectedOriginalLanguage &&
        availableLanguages.find((l) => l.code === selectedOriginalLanguage);

      if (!selectedOriginalLanguage || !currentSelectionAvailable) {
        // Prefer English if available, otherwise use first available language
        if (availableLanguages.length > 0) {
          const englishAvailable = availableLanguages.find(
            (l) => l.code === 'en',
          );
          const defaultLanguage = englishAvailable
            ? 'en'
            : availableLanguages[0].code;
          setSelectedOriginalLanguage(defaultLanguage);
        }
      }
    }
  }, [courseData, selectedOriginalLanguage, availableLanguages]);

  const originalLanguage =
    selectedOriginalLanguage &&
    availableLanguages.some(
      (l: LanguageAvailability) =>
        l.code === selectedOriginalLanguage && l.available,
    )
      ? selectedOriginalLanguage
      : availableLanguages.length > 0
        ? availableLanguages[0]?.code
        : originalLanguageCode;

  const _originalLanguageName = getLanguageName(originalLanguage);
  const targetLanguageName = getLanguageName(targetLanguage);

  // Overall chapter index for progress (copied logic)
  // _overallChapterNumber removed – variable was unused

  // _partEndIndexes removed – variable was unused

  if (loading) {
    return (
      <PageLayout
        title=""
        variant="light"
        footerVariant="light"
        className="flex justify-center items-center min-h-screen"
      >
        <LoadingSpinner size="md" />
        <div className="mt-4 text-gray-600">Loading compare view…</div>
      </PageLayout>
    );
  }

  if (error || !chapterData) {
    return (
      <PageLayout
        title="Error"
        variant="light"
        footerVariant="light"
        className="flex justify-center items-center min-h-screen"
      >
        <div className="text-center">
          <div className="text-red-600 mb-4">
            Error: {error ?? 'Chapter data not found'}
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

  if (!currentSlide) {
    return (
      <PageLayout
        title="Error"
        variant="light"
        footerVariant="light"
        className="flex justify-center items-center min-h-screen"
      >
        <div className="text-center">
          <div className="text-red-600 mb-4">
            Slide not found. Index: {slideIndex} (Numeric: {numericSlideIndex})
            <br />
            Available slides: {chapterData?.slides?.length || 0}
            <br />
            Slide IDs:{' '}
            {chapterData?.slides?.map((s) => s.slideId).join(', ') || 'none'}
          </div>
          <Link
            to="/$lang/content/translate/$courseId/$chapterId"
            params={{ lang, courseId, chapterId }}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 inline-block"
          >
            Go Back to Chapter
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      variant="light"
      footerVariant="light"
      maxWidth="max-w-7xl"
      paddingXClasses="px-4"
    >
      {/* Header Section removed */}

      {/* Navigation and Course Header */}
      <div className="flex flex-col gap-10 mb-10">
        <div className="flex items-center gap-1 text-base">
          <img src={BreadcrumbArrowIcon} alt="" className="w-[8px] h-[12px]" />
          <Link
            to="/$lang/content/translate/$courseId/$chapterId"
            params={{ lang, courseId, chapterId }}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            {`${chapterData.context.partIndex}.${chapterData.context.chapterIndex} ${chapterData.context.chapterTitle}`}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="text-gray-700 px-3 py-1 rounded text-sm font-medium"
            style={{ backgroundColor: '#E5E5E5' }}
          >
            {chapterData.context.courseIndex?.toUpperCase()}
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
            {`${chapterData.context.partIndex}.${chapterData.context.chapterIndex} ${chapterData.context.chapterTitle}`}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('presentation')}
          className={`px-4 py-2 text-sm font-medium relative ${
            activeTab === 'presentation'
              ? 'text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('translate.coursePresentation', {
            defaultValue: 'Course presentation',
          })}
          {activeTab === 'presentation' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transcription')}
          className={`px-4 py-2 text-sm font-medium relative ${
            activeTab === 'transcription'
              ? 'text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('translate.transcription', { defaultValue: 'Transcription' })}
          {activeTab === 'transcription' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex flex-col gap-12">
        {/* Course Presentation Tab Content - Always rendered but hidden when not active */}
        <div
          className={`flex flex-col gap-12 ${activeTab === 'presentation' ? 'block' : 'hidden'}`}
        >
          {/* Original (top) */}
          <div>
            <div
              style={{
                backgroundColor: '#F5F5F5',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0px 1px 1px 0px #00000040',
              }}
            >
              {/* Language Selection Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-[10px]">
                  <span
                    className="text-[18px] font-semibold text-gray-900"
                    style={{ fontFamily: 'Rubik, sans-serif' }}
                  >
                    {t('translate.language', { defaultValue: 'Language' })}
                  </span>
                  {/* Unified dropdown component */}
                  <LanguageDropdown
                    options={languageAvailability}
                    loading={languagesLoading}
                    value={selectedOriginalLanguage}
                    onChange={(code: string) => {
                      const langAvailability = languageAvailability.find(
                        (l) => l.code === code,
                      );
                      if (langAvailability?.available) {
                        setPngLoading(true);
                        setPngError(null);
                        setSelectedOriginalLanguage(code);
                      }
                    }}
                    selectClassName="w-full sm:w-[225px]"
                  />
                </div>
              </div>

              {/* PNG Image */}
              <div className="mb-6 flex justify-center min-h-[200px]">
                {currentSlide && (
                  <div className="relative w-full flex justify-center">
                    {/* Loading Spinner */}
                    {(pngLoading || languagesLoading) && !pngError && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <LoadingSpinner size="md" className="h-auto" />
                      </div>
                    )}

                    {/* Only render image when we have confirmed the language is available */}
                    {!languagesLoading &&
                      originalLanguage &&
                      availableLanguages.length > 0 &&
                      availableLanguages.some(
                        (l: LanguageAvailability) =>
                          l.code === originalLanguage && l.available,
                      ) && (
                        <img
                          key={`${currentSlide.slideId}-${originalLanguage}`}
                          data-slide-png
                          src={buildTranslationFileUrl(
                            courseId,
                            originalLanguage,
                            currentSlide.partId,
                            chapterId,
                            currentSlide.slideId,
                            'png',
                            'proofread',
                          )}
                          alt={`Slide ${numericSlideIndex + 1} - ${getLanguageName(originalLanguage)}`}
                          className={`max-w-full h-auto border border-gray-300 rounded-lg shadow-sm transition-opacity duration-200 ${
                            pngLoading || pngError ? 'opacity-0' : 'opacity-100'
                          }`}
                          onError={(e) => {
                            setPngLoading(false);
                            setPngError(
                              `Failed to load image from: ${e.currentTarget.src}`,
                            );
                          }}
                          onLoad={(e) => {
                            // Check if image has valid dimensions
                            if (
                              e.currentTarget.naturalWidth === 0 ||
                              e.currentTarget.naturalHeight === 0
                            ) {
                              setPngError(
                                'Image loaded but has invalid dimensions',
                              );
                            } else {
                              setPngError(null);
                            }

                            setPngLoading(false);
                          }}
                        />
                      )}

                    {/* Error Display */}
                    {pngError && (
                      <div className="flex items-center justify-center p-4 text-red-600 bg-red-50 border border-red-300 rounded-lg">
                        <div className="text-center">
                          <div className="mb-2">
                            Failed to load presentation image
                          </div>
                          <div className="text-sm text-gray-600">
                            {pngError}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Proofread (bottom) */}
          <div>
            {currentSlide && (
              <ValidatedPptEditor
                courseId={courseId}
                chapterId={chapterId}
                slideId={currentSlide.slideId}
                partId={currentSlide.partId}
                fileName="proofread"
                language={targetLanguage}
                validated={pptValidated}
                onValidationChange={setPptValidated}
                fileUrl={buildPptxUrl(
                  courseId,
                  targetLanguage,
                  currentSlide.partId,
                  chapterId,
                  currentSlide.slideId,
                  'proofread',
                )}
                languageLabel={targetLanguageName}
                mode="edit"
                onLoadingStateChange={setPptSaving}
              />
            )}
          </div>
        </div>

        {/* Transcription Tab Content - Always rendered but hidden when not active */}
        <div
          className={`flex flex-col gap-12 ${activeTab === 'transcription' ? 'block' : 'hidden'}`}
        >
          {/* Original Transcription */}
          <div>
            <div
              style={{
                backgroundColor: '#F5F5F5',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0px 1px 1px 0px #00000040',
              }}
            >
              {/* Language Selection Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-[10px]">
                  <span
                    className="text-[18px] font-semibold text-gray-900"
                    style={{ fontFamily: 'Rubik, sans-serif' }}
                  >
                    {t('translate.language', { defaultValue: 'Language' })}
                  </span>
                  <div className="relative">
                    <LanguageDropdown
                      options={transcriptLanguageAvailability}
                      loading={transcriptLanguagesLoading}
                      value={selectedOriginalTranscriptLanguage}
                      onChange={(code: string) => {
                        const availability =
                          transcriptLanguageAvailability.find(
                            (l) => l.code === code,
                          );
                        if (availability?.available) {
                          setSelectedOriginalTranscriptLanguage(code);
                        }
                      }}
                      selectClassName="w-full sm:w-[225px]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4 min-h-[200px]">
                <div className="text-gray-700 whitespace-pre-wrap">
                  {displayedOriginalTranscript ??
                    t('translate.noTranscriptionAvailable', {
                      defaultValue: 'No transcription available',
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* Translated Transcription */}
          <div>
            <div
              style={{
                backgroundColor: '#F5F5F5',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0px 1px 1px 0px #00000040',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-[10px]">
                  <span
                    className="text-[18px] font-semibold text-gray-900"
                    style={{ fontFamily: 'Rubik, sans-serif' }}
                  >
                    {t('translate.translatedTranscription', {
                      defaultValue: 'Translated transcription',
                    })}
                  </span>
                  <span
                    className="text-orange-500 text-[18px]"
                    style={{ fontFamily: 'Rubik, sans-serif' }}
                  >
                    {targetLanguageName}
                  </span>
                </div>
              </div>

              {/* Editable area */}
              <div className="bg-white border rounded-lg p-4 min-h-[200px]">
                <textarea
                  value={translatedText}
                  onChange={(e) => handleTranslatedChange(e.target.value)}
                  placeholder={t('translate.enterTranslation', {
                    defaultValue: 'Enter your translation here...',
                  })}
                  className="w-full h-full min-h-[160px] border-0 resize-none focus:outline-none text-base leading-relaxed bg-transparent text-gray-900 textarea-scrollbar"
                  style={{ width: 'calc(100% + 18px)', marginRight: '-18px' }}
                />
              </div>

              {/* Validate Transcription */}
              <div className="mt-4">
                <ValidationCheckbox
                  checked={transcriptionValidated}
                  onToggle={handleValidateTranscription}
                  label={t('translate.validateTranscription', {
                    defaultValue: 'Validate transcription',
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Go Back Button */}
      <div className="flex justify-end mt-12">
        {pptSaving ? (
          <Button
            variant="primary"
            size="m"
            disabled
            className="flex gap-[10px] text-[18px] leading-[18px] font-medium opacity-60"
            title={t('translate.waitingForSave', {
              defaultValue: 'Waiting for PPT save to complete...',
            })}
          >
            {t('translate.goBack', { defaultValue: 'Go back' })} ←
          </Button>
        ) : (
          <Link
            to="/$lang/content/translate/$courseId/$chapterId"
            params={{ lang, courseId, chapterId }}
          >
            <Button
              variant="primary"
              size="m"
              className="flex gap-[10px] text-[18px] leading-[18px] font-medium"
            >
              {t('translate.goBack', { defaultValue: 'Go back' })} ←
            </Button>
          </Link>
        )}
      </div>
    </PageLayout>
  );
}
