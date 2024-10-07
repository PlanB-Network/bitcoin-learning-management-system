import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { JoinedCourseWithAll } from '@blms/types';
import { cn } from '@blms/ui';

export const CourseCurriculum = ({
  course,
  courseHasToBePurchased = false,
  hideGithubLink = false,
  className,
  children,
}: {
  course: JoinedCourseWithAll;
  courseHasToBePurchased?: boolean;
  hideGithubLink?: boolean;
  className?: string;
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation();

  return (
    <div className={cn('flex flex-col max-w-5xl text-newBlack-1', className)}>
      {children}
      <section className="flex flex-col gap-5">
        {course.parts?.map((part, partIndex) => (
          <details key={partIndex} className="group">
            <summary className="subtitle-large-caps-22px max-lg:text-lg cursor-pointer w-fit flex gap-2">
              <span className="inline group-open:hidden">+</span>
              <span className="hidden group-open:inline">-</span>
              <span>{part.title}</span>
            </summary>
            <div className="flex flex-col gap-2.5 lg:gap-4 mt-5">
              {part.chapters?.map((chapter, index) => {
                return (
                  chapter !== undefined && (
                    <div
                      key={index}
                      className="flex justify-between items-center pl-8"
                    >
                      <Link
                        to={
                          courseHasToBePurchased
                            ? ''
                            : '/courses/$courseId/$chapterId'
                        }
                        params={{
                          courseId: course.id,
                          chapterId: chapter.chapterId,
                        }}
                        className={cn(
                          'flex items-center group/link gap-7',
                          courseHasToBePurchased && 'pointer-events-none',
                        )}
                      >
                        <span className="label-medium-16px group-hover/link:font-medium group-hover/link:underline">{`${partIndex + 1}.${chapter.chapterIndex} - ${chapter.title}`}</span>
                        {chapter.startDate &&
                          chapter.startDate > new Date() && (
                            <span className="text-newGray-1 leading-[121%] hover:no-underline max-lg:hidden">
                              {'//'}{' '}
                              {new Intl.DateTimeFormat(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true,
                                timeZoneName: 'short',
                              }).format(new Date(chapter.startDate))}
                              {chapter.addressLine1 &&
                                ` - ${chapter.addressLine1}`}
                            </span>
                          )}
                      </Link>
                      {!hideGithubLink && (
                        <Link
                          to={`https://github.com/PlanB-Network/bitcoin-educational-content/tree/dev/courses/${course.id}`}
                          className="leading-[156.25%] underline text-darkOrange-5 max-lg:hidden"
                        >
                          {t('dashboard.teacher.courses.editOnGithub')}
                        </Link>
                      )}
                    </div>
                  )
                );
              })}
            </div>
          </details>
        ))}
      </section>
    </div>
  );
};
