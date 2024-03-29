import { useEffect, useState } from 'react';

import { MainLayout } from '../../../components/MainLayout/index.tsx';
import { trpc } from '../../../utils/trpc.ts';
import { CurrentEvents } from '../components/current-events.tsx';
import { EventsGrid } from '../components/events-grid.tsx';
import { EventsIntroduction } from '../components/events-introduction.tsx';

export const Events = () => {
  const { data: events } = trpc.content.getEvents.useQuery();

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

  return (
    <MainLayout>
      <div className="max-w-[1440px] w-fit flex flex-col gap-6 px-4 py-2.5 mx-auto md:gap-[60px] md:px-10">
        <EventsIntroduction />
        {events && (
          <CurrentEvents events={events} conversionRate={conversionRate} />
        )}
        <div className="h-px w-2/5 bg-newBlack-5 mx-auto sm:w-full"></div>
        {events && (
          <EventsGrid events={events} conversionRate={conversionRate} />
        )}
      </div>
    </MainLayout>
  );
};
