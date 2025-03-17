import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  Card,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Loader,
  TextTag,
} from '@blms/ui';

import LockGif from '#src/assets/icons/lock.gif?no-inline';
import BookOpen from '#src/assets/resources/library.svg';
import VideoPreview from '#src/assets/resources/preview-video.webp?no-inline';
import { fixEmbedUrl } from '#src/components/Markdown/conference-markdown-body.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import Flag from '#src/molecules/Flag/index.tsx';
import { BackLink } from '#src/molecules/backlink.tsx';
import { CourseCard } from '#src/organisms/course-card.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { addSpaceToCourseIndex } from '#src/utils/courses.ts';
import { resourceImgUrl, trpc } from '#src/utils/index.ts';
import { useShuffleSuggestedContent } from '#src/utils/resources-hook.ts';

import type { JoinedEvent } from '@blms/types';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { formatNameForURL } from '#src/utils/string.ts';
import { LectureCard } from '../-components/cards/lecture-card.js';
import { LectureBuy } from '../-components/lecture-buy.js';
import { ResourceLayout } from '../-components/resource-layout.js';
import { SuggestedHeader } from '../-components/suggested-header.js';

export const Route = createFileRoute(
  '/$lang/_content/resources/lectures/$lectureName-$lectureId',
)({
  params: {
    parse: (params) => {
      const lectureNameId = params['lectureName-$lectureId'];
      const { id, name } = getNameAndIdFromUrl(lectureNameId);

      return {
        lang: z.string().parse(params.lang),
        'lectureName-$lectureId': `${name}-${id}`,
        lectureName: z.string().parse(name),
        lectureId: z.string().parse(id),
      };
    },
    stringify: ({ lang, lectureName, lectureId }) => ({
      lang: lang,
      'lectureName-$lectureId': `${lectureName}-${lectureId}`,
    }),
  },
  component: Lecture,
});

