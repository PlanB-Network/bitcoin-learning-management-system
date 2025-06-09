import type { CourseResponse, JoinedCourse } from '@blms/types';
import { ListItem, cn } from '@blms/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { CourseCurriculum } from '#src/patterns/course-curriculum.tsx';
import { assetUrl, trpc } from '#src/utils/index.ts';
import { MakeModificationBlock } from './make-modification.tsx';

export const CourseDetails = ({ course }: { course: JoinedCourse }) => {
  const { t, i18n } = useTranslation();

  const courseItems = {
    'Course Name': course.name,
    Professor: course.mainProfessors
      .map((professor) => professor.name)
      .join(', '),
    Level: t(`words.level.${course.level}`),
    Duration: `${course.hours} ${t('words.hours')}`,
    Price:
      (course.onlinePriceDollars && course.onlinePriceDollars > 0) ||
      (course.inpersonPriceDollars && course.inpersonPriceDollars > 0)
        ? `$${course.inpersonPriceDollars} (in-person) \n $${course.onlinePriceDollars} (online)`
        : t('words.free'),
    'Course ID': course.index.toUpperCase(),
  };

  const { data: courseWithDetails, isFetched } =
    trpc.content.getCourse.useQuery(
      {
        id: course.id,
        language: i18n.language,
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    );

  const infoTextClasses =
    'flex flex-col py-1 px-4 bg-white rounded-md border border-newGray-4 overflow-y-scroll text-newBlack-3 body-14px !leading-[120%] whitespace-pre-line scrollbar-light';

  const labelClasses = 'leading-tight font-medium text-black';

  // Hack to ensure that the max height of second column is equal to the first column (not reproducible with CSS alone)
  const goalAndObjectivesRef = useRef<HTMLDivElement | null>(null);
  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const [goalAndObjectivesHeight, setGoalAndObjectivesHeight] = useState(0);

  useEffect(() => {
    if (goalAndObjectivesRef.current && descriptionRef.current) {
      const height1 =
        goalAndObjectivesRef.current.getBoundingClientRect().height;
      setGoalAndObjectivesHeight(height1);
    }
  }, [course]);
  // End of hack

  return (
    <div className="flex flex-col text-dashboardSectionTitle w-full mt-3 lg:mt-10">
      <h2 className="mb-2.5 lg:mb-4 text-dashboardSectionTitle title-medium-sb-18px lg:title-large-sb-24px">
        {course.name}
      </h2>
      <p className="text-dashboardSectionText/75 body-14px lg:body-16px">
        {t('dashboard.teacher.courses.quickRecap')}
      </p>

      <div className="flex flex-col gap-6 mb-5 mt-6 lg:mb-8 lg:mt-10 lg:bg-newGray-6 lg:shadow-course-navigation lg:rounded-[20px] lg:p-5 max-w-xl lg:max-w-5xl">
        {/* Course details section */}
        <div className="flex flex-col gap-5 lg:gap-10 w-full items-center">
          <div className="flex max-lg:flex-col items-center justify-center w-full gap-x-[60px] gap-y-5">
            <div className="flex flex-col gap-2.5 w-full max-w-[517px]">
              <div className="flex flex-col w-full">
                {Object.entries(courseItems).map(([key, value]) => (
                  <ListItem
                    key={key}
                    leftText={key}
                    rightText={value.toLocaleString()}
                    variant="light"
                  />
                ))}
              </div>
            </div>
            {/* Course image section */}
            <div className="w-full max-w-[406px] flex justify-center items-center max-lg:-order-1">
              <img
                src={assetUrl(
                  `courses/${course.index}`,
                  'thumbnail.webp',
                  course.lastCommit,
                )}
                alt={course.name}
                className="rounded-[20px] shadow-course-navigation"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-5">
            <div
              className="flex flex-col gap-5 lg:flex-1"
              ref={goalAndObjectivesRef}
            >
              <div className="flex flex-col gap-3 w-full">
                <span className={labelClasses}>{t('words.goal')}</span>
                <p className={infoTextClasses}>{course.goal}</p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <span className={labelClasses}>
                  {t('dashboard.teacher.courses.objectives')}
                </span>
                <ul
                  className={cn(
                    'gap-0.5 w-full list-disc list-inside',
                    infoTextClasses,
                  )}
                >
                  {course.objectives.map((objective, i) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div
              className="flex flex-col gap-3 w-full  lg:flex-1 max-lg:!max-h-full"
              style={{ maxHeight: `${goalAndObjectivesHeight}px` }}
              ref={descriptionRef}
            >
              <span className={labelClasses}>
                {t('dashboard.teacher.courses.courseLongDescription')}
              </span>
              <div className={cn('gap-2 w-full', infoTextClasses)}>
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h3 className="title-small-med-16px">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <div className="body-14px">{children}</div>
                    ),
                  }}
                >
                  {course.rawDescription}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TODO: check why we need type */}
      {isFetched && (
        <CourseCurriculum course={courseWithDetails as CourseResponse}>
          <h4 className="mb-2.5 lg:mb-4 text-dashboardSectionTitle title-medium-sb-18px lg:title-large-sb-24px">
            {t('dashboard.teacher.courses.curriculum')}
          </h4>
          <p className="mb-8 body-14px lg:body-16px">
            {t('dashboard.teacher.courses.curriculumDescription')}
          </p>
        </CourseCurriculum>
      )}

      <MakeModificationBlock
        title={t('dashboard.teacher.courses.makeModifications')}
        titleLink={`https://github.com/PlanB-Network/bitcoin-educational-content/tree/dev/courses/${course.id}`}
        text="dashboard.teacher.courses.courseModification"
        textLink="/tutorials/others/contribution/5862003b-9d76-47f5-a9e0-5ec74256a8ba"
      />
    </div>
  );
};
