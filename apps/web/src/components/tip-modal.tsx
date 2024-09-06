import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { AiOutlineCopy } from 'react-icons/ai';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@blms/ui';

import { useSmaller } from '#src/hooks/use-smaller.js';

import BitcoinCircleGray from '../assets/icons/bitcoin_circle_gray.svg';
import LightningOrange from '../assets/icons/lightning_orange.svg';
import PaynimRobotGray from '../assets/icons/paynym_robot_gray.svg';
import RabbitWithPresent from '../assets/icons/rabbit_with_present.svg';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lightningAddress: string;
  userName: string | undefined;
}

export const TipModal = ({
  isOpen,
  onClose,
  lightningAddress,
  userName,
}: LoginModalProps) => {
  const { t } = useTranslation();
  const isMobile = useSmaller('md');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={isMobile ? isMobile : false}
        className="flex flex-col items-center gap-3 py-2 px-4 sm:gap-6 sm:p-6"
      >
        <DialogTitle className="hidden">
          {t('professors.tips.thanksNoName')}
        </DialogTitle>
        <DialogDescription className="hidden">
          {t('professors.tips.thanksNoName')}
        </DialogDescription>
        <img src={RabbitWithPresent} alt="" className="" />
        <p className="text-xs font-light italic text-blue-800 md:text-xl">
          {userName
            ? t('professors.tips.thanks', { name: userName })
            : t('professors.tips.thanksNoName')}
        </p>
        <div className="flex w-full flex-row items-center justify-evenly">
          <img src={BitcoinCircleGray} alt="" className="h-8 w-auto" />
          <span className="text-2xl text-gray-300">{`<`}</span>
          <img src={LightningOrange} alt="" className="h-12 w-auto" />
          <span className="text-2xl text-gray-300">{`>`}</span>
          <img src={PaynimRobotGray} alt="" className="h-8 w-auto" />
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
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <AiOutlineCopy
                  className="text-blue-1000 h-7 w-auto cursor-pointer"
                  onClick={async () => {
                    await navigator.clipboard.writeText(lightningAddress);
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
      </DialogContent>
    </Dialog>
  );
};
