import type { JoinedEvent } from '@blms/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@blms/ui';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { trpc } from '#src/utils/trpc.js';
import { ModalBookDescription } from './modal-book-description.tsx';
import { ModalBookSuccess } from './modal-book-success.tsx';
import { ModalBookSummary } from './modal-book-summary.tsx';

interface EventBookModalProps {
  event: JoinedEvent;
  accessType: 'physical' | 'online' | 'replay';
  isOpen: boolean;
  onClose: (isPaid?: boolean) => void;
}

export const EventBookModal = ({
  event,
  accessType,
  isOpen,
  onClose,
}: EventBookModalProps) => {
  const { t } = useTranslation();
  const saveUserEventRequest = useMutation(
    trpc.user.events.saveUserEvent.mutationOptions(),
  );
  const [isEventBooked, setIsEventBooked] = useState(false);

  const saveAndDisplaySuccess = useCallback(() => {
    saveUserEventRequest.mutateAsync({
      booked: true,
      eventId: event.id,
      withPhysical: true,
    });
    setIsEventBooked(true);
  }, [event.id, saveUserEventRequest]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        onClose();
        setIsEventBooked(false);
      }}
    >
      <DialogContent className="max-w-4xl p-6 w-[90%] lg:w-full lg:p-0 overflow-auto">
        <DialogTitle className="hidden">Booking Modal</DialogTitle>
        <DialogDescription className="hidden">Booking Modal</DialogDescription>
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-6 lg:gap-0">
          <ModalBookSummary
            event={event}
            accessType={accessType}
            mobileDisplay={false}
          />
          <div className="flex flex-col items-center justify-center lg:m-6">
            {isEventBooked ? (
              <ModalBookSuccess
                accessType={accessType}
                event={event}
                onClose={() => {
                  onClose();
                  setIsEventBooked(false);
                }}
              />
            ) : (
              <ModalBookDescription
                accessType={accessType}
                onBooked={saveAndDisplaySuccess}
                isGdprCompliance={event.isGdprCompliance}
                gdprTerms={event.customTcDisclaimer ?? t('events.tcDisclaimer')}
                description={
                  accessType === 'physical'
                    ? t('events.payment.description_free_physical')
                    : ''
                }
                callout={
                  <Trans
                    i18nKey={`events.payment.callout_book_${accessType}`}
                    components={{
                      highlight: <span className="font-medium" />,
                    }}
                  />
                }
              >
                <ModalBookSummary
                  event={event}
                  accessType={accessType}
                  mobileDisplay={true}
                />
              </ModalBookDescription>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
