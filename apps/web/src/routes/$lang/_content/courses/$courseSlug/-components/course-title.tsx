import type { CourseResponse } from '@blms/types';
import { TextTag } from '@blms/ui';
import { addSpaceToCourseIndex } from '#src/utils/courses.ts';

export const CourseTitle = ({ course }: { course: CourseResponse }) => {
  return (
    <div className="flex max-md:flex-col md:items-center gap-2 md:gap-5">
      <TextTag size="base" className="uppercase w-fit max-md:hidden">
        {addSpaceToCourseIndex(course.index)}
      </TextTag>
      <h3 className="display-small-32px">{course.name}</h3>
    </div>
  );
};
