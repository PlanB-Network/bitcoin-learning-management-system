import type { CourseResponse } from '@blms/types';
import { TextTag } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { addSpaceToCourseIndex } from '#src/utils/courses.ts';

export const CourseTitle = ({ course }: { course: CourseResponse }) => {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="flex items-center gap-2 group"
    >
      <TextTag
        size="small"
        variant="brown"
        className="uppercase w-fit shrink-0"
      >
        {addSpaceToCourseIndex(course.index)}
      </TextTag>
      <h3 className="subtitle-base text-neutral-900 line-clamp-1 group-hover:text-orange-500">
        {course.name}
      </h3>
    </Link>
  );
};
