import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';
import { RxCaretLeft, RxCaretRight } from 'react-icons/rx';

import type { EventPayment, JoinedEvent } from '@sovereign-university/types';

import { EventCard } from './event-card.tsx';

interface EventsCarouselProps {
  events: JoinedEvent[];
  eventPayments: EventPayment[] | undefined;
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

export const EventsCarousel = ({
  events,
  eventPayments,
  openAuthModal,
  isLoggedIn,
  setIsPaymentModalOpen,
  setPaymentModalData,
  conversionRate,
}: EventsCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative w-full bg-newBlack-2 ">
      <div
        className="overflow-hidden max-w-[1800px] mx-auto py-3 sm:px-10 sm:py-[30px]"
        ref={emblaRef}
      >
        <div className="flex">
          {events.map((event) => (
            <div
              key={event.name}
              className="flex-[0_0_auto] max-w-[85%] min-w-0 mx-2 sm:mx-3"
            >
              <EventCard
                event={event}
                eventPayments={eventPayments}
                isPassed={true}
                openAuthModal={openAuthModal}
                isLoggedIn={isLoggedIn}
                setIsPaymentModalOpen={setIsPaymentModalOpen}
                setPaymentModalData={setPaymentModalData}
                conversionRate={conversionRate}
              />
            </div>
          ))}
        </div>
        <div className="absolute h-full w-20 min-[1900px]:w-40 top-0 left-0 flex justify-center items-center bg-gradient-to-r from-[#A4A4A4]/75 to-transparent z-10">
          <RxCaretLeft
            size={80}
            className="hover:text-newOrange-1 hover:cursor-pointer z-10 transition-colors"
            onClick={scrollPrev}
          />
        </div>
        <div className="absolute h-full w-20 min-[1900px]:w-40 top-0 right-0 flex justify-center items-center bg-gradient-to-r from-transparent to-[#A4A4A4]/75 z-10">
          <RxCaretRight
            size={80}
            className="hover:text-newOrange-1 hover:cursor-pointer z-10 transition-colors"
            onClick={scrollNext}
          />
        </div>
      </div>
    </div>
  );
};
