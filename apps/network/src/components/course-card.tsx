import { formatNameForURL } from '@blms/shared';
import type { CourseResponse, JoinedCourse } from '@blms/types';
import { Button, cn, Image, ListItem, TextTag } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { t } from 'i18next';
import { TbChevronRight } from 'react-icons/tb';
import HalfFilledStar from '#src/assets/half-filled-star.svg?react';
import { assetUrl, normalizeString } from '#src/utils/misc.tsx';

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

        <div className="flex md:flex-col max-md:items-center max-md:gap-2 max-md:mb-2 md:mb-2 md:px-4">
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
                <TextTag
                  size="small"
                  variant="lightMaroon"
                  mode={mode}
                  className="uppercase"
                >
                  {t(`words.level.${course.level}`)}
                </TextTag>
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
              <span className="flex items-center gap-1">
                <HalfFilledStar className="size-5" />
                <span className="text-yellow-500 text-sm font-semibold leading-none tracking-[-0.15px]">
                  {course.averageRating.toFixed(1)}
                </span>
              </span>
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
