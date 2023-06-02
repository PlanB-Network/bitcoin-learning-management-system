import { useNavigate } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { MainLayout } from '../../../components/MainLayout';
import { useRequiredParams } from '../../../utils';

export const CourseChapter = () => {
  const navigate = useNavigate();

  const { courseId, language, chapterIndex } = useRequiredParams();

  const { data: chapter } = trpc.content.getCourseChapter.useQuery({
    courseId,
    language,
    chapterIndex,
  });

  if (!chapter) navigate('/404');

  return (
    <MainLayout>
      <div>
        <h1 className="text-black">{chapter?.title}</h1>
      </div>
    </MainLayout>
  );
};
