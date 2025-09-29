import type { CourseResponse, JoinedCourse } from '@blms/types';
import { cn, Image } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { assetUrl, resourceImgUrl } from '#src/utils/index.js';
import { formatNameForURL } from '#src/utils/string.ts';

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
  return (
    <Link
      key={course.id}
      to={`/courses/${formatNameForURL(course.name)}-${course.id}`}
      className={cn('flex w-full max-md:mx-auto]', className)}
    >
      <article
        className={`flex flex-row overflow-hidden h-[284px] ${courseCardStyles({
          color: featured ? 'featured' : 'primary',
        })}`}
      >
        <DesktopCourseThumbnail course={course} />

        <div className="w-full">
          <div className="flex md:flex-col max-md:items-center">
            <MobileCourseThumbnail course={course} />
          </div>

          <div className=" flex  flex-col p-4 h-full">
            <span className="max-md:flex flex-col !line-clamp-2 title-extra-large md:align-top mb-2 md:mb-0">
              {course.name}
            </span>
            <p className="text-neutral-600 text-base line-clamp-3">
              {course.goal}
            </p>

            <div className="flex flex-row my-2">
              {course.mainProfessors.map((professor) => (
                <Image
                  key={professor.id}
                  src={resourceImgUrl(professor, 'profile.webp')}
                  alt={professor.name}
                  breakpoints={{ default: 69, md: 128 }}
                  className={cn(
                    'size-6 rounded-full z-10 object-cover [overflow-clip-margin:_unset]',
                  )}
                />
              ))}

              <span className="ml-1">
                {course.mainProfessors.map((professor) => professor.name)}
              </span>
            </div>

            <div className="mt-auto flex flew-row justify-between">
              <p>Online | City</p>
              <div>
                <span>Dates</span>
                <span className="ml-4">{`${course.hours} hours`}</span>
              </div>
            </div>
          </div>
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
      width={338}
      height={284}
      loading="lazy"
      src={assetUrl(
        `courses/${course.index}`,
        'thumbnail.webp',
        course.lastCommit,
      )}
      alt={course.name}
      breakpoints={{ default: 320 }}
      className="max-md:hidden object-cover [overflow-clip-margin:_unset]"
    />
  );
};

const MobileCourseThumbnail = ({
  course,
}: {
  course: JoinedCourse | CourseResponse;
}) => {
  return (
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
  );
};
