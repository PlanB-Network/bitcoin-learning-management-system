import { Button, Dialog, DialogContent, DialogTitle } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import ThumbUpIcon from '#src/assets/icons/thumb-up-pixelated.svg?react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EducatorContentSuccessModal = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] flex flex-col items-center text-center p-8 gap-6">
        <DialogTitle className="sr-only">
          {t('educatorContent.successTitle')}
        </DialogTitle>

        <ThumbUpIcon className="w-20 h-20 text-orange-500" />

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-gray-900">
            {t('educatorContent.successTitle')}
          </h2>
          <p className="text-sm text-gray-500">
            {t('educatorContent.successSubtitle')}
          </p>
        </div>

        <Button variant="primary" className="w-full" onClick={onClose}>
          {t('words.done')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
