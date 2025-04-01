import type { JoinedCourse, JoinedTutorialLight } from '@blms/types';

export const getTutorial = (url: string, tutorials: JoinedTutorialLight[]) => {
  const pattern =
    /^https:\/\/planb\.network\/tutorials\/[^/]+\/[^/]+\/([^/]+)$/;
  const match = url.match(pattern);

  if (match) {
    const tutorialId = match[1].slice(-36);
    return tutorials.find((tutorial) => tutorial.id === tutorialId) || null;
  }

  return null;
};

export const getCourse = (url: string, courses: JoinedCourse[]) => {
  const pattern = /^https:\/\/planb\.network\/courses\/([^/]+)$/;
  const match = url.match(pattern);

  if (match) {
    const courseId = match[1].slice(-36);
    return courses.find((course) => course.id === courseId) || null;
  }

  return null;
};
