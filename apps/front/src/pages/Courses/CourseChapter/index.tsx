import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiSkipNext, BiSkipPrevious } from 'react-icons/bi';
import { BsCheckCircle, BsCheckLg } from 'react-icons/bs';
import { Link, generatePath, useNavigate } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { ReactComponent as ProgressRabbit } from '../../../assets/courses/progress_rabbit.svg';
import { ReactComponent as Video } from '../../../assets/resources/video.svg';
import { Button } from '../../../atoms/Button';
import { CourseLayout } from '../../../components/Courses/CourseLayout';
import { LevelPicker } from '../../../components/Courses/PickerCourse';
import { VerticalTable } from '../../../components/Courses/VerticalTable';
import { MarkdownBody } from '../../../components/MarkdownBody';
import { Routes } from '../../../types';
import { compose, computeAssetCdnUrl, useRequiredParams } from '../../../utils';

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

  const completeChapterMutation =
    trpc.user.courses.completeChapter.useMutation();

  const completeChapter = () => {
    completeChapterMutation.mutate({
      courseId,
      chapter: Number(chapterIndex),
    });
  };

  const [isContentExpanded, setIsContentExpanded] = useState(false);
  if (!chapter && isFetched) navigate('/404');

  return (
    <CourseLayout>
      <div>
        {chapter && (
          <div className="flex h-full w-full flex-col items-center justify-center py-1 md:px-2 md:py-3">
            <div
              className={`mb-6 w-full max-w-5xl ${isScreenMd ? '' : 'hidden'}`}
            >
              <span className="font-poppins mb-2 w-full text-left text-lg font-normal leading-6 text-orange-800">
                <Link to="/courses">Courses</Link> &gt;{' '}
                <Link
                  to={generatePath(Routes.Course, {
                    courseId,
                  })}
                >
                  {`${chapter.course?.id.toUpperCase()} > ${chapter.title}`}
                </Link>
              </span>
            </div>

            <div className="mb-0 w-full max-w-5xl px-5 md:px-0">
              <h1
                className={`mb-5 w-full text-left md:text-5xl ${
                  isScreenMd
                    ? 'text-3xl font-semibold text-orange-800'
                    : 'text-4xl font-bold text-white'
                }`}
              >
                {isScreenMd ? (
                  <Link
                    to={generatePath(Routes.Course, {
                      courseId,
                    })}
                  >{`${chapter.course?.id.toUpperCase()} - ${
                    chapter.course?.name
                  }`}</Link>
                ) : (
                  <div className="flex items-center justify-center">
                    {/* linkaqui */}
                    <Link
                      to={generatePath(Routes.Course, {
                        courseId,
                      })}
                    >
                      <div
                        className="mr-2 rounded-full bg-orange-800 p-2 text-sm"
                        title={t('courses.details.courseId', {
                          courseId: chapter.course?.id,
                        })}
                      >
                        <span className="uppercase text-white">
                          {chapter.course?.id}
                        </span>
                      </div>
                    </Link>

                    <h1 className="mb-1 mr-2 text-base  font-semibold text-orange-800">
                      {chapter.course?.name}
                    </h1>
                  </div>
                )}
              </h1>
              {isScreenMd ? (
                <div className="font-body flex flex-row justify-between text-lg font-light tracking-wide">
                  <div>
                    {t('courses.chapter.count', {
                      count: chapter.chapter,
                      total: chapter.course?.chapters?.length,
                    })}
                  </div>
                  <div>{chapter.course?.teacher}</div>
                </div>
              ) : (
                <div className="flex flex-col  ">
                  <div className="flex items-center justify-center p-1 font-thin text-gray-500">
                    <div className="h-0 grow border-t border-gray-300"></div>
                    <span className="px-3">
                      {t('courses.chapter.count', {
                        count: chapter.chapter,
                        total: chapter.course?.chapters?.length,
                      })}
                    </span>
                    <div className="h-0 grow border-t border-gray-300"></div>
                  </div>

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
                      <div className="bg-primary-500 flex h-6 w-6 items-center justify-center rounded-full text-white">
                        <BiSkipPrevious className="h-6 w-6" />
                      </div>
                    </Link>

                    <div className="text-primary-800 p-1 font-semibold">
                      {chapter?.title}
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
                      <div className="bg-primary-500 flex h-6 w-6 items-center justify-center rounded-full text-white">
                        <BiSkipNext className="h-6 w-6" />
                      </div>
                    </Link>
                  </div>
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
                          key={index}
                        >
                          <div
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
                      <div
                        className="relative flex grow overflow-visible"
                        key={index}
                      >
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
            <div className="flex ">
              <div className="grow">
                <div className="text-primary-900 ml-2 mt-2 w-full space-y-6 px-5 md:mt-8 md:max-w-3xl md:px-0">
                  <span
                    className={`text-primary-700  mb-2 font-mono text-base font-normal ${
                      isScreenMd ? '' : 'hidden'
                    }`}
                  >
                    chapter {chapter.chapter}{' '}
                  </span>
                  <h2
                    className={`h-33 text-primary-800 m-1 flex flex-col justify-center self-stretch text-2xl font-semibold uppercase  md:text-3xl ${
                      isScreenMd ? '' : 'mb-1 hidden'
                    }`}
                  >
                    {chapter?.title}
                  </h2>

                  {/* Mostrar la tabla de objetivos del curso Learn*/}

                  <div className="text-primary-700 mt-1 space-y-2 font-light uppercase">
                    <div
                      className={` flex flex-col self-stretch rounded-lg p-0 shadow-md ${
                        isContentExpanded ? 'bg-gray-200' : 'h-auto bg-gray-200'
                      } ${isContentExpanded ? 'h-auto ' : 'mt-1 h-auto '}`}
                    >
                      <h3
                        className="text-primary-800 text-1xl mb-3 ml-2 mt-4 flex cursor-pointer items-center font-semibold"
                        onClick={() => setIsContentExpanded(!isContentExpanded)}
                      >
                        <span className="mr-2">
                          {isContentExpanded ? '>' : '>'}
                        </span>
                        {t('courses.details.objectivesTitle').toLowerCase()}{' '}
                        {/* Convierte el texto a minúsculas */}
                      </h3>
                      {isContentExpanded && (
                        <div className="mb-2 ml-2 px-5 lowercase">
                          <ul className="mt-2 list-inside pl-5">
                            {chapter.course?.objectives?.map(
                              (goal: string, index: number) => (
                                <li key={index}>
                                  <span className="mr-2 opacity-50">{'▶'}</span>
                                  <span className="capitalize">
                                    {goal.toLowerCase()}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <MarkdownBody
                    content={chapter?.raw_content}
                    assetPrefix={computeAssetCdnUrl(
                      chapter.last_commit,
                      `courses/${courseId}`
                    )}
                  />

                  {chapter.chapter !== chapter.course?.chapters?.length ? (
                    <Link
                      className="flex w-full justify-end pt-10"
                      to={generatePath(Routes.CourseChapter, {
                        courseId,
                        chapterIndex: (chapter.chapter + 1).toString(),
                      })}
                    >
                      <Button onClick={completeChapter}>
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
                      <Button onClick={completeChapter}>
                        <span>{t('courses.chapter.finishCourse')}</span>
                        <BsCheckLg className="ml-2 h-6 w-6" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <div className="ml-10 mt-7 shrink-0 ">
                <VerticalTable
                  chapters={chapter.course?.chapters || []}
                  courseTitle={chapter.course?.id || ''}
                  style={{ position: 'sticky', top: '2rem' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </CourseLayout>
  );
};
