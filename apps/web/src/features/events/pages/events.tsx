import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import saif from '../../../assets/events/saif.webp';
import { Button } from '../../../atoms/Button/index.tsx';
import { AuthModal } from '../../../components/AuthModal/index.tsx';
import { AuthModalState } from '../../../components/AuthModal/props.ts';
import { MainLayout } from '../../../components/MainLayout/index.tsx';
import { useAppSelector, useDisclosure } from '../../../hooks/index.ts';
import { formatDate, formatTime } from '../../../utils/date.ts';
import { trpc } from '../../../utils/trpc.ts';
import { CurrentEvents } from '../components/current-events.tsx';
import { EventPaymentModal } from '../components/event-payment-modal.tsx';
import { EventsGrid } from '../components/events-grid.tsx';
import { EventsIntroduction } from '../components/events-introduction.tsx';

export const Events = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: events } = trpc.content.getEvents.useQuery();
  const { data: eventPayments, refetch: refetchEventPayments } =
    trpc.user.events.getEventPayment.useQuery();

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

  const currentTimePlusTen = new Date(Date.now() + 1000 * 60 * 10);

  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="self-center max-w-4xl mx-8 flex flex-col items-start text-white gap-4">
          {events?.map((event) => {
            let satsPrice =
              conversionRate && event.priceDollars !== null
                ? Math.round(
                    (event.priceDollars * 100_000_000) / conversionRate,
                  )
                : -1;
            if (process.env.NODE_ENV === 'development') {
              satsPrice = 10;
            }

            const filteredEventPayments = eventPayments?.filter(
              (payment) =>
                payment.paymentStatus === 'paid' &&
                payment.eventId === event.id,
            );

            return (
              <div key={event.id}>
                <EventPaymentModal
                  eventId={event.id}
                  satsPrice={satsPrice}
                  isOpen={isPaymentModalOpen}
                  onClose={(isPaid) => {
                    if (isPaid) {
                      refetchEventPayments();
                      setTimeout(() => {
                        refetchEventPayments();
                      }, 5000);
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
                        {event.name}
                      </p>
                      <p className="text-xl md:text-3xl">{event.description}</p>
                      {event.startDate && (
                        <div className="mt-1 text-sm md:text-base">
                          <p className="">
                            {formatDate(
                              new Date(event.startDate),
                              'Europe/Rome',
                            )}
                          </p>
                          <p>
                            <span className="lowercase">
                              {formatTime(
                                new Date(event.startDate),
                                'Europe/Rome',
                              )}
                              {' to '}
                              {formatTime(
                                new Date(event.endDate),
                                'Europe/Rome',
                              )}{' '}
                            </span>
                            <span>(Turin Time, CET)</span>
                          </p>
                        </div>
                      )}

                      <div className="text-xs md:text-sm">
                        <p>{event.addressLine1}</p>
                        <p>{event.addressLine2}</p>
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
                    <div className="self-end">
                      {filteredEventPayments &&
                      filteredEventPayments.length > 0 ? (
                        <div>
                          {new Date(event.startDate) > currentTimePlusTen ? (
                            <div className="italic font-semibold max-w-32 text-center">
                              Purchased
                            </div>
                          ) : (
                            <Link
                              to={'/events/$eventId'}
                              params={{
                                eventId: event.id,
                              }}
                            >
                              <Button
                                type="button"
                                size="m"
                                variant={'tertiary'}
                                onClick={() => {
                                  console.log('open live');
                                }}
                              >
                                Watch live
                              </Button>
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="gap-2 flex flex-col">
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
                      )}
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
      {/* New layout */}
      <div className="max-w-[1440px] w-fit flex flex-col gap-6 px-4 py-2.5 mx-auto md:gap-[60px] md:px-10">
        <EventsIntroduction />
        <CurrentEvents />
        <div className="h-px w-full bg-newBlack-5"></div>
        <EventsGrid />
      </div>
    </MainLayout>
  );
};
