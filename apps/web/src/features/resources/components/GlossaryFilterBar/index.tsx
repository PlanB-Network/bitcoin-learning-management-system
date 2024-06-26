import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface GlossaryFilterBarProps {
  label?: string;
  value?: string;
  onChange: (v: string) => void;
}

export const GlossaryFilterBar = ({
  value: initialValue = '',
  onChange,
}: GlossaryFilterBarProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);

  return (
    <div className="w-full flex flex-col items-center rounded-lg text-xs md:text-xs mb-10 md:mb-12">
      <div className="w-full flex flex-col items-center">
        <label
          className="mb-10 text-white text-xl md:text-[40px] leading-[171%] md:leading-[116%] text-center font-normal"
          htmlFor="glossaryInput"
        >
          {t('glossary.filterBar')}
        </label>
      </div>
      <div className="flex justify-center w-full">
        <input
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onChange(event.target.value);
          }}
          className="w-full max-w-[498px] border border-darkOrange-5 focus:ring-1 focus:ring-darkOrange-5 rounded-lg bg-[#1C1F28] py-2 pl-4 text-sm text-white placeholder:text-sm placeholder:normal placeholder:text-white placeholder:opacity-50 md:text-base"
          placeholder={t('glossary.placeHolder')}
          id="glossaryInput"
        />
      </div>
    </div>
  );
};
