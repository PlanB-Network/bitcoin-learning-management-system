// @ts-nocheck
// TODO temporary

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import saif from '../../../assets/events/saif.webp';
import { Button } from '../../../atoms/Button/index.tsx';
import { AuthModal } from '../../../components/AuthModal/index.tsx';
import { AuthModalState } from '../../../components/AuthModal/props.ts';
import { MainLayout } from '../../../components/MainLayout/index.tsx';
import { useAppSelector, useDisclosure } from '../../../hooks/index.ts';
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

  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  // TODO Refactor this auth stuff
  const [authMode, setAuthMode] = useState<AuthModalState>(
    AuthModalState.SignIn,
  );

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

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
          <h2 className="text-xl font-medium mt-4">
            {t('events.main.upcomingEvents')}
          </h2>
          {events?.map((event) => {
            let satsPrice = conversionRate
              ? Math.round((event.priceDollars * 100_000_000) / conversionRate)
              : null;
            if (process.env.NODE_ENV === 'development') {
              satsPrice = 10;
            }

            return (
              <div key={event.id}>
                <EventPaymentModal
                  eventId={event.id}
                  satsPrice={satsPrice}
                  isOpen={isPaymentModalOpen}
                  onClose={(isPaid) => {
                    if (isPaid) {
                      // refetchPayment();
                    }
                    setIsPaymentModalOpen(false);
                  }}
                />

                <div className="mt-2 border-2 border-orange-500 rounded-3xl shadow-md-button-white">
                  <div className="flex flex-wrap gap-4 p-4">
                    <img
                      src={saif}
                      className="lg:h-[230px] lg:w-[208px] h-[115px] w-[104px]"
                      alt="Saifedean"
                    />
                    <div className="flex flex-col gap-2 pt-2">
                      <p className="text-orange-500 font-semibold text-sm md:text-base">
                        {event.title}
                      </p>
                      <p className="text-xl md:text-3xl">{event.description}</p>
                      {event.startDate && (
                        <div className="mt-1 text-sm md:text-base">
                          <p className="">
                            {formatDate(new Date(event.startDate))}
                          </p>
                          <p className="lowercase">
                            {formatTime(new Date(event.startDate))}
                            {' to '}
                            {formatTime(
                              addMinutesToDate(
                                new Date(event.startDate),
                                event.duration,
                              ),
                            )}
                          </p>
                        </div>
                      )}

                      <div className="text-xs md:text-sm">
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
                                satsPrice.toLocaleString('fr-FR')}{' '}
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
                        onClick={() => {
                          if (isLoggedIn) {
                            setIsPaymentModalOpen(true);
                          } else {
                            setAuthMode(AuthModalState.SignIn);
                            openAuthModal();
                          }
                        }}
                      >
                        Book your seat
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {isAuthModalOpen ? (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={closeAuthModal}
            initialState={authMode}
          />
        ) : (
          <div></div>
        )}
      </div>
    </MainLayout>
  );
};
