import { formatNameForURL } from '@blms/shared';
import { Flag, Image, Loader, TextTag } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { z } from 'zod';
import LockGif from '#src/assets/icons/lock.gif?no-inline';
import BookOpen from '#src/assets/resources/library.svg';
import VideoPreview from '#src/assets/resources/preview-video.webp?no-inline';
import { PageLayout } from '#src/components/page-layout.tsx';
import { CourseCard } from '#src/patterns/course-card.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { resourceImgUrl, trpc } from '#src/utils/index.ts';
import { fixEmbedUrl } from '#src/utils/misc.ts';
import { LectureBuy } from '../-components/lecture-buy.js';

export const Route = createFileRoute(
  '/$lang/_content/resources/lectures/$lectureName-$lectureId',
)({
  component: Lecture,
  params: {
    parse: (params) => {
      const lectureNameId = params['lectureName-$lectureId'];
      const { id, name } = getNameAndIdFromUrl(lectureNameId);

      return {
        lang: z.string().parse(params.lang),
        lectureId: z.string().parse(id),
        lectureName: z.string().parse(name),
        'lectureName-$lectureId': `${name}-${id}`,
      };
    },
    stringify: ({ lang, lectureName, lectureId }) => ({
      lang: lang,
      'lectureName-$lectureId': `${lectureName}-${lectureId}`,
    }),
  },
});

function Lecture() {
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { courses, session } = useContext(AppContext);

  const isLoggedIn = !!session;

  const {
    data: lecture,
    refetch: refetchLecture,
    isFetched,
  } = useQuery(
    trpc.content.getLecture.queryOptions({
      language: i18n.language ?? 'en',
      strId: params.lectureId,
    }),
  );

  const relatedCourse = courses?.find(
    (course) => course.id === lecture?.courseRelated,
  );

  const { data: eventPayments, refetch: refetchEventPayments } = useQuery(
    trpc.user.events.getEventPayment.queryOptions(undefined, {
      enabled: !!lecture && isLoggedIn,
    }),
  );

  const eventPayment = eventPayments?.find(
    (payment) =>
      payment.paymentStatus === 'paid' && payment.eventId === lecture?.id,
  );

  const navigate = useNavigate();

  const lectureDuration =
    lecture?.endDate && lecture?.startDate
      ? `${Math.floor((new Date(lecture.endDate).getTime() - new Date(lecture.startDate).getTime()) / (1000 * 60 * 60))}h ${Math.floor(((new Date(lecture.endDate).getTime() - new Date(lecture.startDate).getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m`
      : null;

  const lectureDate =
    lecture &&
    new Date(lecture.startDate).toLocaleDateString(i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  useEffect(() => {
    if (eventPayment) refetchLecture();
  }, [refetchLecture, eventPayment]);

  useEffect(() => {
    if (lecture && params.lectureName !== formatNameForURL(lecture.name!)) {
      navigate({
        replace: true,
        to: `/resources/lectures/${formatNameForURL(lecture.name!)}-${lecture.id}`,
      });
    }
  }, [lecture, isFetched, navigate, params.bookName]);
  return (
    <PageLayout
      backLink={{
        href: '/resources/lectures',
        text: t('resources.lectures.title'),
      }}
      layoutSize="base"
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !lecture && (
        <div>
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.lecture'),
          })}
        </div>
      )}

      {lecture && (
        <div className="w-full flex flex-col gap-6">
          <article className="flex flex-col w-full gap-6 md:gap-7.5">
            <Image
              breakpoints={{ default: 736 }}
              className="w-full rounded-lg"
              alt={lecture.name || 'Lecture'}
              src={resourceImgUrl(lecture)}
            />
            <div className="flex flex-col gap-6 md:gap-5.5 w-full">
              <div className="flex flex-col md:gap-1.5 w-full">
                <h1 className="title-small md:display-medium flex gap-2 w-full justify-between items-center">
                  {lecture.name}
                  <Flag
                    code={lecture.languages[0]}
                    size="l"
                    className="shrink-0 max-md:!hidden"
                  />
                </h1>
                {lecture.professorName && (
                  <span className="body-base md:title-medium text-neutral-600">
                    {lecture.professorName}
                  </span>
                )}
                <span className="body-base md:title-medium text-neutral-600 max-md:mt-6">
                  {`${lectureDuration} · ${lectureDate}`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {lecture?.tags.map((tag) => (
                  <TextTag
                    key={tag}
                    size="base"
                    color="grey"
                    className="capitalize"
                  >
                    {tag}
                  </TextTag>
                ))}
              </div>
              {!!lecture?.priceDollars && (
                <LectureBuy
                  lecture={lecture}
                  eventPayment={eventPayment}
                  refetchEventPayments={refetchEventPayments}
                />
              )}
            </div>
          </article>

          <div className="flex flex-col w-full gap-1">
            <h3 className="subtitle-base md:title-base">
              {t('lectures.watchLecture')}
            </h3>
            {!lecture?.replayUrl &&
            !lecture?.liveUrl &&
            lecture?.priceDollars &&
            lecture.priceDollars > 0 ? (
              <div className="relative w-full">
                <img src={VideoPreview} alt="Video preview" />
                <div className="absolute -top-3 left-1 md:top-7 md:left-4 flex gap-3 items-center">
                  <img
                    src={LockGif}
                    alt="Locked"
                    className="w-11 md:w-[62px] shrink-0"
                  />
                  <span className="title-large-24px text-white max-md:hidden">
                    {t('lectures.buyVideoToUnlock')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-full w-full aspect-video">
                <iframe
                  width={'100%'}
                  height={'100%'}
                  className="mx-auto rounded-lg"
                  src={fixEmbedUrl(
                    lecture?.replayUrl || lecture?.liveUrl || '',
                  )}
                  title="Lecture replay"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {relatedCourse && (
            <section className="w-full flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={BookOpen}
                  className="size-5 lg:size-6 shrink-0"
                  alt="BookOpen"
                />
                <h3 className="text-darkOrange-5 body-base-bold md:display-small">
                  {t('lectures.checkFullCourse')}
                </h3>
              </div>
              <p className="md:whitespace-pre-line body-14px md:subtitle-medium-16px mb-5">
                <Trans
                  i18nKey={'lectures.lecturePartCourse'}
                  values={{ courseTitle: relatedCourse.name }}
                >
                  <Link
                    to={`/courses/${relatedCourse.id}`}
                    className="font-semibold"
                  >
                    Course
                  </Link>
                </Trans>
              </p>
              <CourseCard course={relatedCourse} mode="light" />
            </section>
          )}
        </div>
      )}
    </PageLayout>
  );
}
