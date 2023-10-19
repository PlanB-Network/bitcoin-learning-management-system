import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useTranslation } from 'react-i18next';

import { Modal } from '../atoms/Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lightningAddress: string;
}

const { useSmaller } = BreakPointHooks(breakpointsTailwind);

export const TipModal = ({
  isOpen,
  onClose,
  lightningAddress,
}: LoginModalProps) => {
  const { t } = useTranslation();
  const isMobile = useSmaller('md');

  return (
    <Modal closeButtonEnabled={isMobile} isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center">
        <p>TIPS MODAL</p>
        {lightningAddress && <p>ADDRESS {lightningAddress} </p>}
        <p>---</p>
        <p>---</p>
        <p>---</p>
        <p>---</p>
        <p>---</p>
      </div>
    </Modal>
  );
};
