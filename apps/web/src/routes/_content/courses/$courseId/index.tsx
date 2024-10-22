/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Link,
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaLock } from 'react-icons/fa';
import { FaArrowRightLong } from 'react-icons/fa6';
import { FiLoader } from 'react-icons/fi';
import { IoCheckmark } from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';

import type { CourseReviewsExtended, JoinedCourseWithAll } from '@blms/types';
import { Button, Divider, Loader, TextTag, cn } from '@blms/ui';

import { AuthModal } from '#src/components/AuthModals/auth-modal.js';
import { AuthModalState } from '#src/components/AuthModals/props.js';
import { AuthorCard } from '#src/components/author-card.tsx';
import { PublicComment } from '#src/components/Comments/public-comment.tsx';
import PageMeta from '#src/components/Head/PageMeta/index.js';
import { ListItem } from '#src/components/ListItem/list-item.tsx';
import { StarRating } from '#src/components/Stars/star-rating.tsx';
import { useDisclosure } from '#src/hooks/use-disclosure.js';
import { CourseCurriculum } from '#src/organisms/course-curriculum.tsx';
import { AppContext } from '#src/providers/context.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';
import { SITE_NAME } from '#src/utils/meta.js';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';

import { CourseLayout } from '../-components/course-layout.tsx';
import { CoursePaymentModal } from '../-components/payment-modal/course-payment-modal.tsx';

export const Route = createFileRoute('/_content/courses/$courseId/')({
  component: CourseDetails,
});

