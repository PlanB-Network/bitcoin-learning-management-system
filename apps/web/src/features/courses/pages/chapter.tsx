import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { t } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiSkipNext, BiSkipPrevious } from 'react-icons/bi';
import { BsCheckLg } from 'react-icons/bs';

import type { JoinedQuizQuestion } from '@sovereign-university/types';
import { Button } from '@sovereign-university/ui';

import PageMeta from '#src/components/Head/PageMeta/index.js';
import { SITE_NAME } from '#src/utils/meta.js';

import QuizIcon from '../../../assets/courses/quiz-icon.svg';
import OrangePill from '../../../assets/icons/orange_pill_color.svg';
import { CoursesMarkdownBody } from '../../../components/CoursesMarkdownBody/index.tsx';
import { addSpaceToCourseId } from '../../../utils/courses.ts';
import { compose, computeAssetCdnUrl } from '../../../utils/index.ts';
import { joinWords } from '../../../utils/string.ts';
import { trpc } from '../../../utils/trpc.ts';
import type { TRPCRouterOutput } from '../../../utils/trpc.tsx';
import { NavigationPanel } from '../components/navigation-panel.tsx';
import type { Question } from '../components/quizz-card.tsx';
import QuizzCard from '../components/quizz-card.tsx';
import { CourseLayout } from '../layout.tsx';

import { ClassDetails } from './components/class-details.tsx';
import { LiveVideo } from './components/live-video.tsx';

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
      chapterName: previousPart.chapters.at(-1)?.title,
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
      chapterName: nextPart.chapters.at(0)?.title,
    };
  }

  return {
    courseId: chapter.course.id,
    partIndex: chapter.part.part.toString(),
    chapterIndex: (type === 'previous'
      ? chapter.chapter - 1
      : chapter.chapter + 1
    ).toString(),
    chapterName:
      type === 'previous'
        ? currentPart.chapters[chapter.chapter - 2].title
        : currentPart.chapters[chapter.chapter].title,
  };
};

