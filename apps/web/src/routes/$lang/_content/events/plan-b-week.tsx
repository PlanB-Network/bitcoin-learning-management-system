// import type { JoinedEvent } from '@blms/types';
// import { Loader } from '@blms/ui';
// import { useQuery } from '@tanstack/react-query';
// import { createFileRoute } from '@tanstack/react-router';
// import { lazy, Suspense, useContext, useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { AuthModal } from '#src/components/AuthModals/auth-modal.js';
// import { AuthModalState } from '#src/components/AuthModals/props.js';
// import { PageLayout } from '#src/components/page-layout.js';
// import { useDisclosure } from '#src/hooks/use-disclosure.js';
// import { AppContext } from '#src/providers/context.js';
// import { ConversionRateContext } from '#src/providers/conversionRateContext.tsx';
// import type { PaymentModalDataModel } from '#src/services/utils.tsx';
// import { trpc } from '#src/utils/trpc.js';
// import { EventBookModal } from './-components/event-book-modal.tsx';
// import { EventPaymentModal } from './-components/event-payment-modal.tsx';
// import { EventsGrid } from './-components/events-grid.tsx';

// export const Route = createFileRoute('/$lang/_content/events/plan-b-week')({
//   component: PlanBWeek,
// });

// const EventsMap = lazy(
//   () => import('#src/routes/$lang/_content/events/-components/events-map.tsx'),
// );

// function PlanBWeek() {
//   const { t } = useTranslation();

//   const { session } = useContext(AppContext);
//   const { conversionRate } = useContext(ConversionRateContext);

//   const isLoggedIn = !!session;

//   const queryOpts = {
//     refetchOnMount: false, // 10 minutes
//     refetchOnReconnect: false,
//     refetchOnWindowFocus: false,
//     staleTime: 600_000,
//   };

//   const { data: events, isFetched } = useQuery(
//     trpc.content.getRecentEvents.queryOptions(undefined, queryOpts),
//   );

//   const { data: eventPayments, refetch: refetchEventPayments } = useQuery(
//     trpc.user.events.getEventPayment.queryOptions(undefined, {
//       ...queryOpts,
//       enabled: isLoggedIn,
//     }),
//   );

//   const { data: userEvents, refetch: refetchUserEvents } = useQuery(
//     trpc.user.events.getUserEvents.queryOptions(undefined, {
//       ...queryOpts,
//       enabled: isLoggedIn,
//     }),
//   );

//   const [paymentModalData, setPaymentModalData] =
//     useState<PaymentModalDataModel>({
//       accessType: null,
//       dollarPrice: null,
//       eventId: null,
//       satsPrice: null,
//     });
//   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

//   const payingEvent: JoinedEvent | undefined = events?.find(
//     (e) => e.id === paymentModalData.eventId,
//   );

//   useEffect(() => {
//     if (isLoggedIn) {
//       refetchEventPayments();
//       refetchUserEvents();
//     }
//   }, [isLoggedIn, refetchEventPayments, refetchUserEvents]);

//   const authMode = AuthModalState.SignIn;

//   const {
//     open: openAuthModal,
//     isOpen: isAuthModalOpen,
//     close: closeAuthModal,
//   } = useDisclosure();

//   const filteredEvents = events?.filter((event) =>
//     event.addressLine1?.toLowerCase().includes('lugano'),
//   );

//   return (
//     <PageLayout maxWidth="max-w-full" paddingXClasses="px-0">
//       {paymentModalData.eventId &&
//         paymentModalData.satsPrice &&
//         paymentModalData.dollarPrice &&
//         paymentModalData.accessType &&
//         paymentModalData.satsPrice > 0 &&
//         payingEvent && (
//           <EventPaymentModal
//             eventId={paymentModalData.eventId}
//             event={payingEvent}
//             accessType={paymentModalData.accessType}
//             satsPrice={paymentModalData.satsPrice}
//             dollarPrice={paymentModalData.dollarPrice}
//             isOpen={isPaymentModalOpen}
//             onClose={() => {
//               refetchEventPayments();
//               setPaymentModalData({
//                 accessType: null,
//                 dollarPrice: null,
//                 eventId: null,
//                 satsPrice: null,
//               });
//               setIsPaymentModalOpen(false);
//             }}
//           />
//         )}
//       {paymentModalData.eventId &&
//         paymentModalData.satsPrice === 0 &&
//         paymentModalData.accessType &&
//         payingEvent && (
//           <EventBookModal
//             event={payingEvent}
//             accessType={paymentModalData.accessType}
//             isOpen={isPaymentModalOpen}
//             onClose={() => {
//               setIsPaymentModalOpen(false);
//               refetchEventPayments();
//               refetchUserEvents();
//             }}
//           />
//         )}
//       <div className="max-w-[1440px] w-full flex flex-col gap-6 px-3 pt-2.5 mx-auto md:gap-7 md:px-10">
//         {!isFetched && <Loader size={'s'} />}
//         {filteredEvents && (
//           <>
//             <h1 className="display-small-32px lg:display-large text-white text-center">
//               {t('events.planBWeek.pageTitle')}
//             </h1>
//             <Suspense fallback={<Loader size={'s'} />}>
//               <EventsMap
//                 events={filteredEvents}
//                 eventPayments={eventPayments}
//                 userEvents={userEvents}
//                 conversionRate={conversionRate}
//                 openAuthModal={openAuthModal}
//                 isLoggedIn={isLoggedIn}
//                 setIsPaymentModalOpen={setIsPaymentModalOpen}
//                 setPaymentModalData={setPaymentModalData}
//                 showMap={false}
//                 fixedCalendarDate={'2025-10-22'}
//               />
//             </Suspense>

//             <EventsGrid
//               events={filteredEvents}
//               eventPayments={eventPayments}
//               userEvents={userEvents}
//               conversionRate={conversionRate}
//               openAuthModal={openAuthModal}
//               isLoggedIn={isLoggedIn}
//               setIsPaymentModalOpen={setIsPaymentModalOpen}
//               setPaymentModalData={setPaymentModalData}
//               hideTitle={true}
//             />
//           </>
//         )}
//       </div>
//       {isAuthModalOpen && (
//         <AuthModal
//           isOpen={isAuthModalOpen}
//           onClose={closeAuthModal}
//           initialState={authMode}
//         />
//       )}
//     </PageLayout>
//   );
// }
