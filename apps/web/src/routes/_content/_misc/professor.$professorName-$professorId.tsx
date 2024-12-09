import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Loader } from '@blms/ui';

import { AuthorCardFull } from '#src/components/author-card-full.js';
import { PageLayout } from '#src/components/page-layout.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.js';
import { BackLink } from '#src/molecules/backlink.tsx';
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
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { data: professor, isFetched } = trpc.content.getProfessor.useQuery({
    professorId: Number(params.professorId),
    language: i18n.language,
  });

  const categoryHash = window.location.hash.replace('#', '') || 'all';

  const handleBackClick = () => {
    if (categoryHash) {
      navigate({ to: `/professors/${categoryHash}` });
    } else {
      navigate({ to: '/professors/all' });
    }
  };

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
          <BackLink
            label={t('professors.pageTitle')}
            onClick={handleBackClick}
          />
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
                <CourseCard key={course.id} course={course} />
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
                  href={`/tutorials/${tutorial.category}/${tutorial.subcategory}/${tutorial.name}-${tutorial.id}`}
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
