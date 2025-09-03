import { LANGUAGES_MAP } from '@blms/shared';
import { Banner, BannerTitle, Button, Image, Loader } from '@blms/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext, useEffect, useState } from 'react';
import {
  TbBuildingCommunity,
  TbCalendarEvent,
  TbClock,
  TbLanguage,
  TbMapPin,
  TbNumber,
  TbPodium,
  TbTag,
} from 'react-icons/tb';
import { z } from 'zod';
import CheckPixel from '#src/assets/icons/pixelated/check.svg?react';
import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { AuthModalState } from '#src/components/AuthModals/props.ts';
import { MainLayout } from '#src/components/main-layout.js';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { AppContext } from '#src/providers/context.tsx';
import { ConversionRateContext } from '#src/providers/conversionRateContext.tsx';
import type { PaymentModalDataModel } from '#src/services/utils.tsx';
import { formatDateRange, formatHourRange } from '#src/utils/date.ts';
import { resourceImgUrl } from '#src/utils/index.ts';
import { base64ToBlob } from '#src/utils/misc.ts';
import { trpc } from '#src/utils/trpc.js';
import { ListElement2 } from '../../dashboard/_dashboard/course/-components/summer-school.tsx';
import { TaxesSpan } from '../courses/$courseName-$courseId.tsx';
import { EventBookModal } from './-components/event-book-modal.tsx';
import { EventPaymentModal } from './-components/event-payment-modal.tsx';

export const Route = createFileRoute('/$lang/_content/events/$eventId')({
  component: EventDetails,
  params: {
    parse: (params) => ({
      eventId: z.string().parse(params.eventId),
      lang: z.string().parse(params.lang),
    }),
    stringify: ({ lang, eventId }) => ({
      eventId: `${eventId}`,
      lang: lang,
    }),
  },
});

