export function addSpaceToCourseId(courseId: string) {
  return `${courseId.match(/\D+/)?.[0] || ''} ${
    courseId.match(/\d+/)?.[0] || ''
  }`;
}

export function fakeCourseId(courseId: string) {
  if (courseId === 'cuboplus') {
    return 'btc401';
  } else if (courseId === 'rgb') {
    return 'btc402';
  } else {
    return courseId;
  }
}
