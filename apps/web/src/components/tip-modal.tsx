import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { AiOutlineCopy } from 'react-icons/ai';

import BitcoinCircleGray from '../assets/icons/bitcoin_circle_gray.svg?react';
import LightningOrange from '../assets/icons/lightning_orange.svg?react';
import PaynimRobotGray from '../assets/icons/paynym_robot_gray.svg?react';
import RabbitWithPresent from '../assets/rabbit_with_present.svg?react';
import { Modal } from '../atoms/Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lightningAddress: string;
  userName: string;
}

const { useSmaller } = BreakPointHooks(breakpointsTailwind);

export const TipModal = ({
  isOpen,
  onClose,
  lightningAddress,
  userName,
}: LoginModalProps) => {
  const { t } = useTranslation();
  const isMobile = useSmaller('md');

  return (
    <Modal closeButtonEnabled={isMobile} isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center gap-3 px-8 pb-1  sm:gap-6 sm:p-0">
        <RabbitWithPresent />
        <p className="text-xs font-light italic text-blue-800 md:text-xl">
          {userName
            ? t('professors.tips.thanks', { name: userName })
            : t('professors.tips.thanksNoName')}
        </p>
        <div className="flex w-full flex-row items-center justify-evenly">
          <BitcoinCircleGray height={'2rem'} width={'auto'} />
          <span className="text-2xl text-gray-300">{`<`}</span>
          <LightningOrange height={'3rem'} width={'auto'} />
          <span className="text-2xl text-gray-300">{`>`}</span>
          <PaynimRobotGray height={'2rem'} width={'auto'} />
        </div>

        {lightningAddress ? (
          <>
            <QRCodeSVG value={lightningAddress} size={isMobile ? 150 : 220} />
            <div className="relative w-full rounded-md shadow-sm">
              <input
                disabled
                className="w-full bg-gray-200 p-2 pr-12 text-xs font-semibold text-blue-800 sm:text-base"
                value={lightningAddress}
                type="text"
              ></input>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <AiOutlineCopy
                  className="text-blue-1000 h-7 w-auto cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(lightningAddress);
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-xs font-light text-blue-800 md:text-base">
            {t('professors.tips.noTipsYet')}
          </p>
        )}
      </div>
    </Modal>
  );
};
