export * from './course-filters.ts';
export { trpc } from './trpc.ts';

let customCdnUrl = window.localStorage.getItem('cdnUrl');

Object.defineProperty(window, 'setCustomCdnUrl', {
  value: (url: string) => {
    // biome-ignore lint/suspicious/noAssignInExpressions: assignment in expression is intentional for setting global variable
    window.localStorage.setItem('cdnUrl', (customCdnUrl = url));
  },
});

export const cdnUrl = (path: string) => {
  return customCdnUrl ? `${customCdnUrl}/${path}` : `/cdn/${path}`;
};

/**
 * Content asset URL
 */
export const assetUrl = (
  contentPath: string,
  assetPath: string | null,
  // invalidate cache by passing a cacheKey (usually the last commit sha)
  cacheKey?: string,
) => {
  return cdnUrl(
    `${contentPath}/assets/${assetPath}${cacheKey ? `?c=${cacheKey}` : ''}`,
  );
};

/**
 * Content asset URL
 */
export const resourceImgUrl = (
  resource: { path: string; lastCommit: string },
  assetPath = 'thumbnail.webp',
) => {
  return assetUrl(resource.path, assetPath, resource.lastCommit);
};

export const compose = (...args: string[]) => args.join(' ');

export const isUUID = (value: unknown) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);

// Configuration flag to switch between old and new file discovery approach
// Set to true to use the new file discovery endpoints
export const USE_FILE_DISCOVERY = false;

/**
 * Build translation file URL by discovering files with specific extension and suffix
 * Instead of constructing filenames, this approach finds files by extension in the resource path
 */
export const buildTranslationFileUrl = (
  courseId: string,
  language: string,
  partId: string,
  chapterId: string,
  slideId: string,
  fileType: 'pptx' | 'mp3' | 'png',
  suffix?: string,
  fallbackToOld = !USE_FILE_DISCOVERY,
  index?: number,
): string => {
  // For audio files we always want to use discovery-based URLs so that the
  // frontend can fetch freshly-generated MP3s that live in the new directory
  // structure (which includes the partId). For all other file types we keep the
  // current behaviour (go through legacy routes when USE_FILE_DISCOVERY is
  // disabled or when explicit fallback is requested).

  const shouldUseLegacyRoute =
    fileType !== 'mp3' && (fallbackToOld || !USE_FILE_DISCOVERY);

  if (shouldUseLegacyRoute) {
    const oldUrl = `/api/translation-downloads/${fileType}-by-path/${courseId}/${language}/${chapterId}/${slideId}`;
    const suffixParam = suffix ? `?suffix=${encodeURIComponent(suffix)}` : '';
    const url = `${oldUrl}${suffixParam}`;

    return url;
  }

  // New discovery-based URL structure: courseId/language/partId/chapterId/slideId
  const baseUrl = `/api/translation-downloads/${fileType}-by-discovery`;
  const query: string[] = [];
  if (suffix) query.push(`suffix=${encodeURIComponent(suffix)}`);
  if (typeof index === 'number' && Number.isFinite(index)) {
    query.push(`index=${encodeURIComponent(String(index))}`);
  }
  const qs = query.length ? `?${query.join('&')}` : '';
  const url = `${baseUrl}/${courseId}/${language}/${partId}/${chapterId}/${slideId}${qs}`;

  return url;
};

/**
 * Build PPTX file URL with optional suffix (e.g., "-proofread")
 */
export const buildPptxUrl = (
  courseId: string,
  language: string,
  partId: string,
  chapterId: string,
  slideId: string,
  suffix?: string,
  fallbackToOld?: boolean,
): string => {
  return buildTranslationFileUrl(
    courseId,
    language,
    partId,
    chapterId,
    slideId,
    'pptx',
    suffix,
    fallbackToOld,
  );
};

// Build audio file URL (MP3).
// We ALWAYS prefer the new discovery-based endpoints for audio, because newly
// generated audio files are stored under the discovery directory structure that
// includes the partId. For backward-compatibility callers can still override by
// passing `true` for the optional fallbackToOld argument.
export const buildAudioUrl = (
  courseId: string,
  language: string,
  partId: string,
  chapterId: string,
  slideId: string,
  // Default to discovery (false) so that audio generation + playback work even
  // when USE_FILE_DISCOVERY is disabled for other asset types.
  fallbackToOld = false,
): string => {
  return buildTranslationFileUrl(
    courseId,
    language,
    partId,
    chapterId,
    slideId,
    'mp3',
    undefined,
    fallbackToOld,
  );
};

/**
 * Build PNG file URL for slide images
 */
export const buildPngUrl = (
  courseId: string,
  language: string,
  partId: string,
  chapterId: string,
  slideId: string,
  fallbackToOld?: boolean,
  index?: number,
): string => {
  return buildTranslationFileUrl(
    courseId,
    language,
    partId,
    chapterId,
    slideId,
    'png',
    undefined,
    fallbackToOld,
    index,
  );
};

/**
 * Build PNG discovery URL (bypasses legacy routing regardless of USE_FILE_DISCOVERY)
 */
export const buildPngUrlDiscovery = (
  courseId: string,
  language: string,
  partId: string,
  chapterId: string,
  slideId: string,
  index?: number,
): string => {
  const baseUrl = '/api/translation-downloads/png-by-discovery';
  const query: string[] = [];
  if (typeof index === 'number' && Number.isFinite(index)) {
    query.push(`index=${encodeURIComponent(String(index))}`);
  }
  const qs = query.length ? `?${query.join('&')}` : '';
  return `${baseUrl}/${courseId}/${language}/${partId}/${chapterId}/${slideId}${qs}`;
};
