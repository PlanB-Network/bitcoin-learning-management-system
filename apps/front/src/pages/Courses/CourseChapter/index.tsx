import { useTranslation } from 'react-i18next';
import { BiSkipNext } from 'react-icons/bi';
import { BsCheckLg } from 'react-icons/bs';
import ReactMarkdown, { uriTransformer } from 'react-markdown';
import ReactPlayer from 'react-player/youtube';
import { Link, generatePath, useNavigate } from 'react-router-dom';
import remarkUnwrapImages from 'remark-unwrap-images';

import { trpc } from '@sovereign-academy/api-client';

import { ReactComponent as ProgressRabbit } from '../../../assets/courses/progress_rabbit.svg';
import { Button } from '../../../atoms/Button';
import { Routes } from '../../../types';
import { compose, useRequiredParams } from '../../../utils';
import { CourseLayout } from '../CourseLayout';

export const CourseChapter = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { courseId, language, chapterIndex } = useRequiredParams();

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
          <div className="flex h-full w-full flex-col items-center justify-center px-2 py-10">
            <div className="w-full max-w-5xl">
              <h1 className="mb-5 w-full text-left text-5xl font-semibold text-orange-800">
                {`${chapter.course?.id.toUpperCase()} - ${
                  chapter.course?.name
                }`}
              </h1>
              <div className="font-body flex flex-row justify-between text-lg font-thin tracking-wide">
                <div>
                  {t('courses.chapter.count', {
                    count: chapter.chapter,
                    total: chapter.course?.chapters?.length,
                  })}
                </div>
                <div>{chapter.course?.teacher}</div>
              </div>
              <div className="mb-16 mt-5 flex h-4 flex-row justify-between space-x-3 rounded-full">
                {chapter.course?.chapters?.map((current, index) => {
                  const firstChapter = current.chapter === 1;
                  const lastChapter =
                    current.chapter === chapter.course?.chapters?.length;

                  if (current.chapter !== chapter.chapter)
                    return (
                      <Link
                        className="h-4 grow"
                        to={generatePath(Routes.CourseChapter, {
                          courseId,
                          chapterIndex: current.chapter.toString(),
                        })}
                      >
                        <div
                          key={index}
                          className={compose(
                            'h-4 grow',
                            current.chapter < chapter.chapter
                              ? 'bg-orange-600'
                              : 'bg-gray-300',
                            firstChapter ? 'rounded-l-full' : '',
                            lastChapter ? 'rounded-r-full' : ''
                          )}
                        />
                      </Link>
                    );

                  return (
                    <div className="relative flex grow overflow-visible">
                      <div
                        className={compose(
                          'h-4 w-2/3 bg-orange-600',
                          firstChapter ? 'rounded-l-full' : ''
                        )}
                      />
                      <div
                        className={compose(
                          'h-4 w-1/3 bg-gray-300',
                          lastChapter ? 'rounded-r-full' : ''
                        )}
                      />
                      <ProgressRabbit className="absolute inset-0 bottom-4 m-auto h-12 w-full" />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="max-w-3xl">
              <h2 className="text-primary-800 mb-5 text-3xl font-normal uppercase italic">
                {chapter?.title}
              </h2>
              <ReactMarkdown
                children={chapter?.raw_content}
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-primary-900 mb-5 mt-10 text-2xl font-semibold">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-primary-900 mb-5 text-xl font-normal">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-primary-900 mb-5 flex text-justify indent-6 text-base tracking-wide ">
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
                        className="mx-auto my-12 flex justify-center rounded-lg"
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
              {chapter.chapter !== chapter.course?.chapters?.length ? (
                <Link
                  className="mt-16 flex w-full justify-end"
                  to={generatePath(Routes.CourseChapter, {
                    courseId,
                    chapterIndex: (chapter.chapter + 1).toString(),
                  })}
                >
                  <Button>
                    <span>{t('courses.chapter.next')}</span>
                    <BiSkipNext className="ml-2 h-8 w-8" />
                  </Button>
                </Link>
              ) : (
                <Link
                  className="mt-16 flex w-full justify-end"
                  to={generatePath(Routes.Course, {
                    courseId,
                  })}
                >
                  <Button>
                    <span>{t('courses.chapter.finish')}</span>
                    <BsCheckLg className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </CourseLayout>
  );
};
