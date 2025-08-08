import { useMemo, useState } from 'react';
import { getLanguageName } from '#src/utils/i18n.ts';
import { trpcClient } from '#src/utils/trpc.ts';
import { useCourseLanguages } from './useCourseLanguages.ts';
import { useSlideAvailability } from './useSlideAvailability.ts';

interface Params {
  courseId: string;
  partId: string;
  chapterId: string;
  slideId: string;
  originalLanguage: string;
}

export interface TranscriptHook {
  options: LanguageOption[];
  loading: boolean;
  error: Error | null;
  selected: string;
  setSelected: (lang: string) => void;
  contentCache: Record<string, string | null>;
  ensureContentLoaded: (lang: string) => Promise<void>;
}

export interface LanguageOption {
  code: string;
  name: string;
  available: boolean;
}

/**
 * Provides transcript availability list plus a helper to lazily load actual transcript content for languages.
 * Only minimal features required by current UI are implemented to keep risk low.
 */
export function useTranscriptAvailability(params: Params): TranscriptHook {
  const { courseId, partId, chapterId, slideId, originalLanguage } = params;

  const {
    codes: courseCodes,
    loading: loadingCourse,
    error: errorCourse,
  } = useCourseLanguages(courseId);

  const {
    availableCodes,
    loading: loadingAvail,
    error: errorAvail,
  } = useSlideAvailability({
    courseId,
    partId,
    chapterId,
    slideId,
    type: 'transcript',
  });

  const options = useMemo<LanguageOption[]>(() => {
    const set = new Set<string>(courseCodes);
    set.add(originalLanguage);
    return Array.from(set).map((code) => ({
      code,
      name: getLanguageName(code),
      available: availableCodes.includes(code) || code === originalLanguage,
    }));
  }, [courseCodes, availableCodes, originalLanguage]);

  const firstAvailable =
    options.find((o) => o.available)?.code ?? originalLanguage;
  const [selected, setSelected] = useState<string>(firstAvailable);
  const [contentCache, setContentCache] = useState<
    Record<string, string | null>
  >({});

  // Lazy content loader – identical logic to previous component but isolated here.
  const ensureContentLoaded = async (lang: string) => {
    if (Object.hasOwn(contentCache, lang)) return;
    if (lang === originalLanguage) {
      setContentCache((prev) => ({ ...prev, [lang]: null })); // upstream caller will inject originalContent
      return;
    }
    try {
      const resp = await trpcClient.content.getCourseTranslationSlides.query({
        courseId,
        language: lang,
        chapterId,
      } as any);
      const slide = resp?.slides?.find((s: any) => s.slideId === slideId);
      setContentCache((prev) => ({
        ...prev,
        [lang]: slide?.translatedContent ?? null,
      }));
    } catch (err) {
      console.warn('Failed to load transcript content', err);
      setContentCache((prev) => ({ ...prev, [lang]: null }));
    }
  };

  return {
    options,
    loading: loadingCourse || loadingAvail,
    error: errorCourse ?? errorAvail ?? null,
    selected,
    setSelected,
    contentCache,
    ensureContentLoaded,
  };
}
