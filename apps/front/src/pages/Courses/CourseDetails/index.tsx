import ReactMarkdown from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { MainLayout } from '../../../components/MainLayout';
import { useRequiredParams } from '../../../utils';

export const CourseDetails: React.FC = () => {
  const { courseId, language } = useRequiredParams();

  const navigate = useNavigate();

  const { data: course } = trpc.content.getCourse.useQuery({
    id: courseId,
    language,
  });

  if (!course) navigate('/404');

  const { data: chapters } = trpc.content.getCourseChapters.useQuery({
    id: courseId,
    language,
  });

  return (
    <MainLayout>
      <div>
        {course && (
          <div>
            <h1 className="text-black">{course?.name}</h1>
            {/* TODO: Render raw markdown description using custom components and style */}
            <ReactMarkdown children={course.raw_description}></ReactMarkdown>
            <div className="flex flex-col">
              {chapters?.map((chapter) => (
                <div key={chapter.chapter}>
                  <Link
                    to={`/course/${courseId}/${language}/${chapter.chapter}`}
                  >
                    <h2>{chapter.title}</h2>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
