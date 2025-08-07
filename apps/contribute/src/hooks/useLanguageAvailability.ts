import { useMemo } from 'react';
import { getLanguageName } from '#src/utils/i18n.ts';

import { useCourseLanguages } from './useCourseLanguages.ts';
import { useSlideAvailability } from './useSlideAvailability.ts';

interface Params {
  courseId: string;
  partId: string;
  chapterId: string;
  slideId: string;
  /** Course original language (always available even if not uploaded) */
  originalLanguage: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  available: boolean;
}

export function useLanguageAvailability(params: Params) {
  const { courseId, partId, chapterId, slideId, originalLanguage } = params;

  // Source 1: languages configured at course level
  const {
    codes: courseCodes,
    loading: loadingCourse,
    error: errorCourse,
  } = useCourseLanguages(courseId);

  // Source 2: which of those languages have a PPT file for this slide
  const {
    availableCodes,
    loading: loadingAvail,
    error: errorAvail,
  } = useSlideAvailability({
    courseId,
    partId,
    chapterId,
    slideId,
    type: 'ppt',
  });

  // Merge & map to UI friendly structure
  const options = useMemo<LanguageOption[]>(() => {
    const set = new Set<string>(courseCodes);
    set.add(originalLanguage);
    return Array.from(set).map((code) => ({
      code,
      name: getLanguageName(code),
      available: availableCodes.includes(code),
    }));
  }, [courseCodes, availableCodes, originalLanguage]);

  // Determine default:
  const defaultCode = useMemo(() => {
    // Prefer English if available, else first available, else fall back to original language
    const englishAvail = options.find((o) => o.code === 'en' && o.available);
    if (englishAvail) return 'en';
    const firstAvail = options.find((o) => o.available)?.code;
    return firstAvail ?? originalLanguage;
  }, [options, originalLanguage]);

  return {
    options,
    defaultCode,
    loading: loadingCourse || loadingAvail,
    error: errorCourse ?? errorAvail ?? null,
  } as const;
}
