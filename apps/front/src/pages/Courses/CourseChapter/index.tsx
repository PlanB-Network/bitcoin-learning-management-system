import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useTranslation } from 'react-i18next';
import { BiSkipNext, BiSkipPrevious } from 'react-icons/bi';
import { BsCheckLg } from 'react-icons/bs';
import ReactMarkdown, { uriTransformer } from 'react-markdown';
import ReactPlayer from 'react-player/youtube';
import { Link, generatePath, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkUnwrapImages from 'remark-unwrap-images';

import { trpc } from '@sovereign-academy/api-client';

import { ReactComponent as ProgressRabbit } from '../../../assets/courses/progress_rabbit.svg';
import { Button } from '../../../atoms/Button';
import { Routes } from '../../../types';
import { compose, computeAssetCdnUrl, useRequiredParams } from '../../../utils';
import { CourseLayout } from '../CourseLayout';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const CourseChapter = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { courseId, language, chapterIndex } = useRequiredParams();
  const isScreenMd = useGreater('sm');

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
          <div className="flex h-full w-full flex-col items-center justify-center py-5 md:px-2 md:py-10">
            <div className="w-full max-w-5xl px-5 md:px-0">
              <h1 className="mb-5 w-full text-left text-3xl font-semibold text-orange-800 md:text-5xl">
                {`${chapter.course?.id.toUpperCase()} - ${
                  chapter.course?.name
                }`}
              </h1>
              {isScreenMd ? (
                <div className="font-body flex flex-row justify-between text-lg font-thin tracking-wide">
                  <div>
                    {t('courses.chapter.count', {
                      count: chapter.chapter,
                      total: chapter.course?.chapters?.length,
                    })}
                  </div>
                  <div>{chapter.course?.teacher}</div>
                </div>
              ) : (
                <div className="flex flex-row items-center justify-between text-lg ">
                  <Link
                    className="h-6"
                    to={
                      chapter.chapter === 1
                        ? generatePath(Routes.Course, {
                            courseId,
                          })
                        : generatePath(Routes.CourseChapter, {
                            courseId,
                            chapterIndex: (chapter.chapter - 1).toString(),
                          })
                    }
                  >
                    <div className="bg-primary-700 flex h-6 flex-row items-center rounded-full px-3 py-2 text-white">
                      <BiSkipPrevious className="h-6 w-6" />
                    </div>
                  </Link>

                  <div className="text-primary-800 font-normal">
                    {t('courses.chapter.count', {
                      count: chapter.chapter,
                      total: chapter.course?.chapters?.length,
                    })}
                  </div>
                  <Link
                    className="h-6"
                    to={
                      chapter.chapter === chapter.course?.chapters?.length
                        ? generatePath(Routes.Course, {
                            courseId,
                          })
                        : generatePath(Routes.CourseChapter, {
                            courseId,
                            chapterIndex: (chapter.chapter + 1).toString(),
                          })
                    }
                  >
                    <div className="bg-primary-700 flex h-6 flex-row items-center rounded-full px-3 py-2 text-white">
                      <BiSkipNext className="h-6 w-6" />
                    </div>
                  </Link>
                </div>
              )}

              {isScreenMd && (
                <div className="mt-5 flex h-4 flex-row justify-between space-x-3 rounded-full">
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
              )}
            </div>
            <div className="text-primary-900 mt-8 w-full space-y-6 px-5 md:mt-16 md:max-w-3xl md:px-0">
              <h2 className="text-primary-800 text-2xl font-normal uppercase italic md:text-3xl">
                {chapter?.title}
              </h2>
              <ReactMarkdown
                children={chapter?.raw_content}
                components={{
                  h2: ({ children }) => (
                    <h2 className="mt-6 text-xl font-semibold md:mt-10 md:text-2xl">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-normal">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className=" text-justify text-base tracking-wide ">
                      {children}
                    </p>
                  ),
                  ol: ({ children }) => (
                    <ol className="flex list-decimal flex-col px-10 text-justify text-base tracking-wide">
                      {children}
                    </ol>
                  ),
                  ul: ({ children }) => (
                    <ul className="flex list-disc flex-col px-10 text-justify text-base tracking-wide">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="my-1 text-justify text-base tracking-wide last:mb-0">
                      {children}
                    </li>
                  ),
                  table: ({ children }) => (
                    <table className="border-primary-900  w-full border-collapse border">
                      {children}
                    </table>
                  ),
                  th: ({ children }) => (
                    <th className="border-primary-900 border px-2 py-1">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border-primary-900 border px-2 py-1">
                      {children}
                    </td>
                  ),
                  img: ({ src, alt }) =>
                    src?.includes('youtube.com') ||
                    src?.includes('youtu.be') ? (
                      <ReactPlayer
                        className="mx-auto flex max-w-full justify-center rounded-lg py-6"
                        controls={true}
                        url={src}
                      />
                    ) : (
                      <img
                        className="mx-auto flex justify-center rounded-lg py-6"
                        src={src}
                        alt={alt}
                      />
                    ),
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        {...props}
                        children={String(children).replace(/\n$/, '')}
                        style={dark}
                        language={match[1]}
                        PreTag="div"
                      />
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
                remarkPlugins={[remarkGfm, remarkUnwrapImages, remarkMath]}
                rehypePlugins={[rehypeMathjax]}
                transformImageUri={(src) =>
                  uriTransformer(
                    src.startsWith('http')
                      ? src
                      : computeAssetCdnUrl(
                          chapter.last_commit,
                          `courses/${courseId}/${src}`
                        )
                  )
                }
              />
              {chapter.chapter !== chapter.course?.chapters?.length ? (
                <Link
                  className="flex w-full justify-end pt-10"
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
                  className="flex w-full justify-end pt-10"
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
