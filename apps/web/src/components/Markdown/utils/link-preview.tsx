import type { JoinedCourse, JoinedTutorialLight } from '@blms/types';

const base = '(?:planb\\.network|planb\\.academy)';

export const getTutorial = (url: string, tutorials: JoinedTutorialLight[]) => {
  const pattern = new RegExp(`^https://${base}/tutorials/[^/]+/[^/]+/([^/]+)$`);
  const match = url.match(pattern);

  if (match) {
    const tutorialId = match[1].slice(-36);
    return tutorials.find((tutorial) => tutorial.id === tutorialId) || null;
  }

  return null;
};

export const getCourse = (url: string, courses: JoinedCourse[]) => {
  const pattern = new RegExp(`^https://${base}/courses/([^/]+)$`);
  const match = url.match(pattern);

  if (match) {
    const courseId = match[1].slice(-36);
    return courses.find((course) => course.id === courseId) || null;
  }

  return null;
};
