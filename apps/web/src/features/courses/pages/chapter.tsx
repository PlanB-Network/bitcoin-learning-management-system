import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { t } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiSkipNext, BiSkipPrevious } from 'react-icons/bi';
import { BsCheckLg } from 'react-icons/bs';

import { addSpaceToCourseId } from '@sovereign-university/ui';

import ProgressRabbit from '../../../assets/courses/progress_rabbit.svg?react';
import { Button } from '../../../atoms/Button';
import { MarkdownBody } from '../../../components/MarkdownBody';
import { compose, computeAssetCdnUrl } from '../../../utils';
import { joinWords } from '../../../utils/string';
import { TRPCRouterOutput, trpc } from '../../../utils/trpc';
import { NavigationPanel } from '../components/navigation-panel';
import QuizzCard, { Question } from '../components/quizz-card';
import { CourseLayout } from '../layout';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

type Chapter = NonNullable<TRPCRouterOutput['content']['getCourseChapter']>;

const goToChapterParameters = (chapter: Chapter, type: 'previous' | 'next') => {
  const currentPart = chapter.part;

  if (type === 'previous' && chapter.chapter === 1) {
    const previousPart = chapter.course.parts.find(
      (part) => part.part === currentPart.part - 1,
    );

    // If there is no previous part, go to the course page
    if (!previousPart) {
      return { courseId: chapter.course.id };
    }

    // Else go to the last chapter of the previous part
    return {
      courseId: chapter.course.id,
      partIndex: previousPart.part.toString(),
      chapterIndex: previousPart.chapters.length.toString(),
    };
  }

  if (type === 'next' && chapter.chapter === currentPart.chapters.length) {
    const nextPart = chapter.course.parts.find(
      (part) => part.part === currentPart.part + 1,
    );

    // If there is no next part, go to the course page
    if (!nextPart) {
      return { courseId: chapter.course.id };
    }

    // Else go to the first chapter of the next part
    return {
      courseId: chapter.course.id,
      partIndex: nextPart.part.toString(),
      chapterIndex: '1',
    };
  }

  return {
    courseId: chapter.course.id,
    partIndex: chapter.part.part.toString(),
    chapterIndex: (type === 'previous'
      ? chapter.chapter - 1
      : chapter.chapter + 1
    ).toString(),
  };
};

const Title = ({ chapter }: { chapter: Chapter }) => {
  const isScreenMd = useGreater('sm');

  return (
    <div className={`mb-6 w-full max-w-5xl ${isScreenMd ? '' : 'hidden'}`}>
      <span className=" mb-2 w-full text-left text-lg font-normal leading-6 text-orange-500">
        <Link to="/courses">{t('words.courses') + ` > `}</Link>
        <Link
          to={'/courses/$courseId'}
          params={{ courseId: chapter.course.id }}
        >
          {`${chapter.course.id.toUpperCase()} > `}
        </Link>
        <Link
          to={'/courses/$courseId/$partIndex/$chapterIndex'}
          params={{
            courseId: chapter.course.id,
            partIndex: chapter.part.part.toString(),
            chapterIndex: chapter.chapter.toString(),
          }}
        >
          {`${chapter.title}`}
        </Link>
      </span>
    </div>
  );
};

