import { Link } from '@tanstack/react-router';
import { t } from 'i18next';

import type { CourseChapterResponse } from '@blms/types';
import { ButtonWithArrow, Divider } from '@blms/ui';

import { goToChapterParameters } from '#src/utils/courses.ts';

export const CourseExamNotTranslated = ({
  chapter,
}: {
  chapter: CourseChapterResponse;
}) => {
  const isLastChapter =
    chapter.chapterIndex === chapter.part.chapters.length &&
    chapter.part.partIndex === chapter.course.parts.length;

  return (
    <section className="flex flex-col w-full max-w-[816px] gap-7 md:gap-10">
      <div className="flex flex-col text-newBlack-1">
        <h2 className="text-[34px] leading-tight tracking-[0.25px] max-md:hidden">
          {t('courses.exam.finalExam')}
        </h2>
        <Divider
          className="mt-1 md:mt-2.5 mb-7 md:mb-10"
          width="w-full"
          mode="light"
        />

        <div className="flex flex-col gap-4 md:gap-6">
          <p className="body-16px text-justify">
            {t('courses.exam.notTranslatedYet')}
          </p>

          <p className="body-16px text-justify">
            {t('courses.exam.skipExamDescription')}
          </p>
        </div>

        <Link
          className="w-full max-md:max-w-[290px] md:w-fit mt-4 max-md:mx-auto"
          to={
            isLastChapter
              ? '/courses/$courseId'
              : '/courses/$courseId/$chapterId'
          }
          params={goToChapterParameters(chapter, 'next')}
        >
          <ButtonWithArrow
            className="w-full max-md:max-w-[290px] md:w-fit"
            variant="outline"
            size="m"
          >
            <span>
              {window.innerWidth < 768
                ? t('courses.exam.skipExam')
                : t('courses.exam.skipExamGoConclusion')}
            </span>
          </ButtonWithArrow>
        </Link>
      </div>
    </section>
  );
};
