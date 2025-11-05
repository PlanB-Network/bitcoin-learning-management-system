import { formatNameForURL } from '@blms/shared';
import type {
  CourseResponse,
  CourseReviewsExtended,
  JoinedCourse,
} from '@blms/types';
import { Button, cn, DividerSimple, Image, ListItem, TextTag } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { t } from 'i18next';
import { TbChevronRight, TbClock } from 'react-icons/tb';
import HalfFilledStar from '#src/assets/courses/half-filled-star.svg?react';
import { CourseLevelTag } from '#src/routes/$lang/_content/courses/-components/course-level.tsx';
import { assetUrl, resourceImgUrl, trpc } from '#src/utils/index.js';
import { normalizeString } from '#src/utils/string.ts';

const courseCardStyles = cva('group flex flex-col w-full md:h-[400px]', {
  defaultVariants: {
    borderRadius: 'courses',
    color: 'primary',
    mode: 'light',
  },
  variants: {
    borderRadius: {
      courses: 'rounded-2xl',
    },
    color: {
      primary: 'bg-transparent border border-neutral-100 dark:bg-maroon-10',
    },
    mode: {
      dark: 'dark',
      light: '',
    },
  },
});

export const CourseCard = ({
  course,
  mode = 'light',
  className,
  openInNewTab = false,
}: {
  course: JoinedCourse | CourseResponse;
  mode?: 'light' | 'dark';
  className?: string;
  openInNewTab?: boolean;
}) => {
  const { data: reviews } = useQuery(
    trpc.content.getPublicCourseReviews.queryOptions(
      {
        courseId: course.id,
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  return (
    <Link
      key={course.id}
      to={`/courses/${formatNameForURL(course.name)}-${course.id}`}
      target={openInNewTab ? '_blank' : undefined}
      className={cn('flex w-full max-md:mx-auto md:w-[256px]', className)}
    >
      <article
        className={`overflow-hidden ${courseCardStyles({
          color: 'primary',
          mode,
        })} relative`}
      >
        <Image
          width={256}
          height={193}
          loading="lazy"
          src={assetUrl(
            `courses/${course.index}`,
            'thumbnail.webp',
            course.lastCommit,
          )}
          alt={course.name}
          breakpoints={{ default: 600 }}
          className="max-md:hidden rounded-2xl mb-2 object-cover [overflow-clip-margin:_unset] object-center max-h-[193px] group-hover:max-h-[152px] transition-[max-height] ease-in-out"
        />

        <div className="flex md:flex-col max-md:items-center max-md:gap-2 max-md:mb-2 md:mb-2 md:px-4 max-md:pr-2">
          <Image
            width={124}
            height={98}
            loading="lazy"
            src={assetUrl(
              `courses/${course.index}`,
              'thumbnail.webp',
              course.lastCommit,
            )}
            alt={course.name}
            breakpoints={{ default: 300 }}
            className="md:hidden rounded-tl-2xl w-31 object-cover [overflow-clip-margin:_unset] object-center"
          />
          <div className="flex flex-col md:gap-2">
            <span className="max-md:flex flex-col !line-clamp-2 title-small md:title-base text-maroon-11 dark:text-white md:align-top mb-2 md:mb-0">
              {course.name}
            </span>
            <div className="flex md:items-center flex-wrap gap-1.5 md:gap-2 order-2 md:order-1">
              {normalizeString(course.index) === 'btc101' ? (
                <TextTag
                  size="small"
                  variant="green"
                  mode={mode}
                  className="uppercase"
                >
                  {t('words.startHere')}
                </TextTag>
              ) : (
                <CourseLevelTag level={course.level} />
              )}
              {course.requiresPayment && (
                <TextTag
                  size="small"
                  variant="yellow"
                  mode={mode}
                  className="uppercase"
                >
                  {t('courses.details.paidCourse')}
                </TextTag>
              )}
              {course.averageRating !== 0 && (
                <RatingCourseCard
                  course={course}
                  reviews={reviews}
                  className="md:hidden"
                />
              )}
            </div>
          </div>
        </div>
        <div className="relative px-2 max-md:pb-2 md:px-4">
          <p className="text-neutral-400 dark:text-maroon-4 body-small line-clamp-3 md:line-clamp-3 md:group-hover:hidden">
            {course.goal}
          </p>
        </div>

        {course.averageRating !== 0 && (
          <RatingCourseCard
            course={course}
            reviews={reviews}
            className="absolute bottom-4 right-4 max-md:hidden transition-opacity md:group-hover:hidden"
          />
        )}

        <div className="max-md:hidden relative md:px-4">
          <div className="flex-col hidden md:group-hover:flex absolute md:group-hover:static">
            <ListItem
              leftText={t('words.professor')}
              rightText={course.mainProfessors
                .map((professor) => professor.name)
                .join(', ')}
              className="border-none"
              rightTextClassName="ml-2-5 line-clamp-1"
              leftTextClassName="shrink-0"
              variant={mode === 'light' ? 'lightMaroon' : 'dark'}
            />
            <ListItem
              leftText={t('words.duration')}
              rightText={`${course.hours} hours`}
              className="border-t"
              variant={mode === 'light' ? 'lightMaroon' : 'dark'}
            />
          </div>
        </div>
        <div className="max-md:hidden relative flex justify-center w-full mt-auto">
          <div className="absolute w-full bottom-0 px-4 pb-4">
            <Button
              variant="primary"
              size="m"
              className="w-full absolute md:group-hover:static transition-opacity opacity-0 md:group-hover:opacity-100 duration-0 md:group-hover:duration-150"
            >
              {t('courses.explorer.seeCourse')}
              <TbChevronRight
                className={cn('inline-flex whitespace-nowrap ml-3')}
              />
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
};

const RatingCourseCard = ({
  course,
  reviews,
  className,
}: {
  course: JoinedCourse | CourseResponse;
  reviews: CourseReviewsExtended | null | undefined;
  className?: string;
}) => {
  return (
    <span className={cn('flex items-center gap-1', className)}>
      <HalfFilledStar className="size-5" />
      <span className="text-yellow-500 text-sm font-semibold leading-none tracking-[-0.15px]">
        {course.averageRating.toFixed(1)}
      </span>
      {reviews && (
        <span className="text-yellow-500 text-sm font-normal leading-none tracking-[-0.15px]">
          ({reviews.general.length})
        </span>
      )}
    </span>
  );
};

export const HorizontalCourseCardDesktop = ({
  course,
  className,
  openInNewTab = false,
}: {
  course: JoinedCourse | CourseResponse;
  className?: string;
  openInNewTab?: boolean;
}) => {
  const { data: reviews } = useQuery(
    trpc.content.getPublicCourseReviews.queryOptions(
      {
        courseId: course.id,
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  return (
    <Link
      key={course.id}
      to={`/courses/${formatNameForURL(course.name)}-${course.id}`}
      className={cn(
        'flex w-full gap-2 border border-neutral-100 rounded-2xl text-black hover:bg-neutral-50',
        className,
      )}
      target={openInNewTab ? '_blank' : undefined}
    >
      <Image
        src={assetUrl(
          `courses/${course.index}`,
          'thumbnail.webp',
          course.lastCommit,
        )}
        alt={course.name}
        breakpoints={{ default: 440 }}
        className="rounded-l-2xl object-cover [overflow-clip-margin:_unset] object-center w-full max-w-[160px] lg:max-w-[216px] shrink-0"
      />
      <div className="flex items-center gap-4 pl-4 pr-2 py-2.5 w-full">
        <div className="flex flex-col w-full">
          <span className="title-medium">{course.name}</span>
          <p className="text-neutral-600 mt-1 body-extra-small line-clamp-3">
            {course.goal}
          </p>
          <div className="flex items-center gap-1 mt-4">
            <Image
              src={resourceImgUrl(course.mainProfessors[0], 'profile.webp')}
              alt={course.mainProfessors[0]?.name}
              breakpoints={{ default: 128 }}
              className={cn(
                'size-6 rounded-full z-10 object-cover [overflow-clip-margin:_unset]',
              )}
            />
            <span className="body-small">{course.mainProfessors[0]?.name}</span>
          </div>
          <DividerSimple className="my-2.5" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-6">
              <CourseLevelTag level={course.level} addPadding />
              <span className="flex items-center p-2 gap-2">
                <TbClock className="text-brown-400" size={16} />
                <span className="body-extra-small-bold text-brown-800">
                  {t('courses.details.mobile.hours', { hours: course.hours })}
                </span>
              </span>
            </div>
            {course.averageRating !== 0 && (
              <span className="flex items-center gap-1">
                <HalfFilledStar className="size-5" />
                <span className="text-yellow-500 text-sm font-semibold leading-none tracking-[-0.15px]">
                  {course.averageRating.toFixed(1)}
                </span>
                {reviews && (
                  <span className="text-yellow-500 body-small">
                    ({reviews.general.length})
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
        <TbChevronRight className="shrink-0 text-neutral-300" size={20} />
      </div>
    </Link>
  );
};
