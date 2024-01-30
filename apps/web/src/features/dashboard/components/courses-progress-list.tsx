import { Link } from '@tanstack/react-router';
import { t } from 'i18next';

import OrangePill from '../../../assets/icons/orange_pill_color_gradient.svg';
import { Button } from '../../../atoms/Button';
import { compose } from '../../../utils';
import { addSpaceToCourseId } from '../../../utils/courses';
import { TRPCRouterOutput } from '../../../utils/trpc';

export const CoursesProgressList = ({
  courses,
}: {
  courses?: NonNullable<TRPCRouterOutput['user']['courses']['getProgress']>;
}) => (
  <div className="flex flex-col justify-start gap-4 md:gap-0">
    {courses && courses.length > 0 ? (
      courses.map((course) => (
        <div
          key={course.course_id}
          className="flex flex-col items-start justify-start space-x-8 rounded-3xl bg-white px-6 py-4 md:flex-row md:rounded-none md:bg-transparent md:px-0 md:py-2"
        >
          <div className="flex w-full flex-col items-start justify-start space-y-2 py-2">
            <div className="flex w-full items-center justify-between">
              <span className="text-xl font-semibold uppercase text-orange-600 sm:text-base">
                {addSpaceToCourseId(course.course_id)}
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
              <img
                src={OrangePill}
                style={{ marginLeft: `${course.progress_percentage - 2}%` }}
                className={compose('absolute top-[-12px] w-[14px]')}
                alt=""
              />
            </div>
          </div>
          {/* Only for courses in progress */}
          <div
            className={compose(
              'flex flex-row gap-2 self-end pt-2 pr-0 md:p-2 md:pr-0',
              course.progress_percentage === 100 ? 'hidden' : '',
            )}
          >
            <Link
              to={'/courses/$courseId/$partIndex/$chapterIndex'}
              params={{
                courseId: course.course_id,
                partIndex: String(course.lastCompletedChapter.part), // TODO .part et faire +1 sur un des 2
                chapterIndex: String(course.lastCompletedChapter.chapter),
              }}
            >
              <Button variant="tertiary" size="xs" rounded className="px-3">
                {t('words.resume').toLowerCase()}
              </Button>
            </Link>
            <Link to={''}>
              <Button variant="secondary" size="xs" rounded className="px-3">
                {t('words.details').toLowerCase()}
              </Button>
            </Link>
          </div>
          {/* Only for Completed course */}
          <div
            className={compose(
              'flex flex-row gap-2 self-end pt-2 pr-0 md:p-2 md:pr-0',
              course.progress_percentage !== 100 ? 'hidden' : '',
            )}
          >
            <Link to={''}>
              <Button
                variant="primary"
                size="xs"
                rounded
                className="bg-green-600 px-3"
              >
                {t('words.certificate').toLowerCase()}
              </Button>
            </Link>
            <Link to={''}>
              <Button variant="secondary" size="xs" rounded className="px-3">
                {t('words.details').toLowerCase()}
              </Button>
            </Link>
          </div>
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
