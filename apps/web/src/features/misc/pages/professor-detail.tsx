import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useParams } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import yellowBook from '../../../assets/icons/book_yellow.png';
import handWriting from '../../../assets/icons/hand_writing.png';
import { AuthorCardFull } from '../../../components/author-card-full';
import { CoursePreview } from '../../../components/coursePreview';
import { useNavigateMisc } from '../../../hooks';
import { trpc } from '../../../utils/trpc';
import { ResourceLayout } from '../../resources/layout';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const ProfessorDetail = () => {
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const { professorId } = useParams({
    from: '/professor/$professorId',
  });
  const isScreenMd = useGreater('sm');
  const { data: professor, isFetched } = trpc.content.getProfessor.useQuery({
    professorId: Number(professorId),
    language: i18n.language,
  });
  const navigateTo404Called = useRef(false);
  console.log('Prof:', professor);

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
        <div className="text-white">
          <div className="mt-4 flex w-full flex-col items-center">
            <AuthorCardFull professor={professor} />
          </div>
          <div className="mt-6 flex flex-row items-center gap-4 text-2xl font-medium">
            <img src={handWriting} alt="" className=" h-5 w-5" />
            <span>{t('words.courses')}</span>
          </div>
          <div className="grid grid-cols-1 px-5 sm:grid-cols-2 md:grid-cols-3 lg:max-w-6xl xl:grid-cols-4">
            {professor.courses.map((course) => {
              return (
                <div className="w-72">
                  <CoursePreview
                    course={course}
                    selected={true}
                    key={course.id}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-row items-center gap-4 text-2xl font-medium">
            <img src={yellowBook} alt="" className=" h-5 w-5" />
            <span>{t('words.tutorials')}</span>
          </div>
          <p>-----</p>
          <p>-----</p>
        </div>
      )}
    </ResourceLayout>
  );
};
