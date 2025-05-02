import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { last } from 'lodash-es';
import React, {
  memo,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from 'react';
import { useTranslation } from 'react-i18next';
import { FaLock } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { IoCheckmark } from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';
import { z } from 'zod';

import type { CourseResponse, CourseReviewsExtended } from '@blms/types';
import { Button, Divider, Loader, TextTag, customToast } from '@blms/ui';

import SignInIconLight from '#src/assets/icons/profile_log_in_light.svg';
import { AuthModal } from '#src/components/AuthModals/auth-modal.js';
import { AuthModalState } from '#src/components/AuthModals/props.js';
import { PublicComment } from '#src/components/Comments/public-comment.tsx';
import PageMeta from '#src/components/Head/PageMeta/index.js';
import { ListItem } from '#src/components/ListItem/list-item.tsx';
import PresentationMarkdownBody from '#src/components/Markdown/presentation-markdown-body.tsx';
import { StarRating } from '#src/components/Stars/star-rating.tsx';
import { AuthorCard } from '#src/components/author-card.tsx';
import { Image } from '#src/components/image.tsx';
import { ProfessorCardReduced } from '#src/components/professor-card.tsx';
import { useDisclosure } from '#src/hooks/use-disclosure.js';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { CourseCurriculum } from '#src/organisms/course-curriculum.tsx';
import { useAuthModal } from '#src/providers/auth.tsx';
import { AppContext } from '#src/providers/context.js';
import { ConversionRateContext } from '#src/providers/conversionRateContext.tsx';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { formatDate, getDateString } from '#src/utils/date.ts';
import { LANGUAGES_MAP } from '#src/utils/i18n.ts';
import { assetUrl, cdnUrl } from '#src/utils/index.js';
import { SITE_NAME } from '#src/utils/meta.js';
import { base64ToBlob } from '#src/utils/misc.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';
import { CourseLayout } from './-components/course-layout.tsx';
import { CoursePaymentModal } from './-components/payment-modal/course-payment-modal.tsx';

export const Route = createFileRoute(
  '/$lang/_content/courses/$courseName-$courseId',
)({
  params: {
    parse: (params) => {
      const paramNameId = params['courseName-$courseId'];
      const { id, name } = getNameAndIdFromUrl(paramNameId);

      return {
        lang: z.string().parse(params.lang),
        'courseName-$courseId': `${name}-${id}`,
        courseName: z.string().parse(name),
        courseId: z.string().parse(id),
      };
    },
    stringify: ({ lang, courseName, courseId }) => ({
      lang: lang,
      'courseName-$courseId': `${courseName}-${courseId}`,
    }),
  },
  component: CourseDetails,
});

function CourseDetails() {
  const {
    session,
    refetchUserDetails,
    hasSeenRegisterToast,
    setHasSeenRegisterToast,
  } = useContext(AppContext);
  const isLoggedIn = !!session;

  // TODO Refactor this auth stuff
  const [authMode, setAuthMode] = useState<AuthModalState>(
    AuthModalState.SignIn,
  );

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  const { openAuthModal: openAuthModalContext } = useAuthModal();

  const params = Route.useParams();
  const courseId = params.courseId;

  const { t, i18n } = useTranslation();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [coursePaymentFormat, setCoursePaymentFormat] = useState<
    'online' | 'inperson'
  >('online');
  const [satsPrice, setSatsPrice] = useState<number>(0);
  const [dollarPrice, setDollarPrice] = useState<number>(0);
  const [downloadedPdf, setDownloadedPdf] = useState('');

  const { user } = useContext(AppContext);

  const navigate = useNavigate();

  const { data: course, isFetched } = trpc.content.getCourse.useQuery(
    {
      id: courseId,
      language: i18n.language,
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const { data: userCourseProgress } = trpc.user.courses.getProgress.useQuery(
    {
      courseId,
    },
    { enabled: isLoggedIn },
  );

  const { data: payments, refetch: refetchPayment } =
    trpc.user.courses.getPayments.useQuery(undefined, { enabled: isLoggedIn });

  const isCoursePaid = useMemo(
    () =>
      payments?.some(
        (coursePayment) =>
          coursePayment.paymentStatus === 'paid' &&
          coursePayment.courseId === courseId,
      ),
    [courseId, payments],
  );

  const isCoursePaidForInPerson = useMemo(
    () =>
      payments?.some(
        (coursePayment) =>
          coursePayment.paymentStatus === 'paid' &&
          coursePayment.courseId === courseId &&
          coursePayment.format === 'inperson',
      ),
    [courseId, payments],
  );

  const { mutateAsync: startCourse } =
    trpc.user.courses.startCourse.useMutation();

  const {
    mutateAsync: downloadTicketMutateAsync,
    isPending: downloadTicketIsPending,
  } = trpc.user.courses.downloadChapterTicket.useMutation();

  const { data: reviews } = trpc.content.getPublicCourseReviews.useQuery(
    {
      courseId: courseId,
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  let professorNames = course?.mainProfessors
    .map((professor) => professor.name)
    .join(', ');
  if (!professorNames) {
    professorNames = '';
  }

  const courseHasToBePurchased = course?.requiresPayment && !isCoursePaid;
  const displayDownloadTicket =
    isCoursePaidForInPerson &&
    course?.availableSeats &&
    course.availableSeats > 0;

  const now = new Date(Date.now());

  const isStartOrBuyButtonDisabled = !!(
    courseHasToBePurchased &&
    course.paymentExpirationDate &&
    course.paymentExpirationDate < now
  );

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (course && params.courseName !== formatNameForURL(course.name)) {
      navigate({
        to: `/courses/${formatNameForURL(course.name)}-${course.id}`,
        replace: true,
      });
    }
  }, [course, isFetched, navigate, params.bookName]);

  const Header = ({ course }: { course: CourseResponse }) => {
    const beginnerFriendlyCourses = ['btc101', 'btc102', 'scu101'];

    return (
      <section className="flex flex-col self-start w-full">
        <div className="md:flex md:flex-row md:justify-between items-center">
          <h1 className="text-newBlack-1 max-md:text-center title-large-sb-24px md:display-large-med-48px">
            {course.name}
          </h1>
          {course.hasLogo ? (
            <Image
              src={assetUrl(
                `courses/${course.index}`,
                'logo.webp',
                course.lastCommit,
              )}
              hideWhenError={true}
              alt={course.name}
              className="max-md:hidden mr-9"
              breakpoints={{ default: 210 }}
            />
          ) : null}
        </div>
        <div className="mt-6 md:mt-4 flex flex-wrap gap-2 items-center">
          <TextTag
            size={isMobile ? 'verySmall' : 'small'}
            variant="orange"
            className="uppercase"
          >
            {course.requiresPayment
              ? t('courses.details.paidCourse')
              : t('words.free')}
          </TextTag>
          <TextTag
            size={isMobile ? 'verySmall' : 'small'}
            className="uppercase"
          >
            {t(`courses.format.${course.format}`)}
          </TextTag>
          {beginnerFriendlyCourses.includes(course.index) && (
            <TextTag
              size={isMobile ? 'verySmall' : 'small'}
              variant="green"
              className="uppercase"
            >
              {t('words.level.beginnerFriendly')}
            </TextTag>
          )}
        </div>
        <div className="mt-4 md:mt-7 max-md:flex max-md:flex-col gap-1 label-medium-16px md:label-large-20px text-newBlack-1 border-l border-newBlack-5 pl-2.5">
          <span className="!font-medium">{t('courses.explorer.goal')} </span>
          <span>{course.goal}</span>
        </div>
      </section>
    );
  };

  const CourseInfo = ({ course }: { course: CourseResponse }) => {
    return (
      <section className="flex max-lg:flex-col lg:py-2.5 mt-6 lg:mt-7 w-full gap-5 lg:gap-10">
        <Image
          src={assetUrl(
            `courses/${course.index}`,
            'thumbnail.webp',
            course.lastCommit,
          )}
          alt={course.name}
          className="rounded-[20px] w-full lg:max-w-[550px] shrink-1"
          breakpoints={{ default: 320, lg: 576 }}
        />

        <div className="w-full">
          <article className="flex flex-col lg:pt-3 w-full lg:max-w-[564px] [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-newGray-4">
            <ListItem
              leftText={t('words.professor')}
              rightText={course.mainProfessors.map((professor, index) => (
                <React.Fragment key={professor.id}>
                  <Link
                    to={`/professor/${formatNameForURL(professor.name || '')}-${
                      professor.id
                    }`}
                    className="hover:text-darkOrange-5"
                  >
                    {professor.name}
                  </Link>
                  {index < course.mainProfessors.length - 1 && ', '}
                </React.Fragment>
              ))}
              variant="light"
              hasIncreasedPadding
            />
            <ListItem
              leftText={t('words.level.level')}
              rightText={t(`words.level.${course.level}`)}
              variant="light"
              hasIncreasedPadding
            />
            <ListItem
              leftText={t('words.duration')}
              rightText={
                <div className="flex flex-col md:flex-row">
                  <span>{`${course.hours} ${t('words.hours')}`}</span>
                  {course.startDate && course.endDate ? (
                    <>
                      <span className="font-light mx-2 max-md:hidden"> | </span>
                      {getDateString(course.startDate, course.endDate)}
                    </>
                  ) : (
                    ''
                  )}
                </div>
              }
              variant="light"
              hasIncreasedPadding
            />
            {course.format === 'hybrid' && (
              <ListItem
                leftText={t('words.price')}
                rightText={
                  course.onlinePriceDollars && course.inpersonPriceDollars ? (
                    <p>
                      <p>
                        ${course.inpersonPriceDollars}{' '}
                        <span className="font-normal lowercase">
                          ({t('words.inperson')})
                        </span>
                      </p>
                      <p>
                        ${course.onlinePriceDollars}{' '}
                        <span className="font-normal lowercase">
                          ({t('words.online')})
                        </span>
                      </p>
                    </p>
                  ) : (
                    <>
                      {course.onlinePriceDollars || course.inpersonPriceDollars
                        ? course.inpersonPriceDollars
                          ? `${course.inpersonPriceDollars}$`
                          : `${course.onlinePriceDollars}$`
                        : t('words.free')}
                    </>
                  )
                }
                variant="light"
                hasIncreasedPadding
              />
            )}
            {course.format === 'online' && (
              <ListItem
                leftText={t('words.price')}
                rightText={
                  course.onlinePriceDollars
                    ? `${course.onlinePriceDollars}$`
                    : t('words.free')
                }
                variant="light"
                hasIncreasedPadding
              />
            )}
            {course.format === 'inperson' && (
              <ListItem
                leftText={t('words.price')}
                rightText={
                  course.inpersonPriceDollars
                    ? `${course.inpersonPriceDollars}$`
                    : t('words.free')
                }
                variant="light"
                hasIncreasedPadding
              />
            )}
            <ListItem
              leftText={t('words.courseId')}
              rightText={course.index.toUpperCase()}
              variant="light"
              hasIncreasedPadding
            />
            <ListItem
              leftText={
                course.isPlanbSchool
                  ? t('courses.details.pastEditionsRatings')
                  : t('words.ratings')
              }
              rightText={
                <div className="flex gap-2.5 items-center">
                  <StarRating
                    rating={
                      reviews?.general && reviews.general.length > 0
                        ? Number(
                            (
                              reviews?.general.reduce(
                                (acc, rating) => acc + rating,
                                0,
                              ) / reviews.general.length
                            ).toFixed(1),
                          )
                        : 0
                    }
                    starSize={isMobile ? 35 : 30}
                  />
                  {reviews?.general && reviews.general.length > 0 && (
                    <span>({reviews.general.length})</span>
                  )}
                </div>
              }
              variant="light"
              wrapOnMobile
              hasIncreasedPadding
            />
            <div className="lg:flex lg:w-full justify-end max-lg:my-2 lg:mt-5">
              <BuyCourseButtons />
            </div>
          </article>

          {displayDownloadTicket && (
            <div className="ml-2 max-lg:mb-4 max-lg:italic lg:mt-2 flex flex-col gap-4 w-fit">
              <p className="text-lg font-normal max-md:text-base">
                {t('courses.details.inPersonAccess')}
              </p>
            </div>
          )}
        </div>
      </section>
    );
  };

  const Professors = ({ course }: { course: CourseResponse }) => {
    return (
      <section className="max-lg:mx-auto w-full flex flex-col">
        <span className="subtitle-small-caps-14px md:subtitle-medium-caps-reg-18px text-darkOrange-5">
          {t('words.professor')}
        </span>
        <h4 className="mt-4 md:mt-6 label-large-20px md:display-small-32px text-black">
          <span>
            {course.associatedProfessors.length > 0
              ? t('courses.details.coordinatedBy')
              : t('courses.details.taughtBy')}{' '}
          </span>

          <span className="text-darkOrange-5 label-large-20px md:display-small-32px hover:!font-medium">
            {course.mainProfessors.map((professor, index) => (
              <React.Fragment key={professor.id}>
                <Link
                  to={`/professor/${formatNameForURL(professor.name || '')}-${
                    professor.id
                  }`}
                  className="hover:text-darkOrange-5"
                >
                  {professor.name}
                </Link>
                {index < course.mainProfessors.length - 1 && ', '}
              </React.Fragment>
            ))}
          </span>
        </h4>
        <div className="flex h-fit flex-col max-md:gap-4 mt-4">
          {course.mainProfessors.map((professor) => (
            <AuthorCard
              key={professor.id}
              mobileSize="medium"
              professor={professor}
            />
          ))}
        </div>
        {course.associatedProfessors.length > 0 ? (
          <>
            <h4 className="mt-4 md:mt-6 label-large-20px md:display-small-32px text-black">
              <span>{t('courses.details.associatedProfessors')}</span>
            </h4>
            <div className="mt-6 flex flex-row flex-wrap gap-3 md:gap-6 max-md:justify-center">
              {course.associatedProfessors.map((professor) => (
                <ProfessorCardReduced
                  key={professor.id}
                  professor={professor}
                />
              ))}
            </div>
          </>
        ) : null}
      </section>
    );
  };

  const RatingsAndReviews = ({
    reviews,
  }: {
    reviews: CourseReviewsExtended;
  }) => {
    const numberOfReviews = reviews.general.length;
    const averageRating = Number(
      (
        reviews.general.reduce((acc, rating) => acc + rating, 0) /
        numberOfReviews
      ).toFixed(1),
    );
    const maxRating = 5;

    const feedbacksWithComments = reviews.feedbacks.filter(
      (feedback) => feedback.publicComment,
    );

    const totalComments = feedbacksWithComments.length;

    const [visibleFeedbacks, setVisibleFeedbacks] = useState(12);

    const showMoreFeedbacks = () => {
      setVisibleFeedbacks((prev) => prev + 12);
    };

    return (
      <section className="flex w-full flex-col gap-4 md:gap-9">
        <h4 className="subtitle-small-caps-14px md:subtitle-medium-caps-reg-18px text-darkOrange-5">
          {t('courses.review.ratingsAndReviews')}
        </h4>
        <h3 className="label-large-20px md:display-small-32px text-newBlack-1">
          {course?.isPlanbSchool
            ? t('courses.review.whatStudentsSayPasEdition')
            : t('courses.review.whatStudentsSay')}
        </h3>
        <div className="flex flex-col w-full md:items-center">
          <h3 className="lg:text-center subtitle-large-med-20px text-dashboardSectionTitle">
            {t('courses.review.generalGrade')}
          </h3>
          <StarRating
            rating={averageRating}
            totalStars={maxRating}
            starSize={isMobile ? 41 : 45}
            className="mt-2.5 md:mt-5"
          />
          <span className="lowercase body-16px text-dashboardSectionTitle mt-2.5 md:mt-5">{`${averageRating}/${maxRating} (${numberOfReviews} ${
            numberOfReviews > 1
              ? t('dashboard.teacher.reviews.reviews')
              : t('dashboard.teacher.reviews.review')
          })`}</span>
        </div>
        <Divider
          width="w-4/5 max-w-[850px]"
          className="max-md:hidden mx-auto"
          mode="light"
        />
        <section className="w-full max-w-[1016px] mx-auto flex flex-wrap gap-6 justify-center mt-2">
          {[...feedbacksWithComments]
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            .slice(0, visibleFeedbacks)
            .map((feedback, index) => (
              <PublicComment
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                author={feedback.user}
                date={feedback.date}
                avatar={feedback.userPicture || ''}
                comment={feedback.publicComment}
              />
            ))}
        </section>
        {visibleFeedbacks < totalComments && (
          <div className="flex flex-col gap-2 items-center">
            <Button
              variant="outline"
              mode="light"
              size="m"
              onClick={showMoreFeedbacks}
              className="mt-7 lg:mt-8"
            >
              {t('courses.review.loadMoreComments')}
            </Button>
            <span className="body-14px">
              {visibleFeedbacks} {t('courses.review.displayOutOf')}{' '}
              {totalComments}
            </span>
          </div>
        )}
      </section>
    );
  };

  const Footer = () => {
    return (
      <div className="mx-auto">
        <BuyCourseButtons />
      </div>
    );
  };

  const BuyCourseButtons = () => {
    return courseHasToBePurchased ? (
      <>
        {course.format === 'hybrid' &&
        course.inpersonPriceDollars &&
        course.onlinePriceDollars ? (
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-3 lg:self-end">
            <BuyCourseButton format="inperson">
              <>
                <FaLock className="mr-2" />
                {t('courses.details.buyInPersonCourse')}
              </>
            </BuyCourseButton>
            <BuyCourseButton variant="outline" format="online">
              <>
                <FaLock className="mr-2" />
                {t('courses.details.buyOnlineCourse')}
              </>
            </BuyCourseButton>
          </div>
        ) : (
          <BuyCourseButton
            format={course.format === 'hybrid' ? 'inperson' : course.format}
          >
            <>
              <FaLock className="mr-2" />
              {t('courses.details.buyCourse')}
            </>
          </BuyCourseButton>
        )}
      </>
    ) : (
      <div className="flex flex-col lg:flex-row">
        <BuyCourseButton hasArrow format={'online'}>
          <span>
            {userCourseProgress &&
            userCourseProgress.length > 0 &&
            userCourseProgress[0].completedChaptersCount > 0
              ? t('dashboard.myCourses.resumeLesson')
              : t('courses.details.startCourse')}
          </span>
        </BuyCourseButton>
        {displayDownloadTicket && <DownloadTicketButton course={course} />}
      </div>
    );
  };

  const DownloadTicketButton = ({
    course,
  }: {
    course: CourseResponse;
  }) => {
    return (
      <Button
        size="l"
        mode="dark"
        className="max-lg:my-6 max-lg:!m-2 lg:mt-5 w-full max-lg:max-w-[290px] md:w-fit self-center lg:self-end ml-2"
        variant="outline"
        onClick={async () => {
          let pdf = downloadedPdf;
          if (!pdf) {
            pdf = await downloadTicketMutateAsync({
              title: course.name,
              addressLine1: '', // TODO ADD
              addressLine2: '', // TODO ADD
              addressLine3: '', // TODO ADD
              formattedStartDate: `Start date: ${formatDate(course.startDate)}`,
              formattedTime: `End date: ${formatDate(course.endDate)}`,
              liveLanguage:
                LANGUAGES_MAP[
                  course.originalLanguage.toLowerCase().replaceAll('-', '')
                ],
              organizer: course.projectName ?? 'Plan ₿ Network',
              availableSeats: course.availableSeats,
              userName: user ? user.username : '',
            });
            setDownloadedPdf(pdf);
          }
          const fileName = 'ticket.pdf';
          const blob = base64ToBlob(pdf, 'application/pdf');
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', fileName);

          document.body.appendChild(link);

          link.click();

          link.parentNode?.removeChild(link);
          window.URL.revokeObjectURL(url);
        }}
      >
        {t('courses.chapter.detail.ticketDownload')}
        {downloadTicketIsPending ? (
          <span className="ml-3">
            <FiLoader />
          </span>
        ) : null}
      </Button>
    );
  };

  const BuyCourseButton = ({
    children,
    variant = 'primary',
    format,
    hasArrow,
  }: {
    children: JSX.Element;
    variant?: 'primary' | 'outline';
    format: 'online' | 'inperson';
    hasArrow?: boolean;
  }) => {
    const { conversionRate } = useContext(ConversionRateContext);

    const onClick =
      course?.requiresPayment && !isCoursePaid
        ? () => {
            if (isLoggedIn) {
              setCoursePaymentFormat(format);
              const dollarPrice =
                format === 'inperson'
                  ? (course.inpersonPriceDollars ?? 0)
                  : (course.onlinePriceDollars ?? 0);

              let satsPrice = -1;
              if (conversionRate) {
                satsPrice = Math.round(
                  (dollarPrice * 100_000_000) / conversionRate,
                );
                if (satsPrice > 10 && process.env.NODE_ENV === 'development') {
                  satsPrice = 10;
                }
              }

              setDollarPrice(dollarPrice);
              setSatsPrice(satsPrice);
              setIsPaymentModalOpen(true);
            } else {
              setAuthMode(AuthModalState.SignIn);
              openAuthModal();
            }
          }
        : async () => {
            if (!isLoggedIn && !hasSeenRegisterToast) {
              customToast(t('auth.trackProgress'), {
                color: 'primary',
                mode: 'light',
                imgSrc: SignInIconLight,
                onClick: () => {
                  openAuthModalContext(AuthModalState.SignIn);
                },
              });
              setHasSeenRegisterToast(true);
            }

            if (isLoggedIn) {
              await startCourse({ courseId });
              if (
                userCourseProgress &&
                userCourseProgress.length === 0 &&
                !course?.requiresPayment
              ) {
                customToast(t('courses.details.courseAddedToDashboard'), {
                  color: 'primary',
                  mode: 'light',
                  imgSrc: SignInIconLight,
                  closeButton: true,
                });
              }
            }

            navigate({
              to: '/courses/$courseId/$chapterId',
              params: {
                courseId,
                chapterId:
                  userCourseProgress &&
                  userCourseProgress.length > 0 &&
                  userCourseProgress[0].completedChaptersCount > 0
                    ? course?.parts.some((part) =>
                        part.chapters.some(
                          (chapter) =>
                            chapter?.chapterId ===
                            userCourseProgress[0]?.nextChapter?.chapterId,
                        ),
                      )
                      ? userCourseProgress[0]?.nextChapter?.chapterId
                      : last(course?.parts)?.chapters.at(-1)?.chapterId
                    : course?.parts[0]?.chapters[0]
                      ? course?.parts[0].chapters[0].chapterId
                      : '',
              },
            });
          };

    return hasArrow ? (
      <ButtonWithArrow
        size="l"
        mode="dark"
        variant={variant}
        disabled={isStartOrBuyButtonDisabled}
        className="max-lg:my-6 max-lg:!m-2 lg:mt-5 w-full md:w-fit self-center lg:self-end"
        onClick={onClick}
      >
        {children}
      </ButtonWithArrow>
    ) : (
      <Button
        size="l"
        mode="dark"
        variant={variant}
        disabled={isStartOrBuyButtonDisabled}
        className="max-lg:my-6 max-lg:!m-2 lg:mt-5 w-full md:w-fit self-center lg:self-end"
        onClick={onClick}
      >
        {children}
      </Button>
    );
  };

  return (
    <CourseLayout>
      <PageMeta
        title={`${SITE_NAME} - ${course?.name}`}
        description={course?.goal}
        imageSrc={
          course
            ? assetUrl(
                `courses/${course.index}`,
                'thumbnail.webp',
                course.lastCommit,
              )
            : ''
        }
      />
      <div className="text-newBlack-1">
        {!isFetched && <Loader size={'s'} />}
        {isFetched && !course && (
          <div className="flex size-full max-w-[1222px] flex-col items-start justify-center px-4 pt-3 sm:items-center md:pt-10">
            {t('underConstruction.itemNotFoundOrTranslated', {
              item: t('words.course'),
            })}
          </div>
        )}
        {course && (
          <div className="flex size-full max-w-[1222px] flex-col items-start justify-center px-4 pt-3 sm:items-center md:pt-10 mx-auto">
            <Header course={course} />
            <CourseInfo course={course} />
            <Divider className="mt-6 mb-9 max-lg:hidden" width="w-full" />
            <DescriptionAndObjectives course={course} isMobile={isMobile} />
            <Divider className="my-6 lg:my-9" width="w-full" />
            <CourseCurriculum
              course={course}
              courseHasToBePurchased={courseHasToBePurchased}
              hideGithubLink
              className="self-start"
            >
              <h4 className="subtitle-small-caps-14px md:subtitle-medium-caps-reg-18px text-darkOrange-5 mb-4 lg:mb-9">
                {t('courses.details.curriculum')}
              </h4>
            </CourseCurriculum>
            <Divider className="my-6 lg:my-9" width="w-full" />
            <Professors course={course} />
            <Divider className="my-6 lg:my-9" width="w-full" />
            {reviews && <RatingsAndReviews reviews={reviews} />}
            <Footer />
            <CoursePaymentModal
              course={course}
              coursePaymentFormat={coursePaymentFormat}
              satsPrice={satsPrice}
              dollarPrice={dollarPrice}
              isOpen={isPaymentModalOpen}
              professorNames={professorNames}
              onClose={() => {
                setIsPaymentModalOpen(false);
                refetchPayment();
                refetchUserDetails();
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
        <div />
      )}
    </CourseLayout>
  );
}

const DescriptionAndObjectives = memo(
  ({
    course,
    isMobile,
  }: {
    course: CourseResponse;
    isMobile?: boolean;
  }) => {
    const { t } = useTranslation();

    return (
      <>
        <section className="flex flex-col w-full md:grid md:grid-cols-2 gap-6 md:gap-12">
          <div className="flex flex-col gap-4 md:gap-6">
            <h4 className="subtitle-small-caps-14px max-md:mt-2 md:subtitle-medium-caps-reg-18px text-darkOrange-5">
              {t('courses.details.description')}
            </h4>
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h3 className="label-large-20px md:display-small-32px text-newBlack-1">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="body-14px md:subtitle-large-18px text-newBlack-1 text-justify">
                    {children}
                  </p>
                ),
              }}
            >
              {course.rawDescription}
            </ReactMarkdown>
          </div>

          <Divider width="w-full" className="md:hidden" />
          <div className="flex w-full flex-col gap-4 md:gap-6">
            <h4 className="subtitle-small-caps-14px md:subtitle-medium-caps-reg-18px text-darkOrange-5">
              {t('courses.details.learning')}
            </h4>
            <h3 className="label-large-20px md:display-small-32px text-newBlack-1">
              {t('courses.details.objectives')}
            </h3>
            <ul className="flex flex-col gap-4 md:gap-6">
              {course.objectives?.map((goal) => (
                <li className="flex gap-2.5 text-newBlack-1" key={goal}>
                  <IoCheckmark size={isMobile ? 18 : 24} className="shrink-0" />
                  <span className="body-16px md:label-large-20px">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {course.presentationMarkdown ? (
          <>
            <Divider width="w-full" className="mt-9 max-md:mb-6" />
            <section className="text-blue-1000 flex flex-col w-full gap-5 break-words md:px-2 md:mt-8 md:grow md:gap-[18px] md:overflow-hidden pb-2">
              <Suspense fallback={<Loader size={'s'} />}>
                <PresentationMarkdownBody
                  content={course.presentationMarkdown}
                  assetPrefix={cdnUrl(`courses/${course.index}`)}
                />
              </Suspense>
            </section>
          </>
        ) : null}
      </>
    );
  },
);
