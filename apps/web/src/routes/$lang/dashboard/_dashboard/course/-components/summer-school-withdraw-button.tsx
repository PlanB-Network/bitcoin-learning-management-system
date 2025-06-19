import { BasicModal, Button, DialogClose } from '@blms/ui';

import { useSmaller } from '#src/hooks/use-smaller.js';

interface ModalProps {
  onConfirm: () => void;
}

export const SummerSchoolWithdrawButton = ({ onConfirm }: ModalProps) => {
  const isMobile = useSmaller('md');

  return (
    <BasicModal
      trigger={
        <Button variant={'outline'} className="max-md:w-full">
          No, I can't join
        </Button>
      }
      title={'Are you sure to want to withdraw?'}
      content={
        <div className="flex flex-col gap-4 text-left">
          <p>
            We're sorry to hear you might not join the'Lugano Summer School.
          </p>
          <p>
            If you're facing financial or logistical challenges, we would love
            to see if we can help. Feel free to reach out — we might be able to
            make things easier.
          </p>
          <p>
            If you're sure about withdrawing, we understand and hope to welcome
            you at a future Plan ₿ Network event.
          </p>
        </div>
      }
      showLogo={true}
    >
      <div className="!flex gap-4 md:!gap-[30px]">
        <DialogClose asChild>
          <Button
            variant="primary"
            size={isMobile ? 's' : 'l'}
            onClick={() => {
              window.open(
                'https://t.me/asi0_flammeus',
                '_blank',
                'noopener,noreferrer',
              );
            }}
          >
            Contact manager
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="outline"
            size={isMobile ? 's' : 'l'}
            className="w-fit"
            onClick={onConfirm}
          >
            Confirm withdrawal
          </Button>
        </DialogClose>
      </div>
    </BasicModal>
  );
};
