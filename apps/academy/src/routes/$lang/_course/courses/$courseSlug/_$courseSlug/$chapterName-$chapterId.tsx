import { formatNameForURL } from '@blms/shared';
import type {
  CourseChapterResponse,
  FormattedProfessor,
  JoinedQuizQuestion,
} from '@blms/types';
import { Button, cn, Image, Loader } from '@blms/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  lazy,
  memo,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowRightLong } from 'react-icons/fa6';
import { IoIosArrowForward } from 'react-icons/io';
import { TbCheck, TbChevronLeft, TbChevronRight } from 'react-icons/tb';
import { z } from 'zod';
import OrangePill from '#src/assets/icons/orange_pill_color.svg';
import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { AuthModalState } from '#src/components/AuthModals/props.ts';
import { MentorChat } from '#src/components/mentor-chat.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { useGreater } from '#src/hooks/use-greater.js';
import { useAuthModal } from '#src/providers/auth.tsx';
import { CourseContext } from '#src/providers/courseContext.tsx';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import {
  COURSES_WITH_INLINE_LATEX_SUPPORT,
  goToChapterParameters,
} from '#src/utils/courses.js';
import { cdnUrl, compose, resourceImgUrl, trpc } from '#src/utils/index.js';
import { capitalizeFirstWord, joinWords } from '#src/utils/string.js';
import { ClassDetails } from '../../-components/class-details.tsx';
import { LiveVideo } from '../../-components/live-video.tsx';
import { NavigationPanel } from '../../-components/navigation-panel.tsx';
import QuizzCard, {
  type Question,
} from '../../-components/quizz/quizz-card.tsx';
import { CourseConclusion } from '../-components/course-conclusion/course-conclusion.tsx';
import { CourseExamWorkflow } from '../-components/course-exam/course-exam-workflow.tsx';
import { CourseReviewComponent } from '../-components/course-review-component.tsx';
import { CourseTitle } from '../-components/course-title.tsx';
import { SingleTrialExamWorkflow } from '../-components/single-trial-exam/single-trial-exam-workflow.tsx';
import { getTabs } from '../-utils/get-tabs.tsx';

export const Route = createFileRoute(
  '/$lang/_course/courses/$courseSlug/_$courseSlug/$chapterName-$chapterId',
)({
  // params: {
  //   parse: (params) => ({
  //     lang: z.string().parse(params.lang),
  //     courseId: z.string().parse(params.courseSlug),
  //     chapterId: z.string().parse(params.chapterId),
  //   }),
  //   stringify: ({ lang, courseId, chapterId }) => ({
  //     lang: lang,
  //     courseId: `${courseId}`,
  //     chapterId: `${chapterId}`,
  //   }),
  // },
  component: CourseChapter,
  params: {
    parse: (params: Record<string, string>) => {
      const paramNameId = params['chapterName-$chapterId'];
      const { id, name } = getNameAndIdFromUrl(paramNameId);

      return {
        chapterId: z.string().parse(id),
        chapterName: z.string().parse(name),
        'chapterName-$chapterId': `${name}-${id}`,
        courseId: z.string().parse(params.courseSlug),
        lang: z.string().parse(params.lang),
      };
    },
    stringify: ({ lang, courseId, chapterName, chapterId }) => ({
      'chapterName-$chapterId': `${chapterName}-${chapterId}`,
      courseId: `${courseId}`,
      lang: lang,
    }),
  },
});

const CoursesMarkdownBody = lazy(
  () => import('#src/components/Markdown/courses-markdown-body.tsx'),
);

