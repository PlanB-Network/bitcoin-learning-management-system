import useEmblaCarousel from 'embla-carousel-react';

import type { JoinedEvent } from '@sovereign-university/types';

import { EventCard } from './event-card.tsx';

interface EventsCarouselProps {
  events: JoinedEvent[];
  conversionRate: number | null;
}

export const EventsCarousel = ({
  events,
  conversionRate,
}: EventsCarouselProps) => {
  const [emblaRef] = useEmblaCarousel();

  let passedEvents: JoinedEvent[] = [];

  if (events) {
    passedEvents = events
      ?.filter((event) => {
        const now = Date.now();
        let endDate = new Date(event.endDate).getTime();
        const ONE_HOUR = 60 * 60 * 1000;

        if (new Date(event.endDate).getUTCHours() === 0) {
          const TWENTY_FOUR_HOURS = 24 * ONE_HOUR;
          endDate += TWENTY_FOUR_HOURS;
        }

        return now > endDate && now - endDate > ONE_HOUR;
      })
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
  }

  if (passedEvents.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-newBlack-2">
      <div
        className="overflow-hidden py-3 sm:px-10 sm:py-[30px]"
        ref={emblaRef}
      >
        <div className="flex">
          {passedEvents.map((event) => (
            <div
              key={event.name}
              className="flex-[0_0_auto] max-w-[85%] min-w-0 mx-2 sm:mx-3"
            >
              <EventCard
                event={event}
                conversionRate={conversionRate}
                isPassed={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
