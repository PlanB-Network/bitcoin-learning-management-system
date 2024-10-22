import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BsCheck } from 'react-icons/bs';

import type { JoinedCourseWithAll } from '@blms/types';
import { TextTag, cn } from '@blms/ui';

import { useSmaller } from '#src/hooks/use-smaller.ts';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';

export const CourseCurriculum = ({
  course,
  courseHasToBePurchased = false,
  completedChapters,
  nextChapter,
  hideGithubLink = false,
  className,
  children,
}: {
  course: JoinedCourseWithAll;
  courseHasToBePurchased?: boolean;
  completedChapters?: string[];
  nextChapter?: string;
  hideGithubLink?: boolean;
  className?: string;
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation();

  const isTablet = useSmaller('lg');

  return (
    <div className={cn('flex flex-col max-w-5xl text-newBlack-1', className)}>
      {children}
      <section className="flex flex-col gap-5">
        {course.parts?.map((part, partIndex) => (
          <details key={partIndex} className="group">
            <summary className="cursor-pointer w-full flex gap-2">
              <span className="inline group-open:hidden subtitle-large-caps-22px max-lg:text-lg">
                +
              </span>
              <span className="hidden group-open:inline subtitle-large-caps-22px max-lg:text-lg">
                -
              </span>
              <div className="flex gap-2 max-md:flex-col md:justify-between md:items-center w-full">
                <span className="subtitle-large-caps-22px max-lg:text-lg">
                  {part.title}
                </span>

                {part.chapters.every(
                  (chapter) =>
                    chapter?.chapterId &&
                    completedChapters?.includes(chapter.chapterId),
                ) && (
                  <TextTag
                    variant="orange"
                    size={isTablet ? 'verySmall' : 'small'}
                    className="flex gap-2.5 w-fit font-medium"
                  >
                    {t('dashboard.myCourses.done')}
                    <BsCheck size={18} className="shrink-0" />
                  </TextTag>
                )}

                {part.chapters.some(
                  (chapter) => chapter?.chapterId === nextChapter,
                ) && (
                  <div className="flex flex-col gap-3 lg:hidden">
                    <span className="body-14px-medium text-newBlack-1">
                      {t('dashboard.myCourses.completedOutOf', {
                        completed: part.chapters.filter(
                          (chapter) =>
                            chapter?.chapterId &&
                            completedChapters?.includes(chapter.chapterId),
                        )?.length,
                        total: part.chapters.length,
                      })}
                    </span>
                    <Link
                      to={
                        courseHasToBePurchased
                          ? ''
                          : '/courses/$courseId/$chapterId'
                      }
                      params={{
                        courseId: course.id,
                        chapterId: nextChapter,
                      }}
                      className={cn(
                        'flex items-center',
                        courseHasToBePurchased && 'pointer-events-none',
                      )}
                    >
                      <ButtonWithArrow variant="primary" size="s">
                        {t('dashboard.myCourses.resumeLesson')}
                      </ButtonWithArrow>
                    </Link>
                  </div>
                )}
              </div>
            </summary>
            <div className="flex flex-col gap-2.5 lg:gap-4 mt-5">
              {part.chapters?.map((chapter, index) => {
                return (
                  chapter !== undefined && (
                    <div
                      key={index}
                      className="flex justify-between items-center pl-4 lg:pl-8"
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
                        <span
                          className={cn(
                            'label-medium-16px group-hover/link:font-medium group-hover/link:underline',
                            nextChapter === chapter.chapterId &&
                              'text-darkOrange-5 font-medium',
                          )}
                        >{`${partIndex + 1}.${chapter.chapterIndex} - ${chapter.title}`}</span>
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

                      {completedChapters?.includes(chapter.chapterId) && (
                        <TextTag
                          variant="orange"
                          size="small"
                          className="flex gap-2.5 w-fit font-medium max-lg:hidden"
                        >
                          {t('dashboard.myCourses.done')}
                          <BsCheck size={18} className="shrink-0" />
                        </TextTag>
                      )}

                      {nextChapter === chapter.chapterId && (
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
                            'flex items-center',
                            courseHasToBePurchased && 'pointer-events-none',
                          )}
                        >
                          <ButtonWithArrow
                            variant="primary"
                            size="s"
                            className="max-lg:hidden"
                          >
                            {t('dashboard.myCourses.resumeLesson')}
                          </ButtonWithArrow>
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