const TimelineSmall = ({ chapter }: { chapter: Chapter }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-0 w-full max-w-5xl px-5 md:px-0 sm:hidden mt-5">
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
        <div className="flex items-center justify-center p-1 font-normal text-black tracking-015px">
          <div className="h-0 grow border-t border-gray-300"></div>
          <span className="px-3">
            {t('courses.part.count', {
              count: chapter.part.part,
              total: chapter.course.parts?.length,
            })}
            <span className={`ml-1.5 lowercase`}>
              {t('courses.chapter.count', {
                count: chapter.chapter,
              })}
            </span>
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
            <div className="flex size-6 items-center justify-center rounded-full bg-blue-500 text-white">
              <BiSkipPrevious className="size-6" />
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
            <div className="flex size-6 items-center justify-center rounded-full bg-blue-500 text-white">
              <BiSkipNext className="size-6" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

const TimelineBig = ({
  chapter,
  professor,
}: {
  chapter: Chapter;
  professor: string;
}) => {
  const { t } = useTranslation();

  const isFirstChapter = chapter.chapter === 1 && chapter.part.part === 1;

  const isLastChapter =
    chapter.chapter === chapter.part.chapters.length &&
    chapter.part.part === chapter.course.parts.length;

  return (
    <div className="mb-0 w-full max-w-[66rem] max-sm:hidden mt-7 px-5 md:px-2">
      <h1 className="flex items-center mb-5 mt-2 text-2xl md:text-4xl text-orange-800 lg:text-5xl gap-7">
        <Link
          to={'/courses/$courseId'}
          params={{ courseId: chapter.course.id }}
          className="px-4 py-2 bg-newGray-5 text-newGray-2 rounded-2xl leading-tight hover:text-darkOrange-5 hover:bg-darkOrange-0"
        >
          {addSpaceToCourseId(chapter.course.id.toUpperCase())}
        </Link>
        <Link
          to={'/courses/$courseId'}
          params={{ courseId: chapter.course.id }}
          className="text-black font-semibold leading-tight hover:text-darkOrange-5"
        >
          {chapter.course.name}
        </Link>
      </h1>
      <div className="font-body flex flex-row justify-between text-xl text-black leading-relaxed tracking-015px mt-7">
        <div>
          {t('courses.part.count', {
            count: chapter.part.part,
            total: chapter.course.parts.length,
          })}
          <span className={`ml-2.5 lowercase`}>
            {t('courses.chapter.count', {
              count: chapter.chapter,
            })}
          </span>
        </div>
        <div>{professor}</div>
      </div>

      <div className="mt-5 flex h-4 flex-row justify-between space-x-3 rounded-full">
        {chapter.course.parts.map((currentPart) => {
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
                            ? 'bg-darkOrange-5'
                            : 'bg-newGray-3',
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
                        'h-4 w-2/3 bg-darkOrange-5',
                        firstPart && firstChapter ? 'rounded-l-full' : '',
                      )}
                    />
                    <div
                      className={compose(
                        'h-4 w-1/3 bg-newGray-3',
                        lastPart && lastChapter ? 'rounded-r-full' : '',
                      )}
                    />
                    <img
                      src={OrangePill}
                      className={compose(
                        'absolute inset-0 bottom-0 left-0 m-auto h-8 w-full',
                      )}
                      alt=""
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-10 mt-10 text-center leading-normal tracking-015px">
        {!isFirstChapter && (
          <Link
            to={
              isFirstChapter
                ? '/courses/$courseId'
                : '/courses/$courseId/$partIndex/$chapterIndex'
            }
            params={goToChapterParameters(chapter, 'previous')}
            className="basis-1/4 truncate text-newGray-1"
          >
            {goToChapterParameters(chapter, 'previous').chapterName}
          </Link>
        )}

        <div className="flex gap-10 items-center text-darkOrange-5 font-semibold">
          {!isFirstChapter && <span>&lt;</span>}
          <span>{chapter.title}</span>
          {!isLastChapter && <span>&gt;</span>}
        </div>

        {!isLastChapter && (
          <Link
            to={
              isLastChapter
                ? '/courses/$courseId'
                : '/courses/$courseId/$partIndex/$chapterIndex'
            }
            params={goToChapterParameters(chapter, 'next')}
            className="basis-1/4 truncate text-newGray-1"
          >
            {goToChapterParameters(chapter, 'next').chapterName}
          </Link>
        )}
      </div>

      <div className="mt-2 bg-newGray-1 h-px" />
    </div>
  );
};

const Header = ({
  chapter,
  sections,
}: {
  chapter: Chapter;
  sections: string[];
}) => {
  const { t } = useTranslation();

  const [isContentExpanded, setIsContentExpanded] = useState(true);

  return (
    <>
      <div>
        <h2 className="mt-4 flex flex-col justify-center self-stretch text-2xl font-semibold text-blue-900  md:text-3xl max-sm:mb-1 max-sm:hidden">
          {chapter?.title}
        </h2>
      </div>

      <div className="mt-1 space-y-2 text-blue-800">
        {sections.length > 0 && (
          <div
            className={`flex flex-col self-stretch rounded-3xl p-4 shadow-md ${
              isContentExpanded ? 'bg-beige-300' : 'bg-beige-300 h-auto'
            } ${isContentExpanded ? 'h-auto ' : 'mt-1 h-auto '}`}
          >
            <button
              className="mb-3 flex cursor-pointer items-center text-lg font-medium text-blue-700 md:text-xl"
              onClick={() => setIsContentExpanded(!isContentExpanded)}
            >
              <span
                className={`mr-3 text-2xl ${
                  isContentExpanded ? 'rotate-90' : ''
                }`}
              >
                {'> '}
              </span>
              <span>{t('courses.details.objectivesTitle')}</span>
            </button>
            {isContentExpanded && (
              <div className="px-5 text-sm md:text-base">
                <ul className="list-inside text-sm">
                  {sections.map((goal: string, index: number) => (
                    <li className="mt-1" key={index}>
                      <span className="mr-3 text-blue-300 opacity-50">
                        {'▶'}
                      </span>
                      <span className="text-blue-800">
                        <span style={{ textTransform: 'uppercase' }}>
                          {goal.charAt(0)}
                        </span>
                        {goal.slice(1)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
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
        className="flex w-full justify-end pt-5 md:pt-10"
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
            <BsCheckLg className="ml-2 size-6" />
          </Button>
        ) : (
          <Button onClick={completeChapter}>
            <span>{t('courses.chapter.next')}</span>
            <BiSkipNext className="ml-2 size-8" />
          </Button>
        )}
      </Link>
    </div>
  );
};

const MarkdownContent = ({ chapter }: { chapter: Chapter }) => {
  return (
    <CoursesMarkdownBody
      content={chapter.rawContent}
      assetPrefix={computeAssetCdnUrl(
        chapter.lastCommit,
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

  const shuffledArray = shuffleArray([...questionArray]);
  return shuffledArray.slice(0, count);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapQuizzToQuestions(quizzArray: JoinedQuizQuestion[]): Question[] {
  return quizzArray.map((quizz) => {
    const answers = [quizz.answer, ...quizz.wrongAnswers];
    const shuffledAnswers = shuffleArray(answers);
    const correctAnswer = shuffledAnswers.indexOf(quizz.answer);

    return {
      question: quizz.question,
      answers: shuffledAnswers,
      explanation: quizz.explanation as string,
      correctAnswer,
    };
  });
}

function shuffleArray<T>(array: T[]): T[] {
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
    if (quizzArray === undefined) {
      return [];
    } else {
      const temp = mapQuizzToQuestions(quizzArray);
      return getRandomQuestions(temp, 5);
    }
  }, [quizzArray]);

  const sections: string[] = useMemo(() => {
    if (chapter === undefined) {
      return [];
    } else {
      const regex = /^### (.+)$/gm;

      const sections: string[] = [];

      let match;
      while ((match = regex.exec(chapter.rawContent)) !== null) {
        sections.push(match[1]);
      }

      return sections;
    }
  }, [chapter]);

  let displayClassDetails = false;
  let displayLiveSection = false;
  let displayLiveVideo = false;
  let displayQuizAndNext = true;

  if (chapter && chapter.startDate && chapter.endDate) {
    // const isMarkdownAvailable = chapter.rawContent && chapter.rawContent.length > 0 ? true : false;
    const now = new Date(Date.now());
    const chapterEndDate = new Date(new Date(chapter.endDate).getTime());

    displayClassDetails =
      (chapter.isInPerson || false || chapter.isOnline || false) &&
      chapterEndDate > now;
    displayLiveSection = chapter.isOnline || false;
    displayLiveVideo =
      displayLiveSection &&
      new Date(chapter.startDate).setHours(0, 0, 0, 0) <= Date.now();
    displayQuizAndNext = false;
  }

  let computerProfessor = '';
  if (chapter) {
    console.log('isInPerson :', chapter.isInPerson);
    console.log('isOnline :', chapter.isOnline);
    console.log('startDate :', chapter.startDate);
    console.log('timezone :', chapter.timezone);

    {
      (() => {
        let professors;
        professors = chapter.course.professors;
        if (chapter.professors && chapter.professors.length > 0) {
          professors = chapter.professors;
        }

        computerProfessor = joinWords(
          professors
            .map((p) => p.name)
            .filter((name): name is string => name !== undefined),
        );
      })();
    }
  }

  if (!chapter && isFetched) {
    navigate({ to: '/404' });
  }

  return (
    <CourseLayout>
      <PageMeta
        title={`${SITE_NAME} - ${chapter?.course.name} - ${chapter?.title}`}
        description={chapter?.course.objectives}
        imageSrc={
          chapter
            ? computeAssetCdnUrl(
                chapter.course.lastCommit,
                `courses/${chapter.course.id}/assets/thumbnail.webp`,
              )
            : ''
        }
      />
      <div className="text-blue-800">
        {chapter && (
          <div className="flex size-full flex-col items-center justify-center">
            {/* Desktop */}
            <TimelineBig chapter={chapter} professor={computerProfessor} />
            {/* Mobile */}
            <TimelineSmall chapter={chapter} />

            <div className="flex w-full flex-col items-center justify-center md:flex md:max-w-[66rem] md:flex-row md:items-stretch md:justify-stretch">
              {displayClassDetails && (
                <ClassDetails
                  course={chapter.course}
                  chapter={chapter}
                  professor={computerProfessor}
                />
              )}
            </div>

            <div className="flex w-full flex-col items-center justify-center md:flex md:max-w-[66rem] md:flex-row md:items-stretch md:justify-stretch">
              <div className="w-full">
                <div className="text-blue-1000 w-full space-y-4 break-words px-5 md:ml-2 md:mt-8 md:w-full md:max-w-3xl md:grow md:space-y-6 md:overflow-hidden md:px-0">
                  <Header chapter={chapter} sections={sections} />
                  {displayLiveSection &&
                    chapter.liveUrl &&
                    chapter.startDate && (
                      <LiveVideo
                        url={chapter.liveUrl}
                        chatUrl={chapter.chatUrl}
                        displayVideo={displayLiveVideo}
                      />
                    )}
                  <MarkdownContent chapter={chapter} />
                  {displayQuizAndNext && (
                    <>
                      {questionsArray && questionsArray.length > 0 && (
                        <>
                          <div className="flex items-center">
                            <img
                              src={QuizIcon}
                              className="ml-4 size-6"
                              alt=""
                            />
                            <p className="ml-2 text-lg font-medium text-blue-900">
                              {t('courses.quizz.quizz')}
                            </p>
                          </div>
                          <QuizzCard
                            name={chapter.course.id}
                            chapter={`${chapter.part.part.toString()}.${chapter.chapter.toString()}`}
                            questions={questionsArray}
                          />
                        </>
                      )}
                      <BottomButton chapter={chapter} />
                    </>
                  )}
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
