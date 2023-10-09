import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BiSkipNext, BiSkipPrevious } from 'react-icons/bi';
import { BsCheckLg } from 'react-icons/bs';

import ProgressRabbit from '../../../assets/courses/progress_rabbit.svg';
import { Button } from '../../../atoms/Button';
import { MarkdownBody } from '../../../components/MarkdownBody';
import { useNavigateMisc } from '../../../hooks';
import { compose, computeAssetCdnUrl } from '../../../utils';
import { trpc } from '../../../utils/trpc';
import { CourseLayout } from '../layout';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const CourseChapter = () => {
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const { courseId, language, chapterIndex } = useParams({
    from: '/courses/$courseId/$chapterIndex',
  });

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

  if (!chapter && isFetched) navigateTo404();

  return (
    <CourseLayout>
      <div>
        {chapter && (
          <div className="flex h-full w-full flex-col items-center justify-center py-5 md:px-2 md:py-10">
            <div className="w-full max-w-5xl px-5 md:px-0">
              <h1 className="mb-5 w-full text-left text-3xl font-semibold text-orange-600 md:text-5xl">
                {`${chapter.course?.id.toUpperCase()} - ${chapter.course?.name}`}
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
                <div className="flex flex-row items-center justify-between text-lg ">
                  <Link
                    className="h-6"
                    to={
                      chapter.chapter === 1
                        ? '/courses/$courseId'
                        : '/courses/$courseId/$chapterIndex'
                    }
                    params={
                      chapter.chapter === 1
                        ? { courseId }
                        : {
                          courseId,
                          chapterIndex: (chapter.chapter - 1).toString(),
                        }
                    }
                  >
                    <div className="flex h-6 flex-row items-center rounded-full bg-blue-700 px-3 py-2 text-white">
                      <BiSkipPrevious className="h-6 w-6" />
                    </div>
                  </Link>

                  <div className="font-normal text-blue-800">
                    {t('courses.chapter.count', {
                      count: chapter.chapter,
                      total: chapter.course?.chapters?.length,
                    })}
                  </div>
                  <Link
                    className="h-6"
                    to={
                      chapter.chapter === chapter.course?.chapters?.length
                        ? '/courses/$courseId'
                        : '/courses/$courseId/$chapterIndex'
                    }
                    params={
                      chapter.chapter === chapter.course?.chapters?.length
                        ? {
                          courseId,
                        }
                        : {
                          courseId,
                          chapterIndex: (chapter.chapter + 1).toString(),
                        }
                    }
                  >
                    <div className="flex h-6 flex-row items-center rounded-full bg-blue-700 px-3 py-2 text-white">
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
                          to={'/courses/$courseId/$chapterIndex'}
                          params={{
                            courseId,
                            chapterIndex: current.chapter.toString(),
                          }}
                          key={index}
                        >
                          <div
                            className={compose(
                              'h-4 grow',
                              current.chapter < chapter.chapter
                                ? 'bg-orange-500'
                                : 'bg-gray-300',
                              firstChapter ? 'rounded-l-full' : '',
                              lastChapter ? 'rounded-r-full' : '',
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
                            'h-4 w-2/3 bg-orange-500',
                            firstChapter ? 'rounded-l-full' : '',
                          )}
                        />
                        <div
                          className={compose(
                            'h-4 w-1/3 bg-gray-300',
                            lastChapter ? 'rounded-r-full' : '',
                          )}
                        />
                        <img
                          src={ProgressRabbit}
                          className="absolute inset-0 bottom-4 m-auto h-12 w-full"
                          alt=""
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-8 w-full space-y-6 px-5 text-blue-900 md:mt-16 md:max-w-3xl md:px-0">
              <h2 className="text-2xl font-normal uppercase italic text-blue-800 md:text-3xl">
                {chapter?.title}
              </h2>
              <MarkdownBody
                content={chapter?.raw_content}
                assetPrefix={computeAssetCdnUrl(
                  chapter.last_commit,
                  `courses/${courseId}`,
                )}
              />

              {chapter.chapter !== chapter.course?.chapters?.length ? (
                <Link
                  className="flex w-full justify-end pt-10"
                  to={'/courses/$courseId/$chapterIndex'}
                  params={{
                    courseId,
                    chapterIndex: (chapter.chapter + 1).toString(),
                  }}
                >
                  <Button onClick={completeChapter}>
                    <span>{t('courses.chapter.next')}</span>
                    <BiSkipNext className="ml-2 h-8 w-8" />
                  </Button>
                </Link>
              ) : (
                <Link
                  className="flex w-full justify-end pt-10"
                  to={'/courses/$courseId'}
                  params={{
                    courseId,
                  }}
                >
                  <Button onClick={completeChapter}>
                    <span>{t('courses.chapter.finishCourse')}</span>
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