const TimelineSmall = ({
  chapter,
}: {
  chapter: CourseChapterResponse;
  professor: string;
}) => {
  const allChapters = chapter.course.parts.flatMap((p) => p.chapters);
  const totalChapters = allChapters.length;

  const currentChapterIndex = allChapters.findIndex(
    (c) => c.chapterId === chapter.chapterId,
  );

  /**
   * 3. Calculate percentage.
   * We use (index / total) * 100 if you want the bar to show progress UP TO the current.
   * We use ((index + 1) / total) * 100 if you want the current chapter to count as 'filled'.
   */
  const progressPercentage =
    totalChapters > 0 ? ((currentChapterIndex + 1) / totalChapters) * 100 : 0;

  return (
    <div className="w-full md:hidden mb-6">
      <div className="flex flex-col">
        <Link
          to={`/courses/${chapter.course.name}-${chapter.course.id}`}
          className="w-full flex justify-center items-center"
        >
          <h1 className="body-extra-small-bold text-neutral-400 text-center">
            {chapter.course.name}
          </h1>
        </Link>
        <div className="h-1 w-25 rounded-full bg-orange-100 overflow-hidden mx-auto mt-2">
          <div
            className="h-full bg-orange-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className={cn('flex items-center justify-between gap-4')}>
          {/*
           * TODO: Refactor nav logic : edge cases (first chapter, course root) make this messy
           * goToChapterParameters always returns a chapterId, even when not needed ?
           */}
          <Link
            to={
              chapter.part.partIndex === 1 && chapter.chapterIndex === 1
                ? '/courses/$courseId'
                : '/courses/$courseId/$chapterId'
            }
            params={goToChapterParameters(chapter, 'previous')}
            className="flex size-8 items-center justify-center rounded-full bg-brown-100 shrink-0"
          >
            <TbChevronLeft className="size-6 text-brown-400" />
          </Link>

          <h2 className="text-center display-extra-small">{chapter.title}</h2>

          {/* TODO : see above */}
          <Link
            to={
              chapter.part.partIndex === chapter.course.parts.length &&
              chapter.chapterIndex === chapter.part.chapters.length
                ? '/courses/$courseId'
                : '/courses/$courseId/$chapterId'
            }
            params={goToChapterParameters(chapter, 'next')}
            className="flex size-8 items-center justify-center rounded-full bg-brown-100 shrink-0"
          >
            <TbChevronRight className="size-6 text-brown-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const TimelineBig = ({
  chapter,
  professors,
}: {
  chapter: CourseChapterResponse;
  professors: FormattedProfessor[];
}) => {
  return (
    <div className="flex flex-col w-full max-w-[736px] max-md:hidden gap-12 mt-8">
      <div className="flex h-4 flex-row justify-between space-x-3 rounded-full">
        {chapter.course.parts.map((currentPart, partIndex) => {
          const firstPart = currentPart.partIndex === 1;
          const lastPart =
            currentPart.partIndex === chapter.course.parts.length;

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: explanation
            <div className="flex h-4 grow flex-row" key={partIndex}>
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
                      className="border-white h-4 grow border-l-[1.5px] first:border-l-0"
                      to={'/courses/$courseId/$chapterId'}
                      params={{
                        chapterId: currentChapter.chapterId,
                        courseId: chapter.course.id,
                      }}
                      // biome-ignore lint/suspicious/noArrayIndexKey: explanation
                      key={chapterIndex}
                    >
                      <div
                        className={compose(
                          'h-4 grow',
                          currentPart.partIndex < chapter.part.partIndex ||
                            (currentPart.partIndex === chapter.part.partIndex &&
                              currentChapter.chapterIndex <
                                chapter.chapterIndex)
                            ? 'bg-orange-500'
                            : 'bg-orange-100',
                          firstPart && firstChapter ? 'rounded-l-full' : '',
                          lastPart && lastChapter ? 'rounded-r-full' : '',
                        )}
                      />
                    </Link>
                  );
                }

                return (
                  <div
                    className="border-white relative flex grow overflow-visible border-l-[1.5px] first:border-l-0"
                    // biome-ignore lint/suspicious/noArrayIndexKey: explanation
                    key={chapterIndex}
                  >
                    <div
                      className={compose(
                        'h-4 w-1/2 bg-orange-500',
                        firstPart && firstChapter ? 'rounded-l-full' : '',
                      )}
                    />
                    <div
                      className={compose(
                        'h-4 w-1/2 bg-orange-100',
                        lastPart && lastChapter ? 'rounded-r-full' : '',
                      )}
                    />
                    <img
                      src={OrangePill}
                      className={compose(
                        'absolute inset-0 bottom-0 left-0 m-auto h-8 w-full',
                      )}
                      alt="Progress pill"
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="font-body flex flex-col justify-between gap-2">
        <span className="title-small text-neutral-400">
          {chapter.part.title}
        </span>
        <Header chapter={chapter} />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {professors.map((professor) => (
              <Image
                key={professor.id}
                src={resourceImgUrl(professor, 'profile.webp')}
                alt={professor.name}
                width={24}
                height={24}
                breakpoints={{ default: 64 }}
                className={cn(
                  'size-6 rounded-full object-cover [overflow-clip-margin:_unset]',
                )}
              />
            ))}
          </div>
          <span className="body-16px text-neutral-600">
            {professors.map((professor) => professor.name).join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
};

const Header = ({ chapter }: { chapter: CourseChapterResponse }) => {
  return <h1 className="display-medium">{chapter.title}</h1>;
};

const BottomButton = ({ chapter }: { chapter: CourseChapterResponse }) => {
  const { t } = useTranslation();

  const completeChapterMutation = useMutation(
    trpc.user.courses.completeChapter.mutationOptions(),
  );

  const completeChapter = () => {
    completeChapterMutation.mutate({
      chapterId: chapter.chapterId,
      courseId: chapter.course.id,
      language: chapter.language,
    });
  };

  const isLastChapter =
    chapter.chapterIndex === chapter.part.chapters.length &&
    chapter.part.partIndex === chapter.course.parts.length;

  return (
    <Link
      className="group flex w-fit !mt-4 md:!mt-8 mx-auto md:ml-auto"
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
              'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 lg:group-hover:max-w-96 lg:group-hover:opacity-100',
              'lg:group-hover:ml-3',
            )}
          />
        </Button>
      ) : (
        <Button
          variant="primary"
          size="l"
          onClick={completeChapter}
          className="max-md:min-w-[262px]"
        >
          <span>{t('courses.chapter.next')}</span>
          <FaArrowRightLong
            className={cn(
              'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 lg:group-hover:max-w-96 lg:group-hover:opacity-100',
              'lg:group-hover:ml-3',
            )}
          />
        </Button>
      )}
    </Link>
  );
};

