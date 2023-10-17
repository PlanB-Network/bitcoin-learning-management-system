import { Link } from '@tanstack/react-router';

import { CourseProgressExtended } from '@sovereign-university/types';

import BitcoinEgg from '../../../assets/icons/bitcoin_egg.svg?react';
import { Button } from '../../../atoms/Button';
import { compose } from '../../../utils';

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
              <span className="font-bold uppercase text-orange-600">
                {course.course_id}
              </span>
              <div className="italic text-orange-600">
                {course.progress_percentage}%
              </div>
            </div>
            <div className="relative flex h-2 w-full rounded-r-full">
              <div className="absolute h-2 w-full bg-orange-200"></div>
              <div
                style={{ width: `${course.progress_percentage}%` }}
                className={`absolute h-2 bg-orange-500`}
              ></div>
              <BitcoinEgg
                style={{ marginLeft: `${course.progress_percentage - 2}%` }}
                className="absolute top-[-12px]"
              />
              {/* const isCompleted = course.chapters?.some(
                  (chapter) => chapter.chapter === index + 1,
                ); */}
              {/* {course.progress_percentage}% */}
            </div>
          </div>
          {course.progress_percentage !== 10 && (
            <div
              className={compose(
                'self-end pt-2 pr-0 md:p-2 md:pr-0',
                course.progress_percentage === 100 ? 'invisible' : '',
              )}
            >
              <Link
                to={'/courses/$courseId/$partIndex/$chapterIndex'}
                params={{
                  courseId: course.course_id,
                  partIndex: '1', // TODO .part et faire +1 sur un des 2
                  chapterIndex: '1', //String(course.lastCompletedChapter.chapter + 1),
                }}
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
      <div className="w-full rounded-3xl bg-white p-6 py-8 text-center text-sm font-medium italic text-blue-800 md:rounded-none md:bg-transparent">
        <Link to={'/courses'} className="text-orange-600">
          Start a course
        </Link>{' '}
        to see your progress here!
      </div>
    )}
  </div>
);
