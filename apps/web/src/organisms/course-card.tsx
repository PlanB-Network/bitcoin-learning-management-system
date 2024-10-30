import { cva } from 'class-variance-authority';
import { t } from 'i18next';
import { FaArrowRightLong } from 'react-icons/fa6';

import type { JoinedCourse } from '@blms/types';
import { Button, cn } from '@blms/ui';

import { ListItem } from '#src/components/ListItem/list-item.tsx';
import { StarRating } from '#src/components/Stars/star-rating.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';

const courseCardStyles = cva(
  'group flex flex-col w-full md:h-[472px] p-2.5 overflow-hidden',
  {
    variants: {
      color: {
        primary: 'bg-tertiary-10',
      },
      borderRadius: {
        courses: 'rounded-[10px] md:rounded-[20px]',
      },
    },
    defaultVariants: {
      color: 'primary',
      borderRadius: 'courses',
    },
  },
);

export const CourseCard = ({
  course,
  color,
  borderRadius,
}: {
  course: JoinedCourse;
  color?: 'primary';
  borderRadius?: 'courses';
}) => {
  const maxRating = 5;

  return (
    <article className={courseCardStyles({ color, borderRadius })}>
      <img
        src={computeAssetCdnUrl(
          course.lastCommit,
          `courses/${course.id}/assets/thumbnail.webp`,
        )}
        alt={course.name}
        className="max-md:hidden rounded-md mb-2.5 object-cover [overflow-clip-margin:_unset] object-center max-h-72 group-hover:max-h-44 transition-[max-height] duration-300 ease-linear"
      />
      <div className="flex md:flex-col max-md:gap-2.5 max-md:mb-2.5 md:mb-2">
        <img
          src={computeAssetCdnUrl(
            course.lastCommit,
            `courses/${course.id}/assets/thumbnail.webp`,
          )}
          alt={course.name}
          className="md:hidden rounded-md w-[124px] object-cover [overflow-clip-margin:_unset] object-center"
        />
        <div className="flex flex-col md:gap-2">
          <span className="max-md:flex flex-col md:mb-2 !line-clamp-2 font-medium leading-[120%] tracking-015px md:desktop-h6 text-white md:align-top mb-2 lg:mb-0">
            {course.name}
          </span>
          <div className="flex md:items-center flex-col md:flex-row flex-wrap gap-2 md:gap-5 md:mt-auto">
            <div className="flex md:items-center gap-1.5 md:gap-2 order-2 md:order-1">
              <span className="bg-tertiary-8 text-white rounded-sm p-1 text-xs leading-none uppercase">
                {course.id === 'btc101'
                  ? t('words.start')
                  : t(`words.level.${course.level}`)}
              </span>
              <span className="bg-tertiary-8 text-white rounded-sm p-1 text-xs leading-none uppercase">
                {course.requiresPayment ? t('words.paid') : t('words.free')}
              </span>
            </div>
            <div className="flex order-1 md:order-2">
              <StarRating
                rating={course.averageRating}
                totalStars={maxRating}
                starSize={20}
                className="gap-2"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="relative">
        <p className="text-tertiary-4 md:leading-relaxed md:tracking-[0.08px] line-clamp-3 md:line-clamp-4 transition-opacity opacity-100 md:group-hover:opacity-0 md:group-hover:absolute duration-300">
          {course.goal}
        </p>
      </div>
      <div className="max-md:hidden relative">
        <div className="flex flex-col transition-opacity opacity-0 md:group-hover:opacity-100 absolute md:group-hover:static duration-0 md:group-hover:duration-150">
          <span className="font-medium leading-normal tracking-015px mb-2 line-clamp-1">
            {t('words.professor')}:{' '}
            {course.professors.map((professor) => professor.name).join(', ')}
          </span>
          <ListItem
            leftText={t('words.duration')}
            rightText={course.hours + ' hours'}
            className="border-t"
          />
          <ListItem
            leftText={t('words.price')}
            rightText={
              course.requiresPayment
                ? course.onlinePriceDollars === null
                  ? `${course.inpersonPriceDollars}$`
                  : `${course.onlinePriceDollars}$`
                : t('words.free')
            }
            className="border-none"
          />
        </div>
      </div>
      <div className="max-md:hidden relative mt-auto">
        <Button
          variant="primary"
          size="m"
          className="w-full absolute md:group-hover:static transition-opacity opacity-0 md:group-hover:opacity-100 duration-0 md:group-hover:duration-300"
        >
          {t('courses.explorer.seeCourse')}
          <FaArrowRightLong
            className={cn(
              'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
              'group-hover:ml-3',
            )}
          />
        </Button>
      </div>
    </article>
  );
};
