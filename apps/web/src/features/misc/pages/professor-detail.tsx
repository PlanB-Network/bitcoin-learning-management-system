import { useParams } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import yellowBook from '../../../assets/icons/book_yellow.png';
import handWriting from '../../../assets/icons/hand_writing.png';
import { AuthorCardFull } from '../../../components/author-card-full.tsx';
import { CourseCard } from '../../../components/course-card.tsx';
import { TutorialCard } from '../../../components/tutorial-card.tsx';
import { useNavigateMisc } from '../../../hooks/index.ts';
import { trpc } from '../../../utils/trpc.ts';
import { ResourceLayout } from '../../resources/layout.tsx';

export const ProfessorDetail = () => {
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const { professorId } = useParams({
    from: '/professor/$professorId',
  });

  const { data: professor, isFetched } = trpc.content.getProfessor.useQuery({
    professorId: Number(professorId),
    language: i18n.language,
  });

  const navigateTo404Called = useRef(false);

  useEffect(() => {
    if (!professor && isFetched && !navigateTo404Called.current) {
      navigateTo404();
      navigateTo404Called.current = true;
    }
  }, [professor, isFetched, navigateTo404]);

  return (
    <ResourceLayout
      title={t('professors.pageTitle')}
      tagLine={t('professors.pageSubtitle')}
      link={'/professors'}
    >
      {professor && (
        <div className="flex flex-col text-white">
          <div className="mt-4 flex w-full flex-col items-start">
            <AuthorCardFull professor={professor} />
          </div>
          {professor.courses.length > 0 && (
            <div className="mt-6 flex flex-row items-center gap-4 text-2xl font-medium">
              <img src={handWriting} alt="" className=" size-5" />
              <span>{t('words.courses')}</span>
            </div>
          )}
          <div className="flex flex-wrap justify-start">
            {professor.courses.map((course) => {
              return (
                <div key={course.id} className="w-full md:w-72">
                  <CourseCard course={course} selected={true} key={course.id} />
                </div>
              );
            })}
          </div>
          {professor.tutorials.length > 0 && (
            <div className="mt-6 flex flex-row items-center gap-4 text-2xl font-medium">
              <img src={yellowBook} alt="" className=" size-5" />
              <span>{t('words.tutorials')}</span>
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-start gap-4">
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
    </ResourceLayout>
  );
};
