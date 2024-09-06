import {
  Link,
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader } from '@blms/ui';

import yellowBook from '#src/assets/icons/book_yellow.png';
import handWriting from '#src/assets/icons/hand_writing.png';
import { AuthorCardFull } from '#src/components/author-card-full.js';
import { PageLayout } from '#src/components/PageLayout/index.tsx';
import { TutorialCard } from '#src/components/tutorial-card.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.js';
import { formatNameForURL } from '#src/utils/string.js';
import { trpc } from '#src/utils/trpc.js';

import { CourseCard } from '../courses/index.tsx';

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
    <PageLayout
      title={t('professors.pageTitle')}
      description={t('professors.pageSubtitle')}
      link={'/professors'}
    >
      {!isFetched && <Loader size={'s'} />}
      {professor && (
        <div className="flex flex-col text-white">
          <div className="mt-4 flex w-full flex-col items-start">
            <AuthorCardFull professor={professor} className="mx-auto" />
          </div>
          {professor.courses.length > 0 && (
            <div className="mt-6 flex flex-row items-center gap-4 text-2xl font-medium">
              <img src={handWriting} alt="" className=" size-5" />
              <span>{t('words.courses')}</span>
            </div>
          )}
          <section className="flex justify-center gap-5 md:gap-10 flex-wrap mt-8 md:mt-12">
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
              <img src={yellowBook} alt="" className=" size-5" />
              <span>{t('words.tutorials')}</span>
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {professor.tutorials.map((tutorial) => {
              return (
                <TutorialCard
                  className="w-full md:w-[25rem]"
                  tutorial={tutorial}
                  key={tutorial.id}
                />
              );
            })}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