function Lecture() {
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { courses } = useContext(AppContext);

  const {
    data: lecture,
    refetch: refetchLecture,
    isFetched,
  } = trpc.content.getLecture.useQuery({
    strId: params.lectureId,
    language: i18n.language ?? 'en',
  });

  const relatedCourse = courses?.find(
    (course) => course.id === lecture?.courseRelated,
  );

  const { data: eventPayments, refetch: refetchEventPayments } =
    trpc.user.events.getEventPayment.useQuery(undefined, {
      enabled: !!lecture,
    });

  const eventPayment = eventPayments?.find(
    (payment) =>
      payment.paymentStatus === 'paid' && payment.eventId === lecture?.id,
  );

  const { data: suggestedLectures, isFetched: isFetchedSuggested } =
    trpc.content.getLectures.useQuery({});

  const navigate = useNavigate();

  const isMobile = useSmaller('md');

  const shuffledSuggestedLectures = useShuffleSuggestedContent(
    suggestedLectures ?? [],
    lecture,
  );

  const lectureDuration =
    lecture?.endDate && lecture?.startDate
      ? `${Math.floor((new Date(lecture.endDate).getTime() - new Date(lecture.startDate).getTime()) / (1000 * 60 * 60))}h ${Math.floor(((new Date(lecture.endDate).getTime() - new Date(lecture.startDate).getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m`
      : null;

  useEffect(() => {
    if (eventPayment) refetchLecture();
  }, [refetchLecture, eventPayment]);

  useEffect(() => {
    if (lecture && params.lectureName !== formatNameForURL(lecture.name!)) {
      navigate({
        to: `/resources/lectures/${formatNameForURL(lecture.name!)}-${lecture.id}`,
        replace: true,
      });
    }
  }, [lecture, isFetched, navigate, params.bookName]);
  return (
    <ResourceLayout
      link={'/resources/lectures'}
      activeCategory="lectures"
      showPageHeader={false}
      showResourcesDropdownMenu={true}
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !lecture && (
        <div className="max-w-[768px] mx-auto text-white">
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.lecture'),
          })}
        </div>
      )}
      {lecture && (
        <div className="flex-col">
          <BackLink
            to={'/resources/lectures'}
            label={t('resources.lectures.title')}
          />

          <article className="w-full">
            <Card
              className="md:mx-auto w-full"
              withPadding={false}
              paddingClass="p-4 md:p-[30px]"
              color="orange"
            >
              <div className="w-full flex flex-col md:flex-row gap-[25px] lg:gap-10">
                <div className="flex flex-col items-center shrink-0 relative rounded-[10px] lg:rounded-[20px] max-md:shadow-course-navigation max-md:w-fit mx-auto">
                  <img
                    className="w-full max-w-[256px] mx-auto object-cover [overflow-clip-margin:_unset] rounded-[10px] lg:rounded-[20px] lg:max-w-[457px]"
                    alt={t('imagesAlt.bookCover')}
                    src={resourceImgUrl(lecture)}
                  />
                  <div className="shrink-0 md:hidden absolute top-[13px] right-[12px] flex flex-col gap-1 p-1 bg-white rounded-sm">
                    {lecture.languages.map((language) => (
                      <Flag key={language} code={language} size="m" />
                    ))}
                  </div>
                  {!isMobile && !!lecture?.priceDollars && (
                    <LectureBuy
                      lecture={lecture}
                      eventPayment={eventPayment}
                      refetchEventPayments={refetchEventPayments}
                    />
                  )}
                </div>

                <div className="w-full max-w-2xl flex flex-col justify-between gap-6 md:gap-4 self-stretch">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center gap-4 w-full">
                      <h2 className="title-large-24px lg:display-small-med-32px text-white">
                        {lecture.name}
                      </h2>
                      <Flag
                        code={lecture.languages[0]}
                        size="xl"
                        className="shrink-0 max-md:hidden"
                      />
                    </div>

                    <span className="text-white subtitle-large-18px lg:title-large-24px">
                      {lecture.professorName || lecture.projectName}
                    </span>

                    <div className="flex max-md:flex-col gap-[5px] md:gap-12">
                      {lectureDuration && (
                        <span className="text-newGray-3 subtitle-small-med-14px lg:subtitle-large-med-20px">
                          {t('words.duration')}:{' '}
                          <span className="text-white">{lectureDuration}</span>
                        </span>
                      )}
                      {lecture.startDate && (
                        <span className="text-newGray-3 subtitle-small-med-14px lg:subtitle-large-med-20px">
                          {t('words.date')}:{' '}
                          <span className="text-white">
                            {new Date(lecture.startDate).toLocaleDateString(
                              i18n.language,
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-[10px]">
                      {lecture.tags.map((tag) => (
                        <TextTag
                          key={tag}
                          size="small"
                          variant="lightMaroon"
                          mode="dark"
                        >
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </TextTag>
                      ))}
                    </div>
                  </div>

                  {relatedCourse && (
                    <div className="flex flex-col gap-2 md:gap-3">
                      <p className="text-tertiary-2 subtitle-small-caps-14px md:subtitle-medium-caps-18px">
                        {t('lectures.partCourse')}
                      </p>
                      <div className="flex max-md:flex-col flex-wrap gap-1 md:gap-2">
                        <TextTag
                          size={isMobile ? 'verySmall' : 'small'}
                          variant="darkMaroon"
                          mode="dark"
                        >
                          {addSpaceToCourseIndex(
                            relatedCourse.index,
                          ).toUpperCase()}
                        </TextTag>
                        <Link
                          to={`/courses/${relatedCourse.id}`}
                          className="text-white body-14px-medium md:subtitle-large-med-20px"
                        >
                          {relatedCourse.name}
                        </Link>
                      </div>
                    </div>
                  )}

                  {isMobile && !!lecture?.priceDollars && (
                    <LectureBuy
                      lecture={lecture}
                      eventPayment={eventPayment}
                      refetchEventPayments={refetchEventPayments}
                    />
                  )}
                </div>
              </div>
            </Card>
          </article>
        </div>
      )}

      <div className="flex flex-col mt-8 md:mt-20 w-full gap-4 md:gap-8">
        <h3 className="subtitle-medium-16px lg:display-small-32px text-white">
          {t('lectures.watchLecture')}
        </h3>
        {!lecture?.replayUrl &&
        !lecture?.liveUrl &&
        lecture?.priceDollars &&
        lecture.priceDollars > 0 ? (
          <div className="relative w-full">
            <img src={VideoPreview} alt="Video preview" />
            <div className="absolute -top-3 left-1 md:top-[30px] md:left-[18px] flex gap-3 items-center">
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
              src={fixEmbedUrl(lecture?.replayUrl || lecture?.liveUrl || '')}
              title="Lecture replay"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {relatedCourse && (
        <section className="w-full flex flex-col mt-8 md:mt-20 justify-center items-center">
          <div className="flex max-md:flex-col items-center justify-center md:justify-start mb-2 lg:mb-4 mx-auto w-fit">
            <img
              src={BookOpen}
              className="size-[20px] lg:size-[32px] mr-3 my-1 shrink-0"
              alt="BookOpen"
            />
            <h3 className="items-center title-small-med-16px md:title-large-24px font-medium mt-1 text-darkOrange-5">
              {t('lectures.checkFullCourse')}
            </h3>
          </div>
          <p className="text-white md:whitespace-pre-line text-center body-medium-14px md:subtitle-medium-16px  mb-5 md:mb-12">
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
          <CourseCard course={relatedCourse} />
        </section>
      )}

      <section className="mt-8 lg:mt-20">
        <SuggestedHeader
          text="resources.pageSubtitleLectures"
          placeholder="Other lectures"
        />

        <Carousel>
          <CarouselContent>
            {isFetchedSuggested ? (
              shuffledSuggestedLectures.slice(0, 10).map((suggestedLecture) => {
                const isLecture = 'name' in suggestedLecture;
                if (isLecture) {
                  return (
                    <CarouselItem
                      key={suggestedLecture.id}
                      className="text-white bg-gradient-to-r size-full max-w-[157px] lg:max-w-[315px] rounded-[10px]"
                    >
                      <Link to={`/resources/lectures/${suggestedLecture.id}`}>
                        <LectureCard
                          key={suggestedLecture.id}
                          lecture={suggestedLecture as JoinedEvent}
                        />
                      </Link>
                    </CarouselItem>
                  );
                }
                return null;
              })
            ) : (
              <Loader size={'s'} />
            )}
          </CarouselContent>
          <CarouselPrevious className="*:size-5 md:*:size-8" />
          <CarouselNext className="*:size-5 md:*:size-8" />
        </Carousel>
      </section>
    </ResourceLayout>
  );
}