function CourseDetails() {
  const { session } = useContext(AppContext);
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

  const { courseId } = useParams({
    from: '/courses/$courseId',
  });
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

  const { data: payments, refetch: refetchPayment } =
    trpc.user.courses.getPayment.useQuery(undefined, { enabled: isLoggedIn });

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

  const {
    mutateAsync: downloadTicketMutateAsync,
    isPending: downloadTicketisPending,
  } = trpc.user.courses.downloadChapterTicket.useMutation();

  const { data: reviews } = trpc.content.getPublicCourseReviews.useQuery(
    {
      courseId: courseId,
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  let professorNames = course?.professors
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

  const isStartOrBuyButtonDisabled = false;

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
          const newConversionRate = data.USD;
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

  const Header = ({ course }: { course: JoinedCourseWithAll }) => {
    const beginnerFriendlyCourses = ['btc101', 'btc102', 'scu101'];

    return (
      <section className="flex flex-col self-start w-full">
        <h1 className="text-newBlack-1 max-md:text-center title-large-sb-24px md:display-large-med-48px">
          {course.name}
        </h1>
        <div className="mt-6 md:mt-4 flex flex-wrap gap-2 items-center">
          <TextTag
            size={isMobile ? 'verySmall' : 'large'}
            variant="orange"
            className="uppercase"
          >
            {course.requiresPayment ? t('words.paid') : t('words.free')}
          </TextTag>
          <TextTag
            size={isMobile ? 'verySmall' : 'large'}
            className="uppercase"
          >
            {course.parts.some((part) =>
              part.chapters.some((chapter) => chapter?.isInPerson),
            )
              ? t('words.inPerson')
              : t('words.online')}
          </TextTag>
          {beginnerFriendlyCourses.includes(course.id) && (
            <TextTag
              size={isMobile ? 'verySmall' : 'large'}
              variant="green"
              className="uppercase"
            >
              {t('words.level.beginnerFriendly')}
            </TextTag>
          )}
        </div>
        <div className="mt-4 md:mt-7 max-md:flex max-md:flex-col gap-1 label-medium-16px md:label-large-20px text-newBlack-1 border-l border-newBlack-5 pl-2.5">
          <span className="!font-medium">{t('words.goal')} : </span>
          <span>{course.goal}</span>
        </div>
      </section>
    );
  };

  const CourseInfo = ({ course }: { course: JoinedCourseWithAll }) => {
    return (
      <section className="flex max-lg:flex-col lg:py-2.5 mt-6 lg:mt-7 w-full gap-5 lg:gap-10">
        <img
          src={computeAssetCdnUrl(
            course.lastCommit,
            `courses/${course.id}/assets/thumbnail.webp`,
          )}
          alt={course.name}
          className="rounded-[20px] w-full lg:max-w-[550px] shrink-1"
        />
        <article className="flex flex-col lg:pt-3 w-full lg:max-w-[564px]">
          <ListItem
            leftText={t('words.professor')}
            rightText={course.professors.map((professor, index) => (
              <React.Fragment key={professor.id}>
                <Link
                  to={`/professor/${formatNameForURL(professor.name || '')}-${professor.id}`}
                  className="hover:text-darkOrange-5"
                >
                  {professor.name}
                </Link>
                {index < course.professors.length - 1 && ', '}
              </React.Fragment>
            ))}
            variant="light"
          />
          <ListItem
            leftText={t('words.level.level')}
            rightText={t(`words.level.${course.level}`)}
            variant="light"
          />
          <ListItem
            leftText={t('words.duration')}
            rightText={`${course.hours} ${t('words.hours')}`}
            variant="light"
          />
          {course.format === 'hybrid' && (
            <ListItem
              leftText={t('words.price')}
              rightText={
                course.onlinePriceDollars || course.inpersonPriceDollars ? (
                  <p>
                    <p>
                      ${course.inpersonPriceDollars}{' '}
                      <span className="font-normal lowercase">
                        ({t('words.inPerson')})
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
                  t('words.free')
                )
              }
              variant="light"
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
            />
          )}
          <ListItem
            leftText={t('words.courseId')}
            rightText={course.id.toUpperCase()}
            variant="light"
          />
          <ListItem
            leftText={t('words.ratings')}
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
          />
          <div className="max-lg:my-2">
            <BuyCourseButtons />
          </div>
          {displayDownloadTicket && (
            <div className="ml-2 max-lg:mb-4 max-lg:italic lg:mt-2 flex flex-col gap-4 w-fit">
              <p className="text-lg font-normal max-md:text-base">
                {t('courses.details.inPersonAccess')}
              </p>
            </div>
          )}
        </article>
      </section>
    );
  };

  const DescriptionAndObjectives = ({
    course,
  }: {
    course: JoinedCourseWithAll;
  }) => {
    return (
      <section className="flex flex-col w-full md:grid md:grid-cols-2 gap-6 md:gap-12">
        <div className="flex flex-col gap-4 md:gap-6">
          <h4 className="subtitle-small-caps-14px md:subtitle-medium-caps-18px text-darkOrange-5">
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
                <p className="body-14px md:subtitle-med-16px text-newBlack-1 text-justify">
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
          <h4 className="subtitle-small-caps-14px md:subtitle-medium-caps-18px text-darkOrange-5">
            {t('courses.details.objectives')}
          </h4>
          <h3 className="label-large-20px md:display-small-32px text-newBlack-1">
            {t('courses.details.objectivesTitle')}
          </h3>
          <ul className="flex flex-col gap-4 md:gap-6">
            {course.objectives?.map((goal, index) => (
              <li className="flex gap-2.5 text-newBlack-1" key={index}>
                <IoCheckmark size={isMobile ? 18 : 24} className="shrink-0" />
                <span className="body-16px md:label-large-20px">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  };

  const Professors = ({ course }: { course: JoinedCourseWithAll }) => {
    return (
      <section className="max-lg:mx-auto w-full flex flex-col">
        <span className="subtitle-small-caps-14px md:subtitle-medium-caps-18px text-darkOrange-5">
          {t('words.professor')}
        </span>
        <h4 className="mt-4 md:mt-6 label-large-20px md:display-small-32px text-black">
          {t('courses.details.taughtBy')}{' '}
          <span className="text-darkOrange-5 label-large-20px md:display-small-32px hover:!font-medium">
            {course.professors.map((professor, index) => (
              <React.Fragment key={professor.id}>
                <Link
                  to={`/professor/${formatNameForURL(professor.name || '')}-${professor.id}`}
                  className="hover:text-darkOrange-5"
                >
                  {professor.name}
                </Link>
                {index < course.professors.length - 1 && ', '}
              </React.Fragment>
            ))}
          </span>
        </h4>
        <div className="flex h-fit flex-col max-md:gap-4">
          {course.professors.map((professor) => (
            <AuthorCard
              key={professor.id}
              className="sm:mt-4"
              professor={professor}
            />
          ))}
        </div>
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

    const [visibleFeedbacks, setVisibleFeedbacks] = useState(12);

    const showMoreFeedbacks = () => {
      setVisibleFeedbacks((prev) => prev + 12);
    };

    return (
      <section className="flex w-full flex-col gap-4 md:gap-9">
        <h4 className="subtitle-small-caps-14px md:subtitle-medium-caps-18px text-darkOrange-5">
          {t('courses.review.ratingsAndReviews')}
        </h4>
        <h3 className="label-large-20px md:display-small-32px text-newBlack-1">
          {t('courses.review.whatStudentsSay')}
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
          <span className="lowercase body-16px text-dashboardSectionTitle mt-2.5 md:mt-5">{`${averageRating}/${maxRating} (${numberOfReviews} ${numberOfReviews > 1 ? t('dashboard.teacher.reviews.reviews') : t('dashboard.teacher.reviews.review')})`}</span>
        </div>
        <Divider
          width="w-4/5 max-w-[850px]"
          className="max-md:hidden mx-auto"
          mode="light"
        />
        <section className="w-full max-w-[1016px] mx-auto flex flex-wrap gap-6 justify-center mt-2">
          {[...reviews.feedbacks]
            .filter((feedback) => feedback.publicComment)
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            .slice(0, visibleFeedbacks)
            .map((feedback, index) => (
              <PublicComment
                key={index}
                author={feedback.user}
                date={feedback.date}
                avatar={feedback.userPicture || ''}
                comment={feedback.publicComment}
              />
            ))}
        </section>
        {visibleFeedbacks < reviews.feedbacks.length && (
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
              {reviews.feedbacks.length}
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
        {course.format === 'hybrid' ? (
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
          <BuyCourseButton format={course.format}>
            <>
              <FaLock className="mr-2" />
              {t('courses.details.buyCourse')}
            </>
          </BuyCourseButton>
        )}
      </>
    ) : (
      <div className="flex flex-col lg:flex-row">
        <BuyCourseButton format={'online'}>
          <>
            {t('courses.details.startCourse')}
            <FaArrowRightLong
              className={cn(
                'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                'group-hover:ml-3',
              )}
            />
          </>
        </BuyCourseButton>
        {displayDownloadTicket && <DownloadTicketButton course={course} />}
      </div>
    );
  };

  const DownloadTicketButton = ({
    course,
  }: {
    course: JoinedCourseWithAll;
  }) => {
    return (
      <Button
        size="l"
        mode="dark"
        className="max-lg:my-6 !m-2 lg:mt-5 w-full max-lg:max-w-[290px] md:w-fit self-center lg:self-end"
        variant="outline"
        onClick={async () => {
          let pdf = downloadedPdf;
          if (!pdf) {
            pdf = await downloadTicketMutateAsync({
              title: course.name,
              addressLine1: 'Lugano, Switzerland',
              addressLine2: '',
              addressLine3: '',
              formattedStartDate: 'Start date: October 22nd 2024',
              formattedTime: 'End date : October 23rd 2024',
              liveLanguage: '',
              formattedCapacity: '',
              contact: 'contact@planb.network',
              userName: user ? user.username : '',
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
    );
  };

  const BuyCourseButton = ({
    children,
    variant = 'primary',
    format,
  }: {
    children: JSX.Element;
    variant?: 'primary' | 'outline';
    format: 'online' | 'inperson';
  }) => {
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
        : () => {
            navigate({
              to: '/courses/$courseId/$chapterId',
              params: {
                courseId,
                chapterId:
                  course?.parts[0] && course?.parts[0].chapters[0]
                    ? course?.parts[0].chapters[0].chapterId
                    : '',
              },
            });
          };

    return (
      <Button
        size="l"
        mode="dark"
        variant={variant}
        disabled={isStartOrBuyButtonDisabled}
        className="max-lg:my-6 !m-2 lg:mt-5 w-full max-lg:max-w-[290px] md:w-fit self-center lg:self-end"
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
            ? computeAssetCdnUrl(
                course.lastCommit,
                `courses/${course.id}/assets/thumbnail.webp`,
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
            <DescriptionAndObjectives course={course} />
            <Divider className="my-6 lg:my-9" width="w-full" />
            <CourseCurriculum
              course={course}
              courseHasToBePurchased={courseHasToBePurchased}
              hideGithubLink
              className="self-start"
            >
              <h4 className="subtitle-small-caps-14px md:subtitle-medium-caps-18px text-darkOrange-5 mb-4 lg:mb-9">
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
}
