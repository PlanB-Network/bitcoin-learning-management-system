import { Button } from '@blms/ui';
import { Link, createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BreadcrumbArrowIcon from '#src/assets/icons/breadcrumb_navigation_arrow_orange.svg';
import DroplistArrowIcon from '#src/assets/icons/droplist_arrow_balck.svg';

import { PageLayout } from '#src/components/page-layout.tsx';
import { OnlyOfficeSlideEditor } from '#src/components/translation/onlyoffice-slide-editor.tsx';
import { getLanguageName } from '#src/utils/i18n.ts';
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
  const [totalChapters, setTotalChapters] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'presentation' | 'transcription'>(
    'presentation',
  );
  const [selectedOriginalLanguage, setSelectedOriginalLanguage] =
    useState<string>('');
  // UPDATED STATE: track language availability instead of just available languages
  const [languageAvailability, setLanguageAvailability] = useState<
    LanguageAvailability[]
  >([]);
  const [languagesLoading, setLanguagesLoading] = useState(false);
  // ----------------------------
  // State for transcript language selection
  // ----------------------------
  const [
    selectedOriginalTranscriptLanguage,
    setSelectedOriginalTranscriptLanguage,
  ] = useState<string>('');
  const [transcriptLanguageAvailability, setTranscriptLanguageAvailability] =
    useState<LanguageAvailability[]>([]);
  const [transcriptLanguagesLoading, setTranscriptLanguagesLoading] =
    useState(false);
  const [transcriptContentCache, setTranscriptContentCache] = useState<
    Record<string, string | null>
  >({});

  const numericSlideIndex = Number(slideIndex);
  const targetLanguage = Route.useSearch()?.targetLanguage || 'fr';

  // New helper to fetch language availability from the backend (single request)
  const fetchSlideLanguageAvailability = async (
    courseId: string,
    partId: string,
    chapterId: string,
    slideId: string,
  ): Promise<string[]> => {
    try {
      const url = `/api/translation-downloads/pptx-availability/${courseId}/${partId}/${chapterId}/${slideId}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Failed to fetch availability');
      const data = (await resp.json()) as { languages: string[] };
      return data.languages ?? [];
    } catch (err) {
      console.warn('Could not fetch language availability', err);
      return [];
    }
  };
  // Helper to fetch transcript language availability (checks DB)
  const fetchSlideTranscriptLanguageAvailability = async (
    courseId: string,
    partId: string,
    chapterId: string,
    slideId: string,
  ): Promise<string[]> => {
    try {
      const url = `/api/translation-downloads/transcript-availability/${courseId}/${partId}/${chapterId}/${slideId}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Failed to fetch transcript availability');
      const data = (await resp.json()) as { languages: string[] };
      return data.languages ?? [];
    } catch (err) {
      console.warn('Could not fetch transcript language availability', err);
      return [];
    }
  };
  // UPDATED: Fetch languages and check availability
  useEffect(() => {
    const fetchAvailableLanguages = async () => {
      setLanguagesLoading(true);

      try {
        // Prefer public endpoint (works for any user)
        let resp: any;
        try {
          resp = await (
            trpcClient as any
          ).content.getCourseLanguagesPublic.query({ id: courseId });
        } catch (e: any) {
          // If public endpoint unavailable (older backend) or we are admin using secured route
          resp = await (trpcClient as any).content.getCourseLanguages?.query?.({
            id: courseId,
          });
        }

        if (resp?.languages?.length) {
          // Always ensure the course original language is present in the dropdown
          const originalLang = courseData?.originalLanguage ?? 'en';
          const codesSet = new Set<string>(
            resp.languages.map((l: any) => l.code),
          );
          codesSet.add(originalLang);
          const codes = Array.from(codesSet);

          // Check availability via backend endpoint
          if (chapterData?.slides?.[numericSlideIndex]) {
            const currentSlide = chapterData.slides[numericSlideIndex];

            const availableCodes = await fetchSlideLanguageAvailability(
              courseId,
              currentSlide.partId,
              chapterId,
              currentSlide.slideId,
            );

            const languageAvailabilityResults = codes.map((lang) => ({
              code: lang,
              name: getLanguageName(lang),
              available: availableCodes.includes(lang),
            }));

            setLanguageAvailability(languageAvailabilityResults);

            // Set default selected language to first available one, preferring 'en'
            if (!selectedOriginalLanguage) {
              const availableLanguages = languageAvailabilityResults.filter(
                (l) => l.available,
              );
              if (availableLanguages.length > 0) {
                const defaultLang =
                  availableLanguages.find((l) => l.code === 'en')?.code ||
                  availableLanguages[0].code;
                setSelectedOriginalLanguage(defaultLang);
              }
            }
          } else {
            // If we don't have slide data yet, assume all languages are available
            const allLanguages = codes.map((lang) => ({
              code: lang,
              name: getLanguageName(lang),
              available: true,
            }));
            setLanguageAvailability(allLanguages);

            if (!selectedOriginalLanguage) {
              const defaultLang = codes.includes('en') ? 'en' : codes[0];
              setSelectedOriginalLanguage(defaultLang);
            }
          }
          setLanguagesLoading(false);
          return;
        }
      } catch (err) {
        // Not authorized or endpoint unavailable – log and continue with fallback
        console.warn('Could not fetch course languages, falling back', err);
      }

      // Fallback: use original language + English (if available)
      const originalLanguageCode = courseData?.originalLanguage ?? 'en';
      const hasEnglishVersion = originalLanguageCode.toLowerCase() !== 'en';
      const fallbackLanguages = hasEnglishVersion
        ? [originalLanguageCode, 'en']
        : [originalLanguageCode];

      // Check availability for fallback languages
      if (chapterData?.slides?.[numericSlideIndex]) {
        const currentSlide = chapterData.slides[numericSlideIndex];

        const availableCodes = await fetchSlideLanguageAvailability(
          courseId,
          currentSlide.partId,
          chapterId,
          currentSlide.slideId,
        );

        const fallbackAvailabilityResults = fallbackLanguages.map((lang) => ({
          code: lang,
          name: getLanguageName(lang),
          available: availableCodes.includes(lang),
        }));

        setLanguageAvailability(fallbackAvailabilityResults);

        if (!selectedOriginalLanguage) {
          const availableLanguages = fallbackAvailabilityResults.filter(
            (l) => l.available,
          );
          if (availableLanguages.length > 0) {
            const defaultLang =
              availableLanguages.find((l) => l.code === 'en')?.code ||
              availableLanguages[0].code;
            setSelectedOriginalLanguage(defaultLang);
          }
        }
      } else {
        const fallbackAvailability = fallbackLanguages.map((lang) => ({
          code: lang,
          name: getLanguageName(lang),
          available: true,
        }));
        setLanguageAvailability(fallbackAvailability);

        if (!selectedOriginalLanguage) {
          setSelectedOriginalLanguage(
            hasEnglishVersion ? 'en' : originalLanguageCode,
          );
        }
      }

      setLanguagesLoading(false);
    };

    fetchAvailableLanguages();
    // We deliberately exclude courseData from deps to avoid double-call; courseId is sufficient.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, chapterData, numericSlideIndex]);

  // ----------------------------
  // Fetch transcript language availability
  // ----------------------------
  useEffect(() => {
    const fetchTranscriptLanguages = async () => {
      setTranscriptLanguagesLoading(true);
      try {
        let resp: any;
        try {
          resp = await (
            trpcClient as any
          ).content.getCourseLanguagesPublic.query({ id: courseId });
        } catch (e: any) {
          resp = await (trpcClient as any).content.getCourseLanguages?.query?.({
            id: courseId,
          });
        }

        const originalLang = courseData?.originalLanguage ?? 'en';
        const codesSet = new Set<string>();
        if (resp?.languages?.length) {
          for (const l of resp.languages) {
            codesSet.add(l.code);
          }
        }
        codesSet.add(originalLang);
        const codes = Array.from(codesSet);

        if (chapterData?.slides?.[numericSlideIndex]) {
          const currentSlide = chapterData.slides[numericSlideIndex];
          const availableCodes = await fetchSlideTranscriptLanguageAvailability(
            courseId,
            currentSlide.partId,
            chapterId,
            currentSlide.slideId,
          );

          const availability = codes.map((lang) => ({
            code: lang,
            name: getLanguageName(lang),
            available: availableCodes.includes(lang) || lang === originalLang,
          }));

          setTranscriptLanguageAvailability(availability);

          if (!selectedOriginalTranscriptLanguage) {
            const available = availability.filter((l) => l.available);
            if (available.length > 0) {
              const defaultLang =
                available.find((l) => l.code === 'en')?.code ||
                available[0].code;
              setSelectedOriginalTranscriptLanguage(defaultLang);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch transcript languages', err);
      } finally {
        setTranscriptLanguagesLoading(false);
      }
    };

    fetchTranscriptLanguages();
  }, [courseId, chapterData, numericSlideIndex]);

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
    chapterData,
    numericSlideIndex,
    courseId,
    chapterId,
    courseData,
    transcriptContentCache,
  ]);

  // Compute derived values once we have data
  const currentSlide = chapterData?.slides?.[numericSlideIndex];

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
          const chaptersCount = courseResp.parts.reduce(
            (total: number, part: any) => total + (part.chapters?.length || 0),
            0,
          );
          setTotalChapters(chaptersCount);
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

  // Compute file base name (same logic as parent page)
  const fileBaseName = React.useMemo(() => {
    if (!chapterData || !currentSlide) return '';
    const partIdx = chapterData.context.partIndex;
    const chapIdx = chapterData.context.chapterIndex;
    const slideIdx = currentSlide.slideNumber ?? numericSlideIndex;
    return `${partIdx}.${chapIdx}_${slideIdx}`;
  }, [chapterData, currentSlide, numericSlideIndex]);

  // Original language handling
  const originalLanguageCode = courseData?.originalLanguage ?? 'en';
  const hasEnglishVersion = originalLanguageCode.toLowerCase() !== 'en';

  // Get available languages from the languageAvailability state
  const availableLanguages = languageAvailability.filter((l) => l.available);

  // Initialize selected language when data loads
  React.useEffect(() => {
    if (
      courseData &&
      !selectedOriginalLanguage &&
      availableLanguages.length > 0
    ) {
      // Default to English if available, otherwise use first available language
      const defaultLanguage =
        availableLanguages.find((l) => l.code === 'en')?.code ||
        availableLanguages[0].code;
      setSelectedOriginalLanguage(defaultLanguage);
    }
  }, [courseData, selectedOriginalLanguage, availableLanguages]);

  const originalLanguage =
    selectedOriginalLanguage ||
    availableLanguages.find((l) => l.code === 'en')?.code ||
    availableLanguages[0]?.code ||
    originalLanguageCode;
  const originalLanguageName = getLanguageName(originalLanguage);
  const targetLanguageName = getLanguageName(targetLanguage);

  // Overall chapter index for progress (copied logic)
  const overallChapterNumber = React.useMemo(() => {
    if (!courseData) return 0;
    const chaptersInCourse = courseData.parts.flatMap(
      (part: any) => part.chapters,
    );
    const index = chaptersInCourse.findIndex(
      (ch: any) => ch.chapterId === chapterId,
    );
    return index >= 0 ? index + 1 : 0;
  }, [courseData, chapterId]);

  const partEndIndexes = React.useMemo(() => {
    if (!courseData) return [] as number[];
    let cumulative = 0;
    return courseData.parts.map((part: any) => {
      cumulative += part.chapters?.length || 0;
      return cumulative - 1;
    });
  }, [courseData]);

  if (loading) {
    return (
      <PageLayout
        title=""
        variant="light"
        footerVariant="light"
        className="flex justify-center items-center min-h-screen"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        <div className="mt-4 text-gray-600">Loading compare view…</div>
      </PageLayout>
    );
  }

  if (error || !chapterData || !currentSlide) {
    return (
      <PageLayout
        title="Error"
        variant="light"
        footerVariant="light"
        className="flex justify-center items-center min-h-screen"
      >
        <div className="text-center">
          <div className="text-red-600 mb-4">
            Error: {error ?? 'Data not found'}
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

  return (
    <PageLayout
      variant="light"
      footerVariant="light"
      maxWidth="max-w-7xl"
      paddingXClasses="px-4"
    >
      {/* Header Section – copied from translation page for consistency */}
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
                  {/* Custom select with dropdown arrow */}
                  <div className="relative">
                    <select
                      value={selectedOriginalLanguage}
                      onChange={(e) => {
                        const selectedLang = e.target.value;
                        // Only allow selection of available languages
                        const langAvailability = languageAvailability.find(
                          (l) => l.code === selectedLang,
                        );
                        if (langAvailability?.available) {
                          setSelectedOriginalLanguage(selectedLang);
                        }
                      }}
                      disabled={languagesLoading}
                      className={`appearance-none bg-white border border-[#CCCCCC] rounded-[10px] text-sm text-orange-500 w-full sm:w-[225px] h-[34px] pl-8 pr-3 py-1 ${
                        languagesLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {languagesLoading ? (
                        <option value="">
                          {t('translate.loadingLanguages', {
                            defaultValue: 'Loading languages...',
                          })}
                        </option>
                      ) : languageAvailability.length === 0 ? (
                        <option value="">
                          {t('translate.noLanguagesAvailable', {
                            defaultValue: 'No languages available',
                          })}
                        </option>
                      ) : (
                        languageAvailability.map((lang) => (
                          <option
                            key={lang.code}
                            value={lang.code}
                            disabled={!lang.available}
                            className={`${lang.available ? 'text-gray-900' : 'text-gray-400 cursor-not-allowed'}`}
                            style={{
                              color: lang.available ? 'inherit' : '#9CA3AF',
                              cursor: lang.available
                                ? 'pointer'
                                : 'not-allowed',
                            }}
                          >
                            {lang.name}
                            {!lang.available && ' (Not available)'}
                          </option>
                        ))
                      )}
                    </select>
                    {/* Black arrow icon or loading spinner */}
                    {languagesLoading ? (
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-500" />
                      </div>
                    ) : (
                      <img
                        src={DroplistArrowIcon}
                        alt="Dropdown arrow"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[11px] h-[7px]"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <OnlyOfficeSlideEditor
                  key={`original-${selectedOriginalLanguage}-${currentSlide?.slideId ?? ''}`}
                  fileUrl={
                    currentSlide
                      ? `/api/translation-downloads/pptx/${courseId}/${originalLanguage}/${currentSlide.partId}/${chapterId}/${currentSlide.slideId}/${fileBaseName}`
                      : null
                  }
                  className="w-full"
                  courseId={courseId}
                  partId={currentSlide?.partId}
                  chapterId={chapterId}
                  slideId={currentSlide?.slideId}
                  fileName={fileBaseName}
                  language={originalLanguage}
                />
              </div>
            </div>
          </div>

          {/* Proofread (bottom) */}
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
              {/* Language info header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-[10px]">
                  <span
                    className="text-[18px] font-semibold text-gray-900"
                    style={{ fontFamily: 'Rubik, sans-serif' }}
                  >
                    {t('translate.language', { defaultValue: 'Language' })}
                  </span>
                  <span
                    className="text-orange-500 text-[18px]"
                    style={{ fontFamily: 'Rubik, sans-serif' }}
                  >
                    {targetLanguageName}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <OnlyOfficeSlideEditor
                  key={`proofread-${targetLanguage}-${currentSlide?.slideId ?? ''}`}
                  fileUrl={
                    currentSlide
                      ? `/api/translation-downloads/pptx/${courseId}/${targetLanguage}/${currentSlide.partId}/${chapterId}/${currentSlide.slideId}/${fileBaseName}-proofread`
                      : null
                  }
                  className="w-full"
                  courseId={courseId}
                  partId={currentSlide?.partId}
                  chapterId={chapterId}
                  slideId={currentSlide?.slideId}
                  fileName={`${fileBaseName}-proofread`}
                  language={targetLanguage}
                />
              </div>
            </div>
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
                    <select
                      value={selectedOriginalTranscriptLanguage}
                      onChange={(e) => {
                        const selectedLang = e.target.value;
                        const availability =
                          transcriptLanguageAvailability.find(
                            (l) => l.code === selectedLang,
                          );
                        if (availability?.available) {
                          setSelectedOriginalTranscriptLanguage(selectedLang);
                        }
                      }}
                      disabled={transcriptLanguagesLoading}
                      className={`appearance-none bg-white border border-[#CCCCCC] rounded-[10px] text-sm text-orange-500 w-full sm:w-[225px] h-[34px] pl-8 pr-3 py-1 ${
                        transcriptLanguagesLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {transcriptLanguagesLoading ? (
                        <option value="">
                          {t('translate.loadingLanguages', {
                            defaultValue: 'Loading languages...',
                          })}
                        </option>
                      ) : transcriptLanguageAvailability.length === 0 ? (
                        <option value="">
                          {t('translate.noLanguagesAvailable', {
                            defaultValue: 'No languages available',
                          })}
                        </option>
                      ) : (
                        transcriptLanguageAvailability.map((lang) => (
                          <option
                            key={lang.code}
                            value={lang.code}
                            disabled={!lang.available}
                            className={`${lang.available ? 'text-gray-900' : 'text-gray-400 cursor-not-allowed'}`}
                            style={{
                              color: lang.available ? 'inherit' : '#9CA3AF',
                              cursor: lang.available
                                ? 'pointer'
                                : 'not-allowed',
                            }}
                          >
                            {lang.name}
                            {!lang.available && ' (Not available)'}
                          </option>
                        ))
                      )}
                    </select>
                    {transcriptLanguagesLoading ? (
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-500" />
                      </div>
                    ) : (
                      <img
                        src={DroplistArrowIcon}
                        alt="Dropdown arrow"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[11px] h-[7px]"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4 min-h-[200px]">
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
            <h3 className="mb-4 text-gray-900 font-semibold text-[20px]">
              {t('translate.translatedTranscription', {
                defaultValue: 'Translated transcription',
              })}{' '}
              – {targetLanguageName}
            </h3>
            <div className="bg-gray-50 border rounded-lg p-4 min-h-[200px]">
              <div className="text-gray-700 whitespace-pre-wrap">
                {currentSlide?.translatedContent ||
                  t('translate.noTranslationAvailable', {
                    defaultValue: 'No translation available',
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Go Back Button */}
      <div className="flex justify-end mt-12">
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
      </div>
    </PageLayout>
  );
}
