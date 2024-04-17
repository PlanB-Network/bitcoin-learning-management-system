import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineClose } from 'react-icons/ai';

import type { JoinedEvent } from '@sovereign-university/types';

import { Modal } from '#src/atoms/Modal/index.js';

import { ModalBookDescription } from './modal-book-description.tsx';
import { ModalBookSuccess } from './modal-book-success.tsx';
import { ModalBookSummary } from './modal-book-summary.tsx';

interface EventBookModalProps {
  event: JoinedEvent;
  accessType: 'physical' | 'online' | 'replay';
  satsPrice: number;
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

  const [isEventBooked, setIsEventBooked] = useState(false);

  const displaySuccess = useCallback(() => {
    setIsEventBooked(true);
  }, []);

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
        <div className="flex flex-col items-center justify-center lg:pl-6">
          {isEventBooked ? (
            <ModalBookSuccess accessType={accessType} onClose={onClose} />
          ) : (
            <ModalBookDescription
              event={event}
              accessType={accessType}
              onBooked={() => {
                // TODO trigger add booking behavior (free event)
                displaySuccess();
              }}
              description={
                accessType === 'physical'
                  ? t(`events.payment.description_free_physical`)
                  : ''
              }
              callout={t(`events.payment.callout_${accessType}`)}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
