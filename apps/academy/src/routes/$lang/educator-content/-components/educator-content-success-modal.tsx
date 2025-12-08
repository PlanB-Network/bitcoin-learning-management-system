import { Button, Dialog, DialogContent, DialogTitle } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import { TbCircleCheckFilled } from 'react-icons/tb';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EducatorContentSuccessModal = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] min-w-[300px] flex flex-col items-center text-center p-5 gap-5">
        <DialogTitle className="hidden">
          {t('educatorContent.successTitle')}
        </DialogTitle>
        <TbCircleCheckFilled size={60} className="text-green-400 mt-6" />
        <div className="flex flex-col gap-2">
          <h2 className="title-base md:title-large">
            {t('educatorContent.successTitle')}
          </h2>
          <p className="body-small md:label-label">
            {t('educatorContent.successSubtitle')}
          </p>
        </div>
        <Button variant="primary" className="w-full mt-6" onClick={onClose}>
          {t('educatorContent.done')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
