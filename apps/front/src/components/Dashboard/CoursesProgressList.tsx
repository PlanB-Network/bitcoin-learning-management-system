import { Link, generatePath } from 'react-router-dom';

import { CourseProgressExtended } from '@sovereign-academy/types';

import { Button } from '../../atoms/Button';
import { Routes } from '../../types';
import { compose } from '../../utils';

export const CoursesProgressList = ({
  courses,
}: {
  courses: CourseProgressExtended[] | undefined;
}) => (
  <div className="flex flex-col justify-start">
    {courses && courses.length > 0 ? (
      courses.map((course) => (
        <div
          key={course.course_id}
          className="flex flex-col items-start justify-start space-x-8 rounded-3xl bg-white px-6 py-4 md:flex-row md:rounded-none md:bg-transparent md:px-0 md:py-2"
        >
          <div className="flex w-full flex-col items-start justify-start space-y-2 py-2">
            <div className="flex w-full items-center justify-between">
              <span className="font-bold uppercase text-orange-800">
                {course.course_id}
              </span>
              <div className="italic text-orange-800">
                {course.progress_percentage}%
              </div>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-r-full">
              {Array.from({ length: course.total_chapters }).map((_, index) => {
                const isCompleted = course.chapters?.some(
                  (chapter) => chapter.chapter === index + 1
                );

                return (
                  <Link
                    className="h-2 grow rounded-r-full"
                    to={generatePath(Routes.CourseChapter, {
                      courseId: course.course_id,
                      chapterIndex: String(index + 1),
                    })}
                    key={index}
                  >
                    <div
                      className={compose(
                        'h-2 grow border-x border-white last-child:rounded-r-full',
                        isCompleted ? 'bg-orange-600' : 'bg-gray-200'
                      )}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
          {course.progress_percentage !== 10 && (
            <div
              className={compose(
                'self-end pt-2 pr-0 md:p-2 md:pr-0',
                course.progress_percentage === 100 ? 'invisible' : ''
              )}
            >
              <Link
                to={generatePath(Routes.CourseChapter, {
                  courseId: course.course_id,
                  chapterIndex: String(course.lastCompletedChapter.chapter + 1),
                })}
              >
                <Button
                  variant="tertiary"
                  size="xs"
                  rounded
                  className="bg-green-500"
                >
                  resume
                </Button>
              </Link>
            </div>
          )}
        </div>
      ))
    ) : (
      <div className="text-primary-800 w-full rounded-3xl bg-white p-6 py-8 text-center text-sm font-medium italic md:rounded-none md:bg-transparent">
        <Link to={Routes.Courses} className="text-orange-800">
          Start a course
        </Link>{' '}
        to see your progress here!
      </div>
    )}
  </div>
);
