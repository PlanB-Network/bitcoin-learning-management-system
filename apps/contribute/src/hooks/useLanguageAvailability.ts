import { useEffect, useMemo, useState } from 'react';
import type { LanguageOption } from '#src/types/language.ts';
import { getLanguageName } from '#src/utils/i18n.ts';
import { buildPngUrlDiscovery } from '#src/utils/index.ts';
import { getDefaultLanguageCode } from '#src/utils/language-utils.ts';

import { useCourseLanguages } from './useCourseLanguages.ts';
import { useSlideAvailability } from './useSlideAvailability.ts';

interface Params {
  courseId: string;
  partId: string;
  chapterId: string;
  slideId: string;
  /** Course original language (always available even if not uploaded) */
  originalLanguage: string;
  /** Zero-based slide index used for original-language PNG discovery */
  slideIndex?: number;
}

export function useLanguageAvailability(params: Params) {
  const { courseId, partId, chapterId, slideId, originalLanguage, slideIndex } =
    params;

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

  // For original language, PNGs might be stored under /pptx/ with name_index.png.
  // Probe discovery endpoint to treat the original language as available when a PNG exists.
  const [originalPngAvailable, setOriginalPngAvailable] =
    useState<boolean>(false);
  const [
    originalPngAvailableIndexPlusOne,
    setOriginalPngAvailableIndexPlusOne,
  ] = useState<boolean>(false);
  useEffect(() => {
    let cancelled = false;
    async function checkOriginalPng() {
      if (!courseId || !partId || !chapterId || !slideId || !originalLanguage)
        return;
      try {
        const url = buildPngUrlDiscovery(
          courseId,
          originalLanguage,
          partId,
          chapterId,
          slideId,
          // If slideIndex is undefined we still try without it
          typeof slideIndex === 'number' ? slideIndex : undefined,
        );
        const resp = await fetch(url, { method: 'HEAD' }).catch(() => null);
        // If HEAD not supported by proxy, fall back to GET with no-cache
        const ok = resp?.ok
          ? true
          : await fetch(url, { method: 'GET', cache: 'no-store' })
              .then((r) => r.ok)
              .catch(() => false);
        if (!cancelled) setOriginalPngAvailable(ok);

        // If not found and an index is provided, also try index+1 for 1-based filenames
        if (!ok && typeof slideIndex === 'number') {
          const url2 = buildPngUrlDiscovery(
            courseId,
            originalLanguage,
            partId,
            chapterId,
            slideId,
            slideIndex + 1,
          );
          const resp2 = await fetch(url2, { method: 'HEAD' }).catch(() => null);
          const ok2 = resp2?.ok
            ? true
            : await fetch(url2, { method: 'GET', cache: 'no-store' })
                .then((r) => r.ok)
                .catch(() => false);
          if (!cancelled) setOriginalPngAvailableIndexPlusOne(ok2);
        } else if (!cancelled) {
          setOriginalPngAvailableIndexPlusOne(false);
        }
      } catch {
        if (!cancelled) setOriginalPngAvailable(false);
      }
    }
    checkOriginalPng();
    return () => {
      cancelled = true;
    };
  }, [courseId, partId, chapterId, slideId, originalLanguage, slideIndex]);

  // Merge & map to UI friendly structure
  const options = useMemo<LanguageOption[]>(() => {
    // Merge course-configured codes with actually available slide languages
    const set = new Set<string>([...courseCodes, ...availableCodes]);
    if (originalLanguage) set.add(originalLanguage);
    return Array.from(set)
      .filter((code) => typeof code === 'string' && code.trim().length > 0)
      .map((code) => ({
        code,
        name: getLanguageName(code),
        available:
          availableCodes.includes(code) ||
          (Boolean(originalLanguage) &&
            code === originalLanguage &&
            (originalPngAvailable || originalPngAvailableIndexPlusOne)),
      }));
  }, [
    courseCodes,
    availableCodes,
    originalLanguage,
    originalPngAvailable,
    originalPngAvailableIndexPlusOne,
  ]);

  // Determine default using shared logic:
  const defaultCode = useMemo(() => {
    return getDefaultLanguageCode(options, originalLanguage);
  }, [options, originalLanguage]);

  return {
    options,
    defaultCode,
    // Consider loading only if BOTH are still loading; show early otherwise
    loading: loadingCourse && loadingAvail,
    error: errorCourse ?? errorAvail ?? null,
  } as const;
}