const TimelineSmall = ({ chapter }: { chapter: Chapter }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-0 w-full max-w-5xl px-5 md:px-0">
      <h1
        className={`mb-5 w-full text-left text-4xl font-bold text-white md:text-5xl`}
      >
        <div className="flex items-center justify-center">
          <Link
            to={'/courses/$courseId'}
            params={{ courseId: chapter.course.id }}
          >
            <div className="mr-2 rounded-full bg-orange-500 p-2 text-center text-sm">
              <span className="uppercase text-white">
                {addSpaceToCourseId(chapter.course.id)}
              </span>
            </div>
          </Link>
          <h1 className="mb-1 mr-2 text-base  font-semibold text-orange-500">
            {chapter.course.name}
          </h1>
        </div>
      </h1>
      <div className="flex flex-col  ">
        <div className="flex items-center justify-center p-1 font-thin text-gray-500">
          <div className="h-0 grow border-t border-gray-300"></div>
          <span className="px-3">
            {t('courses.part.count', {
              count: chapter.part.part,
              total: chapter.course.parts?.length,
            })}
          </span>
          <div className="h-0 grow border-t border-gray-300"></div>
        </div>

        <div className="flex flex-row items-center justify-between text-lg ">
          <Link
            className="h-6"
            to={
              chapter.part.part === 1 && chapter.chapter === 1
                ? '/courses/$courseId'
                : '/courses/$courseId/$partIndex/$chapterIndex'
            }
            params={goToChapterParameters(chapter, 'previous')}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
              <BiSkipPrevious className="h-6 w-6" />
            </div>
          </Link>

          <div className="p-1 font-semibold text-blue-900">
            {chapter?.title}
          </div>
          <Link
            className="h-6"
            to={
              chapter.part.part === chapter.course.parts.length &&
              chapter.chapter === chapter.part.chapters.length
                ? '/courses/$courseId'
                : '/courses/$courseId/$partIndex/$chapterIndex'
            }
            params={goToChapterParameters(chapter, 'next')}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
              <BiSkipNext className="h-6 w-6" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

const TimelineBig = ({ chapter }: { chapter: Chapter }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-0 w-full max-w-5xl px-5 md:px-0">
      <h1 className="mb-5 mt-2 w-full text-left text-3xl font-semibold text-orange-800 md:text-5xl">
        <Link
          to={'/courses/$courseId'}
          params={{ courseId: chapter.course.id }}
          className="text-orange-500"
        >
          {`${addSpaceToCourseId(chapter.course.id.toUpperCase())} 
        - 
        ${chapter.course.name}`}
        </Link>
      </h1>
      <div className="font-body flex flex-row justify-between text-lg font-light tracking-wide">
        <div>
          {t('courses.part.count', {
            count: chapter.part.part,
            total: chapter.course.parts.length,
          })}
        </div>
        <div>{joinWords(chapter.course.professors.map((p) => p.name))}</div>
      </div>

      <div className="mt-5 flex h-4 flex-row justify-between space-x-3 rounded-full">
        {chapter.course.parts.map((currentPart, partIndex) => {
          const firstPart = currentPart.part === 1;
          const lastPart = currentPart.part === chapter.course.parts.length;

          return (
            <div className="flex h-4 grow flex-row" key={currentPart.part}>
              {currentPart.chapters.map((currentChapter, chapterIndex) => {
                const firstChapter = currentChapter.chapter === 1;
                const lastChapter =
                  currentChapter.chapter === currentPart.chapters.length;

                if (
                  currentPart.part !== chapter.part.part ||
                  currentChapter.chapter !== chapter.chapter
                ) {
                  return (
                    <Link
                      className="border-beige-300 h-4 grow border-l-[1.5px] first:border-l-0"
                      to={'/courses/$courseId/$partIndex/$chapterIndex'}
                      params={{
                        courseId: chapter.course.id,
                        partIndex: currentPart.part.toString(),
                        chapterIndex: currentChapter.chapter.toString(),
                      }}
                      key={chapterIndex}
                    >
                      <div
                        className={compose(
                          'h-4 grow',
                          currentPart.part < chapter.part.part ||
                            (currentPart.part === chapter.part.part &&
                              currentChapter.chapter < chapter.chapter)
                            ? 'bg-orange-600'
                            : 'bg-gray-300',
                          firstPart && firstChapter ? 'rounded-l-full' : '',
                          lastPart && lastChapter ? 'rounded-r-full' : '',
                        )}
                      />
                    </Link>
                  );
                }

                return (
                  <div
                    className="border-beige-300 relative flex grow overflow-visible border-l-[1.5px] first:border-l-0"
                    key={chapterIndex}
                  >
                    <div
                      className={compose(
                        'h-4 w-2/3 bg-orange-600',
                        firstPart && firstChapter ? 'rounded-l-full' : '',
                      )}
                    />
                    <div
                      className={compose(
                        'h-4 w-1/3 bg-gray-300',
                        lastPart && lastChapter ? 'rounded-r-full' : '',
                      )}
                    />
                    <ProgressRabbit className="absolute inset-0 bottom-4 m-auto h-12 w-full" />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HeaderBig = ({ chapter }: { chapter: Chapter }) => {
  const { t } = useTranslation();
  const isScreenMd = useGreater('sm');

  const [isContentExpanded, setIsContentExpanded] = useState(true);

  return (
    <>
      <div>
        <span
          className={`mb-1  font-mono text-base font-normal text-blue-800 ${
            isScreenMd ? '' : 'hidden'
          }`}
        >
          chapter {chapter.chapter}{' '}
        </span>
        <h2
          className={`mt-4 flex flex-col justify-center self-stretch text-2xl font-semibold uppercase text-blue-900  md:text-3xl ${
            isScreenMd ? '' : 'mb-1 hidden'
          }`}
        >
          {chapter?.title}
        </h2>
      </div>

      <div className="mt-1 space-y-2 uppercase text-blue-800">
        <div
          className={` flex flex-col self-stretch rounded-lg p-0 shadow-md ${
            isContentExpanded ? 'bg-beige-300' : 'bg-beige-300 h-auto'
          } ${isContentExpanded ? 'h-auto ' : 'mt-1 h-auto '}`}
        >
          <h3
            className="mb-3 ml-2 mt-4 flex cursor-pointer items-center text-xl font-medium text-blue-700"
            onClick={() => setIsContentExpanded(!isContentExpanded)}
          >
            <span className="mr-1 text-2xl">{'> '}</span>
            <span>{t('courses.details.objectivesTitle')}</span>
          </h3>
          {isContentExpanded && (
            <div className="mb-2 ml-2 px-5 lowercase ">
              <ul className="list-inside pl-2 text-sm">
                {chapter.course.objectives?.map(
                  (goal: string, index: number) => (
                    <li className="mt-1" key={index}>
                      <span className="mr-2 text-blue-300 opacity-50">
                        {'▶'}
                      </span>
                      <span className="text-blue-800">
                        <span style={{ textTransform: 'uppercase' }}>
                          {goal.charAt(0)}
                        </span>
                        {goal.slice(1)}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const HeaderSmall = ({ chapter }: { chapter: Chapter }) => {
  const { t } = useTranslation();
  const isScreenMd = useGreater('sm');

  const [isContentExpanded, setIsContentExpanded] = useState(false);

  return (
    <>
      <div>
        <span
          className={`mb-2  font-mono text-base font-normal text-blue-800 ${
            isScreenMd ? '' : 'hidden'
          }`}
        >
          chapter {chapter.chapter}{' '}
        </span>
        <h2
          className={`m-1 flex h-32 flex-col justify-center self-stretch text-2xl font-semibold uppercase text-blue-900  md:text-3xl ${
            isScreenMd ? '' : 'mb-1 hidden'
          }`}
        >
          {chapter?.title}
        </h2>
      </div>
      {/* Mostrar la tabla de objetivos del curso Learn*/}
      <div className="my-1 space-y-2 font-light uppercase text-blue-800">
        <div
          className={` flex flex-col self-stretch rounded-lg p-0 shadow-md ${
            isContentExpanded ? 'bg-beige-300' : 'bg-beige-300 h-auto'
          } ${isContentExpanded ? 'h-auto ' : 'mt-1 h-auto '}`}
        >
          <h3
            className="mb-3 ml-2 mt-4 flex cursor-pointer items-center text-xl font-semibold text-blue-900"
            onClick={() => setIsContentExpanded(!isContentExpanded)}
          >
            <span className="mr-2">{isContentExpanded ? '>' : '>'}</span>
            {t('courses.details.objectivesTitle').toLowerCase()}{' '}
            {/* Convierte el texto a minúsculas */}
          </h3>
          {isContentExpanded && (
            <div className="mb-2 ml-2 px-5 lowercase">
              <ul className="mt-2 list-inside pl-5">
                {chapter.course.objectives?.map(
                  (goal: string, index: number) => (
                    <li key={index}>
                      <span className="mr-2 opacity-50">{'▶'}</span>
                      <span className="capitalize">{goal.toLowerCase()}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const BottomButton = ({ chapter }: { chapter: Chapter }) => {
  const { t } = useTranslation();

  const completeChapterMutation =
    trpc.user.courses.completeChapter.useMutation();

  const completeChapter = () => {
    completeChapterMutation.mutate({
      courseId: chapter.course.id,
      part: Number(chapter.part.part),
      chapter: Number(chapter.chapter),
    });
  };

  const isLastChapter =
    chapter.chapter === chapter.part.chapters.length &&
    chapter.part.part === chapter.course.parts.length;

  return (
    <div>
      <Link
        className="flex w-full justify-end pt-10"
        to={
          isLastChapter
            ? '/courses/$courseId'
            : '/courses/$courseId/$partIndex/$chapterIndex'
        }
        params={goToChapterParameters(chapter, 'next')}
      >
        {isLastChapter ? (
          <Button onClick={completeChapter}>
            <span>{t('courses.chapter.finishCourse')}</span>
            <BsCheckLg className="ml-2 h-6 w-6" />
          </Button>
        ) : (
          <Button onClick={completeChapter}>
            <span>{t('courses.chapter.next')}</span>
            <BiSkipNext className="ml-2 h-8 w-8" />
          </Button>
        )}
      </Link>
    </div>
  );
};

const MarkdownContent = ({ chapter }: { chapter: Chapter }) => {
  return (
    <MarkdownBody
      content={chapter.raw_content}
      assetPrefix={computeAssetCdnUrl(
        chapter.last_commit,
        `courses/${chapter.course.id}`,
      )}
    />
  );
};

function getRandomQuestions(
  questionArray: Question[],
  count: number,
): Question[] {
  if (count >= questionArray.length) {
    return questionArray;
  }

  const shuffledArray = shuffleArray(questionArray.slice());
  return shuffledArray.slice(0, count);
}

function mapQuizzToQuestions(quizzArray: any[]): Question[] {
  const questions: any[] = quizzArray.map((quizz) => {
    const answers = [quizz.answer, ...quizz.wrong_answers];
    const shuffledAnswers = shuffleArray(answers);
    const correctAnswer = shuffledAnswers.indexOf(quizz.answer);

    return {
      question: quizz.question,
      answers: shuffledAnswers,
      explanation: quizz.explanation,
      correctAnswer,
    };
  });

  return questions;
}

function shuffleArray(array: any[]): any[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const CourseChapter = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { courseId, partIndex, chapterIndex } = useParams({
    from: '/courses/$courseId/$partIndex/$chapterIndex',
  });

  const isScreenMd = useGreater('sm');

  const { data: chapters } = trpc.content.getCourseChapters.useQuery({
    id: courseId,
    language: i18n.language,
  });

  const { data: chapter, isFetched } = trpc.content.getCourseChapter.useQuery({
    courseId,
    language: i18n.language,
    partIndex,
    chapterIndex,
  });

  const { data: quizzArray } =
    trpc.content.getCourseChapterQuizQuestions.useQuery({
      courseId,
      language: i18n.language,
      partIndex,
      chapterIndex,
    });

  const questionsArray: Question[] = useMemo(() => {
    if (quizzArray !== undefined) {
      const temp = mapQuizzToQuestions(quizzArray);
      return getRandomQuestions(temp, 5);
    } else {
      return [];
    }
  }, [quizzArray]);

  if (!chapter && isFetched) {
    navigate({ to: '/404' });
  }

  return (
    <CourseLayout>
      <div>
        {chapter && (
          <div className="flex h-full w-full flex-col items-center justify-center py-1 md:px-2 md:py-3">
            <Title chapter={chapter} />
            {isScreenMd ? (
              <TimelineBig chapter={chapter} />
            ) : (
              <TimelineSmall chapter={chapter} />
            )}

            <div className=" flex w-full flex-col items-center justify-center md:flex md:w-auto md:flex-row md:items-stretch md:justify-stretch">
              <div className="w-full">
                <div className="text-blue-1000 w-full space-y-4 break-words px-5 md:ml-2 md:mt-8 md:w-full md:max-w-3xl md:grow md:space-y-6 md:overflow-hidden md:px-0">
                  {isScreenMd ? (
                    <HeaderBig chapter={chapter} />
                  ) : (
                    <HeaderSmall chapter={chapter} />
                  )}
                  <MarkdownContent chapter={chapter} />
                  {questionsArray && questionsArray.length > 0 && (
                    <QuizzCard
                      name={chapter.course.id}
                      chapter={`${chapter.part.part.toString()}.${chapter.chapter.toString()}`}
                      questions={questionsArray}
                    />
                  )}
                  <BottomButton chapter={chapter} />
                </div>
              </div>
              <div className="3xl:block ml-10 mt-7 hidden shrink-0 lg:block xl:block 2xl:block  ">
                {chapters && (
                  <NavigationPanel
                    course={chapter.course}
                    chapters={chapters}
                    currentChapter={chapter}
                    style={{ position: 'sticky', top: '6rem' }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CourseLayout>
  );
};
