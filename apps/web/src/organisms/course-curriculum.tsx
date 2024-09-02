import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { JoinedCourseWithAll } from '@blms/types';

export const CourseCurriculum = ({
  course,
}: {
  course: JoinedCourseWithAll;
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col max-w-5xl">
      <h4 className="mb-2.5 lg:mb-4 text-[#060B15] title-medium-sb-18px lg:title-large-sb-24px">
        {t('dashboard.teacher.courses.curriculum')}
      </h4>
      <p className="mb-8 body-14px lg:body-16px">
        {t('dashboard.teacher.courses.curriculumDescription')}
      </p>
      <section className="flex flex-col gap-5">
        {course.parts?.map((part, partIndex) => (
          <details key={partIndex} className="group">
            <summary className="subtitle-large-caps-22px max-lg:text-lg cursor-pointer w-fit">
              <span className="inline group-open:hidden mr-2">+</span>
              <span className="hidden group-open:inline mr-2">-</span>
              {part.title}
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
                        to={'/courses/$courseId/$chapterId'}
                        params={{
                          courseId: course.id,
                          chapterId: chapter.chapterId,
                        }}
                        className="label-medium-16px hover:font-medium hover:underline"
                      >
                        {`${partIndex + 1}.${chapter.chapterIndex} - ${chapter.title}`}
                      </Link>
                      <Link
                        to={`https://github.com/PlanB-Network/bitcoin-educational-content/tree/dev/courses/${course.id}`}
                        className="leading-[156.25%] underline text-darkOrange-5 max-lg:hidden"
                      >
                        {t('dashboard.teacher.courses.editOnGithub')}
                      </Link>
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