const MarkdownContent = memo(
  ({ chapter }: { chapter: CourseChapterResponse }) => {
    return (
      <Suspense fallback={<Loader size={'s'} />}>
        <CoursesMarkdownBody
          content={chapter.rawContent}
          assetPrefix={cdnUrl(`courses/${chapter.course.index}`)}
          supportInlineLatex={COURSES_WITH_INLINE_LATEX_SUPPORT.includes(
            chapter.course.id,
          )}
        />
      </Suspense>
    );
  },
);

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
      answers: shuffledAnswers,
      correctAnswer,
      explanation: quizz.explanation as string,
      question: quizz.question,
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
  const { i18n, t } = useTranslation();
  const params = Route.useParams();

  const { openAuthModal: openAuthModalContext } = useAuthModal();

  const { course, courseProgress, isLoggedIn } = useContext(CourseContext);

  const [isContentExpanded, setIsContentExpanded] = useState(true);

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  const navigate = useNavigate();

  const { data: chapters } = useQuery(
    trpc.content.getCourseChapters.queryOptions({
      id: params.courseSlug,
      language: i18n.language,
    }),
  );

  const {
    data: chapter,
    isFetched,
    isError,
    error,
  } = useQuery(
    trpc.content.getCourseChapter.queryOptions(
      {
        chapterId: params.chapterId,
        language: i18n.language,
      },
      {
        refetchOnWindowFocus: false,
      },
    ),
  );

  const completeChapterAutoMutation = useMutation(
    trpc.user.courses.completeChapter.mutationOptions(),
  );

  const { data: quizzArray } = useQuery(
    trpc.content.getCourseChapterQuizQuestions.queryOptions({
      chapterId: params.chapterId,
      language: i18n.language,
    }),
  );

  const questionsArray: Question[] = useMemo(() => {
    if (quizzArray === undefined) {
      return [];
    }

    const temp = mapQuizzToQuestions(quizzArray);
    return getRandomQuestions(temp, 5);
  }, [quizzArray]);

  const sections: string[] = useMemo(() => {
    if (chapter === undefined) {
      return [];
    }

    const regex = /^### (.+)$/gm;

    const sections: string[] = [];

    let match: any;
    // biome-ignore lint/suspicious/noAssignInExpressions: explanation
    while ((match = regex.exec(chapter.rawContent)) !== null) {
      sections.push(match[1]);
    }

    return sections;
  }, [chapter]);

  let isAroundLiveTime = false;

  const now = new Date(Date.now());
  if (chapter?.startDate && chapter.endDate) {
    const chapterStartDate = new Date(chapter.startDate.getTime());
    const oneHourBeforeStart = new Date(chapterStartDate);
    oneHourBeforeStart.setHours(oneHourBeforeStart.getHours() - 1);

    const twoDaysAfterStart = new Date(chapterStartDate);
    twoDaysAfterStart.setDate(twoDaysAfterStart.getDate() + 2);

    if (now >= oneHourBeforeStart && now <= twoDaysAfterStart) {
      isAroundLiveTime = true;
    }
  }

  const isSpecialChapter =
    chapter?.isCourseReview ||
    chapter?.isCourseExam ||
    chapter?.isCourseConclusion ||
    chapter?.isSingleTrialExam;

  let displayClassDetails = false;
  let displayLiveSection = false;
  let displayLiveVideo = false;
  let displayQuiz = true;
  let displayNext = true;

  if (chapter?.startDate && chapter.endDate) {
    // const isMarkdownAvailable = chapter.rawContent && chapter.rawContent.length > 0 ? true : false;
    const chapterStartDate = new Date(chapter.startDate.getTime());
    const chapterEndDate = new Date(chapter.endDate.getTime());

    displayClassDetails =
      (chapter.isInPerson || false || chapter.isOnline || false) &&
      chapterEndDate > now;
    displayLiveSection = Boolean(chapter.isOnline);
    displayLiveVideo =
      displayLiveSection && chapterStartDate.setHours(0, 0, 0, 0) <= Date.now();
    displayQuiz = false;

    if (now > chapterStartDate) {
      displayNext = true;
    } else {
      displayNext = false;
    }
  }

  let computedProfessor = '';
  if (chapter) {
    (() => {
      // biome-ignore lint/suspicious/noImplicitAnyLet: explanation
      let professors;
      professors = chapter.course.mainProfessors;
      if (chapter.professors && chapter.professors.length > 0) {
        professors = chapter.professors;
      }

      computedProfessor = joinWords(
        professors
          .map((p) => p.name)
          .filter((name): name is string => name !== undefined),
      );
    })();
  }

  const isScreenSm = useGreater('sm');

  useEffect(() => {
    setIsContentExpanded(isScreenSm ? isScreenSm : false);
  }, [isScreenSm]);

  useEffect(() => {
    if (
      chapter?.course &&
      params.chapterName !== formatNameForURL(chapter.title)
    ) {
      navigate({
        replace: true,
        to: `/courses/${chapter.courseId}/${formatNameForURL(chapter.title)}-${chapter.chapterId}`,
      });
    }
  }, [chapter, isFetched, navigate, params.chapterName]);

  useEffect(() => {
    if (isLoggedIn && isAroundLiveTime && chapter) {
      completeChapterAutoMutation.mutate({
        chapterId: chapter.chapterId,
        courseId: chapter.course.id,
        language: i18n.language,
      });
    }
  }, [chapter, isLoggedIn, isAroundLiveTime]);

  return (
    <PageLayout
      layoutSize="wide"
      title={`${course?.name || ''} - ${chapter?.title || ''}`}
      hideTitle
      navbarTitle={course ? <CourseTitle course={course} /> : undefined}
      tabs={course ? getTabs(course, courseProgress?.[0]) : []}
      actionButtons={
        !isLoggedIn && chapter
          ? [
              {
                text: t('auth.saveProgress'),
                tooltipText: t('auth.signUpToSave'),
                onClick: () => openAuthModalContext(AuthModalState.Register),
              },
            ]
          : []
      }
    >
      <div className="text-black flex flex-col grow">
        {!isFetched && (
          <div className="flex flex-col flex-1 items-center size-full">
            <Loader size={'s'} />
          </div>
        )}

        {isFetched && isError && error.data?.code === 'UNAUTHORIZED' && (
          <div className="flex flex-col flex-1 items-center size-full">
            <div>{t('courses.details.premiumContentNeedsLogin')}</div>
            <div>
              <Button
                size="l"
                mode="light"
                variant="primary"
                className="mt-4"
                onClick={openAuthModal}
              >
                {t('auth.signIn')}
              </Button>
            </div>
          </div>
        )}

        {isFetched && isError && error.data?.code === 'FORBIDDEN' && (
          <div className="flex flex-col flex-1 items-center size-full">
            <div>{t('courses.details.premiumContentNeedsPayment')}</div>
            <div>
              <Link
                to={'/courses/$courseId'}
                params={{ courseId: params.courseSlug }}
                className="text-orange-500 hover:underline"
              >
                {t('courses.details.premiumContentNeedsPaymentAction')}
              </Link>
            </div>
          </div>
        )}

        {isFetched && !isError && !chapter && (
          <div className="flex size-full flex-col items-start py-6 md:items-center md:py-10">
            {t('underConstruction.itemNotFoundOrTranslated', {
              item: t('words.chapter'),
            })}
          </div>
        )}
        {chapter && (
          <div className="flex size-full flex-col">
            {/* Desktop */}
            <TimelineBig
              chapter={chapter}
              professors={chapter?.course.mainProfessors}
            />
            {/* Mobile */}
            <TimelineSmall chapter={chapter} professor={computedProfessor} />

            {displayClassDetails && (
              <ClassDetails
                course={chapter.course}
                chapter={chapter}
                professor={computedProfessor}
              />
            )}

            <div className="flex w-full flex-col items-center justify-center lg:max-w-[1102px] lg:items-stretch lg:justify-stretch">
              {!chapter.isCourseExam && !chapter.isSingleTrialExam && (
                <div id="headerChapter" />
              )}
              <div className="flex w-full max-lg:flex-col items-center justify-center lg:max-w-[1102px] lg:items-stretch lg:justify-stretch">
                <div className="text-blue-950 flex flex-col w-full gap-5 break-words md:mt-8 md:grow md:gap-4 md:overflow-hidden pb-2">
                  {!chapter.isCourseExam &&
                    !chapter.isSingleTrialExam &&
                    sections.length > 0 && (
                      <div
                        className={cn(
                          'flex flex-col self-stretch rounded-[10px] lg:rounded-[20px] p-4 lg:p-5 bg-header',
                          isContentExpanded ? '' : 'h-auto',
                        )}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setIsContentExpanded(!isContentExpanded)
                          }
                          className="flex cursor-pointer items-center text-orange-500 gap-2 lg:gap-4"
                        >
                          <IoIosArrowForward
                            className={cn(
                              'size-4 lg:size-5',
                              isContentExpanded
                                ? 'rotate-90 transition-transform'
                                : 'transition-transform',
                            )}
                          />
                          <span className="subtitle-small-caps-14px lg:subtitle-medium-caps-18px">
                            {t('courses.details.objectivesTitle')}
                          </span>
                        </button>
                        {isContentExpanded && (
                          <div className="mt-4 lg:mt-4 text-sm md:text-base">
                            <ul className="flex flex-col gap-1.5">
                              {sections.map((goal: string) => (
                                <li
                                  className="flex items-center gap-2.5 text-black "
                                  key={goal}
                                >
                                  <TbCheck className="shrink-0 size-[18px] lg:size-6" />
                                  <span className="body-14px lg:label-large-20px">
                                    {capitalizeFirstWord(goal)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  {chapter.isCourseReview && (
                    <div className="mx-4">
                      <CourseReviewComponent
                        courseId={chapter.courseId}
                        chapter={chapter}
                        chapterId={chapter.chapterId}
                        formDisabled={!isLoggedIn}
                      />
                    </div>
                  )}
                  {chapter.isCourseExam && (
                    <CourseExamWorkflow chapter={chapter} />
                  )}
                  {chapter.isCourseConclusion && (
                    <CourseConclusion chapter={chapter} />
                  )}
                  {chapter.isSingleTrialExam && (
                    <SingleTrialExamWorkflow chapter={chapter} />
                  )}
                  {displayLiveSection &&
                    chapter.liveUrl &&
                    chapter.startDate && (
                      <LiveVideo
                        url={chapter.liveUrl}
                        chatUrl={chapter.chatUrl}
                        displayVideo={displayLiveVideo}
                      />
                    )}
                  {!isSpecialChapter && displayLiveSection && displayNext && (
                    <div className="mb-8">
                      <BottomButton chapter={chapter} />
                    </div>
                  )}
                  <MarkdownContent chapter={chapter} />
                  {!isSpecialChapter && displayQuiz && (
                    <div className="md:!mt-5">
                      {questionsArray && questionsArray.length > 0 && (
                        <>
                          <span className="text-orange-500 title-medium-sb-18px md:font-normal md:text-2xl">
                            Quiz
                          </span>
                          <QuizzCard
                            name={chapter.course.index}
                            chapter={`${chapter.part.partIndex.toString()}.${chapter.chapterIndex.toString()}`}
                            questions={questionsArray}
                          />
                        </>
                      )}
                    </div>
                  )}

                  {!isSpecialChapter && !displayLiveSection && displayNext && (
                    <BottomButton chapter={chapter} />
                  )}
                </div>

                {!chapter.isCourseExam &&
                  !chapter.isCourseConclusion &&
                  !chapter.isSingleTrialExam && (
                    <div className="ml-10 mt-7 shrink-0 max-2xl:hidden w-60">
                      {chapters && (
                        <NavigationPanel
                          course={chapter.course}
                          chapters={chapters}
                          currentChapter={chapter}
                        />
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={closeAuthModal}
            initialState={AuthModalState.SignIn}
          />
        )}

        {chapter && (
          <MentorChat chapterId={chapter.chapterId} language={i18n.language} />
        )}
      </div>
    </PageLayout>
  );
}
