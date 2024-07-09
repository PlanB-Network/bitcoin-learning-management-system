export function addSpaceToCourseId(courseId?: string) {
  if (!courseId) return '';

  return `${courseId.match(/\D+/)?.[0] || ''} ${
    courseId.match(/\d+/)?.[0] || ''
  }`;
}
