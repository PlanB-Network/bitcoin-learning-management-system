/**
 * Build S3 key for original PNG slide directory
 * Pattern: contribute/<course_id>/<original_language>/<part_id>/<chapter_id>/pptx/
 */
export const buildOriginalPngDirectory = (
  courseId: string,
  originalLanguage: string,
  partId: string,
  chapterId: string,
): string => {
  return `contribute/${courseId}/${originalLanguage}/${partId}/${chapterId}/pptx/`;
};

/**
 * Build S3 key for original PNG slide with specific filename and slide number
 * Pattern: contribute/<course_id>/<original_language>/<part_id>/<chapter_id>/pptx/<image_name>_<slide_number>.png
 */
export const buildOriginalPngKey = (
  courseId: string,
  originalLanguage: string,
  partId: string,
  chapterId: string,
  imageName: string,
  slideNumber: number,
): string => {
  return `contribute/${courseId}/${originalLanguage}/${partId}/${chapterId}/pptx/${imageName}_${slideNumber}.png`;
};

/**
 * Build S3 key for translated PNG slide
 * Uses ppt_resource_path and replaces pptx with png and .pptx with .png
 */
export const buildTranslatedPngKey = (pptResourcePath: string): string => {
  return pptResourcePath.replace('/pptx/', '/png/').replace('.pptx', '.png');
};

/**
 * Build S3 key for translated PNG slide with -proofread suffix
 * Uses ppt_resource_path and replaces pptx with png, .pptx with -proofread.png
 */
export const buildTranslatedProofreadPngKey = (
  pptResourcePath: string,
): string => {
  return pptResourcePath
    .replace('/pptx/', '/png/')
    .replace('.pptx', '-proofread.png');
};

/**
 * Build S3 key for PNG slide with course context (legacy function for compatibility)
 */
export const buildCoursePngKey = (
  courseId: string,
  language: string,
  partId: string,
  chapterId: string,
  slideId: string,
  fileName: string,
  slideNumber: number,
  type: 'original' | 'proofread' = 'original',
): string => {
  if (type === 'original') {
    // For original, we now list all PNG files in the directory
    return buildOriginalPngDirectory(courseId, language, partId, chapterId);
  }
  // For proofread/translated, we would need the ppt_resource_path
  // This is a fallback that constructs a path similar to the original logic
  const baseName = fileName.replace(/\.pptx$/i, '');
  return `contribute/${courseId}/${language}/${partId}/${chapterId}/${slideId}/png/${baseName}-proofread_${slideNumber}.png`;
};
