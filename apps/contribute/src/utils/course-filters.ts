import type { BasicCourse } from '@blms/types';

/**
 * Extract unique topics from courses for filtering
 */
export const getUniqueTopics = (
  courses: BasicCourse[] | undefined,
): string[] => {
  if (!courses || courses.length === 0) return ['All'];

  const topics = new Set<string>();
  topics.add('All');

  for (const course of courses) {
    if (course.topic) {
      // Capitalize the first letter of each word for consistent display
      const formattedName = course.topic
        .split(' ')
        .map(
          (word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
      topics.add(formattedName);
    }
  }

  return Array.from(topics);
};

/**
 * Filter courses by topic
 */
export const filterCoursesByTopic = (
  courses: BasicCourse[],
  selectedTopic: string,
): BasicCourse[] => {
  if (selectedTopic === 'All') {
    return courses;
  }

  return courses.filter((course: BasicCourse) => {
    // Check if course topic matches the selected topic - case insensitive
    return course.topic?.toLowerCase() === selectedTopic.toLowerCase();
  });
};
