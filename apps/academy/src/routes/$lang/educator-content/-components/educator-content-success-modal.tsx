import { BasicModal, Button } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import CheckPixel from '#src/assets/icons/pixelated/check_orange.svg?react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EducatorContentSuccessModal = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <BasicModal open={isOpen} onOpenChange={onClose}>
      <CheckPixel className="size-15" />

      <div className="flex flex-col gap-2">
        <h2 className="title-base md:title-large -mt-4">
          {t('educatorContent.successTitle')}
        </h2>
        <p className="body-small md:label-label">
          {t('educatorContent.successSubtitle')}
        </p>
      </div>
      <Button variant="primary" className="w-full" onClick={onClose}>
        {t('educatorContent.done')}
      </Button>
    </BasicModal>
  );
};
