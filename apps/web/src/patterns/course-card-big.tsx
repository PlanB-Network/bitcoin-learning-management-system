import { formatNameForURL, getCountryForFlagFromAddress } from '@blms/shared';
import type { CourseResponse, JoinedCourse } from '@blms/types';
import { Button, cn, Flag, Image } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { t } from 'i18next';
import { TbCalendarEvent, TbChevronRight, TbClock } from 'react-icons/tb';
import { formatShortDateRange } from '#src/utils/date.ts';
import { assetUrl, resourceImgUrl } from '#src/utils/index.js';

const courseCardStyles = cva('group flex flex-col w-full rounded-2xl', {
  defaultVariants: {
    color: 'primary',
  },
  variants: {
    color: {
      featured: '',
      primary: 'bg-transparent border border-neutral-100',
    },
  },
});

export const CourseCardBig = ({
  course,
  featured = false,
  className,
}: {
  course: JoinedCourse | CourseResponse;
  featured?: boolean;
  className?: string;
}) => {
  const dateString = formatShortDateRange(course.startDate, course.endDate);

  return (
    <Link
      key={course.id}
      to={`/courses/${formatNameForURL(course.name)}-${course.id}`}
      className={cn(
        'flex w-full max-lg:mx-auto max-lg:max-w-[340px]',
        className,
      )}
    >
      <article
        className={`flex flex-row w-full ${courseCardStyles({
          color: featured ? 'featured' : 'primary',
        })}`}
      >
        <DesktopCourseThumbnail course={course} />

        <div className="grow min-w-0 w-full">
          <MobileCourseThumbnail course={course} />

          <div className="flex flex-col p-4 h-full w-full">
            <span className="mt-4 flex flex-col w-full line-clamp-2 title-medium align-top mb-2 lg:mb-0">
              {course.name}
            </span>
            <p className="text-neutral-600 body-small lg:line-clamp-4">
              {course.goal}
            </p>

            <div className="flex flex-row my-4 items-center">
              {course.mainProfessors.map((professor) => (
                <Image
                  key={professor.id}
                  src={resourceImgUrl(professor, 'profile.webp')}
                  alt={professor.name}
                  breakpoints={{ default: 100, lg: 150 }}
                  className={cn(
                    'size-6 rounded-full z-10 object-cover [overflow-clip-margin:_unset]',
                  )}
                />
              ))}

              <span className="ml-2 max-lg:body-small">
                {course.mainProfessors.map((professor) => professor.name)}
              </span>
            </div>

            <div className="w-full lg:mt-auto flex flex-col flex-wrap lg:flex-row gap-5 lg:gap-2 text-nowrap justify-between overflow-hidden border-t-1 border-neutral-50 pt-5">
              <div className="grow-3 body-base-bold flex flew-row gap-1 mx-2">
                {course.format === 'online' || course.format === 'hybrid' ? (
                  <span>{t('accessType.online')}</span>
                ) : null}
                {course.format === 'hybrid' ? (
                  <span className="text-neutral-100">|</span>
                ) : null}
                {course.format === 'inperson' || course.format === 'hybrid' ? (
                  <div className="flex flex-row gap-2">
                    <Flag
                      code={getCountryForFlagFromAddress(
                        course.addressLine1 || '',
                      )}
                      size="s"
                      className="self-center"
                      isRound={true}
                    />
                    <span>{course.addressLine1}</span>
                  </div>
                ) : null}
              </div>
              <div className="grow-1 flex flex-row gap-2 items-center mx-2">
                <TbCalendarEvent className="h-5 w-5 text-brown-400" />
                <span className="body-base-bold text-brown-800 ">
                  {dateString}
                </span>
              </div>
              <div className="max-lg:hidden flex flex-row gap-2 items-center mx-2">
                <TbClock className="h-5 w-5 text-brown-400" />
                <span className="body-base-bold text-brown-800">{`${course.hours} hours`}</span>
              </div>

              <Button
                variant="primary"
                className="lg:hidden w-full mt-2"
                size={'m'}
              >
                {t('words.discover')}
                <span className="ml-2">{'>'}</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="max-lg:hidden self-center mx-4 w-fit">
          <TbChevronRight className="h-5 w-5 text-neutral-300" />
        </div>
      </article>
    </Link>
  );
};

const DesktopCourseThumbnail = ({
  course,
}: {
  course: JoinedCourse | CourseResponse;
}) => {
  return (
    <Image
      loading="lazy"
      src={assetUrl(
        `courses/${course.index}`,
        'thumbnail.webp',
        course.lastCommit,
      )}
      alt={course.name}
      breakpoints={{ default: 800 }}
      className="max-lg:hidden w-[230px] xl:w-[338px] rounded-l-2xl object-cover"
    />
  );
};

const MobileCourseThumbnail = ({
  course,
}: {
  course: JoinedCourse | CourseResponse;
}) => {
  return (
    <div className="w-full">
      <Image
        loading="lazy"
        width={'full'}
        src={assetUrl(
          `courses/${course.index}`,
          'thumbnail.webp',
          course.lastCommit,
        )}
        alt={course.name}
        breakpoints={{ default: 500 }}
        className="lg:hidden rounded-t-2xl h-[172px] w-full object-cover"
      />
    </div>
  );
};
