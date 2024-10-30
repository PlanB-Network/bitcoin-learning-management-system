import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Loader } from '@blms/ui';

import { AuthorCardFull } from '#src/components/author-card-full.js';
import { PageLayout } from '#src/components/page-layout.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.js';
import { formatNameForURL } from '#src/utils/string.js';
import { trpc } from '#src/utils/trpc.js';

import { CourseCard } from '../../../organisms/course-card.tsx';
import { TutorialCard } from '../tutorials/-components/tutorial-card.tsx';

export const Route = createFileRoute(
  '/_content/_misc/professor/$professorName-$professorId',
)({
  params: {
    parse: (params) => {
      const professorNameId = params['professorName-$professorId'];
      const professorId = professorNameId.split('-').pop();
      const professorName = professorNameId.slice(
        0,
        Math.max(0, professorNameId.lastIndexOf('-')),
      );

      return {
        'professorName-$professorId': `${professorName}-${professorId}`,
        professorName: z.string().parse(professorName),
        professorId: z.number().int().parse(Number(professorId)),
      };
    },
    stringify: ({ professorName, professorId }) => ({
      'professorName-$professorId': `${professorName}-${professorId}`,
    }),
  },
  component: ProfessorDetail,
});

function ProfessorDetail() {
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const navigate = useNavigate();

  const { data: professor, isFetched } = trpc.content.getProfessor.useQuery({
    professorId: Number(params.professorId),
    language: i18n.language,
  });

  useEffect(() => {
    if (
      professor &&
      params.professorName !== formatNameForURL(professor.name)
    ) {
      navigate({
        to: `/professor/${formatNameForURL(professor.name)}-${professor.id}`,
      });
    }
  }, [professor, isFetched, navigateTo404, navigate, params.professorName]);

  return (
    <PageLayout className="max-w-[980px] mx-auto">
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !professor && (
        <div className="w-[850px] mx-auto text-white">
          {t('underConstruction.itemNotFound', {
            item: t('words.professor'),
          })}
        </div>
      )}
      {professor && (
        <div className="flex flex-col gap-1 items-start text-white">
          <Link
            to={'/professors'}
            className="flex items-center subtitle-large-med-20px md:display-large text-darkOrange-5 hover:text-white mb-6 lg:mb-12"
          >
            <ArrowLeft />

            <span className="ml-1">{t('professors.pageTitle')}</span>
          </Link>
          <div className="flex w-full flex-col items-start">
            <AuthorCardFull professor={professor} className="mx-auto" />
          </div>
          {professor.courses.length > 0 && (
            <div className="mt-6 lg:mt-12 flex flex-row items-center gap-4 text-2xl font-medium">
              <span>{t('words.courses')}</span>
            </div>
          )}
          {professor.courses.length > 0 && (
            <section className="flex justify-start gap-5 md:gap-10 flex-wrap mt-6">
              {professor.courses.map((course) => (
                <Link
                  key={course.id}
                  to="/courses/$courseId"
                  params={{ courseId: course.id }}
                  className="flex w-full max-md:max-w-[500px] md:w-[340px]"
                >
                  <CourseCard course={course} />
                </Link>
              ))}
            </section>
          )}

          {professor.tutorials.length > 0 && (
            <div className="mt-6 lg:mt-12 flex flex-row items-center gap-4 text-2xl font-medium">
              <span>{t('words.tutorials')}</span>
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-start gap-6 lg:pr-8 w-full">
            {professor.tutorials.map((tutorial) => {
              return (
                <TutorialCard
                  tutorial={tutorial}
                  key={tutorial.id}
                  href={`/tutorials/${tutorial.category}/${tutorial.name}`}
                  dark={true}
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
      className="text-current size-[18px] md:size-12"
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
