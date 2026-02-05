import { BasicModal, Button, Checkbox, DividerSimple } from '@blms/ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbCopy, TbCopyCheck, TbDownload } from 'react-icons/tb';

import { useSmaller } from '#src/hooks/use-smaller.ts';

export type CalenderEventType = 'class' | 'event' | 'history';

interface CalendarDownloadModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onDownload: (filters: CalenderEventType[]) => void;
  // biome-ignore lint/suspicious/noConfusingVoidType: ok
  onSubscribe: (filters: CalenderEventType[]) => Promise<boolean | void>;
  filters: CalenderEventType[];
  setFilters: React.Dispatch<React.SetStateAction<CalenderEventType[]>>;
  eventTypes: CalenderEventType[];
  showFilters?: boolean;
}

export const CalendarDownloadModal = ({
  isOpen,
  onClose,
  onDownload,
  onSubscribe,
  filters,
  setFilters,
  eventTypes,
  showFilters = true,
}: CalendarDownloadModalProps) => {
  const isMobile = useSmaller('md');

  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const handleSubscribe = async () => {
    const success = await onSubscribe(filters);
    if (success !== false) {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  const toggleFilter = useCallback(
    (filterName: CalenderEventType) => {
      setFilters((prev) =>
        prev.includes(filterName)
          ? prev.filter((p) => p !== filterName)
          : [...prev, filterName],
      );
    },
    [setFilters],
  );

  return (
    <BasicModal
      open={isOpen}
      onOpenChange={onClose}
      title={t('dashboard.calendar.downloadCalendarTitle')}
    >
      <div className="w-full flex flex-col gap-6 text-left">
        {showFilters && (
          <div className="flex flex-col gap-3">
            <h3 className="label-strong">
              {t('dashboard.calendar.followSelectedCalendar')}
            </h3>
            <div className="flex items-center flex-wrap gap-6">
              {eventTypes.map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`checkbox-${type}`}
                    checked={filters.includes(type)}
                    onCheckedChange={() => toggleFilter(type)}
                  />
                  <label
                    htmlFor={`checkbox-${type}`}
                    className="body-large cursor-pointer"
                  >
                    {t(`dashboard.calendar.eventType.${type}`)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h3 className="label-strong">
            {t('dashboard.calendar.subscribeTitle')}
          </h3>
          <ul className="body-base list-disc list-inside">
            <li>{t('dashboard.calendar.subscribeStep1')}</li>
            <li>{t('dashboard.calendar.subscribeStep2')}</li>
            <li>{t('dashboard.calendar.subscribeStep3')}</li>
          </ul>
        </div>

        <Button
          variant="primary"
          size={isMobile ? 'm' : 'l'}
          onClick={handleSubscribe}
          className="w-full gap-2"
        >
          {t('dashboard.calendar.subscribeButton')}
          {isCopied ? <TbCopyCheck size={24} /> : <TbCopy size={24} />}
        </Button>

        <DividerSimple />

        <div className="flex flex-col gap-3">
          <h3 className="label-strong">
            {t('dashboard.calendar.downloadTitle')}
          </h3>
          <ul className="body-base list-disc list-inside">
            <li>{t('dashboard.calendar.downloadStep1')}</li>
            <li>{t('dashboard.calendar.downloadStep2')}</li>
            <li>{t('dashboard.calendar.downloadStep3')}</li>
          </ul>
        </div>

        <Button
          variant="newTertiary"
          size={isMobile ? 'm' : 'l'}
          onClick={() => onDownload(filters)}
          className="w-full gap-2"
        >
          {t('dashboard.calendar.downloadButton')}
          <TbDownload size={24} />
        </Button>
      </div>
    </BasicModal>
  );
};
