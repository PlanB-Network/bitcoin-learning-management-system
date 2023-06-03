import { useTranslation } from 'react-i18next';
import ReactMarkdown, { uriTransformer } from 'react-markdown';
import ReactPlayer from 'react-player/youtube';
import { Link, useNavigate } from 'react-router-dom';
import remarkUnwrapImages from 'remark-unwrap-images';

import { trpc } from '@sovereign-academy/api-client';

import { Button } from '../../../atoms/Button';
import { useRequiredParams } from '../../../utils';
import { CourseLayout } from '../CourseLayout';

export const CourseChapter = () => {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const { courseId, language, chapterIndex } = useRequiredParams();
  console.log({ courseId, language, chapterIndex });

  const { data: chapter, isFetched } = trpc.content.getCourseChapter.useQuery({
    courseId,
    language: language ?? i18n.language,
    chapterIndex,
  });

  if (!chapter && isFetched) navigate('/404');

  return (
    <CourseLayout>
      <div>
        {chapter && (
          <div className="grid h-full w-full grid-cols-4 px-2">
            <div className="m-6 rounded-b-3xl rounded-t-lg bg-gray-200 shadow-lg ring-gray-600/5"></div>
            <div className="col-span-3 pl-10 pr-32">
              <h1 className="text-primary-800 mb-5 text-3xl font-normal">
                {chapter?.title}
              </h1>
              <ReactMarkdown
                children={chapter?.raw_content}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-primary-800 mb-5 text-3xl font-normal">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-primary-800 mb-5 text-xl font-normal">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-primary-800 mb-5 text-base font-normal">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-primary-700 mb-3 flex justify-center text-justify text-sm ">
                      {children}
                    </p>
                  ),
                  img: ({ src, alt }) =>
                    src?.includes('youtube.com') ||
                    src?.includes('youtu.be') ? (
                      <ReactPlayer
                        className="mx-auto my-4 flex justify-center rounded-lg"
                        controls={true}
                        url={src}
                      />
                    ) : (
                      <img
                        className="mx-auto my-4 flex justify-center rounded-lg"
                        src={src}
                        alt={alt}
                      />
                    ),
                }}
                remarkPlugins={[remarkUnwrapImages]}
                transformImageUri={(src) =>
                  uriTransformer(
                    src.startsWith('http')
                      ? src
                      : `http://localhost:8080/${chapter.last_commit}/courses/${courseId}/${src}`
                  )
                }
              />
              {}
              <Link
                to={`/course/${courseId}/${language}/${
                  Number(chapterIndex) + 1
                }`}
              >
                <Button>Next chapter</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </CourseLayout>
  );
};
