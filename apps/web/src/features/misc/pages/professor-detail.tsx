import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useParams } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import handWriting from '../../../assets/icons/hand_writing.png';
import { AuthorCard } from '../../../components/author-card';
import { ProfessorCard } from '../../../components/professor-card';
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
          <AuthorCard professor={professor} />
          <div className="mt-6 flex flex-row items-center gap-4 text-2xl font-medium">
            <img src={handWriting} alt="" className=" h-5 w-5" />
            <span>{t('words.courses')}</span>
          </div>
          <p>-----</p>
          <p>-----</p>
          <p>TUTORIALS</p>
          <p>-----</p>
          <p>-----</p>
        </div>
      )}
    </ResourceLayout>
  );
};
