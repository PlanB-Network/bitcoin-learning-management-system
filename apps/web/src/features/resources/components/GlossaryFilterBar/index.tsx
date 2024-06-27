import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RxReload } from 'react-icons/rx';

import { Button, cn } from '@sovereign-university/ui';

interface GlossaryFilterBarProps {
  value?: string;
  isOnWordPage?: boolean;
  onChange: (v: string) => void;
}

export const GlossaryFilterBar = ({
  value: initialValue = '',
  isOnWordPage,
  onChange,
}: GlossaryFilterBarProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);

  return (
    <div
      className={cn(
        'w-full flex flex-col items-center text-xs md:text-xs mb-10 max-md:mt-5',
        isOnWordPage ? '' : 'md:mb-12',
      )}
    >
      <div className="w-full flex flex-col items-center md:gap-2">
        {isOnWordPage ? (
          <>
            <label
              className="mb-6 text-white desktop-h5 w-full"
              htmlFor="glossaryInput"
            >
              {t('glossary.keepLooking')}
            </label>
          </>
        ) : (
          <>
            <p className="text-darkOrange-5 text-sm md:text-xl font-medium leading-[171%] md:leading-tight -tracking-[0.77px] md:tracking-normal text-center">
              {t('glossary.needHelp')}
            </p>
            <label
              className="mb-10 text-white text-xl md:text-[40px] leading-[171%] md:leading-[116%] -tracking-[0.77px] text-center font-normal"
              htmlFor="glossaryInput"
            >
              {t('glossary.filterBar')}
            </label>
          </>
        )}
      </div>
      <div className="flex justify-center items-center w-full max-md:flex-wrap gap-2 md:gap-7">
        <input
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onChange(event.target.value);
          }}
          className={cn(
            'w-full mx-auto max-w-96 md:max-w-[498px] border border-darkOrange-5 focus:ring-1 focus:ring-darkOrange-5 rounded-lg bg-[#1C1F28] py-2 pl-4 text-sm md:text-lg text-white placeholder:text-sm md:placeholder:text-lg placeholder:text-white placeholder:opacity-25 ',
            isOnWordPage
              ? ''
              : 'shadow-search-word-sm md:shadow-search-word-md',
          )}
          placeholder={
            isOnWordPage ? t('glossary.anotherWord') : t('glossary.placeHolder')
          }
          id="glossaryInput"
        />
        {isOnWordPage && (
          <Button
            variant="newTertiary"
            size="m"
            iconLeft={<RxReload />}
            className="shrink-0"
          >
            {t('glossary.randomSearch')}
          </Button>
        )}
      </div>
    </div>
  );
};
