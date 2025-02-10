import { Link, createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import React, {
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { FaArrowRightLong } from 'react-icons/fa6';
import { FiLoader } from 'react-icons/fi';
import { HiCheck } from 'react-icons/hi2';
import { IoIosArrowForward } from 'react-icons/io';
import { z } from 'zod';

import type { CourseChapterResponse, JoinedQuizQuestion } from '@blms/types';
import { Button, Loader, TextTag, cn } from '@blms/ui';

import OrangePill from '#src/assets/icons/orange_pill_color.svg';
import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { AuthModalState } from '#src/components/AuthModals/props.ts';
import PageMeta from '#src/components/Head/PageMeta/index.js';
import { ProofreadingProgress } from '#src/components/proofreading-progress.js';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { useGreater } from '#src/hooks/use-greater.js';
import { AppContext } from '#src/providers/context.js';
import {
  COURSES_WITH_INLINE_LATEX_SUPPORT,
  addSpaceToCourseId,
  goToChapterParameters,
} from '#src/utils/courses.js';
import { formatDate } from '#src/utils/date.ts';
import { assetUrl, cdnUrl, compose, trpc } from '#src/utils/index.js';
import { SITE_NAME } from '#src/utils/meta.js';
import { capitalizeFirstWord, joinWords } from '#src/utils/string.js';

import { ClassDetails } from '../-components/class-details.tsx';
import { CourseLayout } from '../-components/course-layout.tsx';
import { LiveVideo } from '../-components/live-video.tsx';
import { NavigationPanel } from '../-components/navigation-panel.tsx';
import type { Question } from '../-components/quizz/quizz-card.tsx';
import QuizzCard from '../-components/quizz/quizz-card.tsx';

import { CourseConclusion } from './-components/course-conclusion.tsx';
import { CourseExam } from './-components/course-exam.tsx';
import { CourseReviewComponent } from './-components/course-review.tsx';

const CoursesMarkdownBody = React.lazy(
  () => import('#src/components/Markdown/courses-markdown-body.js'),
);

export const Route = createFileRoute(
  '/$lang/_content/courses/$courseId/$chapterId',
)({
  params: {
    parse: (params) => ({
      lang: z.string().parse(params.lang),
      courseId: z.string().parse(params.courseId),
      chapterId: z.string().parse(params.chapterId),
    }),
    stringify: ({ lang, courseId, chapterId }) => ({
      lang: lang,
      courseId: `${courseId}`,
      chapterId: `${chapterId}`,
    }),
  },
  component: CourseChapter,
});

const NextLessonBanner = ({ chapter }: { chapter: CourseChapterResponse }) => {
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

const TimelineSmall = ({
  chapter,
}: {
  chapter: CourseChapterResponse;
  professor: string;
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-0 w-full max-w-5xl px-[15px] sm:hidden mt-[15px]">
      <Link
        to={'/courses/$courseId'}
        params={{ courseId: chapter.course.id }}
        className="w-full flex justify-center items-center mb-4"
      >
        <h1 className="px-[22px] title-medium-sb-18px text-black max-md:text-center">
          {chapter.course.name}
        </h1>
      </Link>
      <div className="flex flex-col">
        <div className="flex items-center justify-center gap-3">
          <div className="h-0 grow border-t border-gray-300 min-w-8" />
          <span className="body-12px text-newBlack-1 text-center max-w-[225px]">
            {t('courses.part.count', {
              count: chapter.part.partIndex,
              total: chapter.course.parts?.length,
            })}{' '}
            : {chapter.part.title}
          </span>

          <div className="h-0 grow border-t border-gray-300 min-w-8" />
        </div>

        <div
          className={cn(
            'flex items-center justify-between rounded-lg bg-newGray-6 px-2.5 py-[5px] shadow-course-navigation-sm mt-2.5 mb-3 gap-4',
          )}
        >
          <Link
            to={
              chapter.part.partIndex === 1 && chapter.chapterIndex === 1
                ? '/courses/$courseId'
                : '/courses/$courseId/$chapterId'
            }
            params={goToChapterParameters(chapter, 'previous')}
            className="flex size-6 items-center justify-center rounded-full bg-darkOrange-5/60 shrink-0"
          >
            <BiChevronLeft className="size-4 text-white" />
          </Link>
          <h2 className="text-center title-small-med-16px text-headerDark">
            {chapter.part.partIndex}.{chapter.chapterIndex}. {chapter.title}
          </h2>

          <Link
            to={
              chapter.part.partIndex === chapter.course.parts.length &&
              chapter.chapterIndex === chapter.part.chapters.length
                ? '/courses/$courseId'
                : '/courses/$courseId/$chapterId'
            }
            params={goToChapterParameters(chapter, 'next')}
            className="flex size-6 items-center justify-center rounded-full bg-darkOrange-5/60 shrink-0"
          >
            <BiChevronRight className="size-4 text-white" />
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
  chapter: CourseChapterResponse;
  professor: string;
}) => {
  const { t } = useTranslation();

  const isFirstChapter =
    chapter.chapterIndex === 1 && chapter.part.partIndex === 1;

  const isLastChapter =
    chapter.chapterIndex === chapter.part.chapters.length &&
    chapter.part.partIndex === chapter.course.parts.length;

  return (
    <div className="mb-0 w-full max-w-[1102px] max-sm:hidden mt-10 px-5 md:px-2">
      <h1 className="flex items-center gap-5">
        <TextTag size="small" variant="grey" mode="light" className="uppercase">
          {addSpaceToCourseId(chapter.course.id)}
        </TextTag>
        <Link
          to={'/courses/$courseId'}
          params={{ courseId: chapter.course.id }}
          className="text-black hover:text-darkOrange-5 display-small-32px"
        >
          {chapter.course.name}
        </Link>
      </h1>
      <div className="font-body flex flex-col justify-between text-xl text-black leading-relaxed tracking-015px mt-[25px]">
        <span className="label-medium-med-16px text-newBlack-2">
          {t('courses.part.count', {
            count: chapter.part.partIndex,
            total: chapter.course.parts.length,
          })}{' '}
          : {chapter.part.title}
        </span>
        <span className="body-16px text-newBlack-5">{professor}</span>
      </div>
      <div className="mt-5 flex h-4 flex-row justify-between space-x-3 rounded-full">
        {chapter.course.parts.map((currentPart, partIndex) => {
          const firstPart = currentPart.partIndex === 1;
          const lastPart =
            currentPart.partIndex === chapter.course.parts.length;

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
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
                      className="border-beige-300 h-4 grow border-l-[1.5px] first:border-l-0"
                      to={'/courses/$courseId/$chapterId'}
                      params={{
                        courseId: chapter.course.id,
                        chapterId: currentChapter.chapterId,
                      }}
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
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
                            : 'bg-newGray-4',
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
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    key={chapterIndex}
                  >
                    <div
                      className={compose(
                        'h-4 w-1/2 bg-darkOrange-5',
                        firstPart && firstChapter ? 'rounded-l-full' : '',
                      )}
                    />
                    <div
                      className={compose(
                        'h-4 w-1/2 bg-newGray-4',
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
          <span>
            {chapter.part.partIndex}.{chapter.chapterIndex}. {chapter.title}
          </span>
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

const Header = ({ chapter }: { chapter: CourseChapterResponse }) => {
  return (
    <>
      <div>
        <h2 className="mt-2.5 text-black desktop-h4 max-sm:hidden">
          {chapter.part.partIndex}.{chapter.chapterIndex}. {chapter.title}
        </h2>
        <div className="h-px bg-newGray-4 mt-2.5 max-sm:hidden" />
      </div>
    </>
  );
};

const BottomButton = ({ chapter }: { chapter: CourseChapterResponse }) => {
  const { t } = useTranslation();

  const completeChapterMutation =
    trpc.user.courses.completeChapter.useMutation();

  const completeChapter = () => {
    completeChapterMutation.mutate({
      courseId: chapter.course.id,
      chapterId: chapter.chapterId,
      language: chapter.language,
    });
  };

  const isLastChapter =
    chapter.chapterIndex === chapter.part.chapters.length &&
    chapter.part.partIndex === chapter.course.parts.length;

  return (
    <Link
      className="group flex w-fit !mt-8 md:!mt-16 mx-auto md:ml-auto"
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

const MarkdownContent = ({ chapter }: { chapter: CourseChapterResponse }) => {
  const { tutorials, courses } = useContext(AppContext);
  const isFetchedTutorials = tutorials && tutorials.length > 0;

  if (isFetchedTutorials) {
    return (
      <Suspense fallback={<Loader size={'s'} />}>
        <CoursesMarkdownBody
          content={chapter.rawContent}
          assetPrefix={cdnUrl(`courses/${chapter.course.id}`)}
          tutorials={tutorials || []}
          courses={courses || []}
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
  const { i18n, t } = useTranslation();
  const params = Route.useParams();

  const { session } = useContext(AppContext);
  const isLoggedIn = !!session;
  const { user } = useContext(AppContext);

  const [isContentExpanded, setIsContentExpanded] = useState(true);

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  const { data: chapters } = trpc.content.getCourseChapters.useQuery({
    id: params.courseId,
    language: i18n.language,
  });

  const {
    data: chapter,
    isFetched,
    isError,
    error,
  } = trpc.content.getCourseChapter.useQuery({
    language: i18n.language,
    chapterId: params.chapterId,
  });

  const { data: proofreading } = trpc.content.getProofreading.useQuery({
    language: i18n.language,
    courseId: params.courseId,
  });

  const { data: quizzArray } =
    trpc.content.getCourseChapterQuizQuestions.useQuery({
      language: i18n.language,
      chapterId: params.chapterId,
    });

  const ticketAvailable =
    (chapter?.course?.availableSeats && chapter.course.availableSeats > 0) ||
    false;

  const { data: payments } = trpc.user.courses.getPayments.useQuery(undefined, {
    enabled: isLoggedIn && ticketAvailable,
  });

  const isCoursePaidForInPerson = useMemo(
    () =>
      payments?.some(
        (coursePayment) =>
          coursePayment.paymentStatus === 'paid' &&
          coursePayment.courseId === params.courseId &&
          coursePayment.format === 'inperson',
      ),
    [params.courseId, payments],
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
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    while ((match = regex.exec(chapter.rawContent)) !== null) {
      sections.push(match[1]);
    }

    return sections;
  }, [chapter]);

  const {
    mutateAsync: downloadTicketMutateAsync,
    isPending: downloadTicketisPending,
  } = trpc.user.courses.downloadChapterTicket.useMutation();
  const [downloadedPdf, setDownloadedPdf] = useState('');

  const isSpecialChapter =
    chapter?.isCourseReview ||
    chapter?.isCourseExam ||
    chapter?.isCourseConclusion;

  let displayClassDetails = false;
  let displayLiveSection = false;
  let displayLiveVideo = false;
  let displayQuizAndNext = true;

  if (chapter?.startDate && chapter.endDate) {
    // const isMarkdownAvailable = chapter.rawContent && chapter.rawContent.length > 0 ? true : false;
    const now = new Date(Date.now());
    const chapterStartDate = new Date(chapter.startDate.getTime());
    const chapterEndDate = new Date(chapter.endDate.getTime());

    displayClassDetails =
      (chapter.isInPerson || false || chapter.isOnline || false) &&
      chapterEndDate > now;
    displayLiveSection = chapter.isOnline || false;
    displayLiveVideo =
      displayLiveSection && chapterStartDate.setHours(0, 0, 0, 0) <= Date.now();
    displayQuizAndNext = false;
  }

  let computerProfessor = '';
  if (chapter) {
    (() => {
      // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
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

  const isScreenSm = useGreater('sm');

  useEffect(() => {
    setIsContentExpanded(isScreenSm ? isScreenSm : false);
  }, [isScreenSm]);
  const isOriginalLanguage =
    i18n.language === chapter?.course?.originalLanguage;
  return (
    <CourseLayout>
      {proofreading ? (
        <ProofreadingProgress
          isOriginalLanguage={isOriginalLanguage}
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
            ? assetUrl(`courses/${chapter.course.id}`, 'thumbnail.webp')
            : ''
        }
      />
      {chapter ? <NextLessonBanner chapter={chapter} /> : <></>}
      <div className="text-black flex flex-col grow">
        {!isFetched && (
          <div className="flex flex-col flex-1 justify-center items-center size-full">
            <Loader size={'s'} />
          </div>
        )}

        {isFetched && isError && error.data?.code === 'UNAUTHORIZED' && (
          <div className="flex flex-col flex-1 justify-center items-center size-full">
            <div>{t('courses.details.premiumContentNeedsLogin')}</div>
            <div>
              <Button
                size="l"
                mode="dark"
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
          <div className="flex flex-col flex-1 justify-center items-center size-full">
            <div>{t('courses.details.premiumContentNeedsPayment')}</div>
            <div>
              <Link
                to={'/courses/$courseId'}
                params={{ courseId: params.courseId }}
                className="text-newOrange-1 hover:underline"
              >
                {t('courses.details.premiumContentNeedsPaymentAction')}
              </Link>
            </div>
          </div>
        )}

        {isFetched && !isError && !chapter && (
          <div className="flex size-full flex-col items-start justify-center px-2 py-6 sm:items-center sm:py-10">
            {t('underConstruction.itemNotFoundOrTranslated', {
              item: t('words.chapter'),
            })}
          </div>
        )}
        {chapter && (
          <div className="flex size-full flex-col items-center justify-center">
            {/* Desktop */}
            <TimelineBig chapter={chapter} professor={computerProfessor} />
            {/* Mobile */}
            <TimelineSmall chapter={chapter} professor={computerProfessor} />

            <div className="flex w-full flex-col items-center justify-center md:flex md:max-w-[1102px] md:flex-row md:items-stretch md:justify-stretch">
              {displayClassDetails && (
                <ClassDetails
                  course={chapter.course}
                  chapter={chapter}
                  professor={computerProfessor}
                />
              )}
              {ticketAvailable && isCoursePaidForInPerson && (
                <div className="flex flex-col md:flex-row md:mt-4 gap-2 md:gap-4 text-xl leading-8 md:items-center">
                  <Button
                    size="l"
                    mode="dark"
                    className="max-md:my-6 !m-2 md:mt-5 w-full max-md:max-w-[290px] md:w-fit self-center md:self-end"
                    variant="outline"
                    onClick={async () => {
                      let pdf = downloadedPdf;
                      if (!pdf) {
                        pdf = await downloadTicketMutateAsync({
                          title: chapter.course.name,
                          addressLine1: chapter.addressLine1,
                          addressLine2: chapter.addressLine2,
                          addressLine3: chapter.addressLine3,
                          formattedStartDate: `Start date: ${formatDate(chapter.course.startDate)}`,
                          formattedTime: `End date: ${formatDate(chapter.course.endDate)}`,
                          liveLanguage: chapter.liveLanguage,
                          formattedCapacity: '',
                          contact: 'contact@planb.network',
                          userName: user?.username ?? '',
                        });
                        setDownloadedPdf(pdf);
                      }
                      const link = document.createElement('a');
                      link.href = `data:application/pdf;base64,${pdf}`;
                      link.download = 'ticket.pdf';
                      document.body.append(link);
                      link.click();
                      link.remove();
                    }}
                  >
                    {t('courses.chapter.detail.ticketDownload')}
                    {downloadTicketisPending ? (
                      <span className="ml-3">
                        <FiLoader />
                      </span>
                    ) : null}
                  </Button>
                  <p className="text-lg font-normal max-md:text-base max-md:ml-3 max-md:italic">
                    {t('courses.details.inPersonAccess')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex w-full flex-col items-center justify-center lg:max-w-[1102px] lg:items-stretch lg:justify-stretch">
              {!chapter.isCourseExam && (
                <div
                  className="text-blue-1000 w-full space-y-5 break-words px-[15px] md:px-2 md:mt-8 md:grow md:space-y-[18px] md:overflow-hidden pb-2 md:pb-0"
                  id="headerChapter"
                >
                  <Header chapter={chapter} />
                </div>
              )}
              <div className="flex w-full max-lg:flex-col items-center justify-center lg:max-w-[1102px] lg:items-stretch lg:justify-stretch">
                <div className="text-blue-1000 flex flex-col w-full gap-5 break-words px-[15px] md:px-2 md:mt-8 md:grow md:gap-[18px] md:overflow-hidden pb-2">
                  {!chapter.isCourseExam && sections.length > 0 && (
                    <div
                      className={cn(
                        'flex flex-col self-stretch rounded-[10px] lg:rounded-[20px] p-4 lg:p-5 shadow-course-navigation',
                        isContentExpanded
                          ? 'bg-newGray-6'
                          : 'bg-newGray-6 h-auto',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setIsContentExpanded(!isContentExpanded)}
                        className="flex cursor-pointer items-center text-darkOrange-5 gap-2 lg:gap-4"
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
                        <div className="mt-[15px] lg:mt-4 text-sm md:text-base">
                          <ul className="flex flex-col gap-1.5">
                            {sections.map((goal: string) => (
                              <li
                                className="flex items-center gap-2.5 text-black "
                                key={goal}
                              >
                                <HiCheck className="shrink-0 size-[18px] lg:size-6" />
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
                    <CourseExam chapter={chapter} disabled={!isLoggedIn} />
                  )}

                  {chapter.isCourseConclusion && (
                    <CourseConclusion chapter={chapter} />
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
                  <MarkdownContent chapter={chapter} />
                  {!isSpecialChapter && displayQuizAndNext && (
                    <div className="md:!mt-5">
                      {questionsArray && questionsArray.length > 0 && (
                        <>
                          <span className="text-darkOrange-5 title-medium-sb-18px md:font-normal md:text-2xl">
                            Quiz
                          </span>
                          <QuizzCard
                            name={chapter.course.id}
                            chapter={`${chapter.part.partIndex.toString()}.${chapter.chapterIndex.toString()}`}
                            questions={questionsArray}
                          />
                        </>
                      )}
                      <BottomButton chapter={chapter} />
                    </div>
                  )}
                </div>

                {!chapter.isCourseExam && !chapter.isCourseConclusion && (
                  <div className="ml-10 mt-7 hidden shrink-0 lg:block">
                    {chapters && (
                      <NavigationPanel
                        course={chapter.course}
                        chapters={chapters}
                        currentChapter={chapter}
                        style={{ position: 'sticky', top: '6.5rem' }}
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
      </div>
    </CourseLayout>
  );
}
