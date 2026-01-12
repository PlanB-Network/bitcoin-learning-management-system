import { BasicModal, Button } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import AddFilePixel from '#src/assets/icons/pixelated/add-file.svg?react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const GuidelinesModal = ({ isOpen, onClose, onContinue }: Props) => {
  const { t } = useTranslation();

  return (
    <BasicModal
      open={isOpen}
      onOpenChange={onClose}
      title={t('educatorContent.guidelines.title')}
      contentClassName="max-w-[670px]"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <AddFilePixel className="h-20" />

        <p className="title-medium max-w-[400px]">
          {t('educatorContent.guidelines.subtitle')}
        </p>

        <ol className="text-left label-18px w-full py-4">
          <li>
            <span className="font-medium">1. </span>
            {t('educatorContent.guidelines.point1')}
          </li>
          <li>
            <span className="font-medium">2. </span>
            {t('educatorContent.guidelines.point2')}
          </li>
          <li>
            <span className="font-medium">3. </span>
            {t('educatorContent.guidelines.point3')}
          </li>
        </ol>

        <div className="flex flex-col w-full gap-4">
          <Button variant="tertiary" className="w-full" size={'l'}>
            {t('educatorContent.guidelines.readFullGuide')}
          </Button>

          <Button
            variant="primary"
            className="w-full"
            size={'l'}
            onClick={onContinue}
          >
            {t('educatorContent.guidelines.continueToAdd')}
          </Button>
        </div>
      </div>
    </BasicModal>
  );
};
