import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CheckoutData, CouponCode, JoinedEvent } from '@blms/types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@blms/ui';

import { PaymentDescription } from '#src/components/payment-description.js';
import { PaymentQr } from '#src/components/payment-qr.js';
import { trpc } from '#src/utils/trpc.js';

import { ModalPaymentSuccess } from './modal-payment-success.tsx';
import { ModalPaymentSummary } from './modal-payment-summary.tsx';

interface WebSocketMessage {
  status: string;
}

interface EventPaymentModalProps {
  eventId: string;
  event: JoinedEvent;
  accessType: 'physical' | 'online' | 'replay';
  satsPrice: number;
  dollarPrice: number;
  isOpen: boolean;
  onClose: () => void;
}

export const EventPaymentModal = ({
  eventId,
  event,
  accessType,
  satsPrice,
  dollarPrice,
  isOpen,
  onClose,
}: EventPaymentModalProps) => {
  const { t } = useTranslation();

  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const saveEventPaymentRequest = trpc.user.events.saveEventPayment.useMutation(
    {
      onError() {
        setCheckoutError(t('courses.payment.checkoutError'));
      },
    },
  );

  const { data: config } = trpc.auth.config.useQuery();

  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>();
  const [method, setMethod] = useState<'sbp' | 'stripe' | null>(null);
  const [validatedCoupon, setValidatedCoupon] = useState<CouponCode | null>(
    null,
  );
  const [dollarPriceReduced, setDollarsPriceReduced] = useState(dollarPrice);
  const [satsPriceReduced, setSatsPriceReduced] = useState(satsPrice);

  let stripePromise = null;
  if (config) {
    stripePromise = loadStripe(config?.stripePublicKey || '');
  }

  const initEventPayment = useCallback(
    async (method: 'sbp' | 'stripe' | null) => {
      if (method) {
        const serverCheckoutData = await saveEventPaymentRequest.mutateAsync({
          eventId: eventId,
          satsPrice: satsPriceReduced,
          dollarPrice: dollarPriceReduced,
          couponCode: validatedCoupon?.code,
          withPhysical: accessType === 'physical',
          method: method,
        });

        setCheckoutData(serverCheckoutData);
      }

      setMethod(method);
    },
    [
      saveEventPaymentRequest,
      eventId,
      satsPriceReduced,
      dollarPriceReduced,
      validatedCoupon?.code,
      accessType,
    ],
  );

  useEffect(() => {
    setSatsPriceReduced(satsPrice);
  }, [satsPrice]);

  useEffect(() => {
    setDollarsPriceReduced(dollarPrice);
  }, [dollarPrice]);

  useEffect(() => {
    if (checkoutData && isOpen && satsPrice >= 0) {
      const ws = new WebSocket('wss://api.swiss-bitcoin-pay.ch/invoice');

      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ id: checkoutData.id }));
      });

      const handleMessage = (event: MessageEvent) => {
        const message: WebSocketMessage = JSON.parse(
          event.data as string,
        ) as WebSocketMessage;
        if (message.status === 'settled') {
          setIsPaymentSuccess(true);
        }
      };

      ws.addEventListener('message', handleMessage);

      return () => {
        ws.removeEventListener('message', handleMessage);
        ws.close();
      };
    }
  }, [checkoutData, isOpen, satsPrice]);

  function updateCoupon(coupon: CouponCode | null) {
    setValidatedCoupon(coupon);
    if (coupon?.reductionPercentage) {
      setSatsPriceReduced(
        Math.ceil((satsPrice * (100 - coupon.reductionPercentage)) / 100),
      );
      if (dollarPrice) {
        setDollarsPriceReduced(
          Math.ceil((dollarPrice * (100 - coupon.reductionPercentage)) / 100),
        );
      }
    }

    if (!coupon) {
      setSatsPriceReduced(satsPrice);
      setDollarsPriceReduced(dollarPrice);
      setValidatedCoupon(null);
    }
  }
  return (
    <div className="p-4">
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          setCheckoutData(undefined);
          onClose();
        }}
      >
        <DialogContent className="max-h-screen w-[90%] lg:w-full max-w-[1640px] h-[90vh] sm:w-[80vw] lg:p-0 sm:h-[85vh] overflow-auto">
          <DialogTitle className="hidden">Payment Modal</DialogTitle>
          <DialogDescription className="hidden">
            Payment Modal
          </DialogDescription>
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] h-full gap-6 lg:gap-0">
            <ModalPaymentSummary
              event={event}
              accessType={accessType}
              satsPrice={satsPrice}
              mobileDisplay={false}
            />
            <div className="flex flex-col w-full items-center justify-center lg:m-6">
              {checkoutData ? (
                isPaymentSuccess &&
                (satsPriceReduced === 0 || method === 'sbp') ? (
                  <ModalPaymentSuccess
                    event={event}
                    paymentData={checkoutData}
                    accessType={accessType}
                    onClose={onClose}
                  />
                ) : method === 'sbp' ? (
                  <PaymentQr
                    checkoutData={checkoutData}
                    onBack={() => setCheckoutData(undefined)}
                  />
                ) : (
                  <div className="flex flex-col lg:w-full md:w-72">
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{
                        clientSecret: checkoutData.clientSecret,
                      }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                    <div className="self-center">
                      <Button
                        className="mt-4"
                        variant="outline"
                        onClick={() => {
                          setCheckoutData(undefined);
                          onClose();
                        }}
                      >
                        {t('events.payment.back_events')}
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                <PaymentDescription
                  paidPriceDollars={dollarPriceReduced}
                  satsPrice={satsPriceReduced}
                  initPayment={initEventPayment}
                  itemId={event.id}
                  updateCoupon={updateCoupon}
                  event={event}
                  accessType={accessType}
                  checkoutError={checkoutError}
                  description={
                    accessType === 'replay'
                      ? ''
                      : t(`events.payment.description_${accessType}`)
                  }
                  isGdprCompliance={event.isGdprCompliance}
                  gdprTerms={
                    event.customTcDisclaimer ?? t('events.tcDisclaimer')
                  }
                  callout={t(`events.payment.callout_${accessType}`)}
                >
                  <ModalPaymentSummary
                    event={event}
                    accessType={accessType}
                    satsPrice={satsPrice}
                    mobileDisplay={true}
                  />
                </PaymentDescription>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
