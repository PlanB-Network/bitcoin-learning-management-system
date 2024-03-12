// @ts-nocheck
// TODO temporary

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import saif from '../../../assets/events/saif.webp';
import { Button } from '../../../atoms/Button/index.tsx';
import { MainLayout } from '../../../components/MainLayout/index.tsx';
import {
  addMinutesToDate,
  formatDate,
  formatTime,
} from '../../../utils/date.ts';
import { trpc } from '../../../utils/trpc.ts';
import { EventPaymentModal } from '../components/event-payment-modal.tsx';

export const Events = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: events } = trpc.content.getEvents.useQuery();

  const { t } = useTranslation();

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
      <div className="flex flex-col">
        <div className="self-center max-w-4xl mx-8 mt-24 flex flex-col items-start text-white gap-4">
          <h1 className="text-5xl font-medium left self">
            {t('words.events')}
          </h1>
          <p>
            This page lists all Bitcoin events organized by Plan B Network,
            communities, personalities, and partner companies. This portal
            allows you to register for events that interest you, or to watch the
            replays.
          </p>
          <h2 className="text-xl font-medium mt-4">Bitcoin events to come</h2>
          {events?.map((event) => (
            <>
              <EventPaymentModal
                eventId={event.id}
                satsPrice={1}
                isOpen={isPaymentModalOpen}
                onClose={(isPaid) => {
                  if (isPaid) {
                    // refetchPayment();
                  }
                  setIsPaymentModalOpen(false);
                }}
              />

              <div
                className="mt-2 border-2 border-orange-500 rounded-3xl shadow-md-button-white"
                key={event.id}
              >
                <div className="flex flex-row gap-4 p-4">
                  <img
                    src={saif}
                    className="h-[230px] w-[208px]"
                    alt="Saifedean"
                  />
                  <div className="flex flex-col gap-2 pt-2">
                    <p className="text-orange-500 font-semibold">
                      {event.title}
                    </p>
                    <p className="text-3xl">{event.description}</p>
                    {event.startDate && (
                      <>
                        <p className="">{formatDate(event.startDate)}</p>
                        <p className="lowercase">
                          {formatTime(event.startDate)}
                          {' to '}
                          {formatTime(
                            addMinutesToDate(event.startDate, event.duration),
                          )}
                        </p>
                      </>
                    )}

                    <div className="text-sm">
                      <p>{event.addressLine1}</p>
                      <p>{event.addressLine2}</p>
                      {/* new Date(course.paidStartDate).toLocaleDateString() */}
                    </div>
                    {event.priceDollars && (
                      <p className="text-orange-500 mt-3">
                        <>
                          ${event.priceDollars}{' '}
                          <span className="text-orange-500 text-opacity-75">
                            /{' '}
                            {conversionRate &&
                              Math.round(
                                (event.priceDollars * 100_000_000) /
                                  conversionRate,
                              ).toLocaleString('fr-FR')}{' '}
                            sats
                          </span>
                        </>
                      </p>
                    )}
                  </div>
                  <div className="self-end gap-2 flex flex-col">
                    <Button
                      type="button"
                      size="m"
                      disabled={true}
                      variant={'text'}
                    >
                      Watch replay
                    </Button>
                    <Button
                      type="button"
                      size="m"
                      variant={'tertiary'}
                      onClick={() => setIsPaymentModalOpen(true)}
                    >
                      Book your seat
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
