import {
  Link,
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { t } from 'i18next';
import React, {
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { BiSkipNext, BiSkipPrevious } from 'react-icons/bi';
import { FaArrowRightLong } from 'react-icons/fa6';

import type { JoinedQuizQuestion } from '@blms/types';
import { Button, Loader, cn } from '@blms/ui';

import QuizIcon from '#src/assets/courses/quiz-icon.svg';
import OrangePill from '#src/assets/icons/orange_pill_color.svg';
import { AuthModal } from '#src/components/AuthModals/auth-modal.js';
import { AuthModalState } from '#src/components/AuthModals/props.js';
import PageMeta from '#src/components/Head/PageMeta/index.js';
import { ProofreadingProgress } from '#src/components/proofreading-progress.js';
import { useDisclosure } from '#src/hooks/use-disclosure.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { AppContext } from '#src/providers/context.js';
import {
  COURSES_WITH_INLINE_LATEX_SUPPORT,
  addSpaceToCourseId,
  goToChapterParameters,
} from '#src/utils/courses.js';
import { compose, computeAssetCdnUrl, trpc } from '#src/utils/index.js';
import { SITE_NAME } from '#src/utils/meta.js';
import { capitalizeFirstWord, joinWords } from '#src/utils/string.js';
import type { TRPCRouterOutput } from '#src/utils/trpc.js';

import { ClassDetails } from '../-components/class-details.tsx';
import { CourseLayout } from '../-components/course-layout.tsx';
import { LiveVideo } from '../-components/live-video.tsx';
import { NavigationPanel } from '../-components/navigation-panel.tsx';
import type { Question } from '../-components/quizz/quizz-card.tsx';
import QuizzCard from '../-components/quizz/quizz-card.tsx';

import { CourseReview } from './-components/course-review.tsx';

// eslint-disable-next-line import/no-named-as-default-member
const CoursesMarkdownBody = React.lazy(
  () => import('#src/components/Markdown/courses-markdown-body.js'),
);

export const Route = createFileRoute('/_content/courses/$courseId/$chapterId')({
  component: CourseChapter,
});

type Chapter = NonNullable<TRPCRouterOutput['content']['getCourseChapter']>;

const NextLessonBanner = ({ chapter }: { chapter: Chapter }) => {
  const courseParts = chapter.course.parts;
  const currentDate = new Date();

  let closestChapter = null;

  for (const part of courseParts) {
    for (const currentChapter of part.chapters) {
      let currentChapterStartDate = null;

      if (currentChapter.startDate !== null) {
        currentChapterStartDate = currentChapter.startDate;
      }

      if (
        currentChapterStartDate &&
        currentChapterStartDate > currentDate &&
        (!closestChapter ||
          (closestChapter.startDate !== null &&
            closestChapter.startDate &&
            currentChapterStartDate < closestChapter.startDate))
      ) {
        closestChapter = currentChapter;
      }
    }
  }

  if (closestChapter === null || closestChapter.startDate === null) {
    return null;
  }

  return (
    <div className="py-3 bg-newGray-6 shadow-course-navigation">
      <p className="max-w-6xl text-darkOrange-5 md:text-[22px] text-sm leading-normal tracking-[1px] text-center mx-auto">
        {t('courses.chapter.nextLesson')}{' '}
        <Link
          to={'/courses/$courseId/$chapterId'}
          params={{
            courseId: chapter.course.id,
            chapterId: closestChapter.chapterId,
          }}
          className="uppercase font-medium underline"
        >
          {closestChapter.title}
        </Link>{' '}
        {t('words.on')}{' '}
        <span className="uppercase font-medium underline">
          {closestChapter.startDate.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </p>
    </div>
  );
};

const TimelineSmall = ({ chapter }: { chapter: Chapter }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-0 w-full max-w-5xl px-5 md:px-0 sm:hidden mt-5">
      <h1
        className={`mb-5 w-full text-left text-4xl font-bold text-white md:text-5xl`}
      >
        <div className="flex md:flex-wrap items-center justify-center gap-4 md:gap-2">
          <Link
            to={'/courses/$courseId'}
            params={{ courseId: chapter.course.id }}
            className="px-2 py-1 text-xl bg-newGray-5 text-newGray-2 font-normal rounded-lg leading-tight hover:text-darkOrange-5 hover:bg-darkOrange-0 shrink-0 uppercase"
          >
            {addSpaceToCourseId(chapter.course.id)}
          </Link>
          <Link
            to={'/courses/$courseId'}
            params={{ courseId: chapter.course.id }}
          >
            <h1 className="mb-1 md:mr-2 text-xl font-semibold text-black max-md:text-center">
              {chapter.course.name}
            </h1>
          </Link>
        </div>
      </h1>
      <div className="flex flex-col  ">
        <div className="flex items-center justify-center p-1 font-normal text-black tracking-015px">
          <div className="h-0 grow border-t border-gray-300"></div>
          <span className="px-3">
            {t('courses.part.count', {
              count: chapter.part.partIndex,
              total: chapter.course.parts?.length,
            })}
            <span className={`ml-1.5 lowercase`}>
              {t('courses.chapter.count', {
                count: chapter.chapterIndex,
              })}
            </span>
          </span>

          <div className="h-0 grow border-t border-gray-300"></div>
        </div>

        <div className="flex flex-row items-center justify-between text-lg ">
          <Link
            className="h-6"
            to={
              chapter.part.partIndex === 1 && chapter.chapterIndex === 1
                ? '/courses/$courseId'
                : '/courses/$courseId/$chapterId'
            }
            params={goToChapterParameters(chapter, 'previous')}
          >
            <div className="flex size-6 items-center justify-center rounded-full bg-newGray-3 text-white hover:bg-darkOrange-5">
              <BiSkipPrevious className="size-6" />
            </div>
          </Link>

          <div className="p-1 font-semibold text-blue-900 text-center">
            {chapter?.title}
          </div>
          <Link
            className="h-6"
            to={
              chapter.part.partIndex === chapter.course.parts.length &&
              chapter.chapterIndex === chapter.part.chapters.length
                ? '/courses/$courseId'
                : '/courses/$courseId/$chapterId'
            }
            params={goToChapterParameters(chapter, 'next')}
          >
            <div className="flex size-6 items-center justify-center rounded-full bg-newGray-3 text-white hover:bg-darkOrange-5">
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

  const isFirstChapter =
    chapter.chapterIndex === 1 && chapter.part.partIndex === 1;

  const isLastChapter =
    chapter.chapterIndex === chapter.part.chapters.length &&
    chapter.part.partIndex === chapter.course.parts.length;

  return (
    <div className="mb-0 w-full max-w-[66rem] max-sm:hidden mt-7 px-5 md:px-2">
      <h1 className="flex items-center mb-5 mt-2 text-2xl md:text-4xl text-orange-800 lg:text-5xl gap-7">
        <Link
          to={'/courses/$courseId'}
          params={{ courseId: chapter.course.id }}
          className="px-4 py-2 bg-newGray-5 text-newGray-2 rounded-2xl leading-tight hover:text-darkOrange-5 hover:bg-darkOrange-0 shrink-0"
        >
          {addSpaceToCourseId(chapter.course.id.toUpperCase())}
        </Link>
        <Link
          to={'/courses/$courseId'}
          params={{ courseId: chapter.course.id }}
          className="text-black font-medium leading-tight hover:text-darkOrange-5"
        >
          {chapter.course.name}
        </Link>
      </h1>
      <div className="font-body flex flex-row justify-between text-xl text-black leading-relaxed tracking-015px mt-7">
        <div>
          {t('courses.part.count', {
            count: chapter.part.partIndex,
            total: chapter.course.parts.length,
          })}
          <span className={`ml-2.5 lowercase`}>
            {t('courses.chapter.count', {
              count: chapter.chapterIndex,
            })}
          </span>
        </div>
        <div>{professor}</div>
      </div>

      <div className="mt-5 flex h-4 flex-row justify-between space-x-3 rounded-full">
        {chapter.course.parts.map((currentPart) => {
          const firstPart = currentPart.partIndex === 1;
          const lastPart =
            currentPart.partIndex === chapter.course.parts.length;

          return (
            <div className="flex h-4 grow flex-row" key={currentPart.partIndex}>
              {currentPart.chapters.map((currentChapter, chapterIndex) => {
                const firstChapter = currentChapter.chapterIndex === 1;
                const lastChapter =
                  currentChapter.chapterIndex === currentPart.chapters.length;

                if (
                  currentPart.partIndex !== chapter.part.partIndex ||
                  currentChapter.chapterIndex !== chapter.chapterIndex
                ) {
                  return (
                    <Link
                      className="border-beige-300 h-4 grow border-l-[1.5px] first:border-l-0"
                      to={'/courses/$courseId/$chapterId'}
                      params={{
                        courseId: chapter.course.id,
                        chapterId: currentChapter.chapterId,
                      }}
                      key={chapterIndex}
                    >
                      <div
                        className={compose(
                          'h-4 grow',
                          currentPart.partIndex < chapter.part.partIndex ||
                            (currentPart.partIndex === chapter.part.partIndex &&
                              currentChapter.chapterIndex <
                                chapter.chapterIndex)
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
                : '/courses/$courseId/$chapterId'
            }
            params={goToChapterParameters(chapter, 'previous')}
            className="basis-1/4 truncate text-newGray-1 hover:font-medium"
          >
            {goToChapterParameters(chapter, 'previous').chapterName}
          </Link>
        )}

        <div className="flex gap-10 items-center text-darkOrange-5 font-medium">
          {!isFirstChapter && (
            <Link
              to={
                isFirstChapter
                  ? '/courses/$courseId'
                  : '/courses/$courseId/$chapterId'
              }
              params={goToChapterParameters(chapter, 'previous')}
            >
              <span>&lt;</span>
            </Link>
          )}
          <span>{chapter.title}</span>
          {!isLastChapter && (
            <Link
              to={
                isLastChapter
                  ? '/courses/$courseId'
                  : '/courses/$courseId/$chapterId'
              }
              params={goToChapterParameters(chapter, 'next')}
            >
              <span>&gt;</span>
            </Link>
          )}
        </div>

        {!isLastChapter && (
          <Link
            to={
              isLastChapter
                ? '/courses/$courseId'
                : '/courses/$courseId/$chapterId'
            }
            params={goToChapterParameters(chapter, 'next')}
            className="basis-1/4 truncate text-newGray-1 hover:font-medium"
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

  const isScreenSm = useGreater('sm');

  const [isContentExpanded, setIsContentExpanded] = useState(true);

  useEffect(() => {
    setIsContentExpanded(isScreenSm ? isScreenSm : false);
  }, [isScreenSm]);

  return (
    <>
      <div>
        <h2 className="text-black desktop-h5 max-sm:hidden capitalize">
          {t('courses.part.count', {
            count: chapter.part.partIndex,
            total: chapter.course.parts.length,
          })}{' '}
          : {chapter?.part.title.toLowerCase()}
        </h2>
        <h2 className="mt-2.5 text-black desktop-h4 max-sm:hidden">
          {chapter.part.partIndex}.{chapter.chapterIndex}. {chapter.title}
        </h2>
        <div className="h-px bg-newGray-4 mt-2.5" />
      </div>

      <div>
        {sections.length > 0 && (
          <div
            className={`flex flex-col self-stretch rounded-3xl px-6 py-2.5 shadow-course-navigation ${
              isContentExpanded ? 'bg-white' : 'bg-white h-auto'
            } ${isContentExpanded ? 'h-auto ' : 'mt-1 h-auto '}`}
          >
            <button
              className="flex cursor-pointer items-center text-lg font-medium text-black md:text-2xl uppercase"
              onClick={() => setIsContentExpanded(!isContentExpanded)}
            >
              <span
                className={`mr-3 text-2xl ${
                  isContentExpanded
                    ? 'rotate-90 transition-transform'
                    : 'transition-transform'
                }`}
              >
                {'> '}
              </span>
              <span>{t('courses.details.objectivesTitle')}</span>
            </button>
            {isContentExpanded && (
              <div className="mt-3 px-5 text-sm md:text-base">
                <ul className="flex flex-col gap-1.5">
                  {sections.map((goal: string, index: number) => (
                    <li className="flex items-center" key={index}>
                      <span className="mr-3 text-newGray-3 text-sm">
                        {'▶'}
                      </span>
                      <span className="text-black">
                        {capitalizeFirstWord(goal)}
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
      chapterId: chapter.chapterId,
    });
  };

  const isLastChapter =
    chapter.chapterIndex === chapter.part.chapters.length &&
    chapter.part.partIndex === chapter.course.parts.length;

  return (
    <div>
      <Link
        className="flex w-full justify-center md:justify-end pt-5 md:pt-10"
        to={
          isLastChapter ? '/courses/$courseId' : '/courses/$courseId/$chapterId'
        }
        params={goToChapterParameters(chapter, 'next')}
      >
        {isLastChapter ? (
          <Button variant="primary" size="l" onClick={completeChapter}>
            <span>{t('courses.chapter.finishCourse')}</span>
            <FaArrowRightLong
              className={cn(
                'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                'group-hover:ml-3',
              )}
            />
          </Button>
        ) : (
          <Button variant="primary" size="l" onClick={completeChapter}>
            <span>{t('courses.chapter.next')}</span>
            <FaArrowRightLong
              className={cn(
                'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                'group-hover:ml-3',
              )}
            />
          </Button>
        )}
      </Link>
    </div>
  );
};

const MarkdownContent = ({ chapter }: { chapter: Chapter }) => {
  const { tutorials } = useContext(AppContext);
  const isFetchedTutorials = tutorials && tutorials.length > 0;

  if (isFetchedTutorials) {
    return (
      <Suspense fallback={<Loader size={'s'} />}>
        <CoursesMarkdownBody
          content={chapter.rawContent}
          assetPrefix={computeAssetCdnUrl(
            chapter.lastCommit,
            `courses/${chapter.course.id}`,
          )}
          tutorials={tutorials || []}
          supportInlineLatex={COURSES_WITH_INLINE_LATEX_SUPPORT.includes(
            chapter.course.id,
          )}
        />
      </Suspense>
    );
  }

  return <Loader size={'xl'} />;
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

function CourseChapter() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { courseId, chapterId } = useParams({
    from: '/courses/$courseId/$chapterId',
  });

  const { session } = useContext(AppContext);
  const isLoggedIn = !!session;

  const { data: chapters } = trpc.content.getCourseChapters.useQuery({
    id: courseId,
    language: i18n.language,
  });

  const { data: chapter, isFetched } = trpc.content.getCourseChapter.useQuery({
    language: i18n.language,
    chapterId: chapterId,
  });

  const { data: proofreading } = trpc.content.getProofreading.useQuery({
    language: i18n.language,
    courseId: courseId,
  });

  const { data: quizzArray } =
    trpc.content.getCourseChapterQuizQuestions.useQuery({
      language: i18n.language,
      chapterId: chapterId,
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

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  const authMode = AuthModalState.SignIn;

  const isSpecialChapter =
    chapter?.isCourseReview ||
    chapter?.isCourseExam ||
    chapter?.isCourseConclusion;

  let displayClassDetails = false;
  let displayLiveSection = false;
  let displayLiveVideo = false;
  let displayQuizAndNext = true;

  if (chapter && chapter.startDate && chapter.endDate) {
    // const isMarkdownAvailable = chapter.rawContent && chapter.rawContent.length > 0 ? true : false;
    const now = new Date(Date.now());
    const chapterEndDate = new Date(chapter.endDate.getTime());

    displayClassDetails =
      (chapter.isInPerson || false || chapter.isOnline || false) &&
      chapterEndDate > now;
    displayLiveSection = chapter.isOnline || false;
    displayLiveVideo =
      displayLiveSection &&
      chapter.startDate.setHours(0, 0, 0, 0) <= Date.now();
    displayQuizAndNext = false;
  }

  let computerProfessor = '';
  if (chapter) {
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
      {proofreading ? (
        <ProofreadingProgress
          mode="light"
          proofreadingData={{
            contributors: proofreading.contributorsId,
            reward: proofreading.reward,
          }}
        />
      ) : (
        <></>
      )}

      <PageMeta
        title={`${SITE_NAME} - ${chapter?.course.name} - ${chapter?.title}`}
        description={chapter?.course.objectives?.join(',')}
        imageSrc={
          chapter
            ? computeAssetCdnUrl(
                chapter.course.lastCommit,
                `courses/${chapter.course.id}/assets/thumbnail.webp`,
              )
            : ''
        }
      />
      {chapter ? <NextLessonBanner chapter={chapter} /> : <></>}
      <div className="text-black">
        {!isFetched && <Loader size={'s'} />}
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

            <div className="flex w-full flex-col items-center justify-center lg:max-w-[66rem] lg:flex-row lg:items-stretch lg:justify-stretch">
              <div className="text-blue-1000 w-full space-y-4 break-words px-5 md:px-2 md:mt-8 md:max-w-3xl md:grow md:space-y-6 md:overflow-hidden">
                <Header chapter={chapter} sections={sections} />

                {chapter.isCourseReview && (
                  <>
                    {isLoggedIn ? (
                      <CourseReview chapter={chapter}></CourseReview>
                    ) : (
                      <>
                        <p className="text-black text-center italic leading-relaxed tracking-015px w-full max-w-[596px] mx-auto">
                          <Trans i18nKey="courses.review.currentlyLoggedOut">
                            <button
                              onClick={() => {
                                !isLoggedIn && openAuthModal();
                              }}
                              className="underline hover:text-darkOrange-5 italic"
                            >
                              Login or Register
                            </button>
                          </Trans>
                        </p>

                        <CourseReview
                          chapter={chapter}
                          formDisabled={true}
                        ></CourseReview>

                        {isAuthModalOpen && (
                          <AuthModal
                            isOpen={isAuthModalOpen}
                            onClose={closeAuthModal}
                            initialState={authMode}
                          />
                        )}
                      </>
                    )}
                  </>
                )}

                {displayLiveSection && chapter.liveUrl && chapter.startDate && (
                  <LiveVideo
                    url={chapter.liveUrl}
                    chatUrl={chapter.chatUrl}
                    displayVideo={displayLiveVideo}
                  />
                )}
                <MarkdownContent chapter={chapter} />
                {!isSpecialChapter && displayQuizAndNext && (
                  <>
                    {questionsArray && questionsArray.length > 0 && (
                      <>
                        <div className="flex items-center">
                          <img src={QuizIcon} className="ml-4 size-6" alt="" />
                          <p className="ml-2 text-lg font-medium text-blue-900">
                            {t('courses.quizz.quizz')}
                          </p>
                        </div>
                        <QuizzCard
                          name={chapter.course.id}
                          chapter={`${chapter.part.partIndex.toString()}.${chapter.chapterIndex.toString()}`}
                          questions={questionsArray}
                        />
                      </>
                    )}
                    <BottomButton chapter={chapter} />
                  </>
                )}
              </div>
              <div className="3xl:block ml-10 mt-7 hidden shrink-0 lg:block xl:block 2xl:block">
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
}
