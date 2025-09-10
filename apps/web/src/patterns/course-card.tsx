import type { CourseResponse, JoinedCourse } from '@blms/types';
import { Button, cn, Image, ListItem, StarRating, TextTag } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { t } from 'i18next';
import { TbChevronRight } from 'react-icons/tb';
import HalfFilledStar from '#src/assets/courses/half-filled-star.svg?react';
import PlanBSchoolLogo from '#src/assets/logo/planb_school.svg';
import { formatDateRange } from '#src/utils/date.ts';
import { assetUrl } from '#src/utils/index.js';
import { formatNameForURL } from '#src/utils/string.ts';

const courseCardStyles = cva('group flex flex-col w-full md:h-[400px]', {
  defaultVariants: {
    borderRadius: 'courses',
    color: 'primary',
    mode: 'dark',
  },
  variants: {
    borderRadius: {
      courses: 'rounded-2xl',
    },
    color: {
      featured: 'bg-darkOrange-9 border border-darkOrange-5 shadow-sm-section',
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
  featured = false,
  mode = 'dark',
  className,
}: {
  course: JoinedCourse | CourseResponse;
  featured?: boolean;
  mode?: 'light' | 'dark';
  className?: string;
}) => {
  return (
    <Link
      key={course.id}
      to={`/courses/${formatNameForURL(course.name)}-${course.id}`}
      className={cn('flex w-full max-md:mx-auto md:w-[256px]', className)}
    >
      <article
        className={`overflow-hidden ${courseCardStyles({
          color: featured ? 'featured' : 'primary',
          mode,
        })} relative`}
      >
        {/* Badge for Featured Card */}
        {featured && (
          <span className="absolute uppercase -top-px -left-px bg-white border border-white text-black body-semibold-12px md:title-medium-sb-18px rounded-tl-2xl py-1 px-2.5 md:py-2.5 md:px-4 rounded-br-2xl z-10">
            {t('words.startHere')}
          </span>
        )}

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
          breakpoints={{ default: 320 }}
          className="max-md:hidden rounded-2xl mb-2 object-cover [overflow-clip-margin:_unset] object-center max-h-[193px] group-hover:max-h-[152px] transition-[max-height] ease-in-out"
        />

        <div className="flex md:flex-col max-md:gap-2 max-md:mb-2 md:mb-2 md:px-4">
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
            breakpoints={{ default: 124 }}
            className="md:hidden rounded-tl-2xl w-31 object-cover [overflow-clip-margin:_unset] object-center"
          />
          <div className="flex flex-col md:gap-2">
            <span className="max-md:flex flex-col !line-clamp-1 md:!line-clamp-2 title-base text-maroon-11 dark:text-white md:align-top mb-2 md:mb-0">
              {course.name}
            </span>
            <span className="flex items-center gap-1 md:hidden mb-2.5">
              <HalfFilledStar className="size-5" />
              <span className="text-yellow-500 text-sm font-semibold leading-none tracking-[-0.15px]">
                {course.averageRating.toFixed(1)}
              </span>
            </span>
            <div className="flex flex-col flex-wrap gap-2.5 md:mt-auto">
              <div className="flex md:items-center gap-1.5 md:gap-2 order-2 md:order-1">
                <TextTag
                  size="verySmall"
                  variant="lightMaroon"
                  mode={mode}
                  className="uppercase"
                >
                  {t(`words.level.${course.level}`)}
                </TextTag>
                {course.requiresPayment && (
                  <TextTag
                    size="verySmall"
                    variant="yellow"
                    mode={mode}
                    className="uppercase"
                  >
                    {t('courses.details.paidCourse')}
                  </TextTag>
                )}
                <span className="flex items-center gap-1 max-md:hidden">
                  <HalfFilledStar className="size-5" />
                  <span className="text-yellow-500 text-sm font-semibold leading-none tracking-[-0.15px]">
                    {course.averageRating.toFixed(1)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative px-2 max-md:pb-2 md:px-4">
          <p className="text-neutral-400 dark:text-maroon-4 body-small line-clamp-3 md:line-clamp-5 transition-opacity opacity-100 md:group-hover:opacity-0 md:group-hover:absolute">
            {course.goal}
          </p>
        </div>
        <div className="max-md:hidden relative md:px-4">
          <div className="flex flex-col transition-opacity opacity-0 md:group-hover:opacity-100 absolute md:group-hover:static duration-0 md:group-hover:duration-150">
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

export const CourseCardExtended = ({
  course,
}: {
  course: JoinedCourse | CourseResponse;
}) => {
  const maxRating = 5;

  return (
    <Link
      key={course.id}
      to={`/courses/${formatNameForURL(course.name)}-${course.id}`}
      className="flex w-full max-w-[730px] max-md:mx-auto"
    >
      <article
        className={
          'overflow-hidden group flex flex-col w-full max-md:max-w-[500px] max-md:mx-auto md:h-[472px] p-2.5 bg-darkOrange-9 border border-darkOrange-5 shadow-sm-section rounded-[10px] md:rounded-2xl relative'
        }
      >
        <span className="absolute uppercase -top-px -left-px bg-white border border-white rounded-tl-[10px] md:rounded-tl-2xl rounded-br-[10px] py-1 px-2.5 md:py-2.5 md:px-4 md:rounded-br-2xl z-10 shrink-0 max-md:w-[95px]">
          <Image
            src={PlanBSchoolLogo}
            alt="Plan B School"
            loading="lazy"
            breakpoints={{ default: 320 }}
          />
        </span>

        <div className="flex flex-col md:flex-row gap-2.5 md:gap-5 h-full md:max-h-[270px] md:group-hover:max-h-[250px] transition-[max-height] ease-in-out overflow-hidden">
          <Image
            width={320}
            height={224}
            loading="lazy"
            src={assetUrl(
              `courses/${course.index}`,
              'thumbnail.webp',
              course.lastCommit,
            )}
            alt={course.name}
            breakpoints={{ default: 320 }}
            className="w-full rounded-md object-cover [overflow-clip-margin:_unset] object-center md:min-w-[358px]"
          />

          <div className="flex flex-col max-md:gap-1.5">
            <span className="max-md:flex flex-col !line-clamp-2 subtitle-large-med-20px md:desktop-h6 text-white md:align-top">
              {course.name}
            </span>
            <div className="flex flex-col flex-wrap gap-2.5 mt-3">
              <div className="flex md:items-center gap-1.5 md:gap-2 order-2 md:order-1">
                <TextTag
                  size="verySmall"
                  variant="lightMaroon"
                  mode="dark"
                  className="uppercase"
                >
                  {course.index === 'btc101'
                    ? t('words.start')
                    : t(`words.level.${course.level}`)}
                </TextTag>
                <TextTag
                  size="verySmall"
                  variant="lightMaroon"
                  mode="dark"
                  className="uppercase"
                >
                  {course.requiresPayment
                    ? t('courses.details.paidCourse')
                    : t('words.free')}
                </TextTag>
              </div>
              <div className="flex order-1 md:order-2">
                <StarRating
                  rating={Number(course.averageRating.toFixed(1))}
                  totalStars={maxRating}
                  starSize={20}
                  className="gap-2"
                />
              </div>
            </div>
            <p className="text-maroon-4 md:leading-relaxed md:tracking-[0.08px] line-clamp-3 md:line-clamp-6 md:group-hover:line-clamp-5 mt-2.5 md:mt-3 max-md:desktop-typo1">
              {course.goal}
            </p>
          </div>
        </div>

        <div className="md:relative md:mt-4">
          <div className="flex flex-col md:absolute w-full">
            <ListItem
              leftText={t('words.professor')}
              rightText={course.mainProfessors
                .map((professor) => professor.name)
                .join(', ')}
              className="border-none max-md:hidden"
              rightTextClassName="ml-2-5 line-clamp-1"
              leftTextClassName="shrink-0"
              variant="dark"
            />
            {course.startDate && course.endDate && (
              <ListItem
                leftText={t('dashboard.calendar.calendar')}
                rightText={formatDateRange(course.startDate, course.endDate)}
                className="md:border-t"
                variant="dark"
              />
            )}
            <ListItem
              leftText={t('words.duration')}
              rightText={`${course.hours} hours`}
              className="border-t md:group-hover:hidden max-md:hidden"
              variant="dark"
            />
            <ListItem
              leftText={t('words.mode')}
              rightText={
                course.format === 'online'
                  ? t('accessType.online')
                  : course.format === 'inperson'
                    ? t('accessType.physical')
                    : t('accessType.hybrid')
              }
              className="border-t"
              rightTextClassName="lowercase"
              variant="dark"
            />
            <ListItem
              leftText={t('words.price')}
              rightText={
                course.requiresPayment
                  ? course.inpersonPriceDollars
                    ? `$${course.inpersonPriceDollars}`
                    : t('words.free')
                  : t('words.free')
              }
              className="border-t max-md:pb-0"
              variant="dark"
            />
          </div>
        </div>
        <div className="max-md:hidden relative flex justify-center w-full mt-auto">
          <div className="absolute w-full bottom-0">
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
