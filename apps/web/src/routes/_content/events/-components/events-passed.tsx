import { useTranslation } from 'react-i18next';

import type { EventPayment, JoinedEvent, UserEvent } from '@blms/types';

import { EventsCarousel } from './events-carousel.tsx';

interface EventsPassedProps {
  events: JoinedEvent[];
  eventPayments: EventPayment[] | undefined;
  userEvents: UserEvent[] | undefined;
  openAuthModal: () => void;
  isLoggedIn: boolean;
  setIsPaymentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPaymentModalData: React.Dispatch<
    React.SetStateAction<{
      eventId: string | null;
      satsPrice: number | null;
      accessType: 'physical' | 'online' | 'replay' | null;
    }>
  >;
  conversionRate: number | null;
}

export const EventsPassed = ({
  events,
  eventPayments,
  userEvents,
  openAuthModal,
  isLoggedIn,
  setIsPaymentModalOpen,
  setPaymentModalData,
  conversionRate,
}: EventsPassedProps) => {
  const { t } = useTranslation();

  let passedEvents: JoinedEvent[] = [];

  if (events) {
    passedEvents = events
      ?.filter((event) => {
        const now = Date.now();
        let endDate = event.endDate.getTime();
        const ONE_HOUR = 60 * 60 * 1000;

        if (event.endDate.getUTCHours() === 0) {
          const TWENTY_FOUR_HOURS = 24 * ONE_HOUR;
          endDate += TWENTY_FOUR_HOURS;
        }

        return (
          now > endDate &&
          now - endDate > ONE_HOUR &&
          (event.replayUrl || event.liveUrl)
        );
      })
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  if (passedEvents.length === 0) {
    return null;
  }

  return (
    <>
      <section className="max-w-[1440px] w-full flex flex-col px-4 mt-6 mx-auto md:mt-[60px] md:px-10">
        <div className="h-px w-2/5 bg-newBlack-5 mb-6 md:mb-[60px] mx-auto sm:w-full" />
        <div className="max-w-[704px] mx-auto">
          <p className="text-2xl text-center mb-6 md:text-[40px] md:tracking-[0.25px]">
            {t('events.missed.missedp1')}
          </p>
          <p className="text-sm text-center text-newGray-1 mb-6 tracking-015px md:text-base md:mb-[60px]">
            {t('events.missed.missedp2')}
          </p>
        </div>
        <h2 className="text-lg text-center font-medium mb-4 sm:text-xl sm:text-left md:mb-[60px]">
          {t('events.missed.missedh1')}
        </h2>
      </section>
      <EventsCarousel
        events={passedEvents}
        eventPayments={eventPayments}
        userEvents={userEvents}
        openAuthModal={openAuthModal}
        isLoggedIn={isLoggedIn}
        setIsPaymentModalOpen={setIsPaymentModalOpen}
        setPaymentModalData={setPaymentModalData}
        conversionRate={conversionRate}
      />
    </>
  );
};
