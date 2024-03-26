import { EventCard } from './event-card.tsx';

export const EventsGrid = () => {
  return (
    <div className="flex flex-wrap justify-center gap-5 md:gap-[30px] mt-6 md:mt-12 mx-auto">
      <EventCard />
      <EventCard />
      <EventCard />
      <EventCard />
      <EventCard />
      <EventCard />
    </div>
  );
};
