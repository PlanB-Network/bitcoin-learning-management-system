import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsCheckCircle, BsCircleFill, BsRocketTakeoff } from 'react-icons/bs';
import { FaChalkboardTeacher, FaLock } from 'react-icons/fa';
import { HiOutlineAcademicCap, HiOutlineBookOpen } from 'react-icons/hi';
import { IoMdStopwatch } from 'react-icons/io';
import { RxTriangleDown } from 'react-icons/rx';
import ReactMarkdown from 'react-markdown';

import type { JoinedCourseWithAll } from '@sovereign-university/types';
import { cn } from '@sovereign-university/ui';

import graduateImg from '../../../assets/birrete.png';
import watch from '../../../assets/cloclk.png';
import checkBoxSVG from '../../../assets/courses/checkboxFilled.svg';
import crayonSVG from '../../../assets/courses/Crayon.svg';
import Book from '../../../assets/courses/livre.svg?react';
import rocketSVG from '../../../assets/courses/rocketcourse.svg';
import staricon from '../../../assets/courses/star.png';
import wizard from '../../../assets/courses/wizard.png';
import yellowBook from '../../../assets/courses/yellowbook.png';
import rabitPen from '../../../assets/rabbit_holding_pen.svg';
import { Button } from '../../../atoms/Button/index.tsx';
import { AuthModal } from '../../../components/AuthModal/index.tsx';
import { AuthModalState } from '../../../components/AuthModal/props.ts';
import { AuthorCard } from '../../../components/author-card.tsx';
import {
  useAppSelector,
  useDisclosure,
  useNavigateMisc,
} from '../../../hooks/index.ts';
import { addSpaceToCourseId } from '../../../utils/courses.ts';
import { computeAssetCdnUrl, trpc } from '../../../utils/index.ts';
import { CourseButton } from '../components/course-button.tsx';
import { CourseLayout } from '../layout.tsx';

