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

  return (
    <div className="w-full bg-newBlack-2">
      <div
        className="overflow-hidden py-3 sm:px-10 sm:py-[30px]"
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
