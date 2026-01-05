import type { CourseResponse } from '@blms/types';
import { Button, cn } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AuthorCard } from '#src/components/author-card.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';
import { ProofreadingDesktop } from '#src/components/proofreading-progress.tsx';
import { CourseContext } from '#src/providers/courseContext.tsx';
import { trpc } from '#src/utils/trpc.ts';
import { CourseTitle } from '../-components/course-title.tsx';
import { getTabs } from '../-utils/get-tabs.tsx';

export const Route = createFileRoute(
  '/$lang/_course/courses/$courseSlug/_$courseSlug/credits',
)({
  component: Credits,
});

function Credits() {
  const { t } = useTranslation();

  const { course, courseProgress } = useContext(CourseContext);

  return (
    <PageLayout
      title={t('words.credits')}
      layoutSize="base"
      overTitleMobile={course ? course.name : undefined}
      navbarTitle={course ? <CourseTitle course={course} /> : undefined}
      tabs={course ? getTabs(course, courseProgress?.[0]) : []}
    >
      {course && (
        <div className="flex flex-col w-full gap-8 md:gap-14">
          <Professor course={course} />
          <ProofReading course={course} />
          {!course.requiresPayment ? <OpenSourceContent /> : null}
        </div>
      )}
    </PageLayout>
  );
}

const Professor = ({
  course,
}: {
  course: CourseResponse;
  addThanksTipping?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <section className="w-full flex flex-col">
      <SectionTitle
        title={
          course.associatedProfessors.length > 0
            ? t('courses.details.courseCoordinator')
            : t('words.professor')
        }
      />
      <div className="flex flex-col gap-6 mt-3">
        {course.mainProfessors.map((professor) => (
          <AuthorCard
            key={professor.id}
            professor={professor}
            hasDonateButton={false}
            mobileSize="medium"
            centeredContent={false}
          />
        ))}
      </div>
      {course.associatedProfessors.length > 0 && (
        <>
          <SectionTitle
            title={t('courses.details.associatedProfessors')}
            className="mt-8"
          />
          <div className="flex flex-col gap-6 mt-3">
            {course.associatedProfessors.map((professor) => (
              <AuthorCard
                key={professor.id}
                professor={professor}
                hasDonateButton={false}
                mobileSize="medium"
                centeredContent={false}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

const ProofReading = ({ course }: { course: CourseResponse }) => {
  const { i18n, t } = useTranslation();

  const { data: proofreading } = useQuery(
    trpc.content.getProofreading.queryOptions({
      courseId: course.id,
      language: i18n.language,
    }),
  );

  const isOriginalLanguage = i18n.language === course.originalLanguage;
  if (!proofreading) {
    return null;
  }

  return (
    <section className="w-full flex flex-col">
      <SectionTitle title={t('words.contributors')} />

      <div className="flex flex-col md:flex-row gap-6 mt-3">
        <div className="shrink-0">
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
        <div className="flex flex-col gap-4">
          <p className="body-base whitespace-pre-line">
            <Trans i18nKey={'courses.details.creditsCollaboration'}>
              <a
                className="hover:text-orange-500 font-medium"
                href="https://t.me/PlanBNetwork_ContentBuilder"
                target="_blank"
                rel="noreferrer"
              >
                telegram
              </a>
              <Link
                to="/tutorials/contribution/content/proofreading-review-tutorial-28236c98-23b2-4efd-9563-953f08707017"
                className="hover:text-orange-500 font-medium"
                target="_blank"
                rel="noreferrer"
              >
                tutorial
              </Link>
            </Trans>
          </p>
          <Button
            variant="newTertiary"
            className="min-w-[200px] max-md:max-w-[351px] max-md:w-full"
            asChild
          >
            <a
              href="https://t.me/PlanBNetwork_ContentBuilder"
              target="_blank"
              rel="noreferrer"
            >
              {t('words.contribute')}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

const OpenSourceContent = () => {
  const { t } = useTranslation();
  return (
    <section className="w-full flex flex-col">
      <SectionTitle title={t('courses.details.openSourceContentTitle')} />
      <p className="body-base mt-3">
        <Trans i18nKey={'courses.details.openSourceContentDescription'}>
          <a
            className="text-orange-500 underline"
            href="https://creativecommons.org/licenses/by-sa/4.0/deed.en"
            target="_blank"
            rel="noreferrer"
          >
            CC BY-SA
          </a>
        </Trans>
      </p>
    </section>
  );
};

export const SectionTitle = ({
  title,
  className,
}: {
  title: string;
  className?: string;
}) => {
  return (
    <h3
      className={cn('title-medium md:title-large text-orange-500', className)}
    >
      {title}
    </h3>
  );
};
