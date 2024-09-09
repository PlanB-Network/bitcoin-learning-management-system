import {
  Link,
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { AuthorCardFull } from '#src/components/author-card-full.js';
import { PageLayout } from '#src/components/PageLayout/index.tsx';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.js';
import { formatNameForURL } from '#src/utils/string.js';
import { trpc } from '#src/utils/trpc.js';

import { CourseCard } from '../courses/index.tsx';
import { TutorialCard } from '../tutorials/-components/tutorial-card.tsx';

export const Route = createFileRoute(
  '/_content/_misc/professor/$professorName-$professorId',
)({
  component: ProfessorDetail,
});

function ProfessorDetail() {
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const params = useParams({
    from: '/professor/$professorName-$professorId',
  });
  const navigate = useNavigate();

  const professorNameId = params['professorName-$professorId'];
  const professorId = professorNameId.split('-').pop();
  const professorName = professorNameId.slice(
    0,
    Math.max(0, professorNameId.lastIndexOf('-')),
  );

  const { data: professor, isFetched } = trpc.content.getProfessor.useQuery({
    professorId: Number(professorId),
    language: i18n.language,
  });

  const navigateTo404Called = useRef(false);

  useEffect(() => {
    if (!professor && isFetched && !navigateTo404Called.current) {
      navigateTo404();
      navigateTo404Called.current = true;
    } else if (
      professor &&
      professorName !== formatNameForURL(professor.name)
    ) {
      navigate({
        to: `/professor/${formatNameForURL(professor.name)}-${professor.id}`,
      });
    }
  }, [professor, isFetched, navigateTo404, professorName, navigate]);

  return (
    <PageLayout className="max-w-[980px] mx-auto">
      <Link
        to={'/professors'}
        className="flex items-center display-large text-darkOrange-5 hover:text-white"
      >
        <ArrowLeft />

        {t('professors.pageTitle')}
      </Link>
      {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
      {professor && (
        <div className="flex flex-col text-white">
          <div className="mt-4 flex w-full flex-col items-start">
            <AuthorCardFull professor={professor} className="mx-auto" />
          </div>
          {professor.courses.length > 0 && (
            <div className="mt-6 flex flex-row items-center gap-4 text-2xl font-medium">
              <span>{t('words.courses')}</span>
            </div>
          )}
          <section className="flex justify-start gap-5 md:gap-10 flex-wrap mt-8 md:mt-12">
            {professor.courses.map((course) => {
              return (
                <Link
                  key={course.id}
                  to="/courses/$courseId"
                  params={{ courseId: course.id }}
                  className="flex w-full max-md:max-w-[500px] max-md:mx-auto md:w-[340px]"
                >
                  <CourseCard course={course} key={course.id} />
                </Link>
              );
            })}
          </section>
          {professor.tutorials.length > 0 && (
            <div className="mt-6 flex flex-row items-center gap-4 text-2xl font-medium">
              <span>{t('words.tutorials')}</span>
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-start gap-4">
            {professor.tutorials.map((tutorial) => {
              return (
                <TutorialCard
                  tutorial={tutorial}
                  key={tutorial.id}
                  href={`/tutorials/${tutorial.category}/${tutorial.name}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </PageLayout>
  );
}

const ArrowLeft = () => {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-current"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.5856 25.4142C16.2106 25.0391 16 24.5305 16 24.0002C16 23.4699 16.2106 22.9613 16.5856 22.5862L27.8996 11.2722C28.0841 11.0812 28.3048 10.9288 28.5488 10.824C28.7928 10.7192 29.0552 10.664 29.3208 10.6617C29.5863 10.6594 29.8497 10.71 30.0955 10.8106C30.3413 10.9111 30.5646 11.0596 30.7524 11.2474C30.9402 11.4352 31.0887 11.6585 31.1892 11.9043C31.2898 12.1501 31.3404 12.4134 31.3381 12.679C31.3358 12.9446 31.2806 13.207 31.1758 13.451C31.071 13.695 30.9186 13.9157 30.7276 14.1002L20.8276 24.0002L30.7276 33.9002C31.0919 34.2774 31.2935 34.7826 31.2889 35.307C31.2844 35.8314 31.074 36.333 30.7032 36.7038C30.3324 37.0747 29.8308 37.285 29.3064 37.2896C28.782 37.2941 28.2768 37.0925 27.8996 36.7282L16.5856 25.4142Z"
        fill="currentColor"
      />
    </svg>
  );
};