import { CourseDescriptionModal } from './components/course-description-modal.tsx';
import { CoursePaymentModal } from './components/course-payment-modal.tsx';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const CourseDetails: React.FC = () => {
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  // TODO Refactor this auth stuff
  const [authMode, setAuthMode] = useState<AuthModalState>(
    AuthModalState.SignIn,
  );

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  const { courseId } = useParams({
    from: '/courses/$courseId',
  });
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const isScreenMd = useGreater('sm');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [paidSatsPrice, setPaidSatsPrice] = useState(0);
  const [paidWithPhysical, setPaidWithPhysical] = useState(false);
  const [paidPart, setPaidPart] = useState<number | undefined>();
  const [paidChapter, setPaidChapter] = useState<number | undefined>();

  const { data: course, isFetched } = trpc.content.getCourse.useQuery({
    id: courseId,
    language: i18n.language,
  });

  const {
    data: payments,
    // isFetched: isPaymentFetched,
    // refetch: refetchPayment,
  } = trpc.user.courses.getPayment.useQuery();

  console.log({ payments });

  const isCoursePaid = useMemo(
    () =>
      payments?.some(
        (coursePayment) =>
          coursePayment.paymentStatus === 'paid' &&
          coursePayment.courseId === courseId,
      ),
    [courseId, payments],
  );

  const professorNames = course?.professors
    .map((professor) => professor.name)
    .join(', ');

  if (!course && isFetched) navigateTo404();

  const buttonProps = useMemo(
    () =>
      course?.requiresPayment && !isCoursePaid
        ? {
            iconLeft: <FaLock />,
            onClick: () => {
              if (isLoggedIn) {
                setIsDescriptionModalOpen(true);
              } else {
                setAuthMode(AuthModalState.SignIn);
                openAuthModal();
              }
            },
            variant: 'primary' as const,
          }
        : { variant: 'tertiary' as const },
    [course?.requiresPayment, isCoursePaid, isLoggedIn, openAuthModal],
  );

  const displayBuyCourse = course?.requiresPayment && !isCoursePaid;

  // TODO fix this february hack
  const isLinkDisabled =
    displayBuyCourse || (!displayBuyCourse && course?.id === 'giaco');

  const isButtonDisabled = !displayBuyCourse && course?.id === 'giaco';

  const [conversionRate, setConversionRate] = useState<number | null>(null);

  interface MempoolPrice {
    USD: number;
    EUR: number;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://mempool.space/api/v1/prices');
        const data = (await response.json()) as MempoolPrice;

        if (data) {
          const newConversionRate = data.EUR;
          setConversionRate(newConversionRate);
        } else {
          console.error('Failed to retrieve conversion rate from Kraken API.');
        }
      } catch (error) {
        console.error('Failed to fetch conversion rate:', error);
      }
    }

    fetchData();
  }, []);

  let satsPrice = -1;
  if (course && course.paidPriceEuros && conversionRate) {
    satsPrice = Math.round(
      (course.paidPriceEuros * 100_000_000) / conversionRate,
    );
  }

  const Header = ({ course }: { course: JoinedCourseWithAll }) => {
    return (
      <div className="flex max-w-5xl flex-col space-y-2 px-2 sm:flex-row sm:items-center sm:space-x-10">
        {isScreenMd ? (
          <>
            <div
              className="flex shrink-0 grow-0 flex-col items-center justify-center rounded-full bg-orange-500 p-8 text-5xl font-bold uppercase text-white"
              title={t('courses.details.courseId', { courseId: course.id })}
            >
              <span>{addSpaceToCourseId(course.id)}</span>
            </div>
            <div>
              <h1 className="text-3xl  font-semibold text-blue-800  lg:text-5xl">
                {course.name}
              </h1>
              <h2 className="mt-4 text-lg font-light italic text-blue-800">
                <span>{t('courses.details.goal')}</span>
                <span>{course.goal}</span>
              </h2>
            </div>
          </>
        ) : (
          <div className="mb-4 flex flex-col items-center ">
            <div className="mt-2 flex flex-col items-center">
              <div className="size-fit rounded-2xl bg-orange-500 px-3 py-2 text-left text-3xl font-bold uppercase text-white">
                {addSpaceToCourseId(course.id)}
              </div>
              <h1 className="mt-2 px-1 text-center text-xl font-semibold text-orange-500 lg:text-5xl">
                {course.name}
              </h1>
            </div>
            <h2 className="mt-2 text-sm font-light italic text-blue-800">
              <span className="font-semibold">{t('courses.details.goal')}</span>
              <span>{course.goal}</span>
            </h2>
            <div className="flex flex-col space-y-2 p-3 sm:px-0">
              <div className="flex flex-wrap gap-2">
                <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
                  <img src={rabitPen} alt="" className="mr-2 size-4" />
                  <span className="text-sm text-blue-800">
                    {professorNames}
                  </span>
                </div>
                <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
                  <img src={graduateImg} alt="" className="mr-2 size-4" />
                  <span className="text-sm capitalize text-blue-800">
                    {course.level}
                  </span>
                </div>
                <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
                  <Book />
                  <span className="text-sm text-blue-800">
                    {t('courses.details.mobile.chapters', {
                      chapters: course.chaptersCount,
                    })}
                  </span>
                </div>
                <div className="m-1 flex shrink-0 items-center rounded bg-gray-200 px-2 py-1 shadow-md">
                  <img
                    src={watch}
                    alt="Icono de estudio"
                    className="mr-2 size-4"
                  />
                  <span className="text-sm text-blue-800">
                    {t('courses.details.mobile.hours', {
                      hours: course.hours,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CourseInfo = ({ course }: { course: JoinedCourseWithAll }) => {
    return (
      <div className="grid max-w-5xl grid-rows-1 place-items-stretch justify-items-stretch gap-y-8 sm:my-2 sm:grid-cols-2">
        <div className="w-full px-2 sm:pl-2 sm:pr-10">
          <img
            src={computeAssetCdnUrl(
              course.lastCommit,
              `courses/${course.id}/assets/thumbnail.png`,
            )}
            alt=""
          />
        </div>
        <div className="hidden w-full flex-col space-y-5 p-3 sm:block sm:px-0 lg:block xl:block 2xl:block ">
          <div className="flex flex-row items-start space-x-5 ">
            <FaChalkboardTeacher size="35" className="text-orange-600" />
            <span className="w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
              {course.professors?.length > 1
                ? t('courses.details.teachers', {
                    teachers: professorNames,
                  })
                : t('courses.details.teacher', {
                    teacher: professorNames,
                  })}
            </span>
          </div>
          <div className="flex flex-row items-start space-x-5">
            <HiOutlineAcademicCap size="35" className="text-orange-600" />
            <span className="w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
              {t(`courses.details.level`, { level: course.level })}
            </span>
          </div>
          <div className="flex flex-row items-start space-x-5">
            <HiOutlineBookOpen size="35" className="text-orange-600" />
            <span className="w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
              {t('courses.details.numberOfChapters', {
                number: course.chaptersCount,
              })}
            </span>
          </div>
          <div className="flex flex-row items-start space-x-5">
            <IoMdStopwatch size="35" className="text-orange-600" />
            <span className="w-full rounded bg-gray-200 px-3 py-1 text-blue-900">
              {t('courses.details.duration', { hours: course.hours })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const StartTheCourseHR = () => {
    return (
      <div className="relative my-4 w-full max-w-5xl flex-col space-y-2 px-2 sm:my-8 sm:flex-row sm:items-center sm:space-x-10">
        {isScreenMd ? (
          <div>
            <hr className="border-2 border-gray-300" />
            <div className="absolute right-[15%] top-[50%] -translate-y-1/2">
              <div className="relative">
                <Link
                  disabled={isLinkDisabled}
                  to={'/courses/$courseId/$partIndex/$chapterIndex'}
                  params={{
                    courseId,
                    partIndex: '1',
                    chapterIndex: '1',
                  }}
                >
                  <Button rounded {...buttonProps} disabled={isButtonDisabled}>
                    <span className="sm:px-6">
                      {t(
                        displayBuyCourse
                          ? 'courses.details.buyCourse'
                          : 'courses.details.startCourse',
                      )}
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center">
              <div className="h-0 grow border-t-2 border-orange-600"></div>
              <div className=" p-2">
                <div className=" mx-1 flex items-center justify-center">
                  <Link
                    to={'/courses/$courseId/$partIndex/$chapterIndex'}
                    disabled={isLinkDisabled}
                    params={{
                      courseId,
                      partIndex: '1',
                      chapterIndex: '1',
                    }}
                  >
                    <div className="flex">
                      <Button
                        rounded
                        {...buttonProps}
                        disabled={isButtonDisabled}
                      >
                        <span className="relative z-10 text-sm font-medium sm:px-6">
                          {t(
                            displayBuyCourse
                              ? 'courses.details.buyCourse'
                              : 'courses.details.startCourse',
                          )}
                        </span>
                        <img
                          src={rocketSVG}
                          alt=""
                          className="m-0 ml-1 size-5"
                        />
                      </Button>
                    </div>
                  </Link>
                </div>
              </div>
              <div className="h-0 grow border-t-2 border-orange-600"></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const DescriptionAndObjectives = ({
    course,
  }: {
    course: JoinedCourseWithAll;
  }) => {
    return (
      <div className="max-w-5xl grid-rows-2 place-items-stretch justify-items-stretch px-2 sm:my-4 sm:grid sm:grid-cols-2 sm:grid-rows-1 sm:gap-x-20">
        <div className="mb-5 flex w-full flex-col sm:mb-0">
          <div className="flex flex-row gap-1 sm:hidden">
            <img src={crayonSVG} alt="" className="m-0 block size-5" />
            <h4 className="text-blue-1000 mb-1 font-bold uppercase italic sm:hidden">
              {t('courses.details.description')}
            </h4>
          </div>
          <h4 className="mb-1 hidden text-sm font-normal uppercase italic sm:block">
            {t('courses.details.description')}
          </h4>
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h3 className="mb-2 text-[14px] font-medium text-blue-800 sm:mb-5 sm:text-2xl sm:font-normal sm:text-blue-900">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <div className="mb-3 text-justify text-xs text-blue-800 sm:text-sm ">
                  {children}
                </div>
              ),
            }}
          >
            {course.rawDescription}
          </ReactMarkdown>
        </div>
        <div className="flex w-full flex-col">
          <div className="mb-3 flex flex-row gap-1 sm:hidden">
            <img src={staricon} alt="" className=" block size-5" />
            <h4 className="text-blue-1000 mb-1 font-bold uppercase italic sm:hidden">
              {t('courses.details.objectives')}
            </h4>
          </div>
          <h4 className="mb-1 hidden text-sm font-light uppercase italic sm:block">
            {t('courses.details.objectives')}
          </h4>
          <h3 className="mb-5 hidden text-2xl font-normal text-blue-900 sm:block">
            {t('courses.details.objectivesTitle')}
          </h3>
          <ul className="space-y-2 text-xs font-light capitalize text-blue-800 sm:text-base sm:uppercase">
            {(course.objectives as unknown as string[])?.map((goal, index) => (
              <li
                className="flex flex-row items-center sm:items-start sm:space-x-3"
                key={index}
              >
                <div>
                  <BsCheckCircle className="mt-1 hidden size-4 sm:block" />
                </div>
                <img
                  src={checkBoxSVG}
                  alt=""
                  className="mt-1 block size-4 sm:hidden"
                />
                <span className="ml-2 p-1 font-medium sm:ml-0 sm:font-normal">
                  {goal}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const Curriculum = ({ course }: { course: JoinedCourseWithAll }) => {
    return (
      <div className="mb-4 mt-6 max-w-5xl px-2 sm:mt-4">
        <div className="flex h-fit flex-col">
          <div className="mb-3 flex flex-row gap-1 sm:hidden">
            <img src={yellowBook} alt="" className="size-5" />
            <h4 className="text-blue-1000 mb-1  font-semibold uppercase italic sm:hidden">
              {t('courses.details.curriculum')}
            </h4>
          </div>
          <h4 className="mb-5 hidden text-2xl font-light uppercase italic text-gray-400 sm:block">
            {t('courses.details.curriculum')}
          </h4>
          <ul
            className={
              (cn('space-y-5 text-xs capitalize sm:text-base sm:uppercase'),
              course.id === 'giaco' ? 'pointer-events-none' : '')
            }
          >
            {course.parts?.map((part, partIndex) => (
              <li key={partIndex}>
                <div className="mb-1 flex flex-row">
                  <RxTriangleDown
                    className="mr-2 mt-1 text-orange-500"
                    size={20}
                  />
                  <Link
                    to={'/courses/$courseId/$partIndex/$chapterIndex'}
                    params={{
                      courseId,
                      partIndex: (partIndex + 1).toString(),
                      chapterIndex: '1',
                    }}
                  >
                    <p
                      className={cn(
                        'ml-1 text-base font-normal capitalize  sm:text-lg sm:uppercase text-orange-500',
                      )}
                    >
                      {part.title}
                    </p>
                  </Link>
                </div>
                {part.chapters?.map(
                  (chapter, index) =>
                    chapter !== undefined && (
                      <div
                        className="mb-0.5 ml-10 flex flex-row items-center"
                        key={index}
                      >
                        <BsCircleFill className="mr-2 text-blue-500" size={7} />
                        <Link
                          to={'/courses/$courseId/$partIndex/$chapterIndex'}
                          params={{
                            courseId,
                            partIndex: (partIndex + 1).toString(),
                            chapterIndex: chapter.chapter.toString(),
                          }}
                        >
                          <p
                            className={cn(
                              'capitalize',
                              displayBuyCourse
                                ? 'text-gray-400'
                                : 'text-blue-700',
                            )}
                          >
                            {chapter.title}
                            {course.id === 'giaco' &&
                            chapter.sections.length === 0 ? (
                              <span className="italic ml-1">
                                (Not yet available)
                              </span>
                            ) : (
                              ''
                            )}
                          </p>
                        </Link>
                      </div>
                    ),
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const Professors = ({ course }: { course: JoinedCourseWithAll }) => {
    return (
      <div className="my-4 max-w-5xl px-2">
        <div className="flex h-fit flex-col">
          <div className="mb-3 flex flex-row gap-1 sm:hidden">
            <img src={wizard} alt="" className="size-5" />
            <h4 className="text-blue-1000 mb-1 font-semibold uppercase italic sm:hidden">
              {t('courses.details.professor')}
            </h4>
          </div>
          <h4 className="hidden self-center text-2xl font-light uppercase italic text-gray-400 sm:block">
            {t('courses.details.taughtBy')}
          </h4>
          <div className="flex flex-col gap-4">
            {course.professors.map((professor) => (
              <Link
                to={'/professor/$professorId'}
                params={{
                  professorId: professor.id.toString(),
                }}
                key={professor.id}
              >
                <AuthorCard
                  key={professor.id}
                  className="sm:mt-4"
                  professor={professor}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Footer = ({ course }: { course: JoinedCourseWithAll }) => {
    return (
      <div className="my-4 max-w-5xl self-center px-2">
        <div className="flex h-fit flex-col">
          <Link
            className="bottom-2"
            to={'/courses/$courseId/$partIndex/$chapterIndex'}
            disabled={isLinkDisabled}
            params={{
              courseId,
              partIndex: '1',
              chapterIndex: '1',
            }}
          >
            <Button
              size={isScreenMd ? 'l' : 's'}
              disabled={isButtonDisabled}
              {...buttonProps}
              {...(course.requiresPayment
                ? {}
                : {
                    iconRight: <BsRocketTakeoff />,
                  })}
              className="text-blue-1000 mb-auto"
            >
              {t(
                displayBuyCourse
                  ? 'courses.details.buyCourse'
                  : 'courses.details.startCourse',
              )}
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <CourseLayout>
      <div className="text-blue-800">
        {course && (
          <div className="flex size-full flex-col items-start justify-center px-2 py-6 sm:items-center sm:py-10">
            {course?.id !== 'giaco' && <CourseButton courseId={courseId} />}
            <Header course={course} />
            <hr className="mb-8 mt-12 hidden w-full max-w-5xl border-2 border-gray-300 sm:inline" />
            <CourseInfo course={course} />
            <StartTheCourseHR />
            <DescriptionAndObjectives course={course} />
            <hr className="my-4 hidden w-full max-w-5xl border-2 border-gray-300 sm:my-8 sm:block " />
            <Curriculum course={course} />
            <hr className="mb-8 mt-12 hidden w-full max-w-5xl border-2 border-gray-300 sm:inline" />
            <Professors course={course} />
            <hr className="mb-8 mt-12 hidden w-full max-w-5xl border-2 border-gray-300 sm:inline" />
            <Footer course={course} />
            <CoursePaymentModal
              course={course}
              satsPrice={paidSatsPrice}
              withPhysical={paidWithPhysical}
              chapter={paidChapter}
              part={paidPart}
              isOpen={isPaymentModalOpen}
              onClose={(isPaid) => {
                console.log(isPaid);
                // if (isPaid) {
                //   refetchPayment();
                // }
                // setIsPaymentModalOpen(false);
                window.location.reload();
              }}
            />
            <CourseDescriptionModal
              course={course}
              satsPrice={satsPrice}
              isOpen={isDescriptionModalOpen}
              conversionRate={conversionRate as number}
              onClose={() => {
                setIsDescriptionModalOpen(false);
              }}
              onPay={(
                sats,
                withPhysical: boolean,
                part?: number,
                chapter?: number,
              ) => {
                debugger;
                setPaidSatsPrice(sats);
                setPaidWithPhysical(withPhysical);
                setPaidPart(part);
                setPaidChapter(chapter);
                setIsDescriptionModalOpen(false);
                setIsPaymentModalOpen(true);
              }}
            />
          </div>
        )}
      </div>

      {isAuthModalOpen ? (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialState={authMode}
        />
      ) : (
        <div></div>
      )}
    </CourseLayout>
  );
};
