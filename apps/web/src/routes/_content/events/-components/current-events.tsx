import { useTranslation } from 'react-i18next';

import type { EventPayment, JoinedEvent, UserEvent } from '@blms/types';

import { EventCard } from './event-card.tsx';

interface CurrentEventsProps {
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
  headingColor: string;
  headingText: string;
  headingClass?: string;
  showUpcomingIfNone?: boolean;
  showDivider?: boolean;
}

export const CurrentEvents = ({
  events,
  eventPayments,
  userEvents,
  openAuthModal,
  isLoggedIn,
  setIsPaymentModalOpen,
  setPaymentModalData,
  conversionRate,
  headingColor,
  headingText,
  headingClass = '',
  showUpcomingIfNone = false,
  showDivider = true,
}: CurrentEventsProps) => {
  const { t } = useTranslation();

  let liveEvents: JoinedEvent[] = [];
  if (events) {
    liveEvents = events.filter((event) => {
      const now = Date.now();
      const startDate = event.startDate.getTime();
      let endDate = event.endDate.getTime();
      const ONE_HOUR = 60 * 60 * 1000;
      const THIRTY_MINUTES = 30 * 60 * 1000;

      if (event.endDate.getUTCHours() === 0) {
        const TWENTY_FOUR_HOURS = 24 * ONE_HOUR;
        endDate += TWENTY_FOUR_HOURS;
      }

      return startDate - now < THIRTY_MINUTES && now < endDate + ONE_HOUR;
    });
  }

  let nearestUpcomingEvent: JoinedEvent | null = null;
  if (events && liveEvents.length === 0 && showUpcomingIfNone) {
    nearestUpcomingEvent =
      events
        .filter((event) => event.startDate.getTime() > Date.now())
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0] ||
      null;
  }

  if (liveEvents.length === 0 && !nearestUpcomingEvent) {
    return null;
  }

  return (
    <>
      <section className="flex flex-col items-center">
        <h2 className={` ${headingColor}${headingClass}`}>
          {headingText || t('events.main.currentEvents')}
        </h2>
        <div className="flex flex-wrap justify-center gap-10 mt-[10px] lg:mt-[30px] mx-auto sm:p-4 sm:shadow-l-section sm:rounded-[20px] sm:border-2 sm:border-newOrange-1">
          {liveEvents.length > 0
            ? liveEvents.map((event) => (
                <EventCard
                  event={event}
                  eventPayments={eventPayments}
                  userEvents={userEvents}
                  isLive={true}
                  openAuthModal={openAuthModal}
                  isLoggedIn={isLoggedIn}
                  setIsPaymentModalOpen={setIsPaymentModalOpen}
                  setPaymentModalData={setPaymentModalData}
                  conversionRate={conversionRate}
                  key={event.name}
                />
              ))
            : nearestUpcomingEvent && (
                <EventCard
                  event={nearestUpcomingEvent}
                  eventPayments={eventPayments}
                  userEvents={userEvents}
                  isLive={false}
                  openAuthModal={openAuthModal}
                  isLoggedIn={isLoggedIn}
                  setIsPaymentModalOpen={setIsPaymentModalOpen}
                  setPaymentModalData={setPaymentModalData}
                  conversionRate={conversionRate}
                  key={nearestUpcomingEvent.name}
                />
              )}
        </div>
      </section>
      {showDivider && (
        <div className="h-px w-2/5 bg-newBlack-5 mx-auto sm:w-full"></div>
      )}
    </>
  );
};
