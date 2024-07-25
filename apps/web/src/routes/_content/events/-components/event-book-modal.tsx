import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineClose } from 'react-icons/ai';

import type { JoinedEvent } from '@blms/types';

import { Modal } from '#src/atoms/Modal/index.js';
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

  const saveUserEventRequest = trpc.user.events.saveUserEvent.useMutation();

  const [isEventBooked, setIsEventBooked] = useState(false);

  const saveAndDisplaySuccess = useCallback(() => {
    saveUserEventRequest.mutateAsync({
      eventId: event.id,
      booked: true,
      withPhysical: true,
    });
    setIsEventBooked(true);
  }, [event.id, saveUserEventRequest]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isLargeModal>
      <button
        className="absolute right-4 top-2.5 lg:top-5 lg:right-5"
        aria-roledescription="Close Payment Modal"
        onClick={() => onClose()}
      >
        <AiOutlineClose />
      </button>
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
              onBooked={() => {
                saveAndDisplaySuccess();
              }}
              description={
                accessType === 'physical'
                  ? t(`events.payment.description_free_physical`)
                  : ''
              }
              callout={t(`events.payment.callout_${accessType}`)}
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
    </Modal>
  );
};
