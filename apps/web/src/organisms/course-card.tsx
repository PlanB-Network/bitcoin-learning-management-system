import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { t } from 'i18next';
import { FaArrowRightLong } from 'react-icons/fa6';

import type { JoinedCourse } from '@blms/types';
import { Button, TextTag, cn } from '@blms/ui';

import { ListItem } from '#src/components/ListItem/list-item.tsx';
import { StarRating } from '#src/components/Stars/star-rating.js';
import { assetUrl } from '#src/utils/index.js';

const courseCardStyles = cva('group flex flex-col w-full md:h-[472px] p-2.5', {
  variants: {
    color: {
      primary: 'bg-tertiary-10',
      featured: 'bg-darkOrange-9 border border-darkOrange-5 shadow-sm-section',
    },
    borderRadius: {
      courses: 'rounded-[10px] md:rounded-[20px]',
    },
  },
  defaultVariants: {
    color: 'primary',
    borderRadius: 'courses',
  },
});

export const CourseCard = ({
  course,
  featured = false,
}: {
  course: JoinedCourse;
  featured?: boolean;
}) => {
  const maxRating = 5;

  return (
    <Link
      key={course.id}
      to="/courses/$courseId"
      params={{ courseId: course.id }}
      className="flex w-full max-md:max-w-[500px] max-md:mx-auto md:w-[340px]"
    >
      <article
        className={`overflow-hidden ${courseCardStyles({
          color: featured ? 'featured' : 'primary',
        })} relative`}
      >
        {/* Badge for Featured Card */}
        {featured && (
          <span className="absolute uppercase -top-px -left-px bg-white border border-white text-black body-semibold-12px md:title-medium-sb-18px rounded-tl-[10px] md:rounded-tl-[20px] rounded-br-[10px] py-[5px] px-2.5 md:py-2.5 md:px-[15px] md:rounded-br-[20px] z-10">
            {t('words.startHere')}
          </span>
        )}

        <img
          src={assetUrl(`courses/${course.id}`, 'thumbnail.webp')}
          alt={course.name}
          className="max-md:hidden rounded-md mb-2.5 object-cover [overflow-clip-margin:_unset] object-center max-h-72 group-hover:max-h-44 transition-[max-height] duration-300 ease-linear"
        />
        <div className="flex md:flex-col max-md:gap-2.5 max-md:mb-2.5 md:mb-2">
          <img
            src={assetUrl(`courses/${course.id}`, 'thumbnail.webp')}
            alt={course.name}
            className="md:hidden rounded-md w-[124px] object-cover [overflow-clip-margin:_unset] object-center"
          />
          <div className="flex flex-col md:gap-2">
            <span className="max-md:flex flex-col md:mb-2 !line-clamp-2 font-medium leading-[120%] tracking-015px md:desktop-h6 text-white md:align-top mb-2 lg:mb-0">
              {course.name}
            </span>
            <div className="flex flex-col flex-wrap gap-2.5 md:mt-auto">
              <div className="flex md:items-center gap-1.5 md:gap-2 order-2 md:order-1">
                <TextTag
                  size="verySmall"
                  variant="lightMaroon"
                  mode="dark"
                  className="uppercase"
                >
                  {course.id === 'btc101'
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
          <p className="text-tertiary-4 md:leading-relaxed md:tracking-[0.08px] line-clamp-3 transition-opacity opacity-100 md:group-hover:opacity-0 md:group-hover:absolute duration-300">
            {course.goal}
          </p>
        </div>
        <div className="max-md:hidden relative">
          <div className="flex flex-col transition-opacity opacity-0 md:group-hover:opacity-100 absolute md:group-hover:static duration-0 md:group-hover:duration-150">
            <ListItem
              leftText={t('words.professor')}
              rightText={course.professors
                .map((professor) => professor.name)
                .join(', ')}
              className="border-none"
              rightTextClassName="ml-2-5 line-clamp-1"
              leftTextClassName="shrink-0"
            />
            <ListItem
              leftText={t('words.duration')}
              rightText={course.hours + ' hours'}
              className="border-t"
            />
          </div>
        </div>
        <div className="max-md:hidden relative flex justify-center w-full mt-auto">
          <div className="absolute w-full bottom-0">
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
        </div>
      </article>
    </Link>
  );
};
