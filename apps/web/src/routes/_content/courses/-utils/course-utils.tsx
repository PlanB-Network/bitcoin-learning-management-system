import type { JoinedCourse } from '@blms/types';

export const levels = ['beginner', 'intermediate', 'advanced', 'wizard'];

export const sortCoursesByLevel = (courses: JoinedCourse[]) => {
  return courses.sort((a, b) => {
    return levels.indexOf(a.level) - levels.indexOf(b.level);
  });
};

export const toggleSelection = (
  item: string,
  activeItems: string[],
  setActiveItems: React.Dispatch<React.SetStateAction<string[]>>,
) => {
  if (item === 'all') {
    setActiveItems(['all']);
  } else {
    const isSelected = activeItems.includes(item);
    let newSelection = isSelected
      ? activeItems.filter((i) => i !== item)
      : [...activeItems.filter((i) => i !== 'all'), item];

    if (newSelection.length === 0) {
      newSelection = ['all'];
    }

    setActiveItems(newSelection);
  }
};
