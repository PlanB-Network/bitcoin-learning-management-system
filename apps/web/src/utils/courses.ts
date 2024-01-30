export function addSpaceToCourseId(courseId: string) {
  return `${courseId.match(/\D+/)?.[0] || ''} ${
    courseId.match(/\d+/)?.[0] || ''
  }`;
}

export function fakeCourseId(courseId: string) {
  if (courseId === 'cuboplus') {
    return 'ln401';
  } else {
    return courseId;
  }
}
