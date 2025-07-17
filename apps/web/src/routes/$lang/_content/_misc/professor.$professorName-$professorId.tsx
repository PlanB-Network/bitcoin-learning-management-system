import { BackLink, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AuthorCardFull } from '#src/components/author-card-full.js';
import { PageLayout } from '#src/components/page-layout.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.js';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { isUUID } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.js';
import { trpc } from '#src/utils/trpc.js';
import { CourseCard } from '../../../../patterns/course-card.tsx';
import { LectureCard } from '../resources/-components/cards/lecture-card.tsx';
import { TutorialCard } from '../tutorials/-components/tutorial-card.tsx';

export const Route = createFileRoute(
  '/$lang/_content/_misc/professor/$professorName-$professorId',
)({
  component: ProfessorDetail,
  params: {
    parse: (params) => {
      const paramNameId = params['professorName-$professorId'];
      const { id, name } = getNameAndIdFromUrl(paramNameId);

      return {
        lang: z.string().parse(params.lang),
        professorId: z.string().parse(id),
        professorName: z.string().parse(name),
        'professorName-$professorId': `${name}-${id}`,
      };
    },
    stringify: ({ lang, professorName, professorId }) => ({
      lang: lang,
      'professorName-$professorId': `${professorName}-${professorId}`,
    }),
  },
});

function ProfessorDetail() {
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { data: professor, isFetched } = useQuery(
    trpc.content.getProfessor.queryOptions(
      {
        language: i18n.language,
        professorId: params.professorId,
      },
      {
        enabled: isUUID(params.professorId),
      },
    ),
  );

  const { data: lectures } = useQuery(
    trpc.content.getLectures.queryOptions(
      { professorId: professor?.id },
      { enabled: !!professor, staleTime: 300_000 },
    ),
  );

  const categoryHash = window.location.hash.replace('#', '') || 'all';

  const getBacklinkUrl = () => {
    if (categoryHash) {
      return `/professors/${categoryHash}`;
    }

    return '/professors/all';
  };

  useEffect(() => {
    if (
      professor &&
      params.professorName !== formatNameForURL(professor.name)
    ) {
      navigate({
        replace: true,
        to: `/professor/${formatNameForURL(professor.name)}-${professor.id}`,
      });
    }
  }, [professor, isFetched, navigateTo404, navigate, params.professorName]);

  return (
    <PageLayout className="max-w-[1060px] mx-auto">
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !professor && (
        <div className="w-[850px] mx-auto text-white">
          {t('underConstruction.itemNotFound', {
            item: t('words.professor'),
          })}
        </div>
      )}
      {professor && (
        <div className="flex flex-col items-start text-white">
          <BackLink to={getBacklinkUrl()} label={t('professors.pageTitle')} />
          <div className="flex w-full flex-col items-start">
            <AuthorCardFull
              professor={professor}
              className="max-md:mx-auto md:w-full"
            />
          </div>
          {professor.courses.length > 0 && (
            <>
              <div className="mt-6 lg:mt-12 title-large-24px md:display-small-32px">
                <span>{t('words.courses')}</span>
              </div>

              {professor.courses.length > 0 && (
                <section className="flex justify-start gap-5 md:gap-10 flex-wrap mt-6">
                  {professor.courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </section>
              )}
            </>
          )}
          {professor.tutorials.length > 0 && (
            <>
              <div className="mt-6 lg:mt-12 title-large-24px md:display-small-32px">
                <span>{t('words.tutorials')}</span>
              </div>

              <div className="mt-6 flex flex-wrap justify-start gap-6 w-full">
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
            </>
          )}
          {lectures && lectures?.length > 0 && (
            <>
              <div className="mt-6 lg:mt-12 title-large-24px md:display-small-32px">
                <span>{t('words.lectures')}</span>
              </div>
              <div className="mt-6 flex flex-wrap justify-start gap-3 md:gap-6 w-full">
                {lectures?.map((lecture) => {
                  return <LectureCard key={lecture.id} lecture={lecture} />;
                })}
              </div>
            </>
          )}
        </div>
      )}
    </PageLayout>
  );
}