function EventDetails() {
  const params = Route.useParams();

  const [paymentModalData, setPaymentModalData] =
    useState<PaymentModalDataModel>({
      accessType: null,
      dollarPrice: null,
      eventId: null,
      satsPrice: null,
    });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { user, session } = useContext(AppContext);
  const { conversionRate } = useContext(ConversionRateContext);

  const isLoggedIn = !!session;

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  const {
    data: event,
    isFetched,
    refetch,
  } = useQuery(
    trpc.content.getEvent.queryOptions({
      id: params.eventId,
    }),
  );

  const { data: eventPayments, refetch: refetchEventPayments } = useQuery(
    trpc.user.events.getEventPayment.queryOptions(undefined, {
      enabled: !!event && isLoggedIn,
    }),
  );

  const { data: userEvents, refetch: refetchUserEvents } = useQuery(
    trpc.user.events.getUserEvents.queryOptions(undefined, {
      enabled: !!event && isLoggedIn,
    }),
  );

  const { mutateAsync: downloadTicketAsync } = useMutation(
    trpc.user.events.downloadEventTicket.mutationOptions(),
  );

  const eventPayment = eventPayments?.find(
    (payment) =>
      payment.paymentStatus === 'paid' && payment.eventId === event?.id,
  );

  const userEvent = userEvents?.find(
    (ue) => ue.eventId === event?.id && ue.booked,
  );

  useEffect(() => {
    if (eventPayment || userEvent) refetch();
  }, [refetch, eventPayment]);

  const dollarPrice = event?.priceDollars || 0;
  let satsPrice =
    conversionRate && dollarPrice !== null
      ? Math.round((dollarPrice * 100_000_000) / conversionRate)
      : -1;
  if (satsPrice > 10 && process.env.NODE_ENV === 'development') {
    satsPrice = 10;
  }

  const isFree = dollarPrice === 0;

  const isBookableOnlineEvent = event ? event.bookOnline : false;

  const isPaidOnlineEvent = isBookableOnlineEvent && !isFree;

  const isBookableInPersonEvent = event
    ? event.bookInPerson && event.endDate > new Date()
    : false;

  const userBookedTheEvent =
    eventPayment !== undefined || userEvent !== undefined;

  let videoUrl = '';
  if (event?.replayUrl) {
    videoUrl = event?.replayUrl;
  } else if (event?.liveUrl) {
    videoUrl = `${event?.liveUrl}?autoplay=1&muted=1&peertubeLink=0`;
  }

  const dateString =
    event &&
    formatDateRange(
      event.startDate,
      event.endDate,
      event.timezone ?? undefined,
    );
  const timeString =
    event &&
    formatHourRange(
      event.startDate,
      event.endDate,
      event.timezone ?? undefined,
      true,
    );

  const EventButtons = () => {
    if (!event) return null;

    return (
      <>
        {isPaidOnlineEvent &&
          (userBookedTheEvent ? null : (
            <Button
              variant={event.bookInPerson ? 'outline' : 'primary'}
              onClick={() => {
                if (isLoggedIn) {
                  setPaymentModalData({
                    accessType: 'online',
                    dollarPrice: dollarPrice,
                    eventId: event.id,
                    satsPrice: satsPrice,
                  });
                  setIsPaymentModalOpen(true);
                } else {
                  openAuthModal();
                }
              }}
            >
              {t('events.card.bookLive')}
            </Button>
          ))}

        {isBookableInPersonEvent &&
          !userBookedTheEvent &&
          (event?.remainingSeats && event.remainingSeats > 0 ? (
            <Button
              variant="primary"
              onClick={() => {
                if (isLoggedIn) {
                  setPaymentModalData({
                    accessType: 'physical',
                    dollarPrice: dollarPrice,
                    eventId: event.id,
                    satsPrice: satsPrice,
                  });
                  setIsPaymentModalOpen(true);
                } else {
                  openAuthModal();
                }
              }}
            >
              {t('events.card.bookSeat')}
            </Button>
          ) : (
            <Button variant="primary" size={'s'} disabled>
              {t('words.full')}
            </Button>
          ))}
      </>
    );
  };

  return (
    <MainLayout variant="light">
      <div>
        {event &&
        paymentModalData.eventId &&
        paymentModalData.satsPrice &&
        paymentModalData.dollarPrice &&
        paymentModalData.accessType &&
        paymentModalData.satsPrice > 0 ? (
          <EventPaymentModal
            eventId={paymentModalData.eventId}
            event={event}
            accessType={paymentModalData.accessType}
            satsPrice={paymentModalData.satsPrice}
            dollarPrice={paymentModalData.dollarPrice}
            isOpen={isPaymentModalOpen}
            onClose={() => {
              refetchEventPayments();
              refetchUserEvents();
              setPaymentModalData({
                accessType: null,
                dollarPrice: null,
                eventId: null,
                satsPrice: null,
              });
              setIsPaymentModalOpen(false);
            }}
          />
        ) : null}

        {event &&
        paymentModalData.eventId &&
        paymentModalData.satsPrice === 0 &&
        paymentModalData.accessType ? (
          <EventBookModal
            event={event}
            accessType={paymentModalData.accessType}
            isOpen={isPaymentModalOpen}
            onClose={() => {
              refetchEventPayments();
              refetchUserEvents();
              setIsPaymentModalOpen(false);
            }}
          />
        ) : null}
      </div>

      <div className="flex flex-col items-center mt-8 md:mt-12 w-full max-w-3xl mx-auto px-4">
        {!isFetched && (
          <div className="flex flex-col flex-1 justify-center items-center size-full">
            <Loader size={'s'} />
          </div>
        )}

        {isFetched && event && (
          <div className="flex flex-col w-full gap-6 md:gap-8">
            <div className="flex max-sm:flex-col sm:items-center gap-4">
              <Image
                breakpoints={{ default: 250, sm: 300 }}
                width="300"
                height="214"
                loading="lazy"
                src={resourceImgUrl(event)}
                alt={event.name ? event.name : ''}
                className="object-cover [overflow-clip-margin:_unset] sm:aspect-[300/214] w-62 sm:w-full h-full rounded-2xl max-w-75"
              />
              <div className="flex flex-col gap-2 sm:gap-4 w-full">
                <h1 className="display-small sm:display-medium text-newBlack-1">
                  {event.name}
                </h1>
                <span className="title-small md:title-medium text-neutral-600">
                  {event.projectName}
                </span>
              </div>
            </div>

            {(eventPayment || userEvent) && (
              <Banner
                variant="success"
                icon={<CheckPixel className="fill-brightGreen-6" />}
              >
                <BannerTitle>{t('events.eventInfos.eventBooked')}</BannerTitle>
              </Banner>
            )}

            <div className="flex flex-col bg-newGray-6 text-newBlack-3 rounded-xl">
              <h2 className="label-large-med-20px text-newBlack-1 border-b border-newGray-5 py-3 px-4 md:px-6">
                {t('events.eventInfos.whatsPlanned')}
              </h2>

              <div className="p-4 md:p-6 flex flex-col w-full gap-7">
                {/* General infos */}
                <section className="flex flex-col w-full gap-2">
                  <p className="body-base-bold">{t('words.details')}</p>
                  <div className="bg-white px-5 py-4 rounded-2xl">
                    <ListElement2
                      icon={TbCalendarEvent}
                      leftText={t('words.date')}
                    >
                      {dateString}
                    </ListElement2>
                    <ListElement2 icon={TbClock} leftText={t('words.time')}>
                      {timeString}
                    </ListElement2>
                    {event.addressLine1 ||
                    event.addressLine2 ||
                    event.addressLine3 ? (
                      <ListElement2
                        icon={TbMapPin}
                        leftText={t('words.location')}
                      >
                        <div className="flex flex-col">
                          {[
                            event.addressLine3,
                            event.addressLine2,
                            event.addressLine1,
                          ]
                            .filter(Boolean)
                            .map((line, index) => (
                              // biome-ignore lint/suspicious/noArrayIndexKey: <N/A>
                              <span key={index}>{line}</span>
                            ))}
                        </div>
                      </ListElement2>
                    ) : null}
                    <ListElement2
                      icon={TbLanguage}
                      leftText={t('words.language')}
                    >
                      {event.languages
                        .map(
                          (lang) =>
                            LANGUAGES_MAP[
                              lang.toLowerCase().replaceAll('-', '')
                            ] || lang,
                        )
                        .join(', ')}
                    </ListElement2>
                  </div>
                </section>

                {/* Description */}
                {event.description && (
                  <section className="flex flex-col w-full gap-2">
                    <p className="body-base-bold">{t('words.description')}</p>
                    <p className="bg-white px-5 py-4 rounded-2xl text-newBlack-3 body-large">
                      {event.description}
                    </p>
                  </section>
                )}

                {/* Event type infos */}
                <section className="flex flex-col w-full gap-2">
                  <p className="body-base-bold">{t('words.booking')}</p>
                  <div className="bg-white px-5 py-4 rounded-2xl">
                    {event.type && (
                      <ListElement2
                        icon={TbPodium}
                        leftText={t('events.eventInfos.eventType')}
                      >
                        {event.type.charAt(0).toUpperCase() +
                          event.type.slice(1)}
                      </ListElement2>
                    )}
                    {event.availableSeats !== null && event.bookInPerson && (
                      <ListElement2
                        icon={TbNumber}
                        leftText={t('events.eventInfos.numberOfSpots')}
                      >
                        {event.availableSeats}
                      </ListElement2>
                    )}
                    <ListElement2
                      icon={TbBuildingCommunity}
                      leftText={t('words.access')}
                    >
                      {event.bookOnline && event.bookInPerson
                        ? t('events.eventInfos.onlineAndInPerson')
                        : event.bookInPerson
                          ? t('words.inperson')
                          : t('words.online')}
                    </ListElement2>
                  </div>
                </section>

                {/* Pricing */}
                <section className="flex flex-col w-full gap-2">
                  <p className="body-base-bold">{t('words.pricing')}</p>
                  <div className="bg-white p-4 rounded-xl">
                    <ListElement2 icon={TbTag} leftText={t('words.price')}>
                      <div className="flex flex-col">
                        <span>
                          {dollarPrice && dollarPrice !== 0 ? (
                            <>
                              ${dollarPrice} <TaxesSpan />
                            </>
                          ) : (
                            t('words.free')
                          )}
                        </span>
                        {dollarPrice &&
                        dollarPrice > 0 &&
                        conversionRate != null ? (
                          <span className="text-darkOrange-4">
                            {satsPrice} sats
                          </span>
                        ) : null}
                      </div>
                    </ListElement2>
                  </div>
                </section>

                {((event.bookInPerson &&
                  eventPayment?.withPhysical !== true &&
                  userEvent?.withPhysical !== true) ||
                  (dollarPrice > 0 && !userBookedTheEvent)) && (
                  <section className="flex flex-col w-full gap-2">
                    <p className="body-base-bold">
                      {t('events.eventInfos.secureYourSpot')}
                    </p>

                    <div className="flex max-md:flex-col gap-4 justify-center items-center">
                      <EventButtons />
                    </div>
                  </section>
                )}

                {(eventPayment?.withPhysical === true ||
                  userEvent?.withPhysical === true) && (
                  <Button
                    variant="primary"
                    onClick={async () => {
                      const base64 = await downloadTicketAsync({
                        eventId: event.id,
                        userName: user?.username as string,
                      });
                      const fileName = 'ticket.pdf';
                      const blob = base64ToBlob(base64, 'application/pdf');
                      const url = window.URL.createObjectURL(blob);

                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', fileName);

                      document.body.appendChild(link);

                      link.click();

                      link.parentNode?.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    }}
                    className="mx-auto"
                  >
                    {t('events.payment.download_ticket')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {isFetched && event && (
          <div className="flex flex-col gap-6 w-full items-center mt-6 md:mt-8">
            {videoUrl && (
              <iframe
                title={`Live ${event?.name}`}
                className="w-full aspect-video rounded-2xl"
                src={videoUrl}
                allowFullScreen={true}
                sandbox="allow-same-origin allow-scripts allow-popups"
              />
            )}
            {event?.chatUrl && (
              <iframe
                src="https://peertube.planb.network/plugins/livechat/router/webchat/room/4f4a811a-2d98-40dc-80ea-736088b408e7"
                title="Chat"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                className="w-full"
                height="315"
              />
            )}
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
    </MainLayout>
  );
}
