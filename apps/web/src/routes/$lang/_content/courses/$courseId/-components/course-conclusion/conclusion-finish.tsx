import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import React, { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import CertificateLockImage from '#src/assets/courses/completion-diploma-lock.webp?no-inline';
import CertificateSelfPacedSatoshiImage from '#src/assets/courses/completion-diploma-satoshi-clear.webp?no-inline';
import CertificateTeacherLedSatoshiImage from '#src/assets/courses/diploma-teacher-led-satoshi.webp?no-inline';

import type { CourseExamResults, CourseResponse } from '@blms/types';
import { ButtonWithArrow, DividerSimple } from '@blms/ui';

import { useQuery } from '@tanstack/react-query';
import { AuthorCard } from '#src/components/author-card.tsx';
import { ProfessorCardReduced } from '#src/components/professor-card.tsx';
import { ProofreadingDesktop } from '#src/components/proofreading-progress.tsx';
import { CourseCard } from '#src/patterns/course-card.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { filterAndRandomizeCourses } from '#src/routes/$lang/_content/_misc/-components/certificate-display.tsx';
import { ONE_DAY_IN_MS } from '#src/utils/date.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.ts';
import { TimeStampDialog } from '../course-exam/course-exam-result.tsx';

interface ConclusionFinishProps {
  course: CourseResponse;
  examResults?: CourseExamResults;
  hasSingleTrialExamAndThreshold?: boolean;
  hasPassedCourseThreshold?: boolean;
}

export const ConclusionFinish = ({
  course,
  examResults,
  hasSingleTrialExamAndThreshold = false,
  hasPassedCourseThreshold = false,
}: ConclusionFinishProps) => {
  const { session } = useContext(AppContext);

  return (
    <>
      {!hasSingleTrialExamAndThreshold && (
        <>
          <Professor course={course} addThanksTipping />
          <Credits course={course} />
        </>
      )}
      {hasSingleTrialExamAndThreshold ? (
        hasPassedCourseThreshold ? (
          <DiplomaTeacherLed course={course} />
        ) : null
      ) : (
        <DiplomaSelfPaced examResults={examResults} course={course} />
      )}
      {course.topic === 'protocol' ? <Labs /> : null}
      <OtherCourses course={course} />
      {session?.user && (
        <Link
          to="/dashboard/courses"
          className="max-md:hidden mt-8 inline-flex"
        >
          <ButtonWithArrow variant="primary" size="l">
            {t('dashboard.backToDashboard')}
          </ButtonWithArrow>
        </Link>
      )}
    </>
  );
};

const Professor = ({
  course,
}: {
  course: CourseResponse;
  addThanksTipping?: boolean;
}) => {
  return (
    <section className="w-full flex flex-col mt-5 md:mt-8">
      <h4 className="subtitle-medium-caps-18px text-darkOrange-5">
        {t('words.professor')}
      </h4>
      <p className="mt-[15px] md:mt-6 label-large-20px md:display-small-32px text-black">
        {course.associatedProfessors.length > 0
          ? t('courses.details.coordinatedBy')
          : t('courses.details.taughtBy')}{' '}
        <span className="text-darkOrange-5 label-large-20px md:display-small-32px">
          {course.mainProfessors.map((professor, index) => (
            <React.Fragment key={professor.id}>
              <Link
                to={`/professor/${formatNameForURL(professor.name || '')}-${professor.id}`}
                className="hover:text-darkOrange-5 hover:font-medium"
              >
                {professor.name}
              </Link>
              {index < course.mainProfessors.length - 2
                ? ', '
                : index === course.mainProfessors.length - 2
                  ? ' & '
                  : ''}
            </React.Fragment>
          ))}
        </span>
      </p>
      <p className="md:mt-6 text-newBlack-1 md:text-justify body-16px md:label-large-20px max-md:hidden">
        {t('courses.details.thanksTipping')}
      </p>
      <div className="flex h-fit flex-col max-md:gap-4">
        {course.mainProfessors.map((professor) => (
          <AuthorCard
            key={professor.id}
            professor={professor}
            hasDonateButton
            centeredContent={true}
            mobileSize="medium"
          />
        ))}
        {course.associatedProfessors.length > 0 ? (
          <>
            <h4 className="mt-4 md:mt-6 text-darkOrange-5 uppercase">
              <span>{t('courses.details.associatedProfessors')}</span>
            </h4>
            <div className="my-6 flex flex-row flex-wrap gap-6 max-md:justify-center">
              {course.associatedProfessors.map((professor) => (
                <ProfessorCardReduced
                  key={professor.id}
                  professor={professor}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};

const Credits = ({ course }: { course: CourseResponse }) => {
  const { i18n } = useTranslation();

  const { data: proofreading } = useQuery(
    trpc.content.getProofreading.queryOptions({
      language: i18n.language,
      courseId: course.id,
    }),
  );

  const isOriginalLanguage = i18n.language === course.originalLanguage;
  if (!proofreading) {
    return null;
  }

  return (
    <>
      <DividerSimple className="my-5 md:mt-3 md:mb-8" />
      <section className="w-full flex flex-col">
        <h4 className="subtitle-medium-caps-18px text-darkOrange-5">
          {t('words.credits')}
        </h4>

        <p className="mt-[15px] md:mt-6 label-large-20px md:display-small-32px text-black">
          {proofreading?.contributorNames?.length > 0
            ? t('courses.details.hasBeenProofreadBy')
            : t('courses.details.hasNotBeenProofread')}
          <span className="text-darkOrange-5 label-large-20px md:display-small-32px">
            {' '}
            {proofreading?.contributorNames?.length > 0
              ? proofreading.contributorNames.map((proofreader, index) => (
                  <React.Fragment key={proofreader}>
                    <span>{proofreader}</span>
                    {index < proofreading.contributorNames.length - 2
                      ? ', '
                      : index === proofreading.contributorNames.length - 2
                        ? ' & '
                        : ''}
                  </React.Fragment>
                ))
              : ''}
          </span>
        </p>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-[50px] mt-6 md:mt-[30px]">
          <div className="max-md:mx-auto shrink-0">
            <ProofreadingDesktop
              isOriginalLanguage={isOriginalLanguage}
              mode="light"
              proofreadingData={{
                contributors: proofreading?.contributorNames || [],
                reward: proofreading?.reward,
              }}
              standalone
              variant="vertical"
            />
          </div>
          <p className="md:mb-8 text-newBlack-1 md:text-justify body-16px md:subtitle-medium-16px whitespace-pre-line">
            <Trans i18nKey={'courses.details.collaborativeEffort'}>
              <a
                className="hover:text-darkOrange-5 font-medium"
                href="https://t.me/PlanBNetwork_ContentBuilder"
                target="_blank"
                rel="noreferrer"
              >
                telegram
              </a>
              <Link
                to="/tutorials/others/contribution/content-review-tutorial-1ee068ca-ddaf-4bec-b44e-b41a9abfdef6"
                className="hover:text-darkOrange-5 font-medium"
                target="_blank"
                rel="noreferrer"
              >
                tutorial
              </Link>
              <a
                className="hover:text-darkOrange-5 font-medium"
                href="https://creativecommons.org/licenses/by-sa/4.0/deed.en"
                target="_blank"
                rel="noreferrer"
              >
                CC BY-SA
              </a>
            </Trans>
          </p>
        </div>
      </section>
    </>
  );
};

const DiplomaSelfPaced = ({
  examResults,
  course,
}: {
  examResults?: CourseExamResults;
  course: CourseResponse;
}) => {
  const examChapterId = course.parts
    .flatMap((part) => part.chapters)
    .find((chapter) => chapter?.isCourseExam)?.chapterId;

  if (!examResults && !examChapterId) {
    return null;
  }

  return (
    <>
      <DividerSimple className="my-5 md:mt-3 md:mb-8" />
      <section className="w-full flex flex-col">
        <h4 className="subtitle-medium-caps-18px text-darkOrange-5">
          {t('words.diploma')}
        </h4>

        <p className="mt-1 md:mt-6 label-large-20px md:display-small-32px text-black">
          {t('courses.exam.receiveDiploma')}
        </p>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-[50px] mt-6 md:mt-[30px]">
          <div className="max-md:mx-auto shrink-0">
            <img
              src={
                examResults?.succeeded
                  ? CertificateSelfPacedSatoshiImage
                  : CertificateLockImage
              }
              alt="Diploma"
              className="w-full max-w-[403px]"
            />
          </div>
          <div className="flex flex-col justify-between gap-4 grow md:pb-2">
            <p className="text-newBlack-1 md:text-justify body-16px md:subtitle-medium-16px whitespace-pre-line">
              {!examResults || examResults.succeeded ? (
                <Trans
                  i18nKey={
                    examResults?.succeeded
                      ? examResults?.isTimestamped
                        ? 'courses.exam.successDiploma'
                        : 'courses.exam.successDiplomaTimeStamped'
                      : 'courses.exam.examNotPassed'
                  }
                >
                  <TimeStampDialog
                    triggerText={
                      examResults?.succeeded && !examResults?.isTimestamped
                        ? t('courses.exam.timeStamping')
                        : t('courses.exam.timeStampedNoDot')
                    }
                    onHoverAddColor
                  />
                </Trans>
              ) : null}

              {examResults &&
                !examResults.succeeded &&
                t('courses.exam.failedDiploma')}
            </p>

            <Link
              to={
                examResults?.succeeded
                  ? '/dashboard/course/$courseId'
                  : '/courses/$courseId/$chapterId'
              }
              hash={examResults?.succeeded ? 'retakeExam' : ''}
              params={{
                courseId: course?.id,
                chapterId: examChapterId,
              }}
              className="w-fit"
              asChild
            >
              <ButtonWithArrow
                disabled={
                  examResults
                    ? examResults.succeeded
                      ? false
                      : new Date(examResults.startedAt).getTime() +
                          ONE_DAY_IN_MS >
                        Date.now()
                    : false
                }
                className="w-fit max-md:mx-auto"
              >
                {examResults
                  ? examResults.succeeded
                    ? t('courses.exam.getCertificate')
                    : t('courses.exam.retakeExam')
                  : t('courses.exam.takeExam')}
              </ButtonWithArrow>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

const DiplomaTeacherLed = ({
  course,
}: {
  course: CourseResponse;
}) => {
  return (
    <>
      <section className="w-full flex flex-col">
        <h4 className="subtitle-medium-caps-18px text-darkOrange-5">
          {t('words.diploma')}
        </h4>

        <p className="mt-1 md:mt-6 label-large-20px md:display-small-32px text-black">
          {t('courses.exam.receiveDiploma')}
        </p>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-[50px] mt-6 md:mt-[30px]">
          <div className="max-md:mx-auto shrink-0">
            <img
              src={CertificateTeacherLedSatoshiImage}
              alt="Diploma"
              className="w-full max-w-[403px]"
            />
          </div>
          <div className="flex flex-col justify-between gap-4 grow md:pb-2">
            <p className="text-newBlack-1 md:text-justify body-16px md:subtitle-medium-16px whitespace-pre-line">
              {t('courses.exam.successDiplomaTeachedLed')}
            </p>

            <Link
              to={'/dashboard/course/$courseId'}
              hash={'singleTrialExam'}
              params={{
                courseId: course?.id,
              }}
              className="w-fit"
              asChild
            >
              <ButtonWithArrow className="w-fit max-md:mx-auto">
                {t('courses.exam.getCertificate')}
              </ButtonWithArrow>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

const Labs = () => {
  return (
    <>
      <DividerSimple className="my-5 md:mt-3 md:mb-8" />
      <section className="w-full flex flex-col gap-4 md:gap-5">
        <h4 className="subtitle-medium-caps-18px text-darkOrange-5">
          {t('labs.planBLabs')}
        </h4>

        <p className="label-large-20px md:display-small-32px text-black">
          {t('labs.presentation.subtitle')}
        </p>

        <p className="text-newBlack-1 md:text-justify body-16px md:subtitle-medium-16px whitespace-pre-line">
          {t('labs.description1')}
        </p>

        <p className="text-newBlack-1 md:text-justify body-16px md:subtitle-medium-16px whitespace-pre-line">
          {t('labs.description2')}
        </p>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-[50px]">
          <Link to="/plan-b-labs">
            <ButtonWithArrow variant="primary">
              {t('labs.presentation.link')}
            </ButtonWithArrow>
          </Link>
        </div>
      </section>
    </>
  );
};

const OtherCourses = ({ course }: { course: CourseResponse }) => {
  const { courses: allCourses } = useContext(AppContext);

  if (!allCourses || allCourses.length === 0) {
    return null;
  }

  const selectedCourses = filterAndRandomizeCourses(course, allCourses);

  return (
    <>
      <DividerSimple className="my-5 md:my-8" />
      <section className="w-full flex flex-col">
        <h4 className="subtitle-medium-caps-18px text-darkOrange-5">
          {t('courses.details.otherCourses')}
        </h4>
        <p className="mt-1 md:mt-6 label-large-20px md:display-small-32px text-black">
          {t('courses.details.otherCoursesInterest')}
        </p>
      </section>
      <section className="flex max-md:flex-col gap-3 md:gap-5 items-center mt-5 md:mt-8">
        {selectedCourses.map((course) => (
          <CourseCard key={course.id} course={course} mode="light" />
        ))}
      </section>
    </>
  );
};
