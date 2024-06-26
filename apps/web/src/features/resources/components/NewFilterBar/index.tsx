import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  label?: string;
  value?: string;
  onChange: (v: string) => void;
}

export const FilterBar = ({ value: initialValue = '', onChange }: Props) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);

  return (
    <div className="mx-2 w-full items-center justify-between ddd rounded-lg px-4 py-2 text-xs sm:mx-8 sm:w-[40rem] sm:rounded-lg sm:px-6 sm:text-xs">
      <div className="mb-2 mr-3 grow">
        <label className="mb-2 block text-white text-base md:text-2xl justify-center text-center items-center font-normal">
          {t('glossary.filterBar')}
        </label>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <input
            type="text"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              onChange(event.target.value);
            }}
            className="inline-block h-fit w-4/5 ring-1 ring-orange-500 focus:ring-2 max-w-md rounded-lg border-0 bg-[#1C1F28] py-2 pl-4 text-sm text-white placeholder:text-sm placeholder:normal placeholder:text-white placeholder:opacity-50 focus:outline-none sm:max-w-xl sm:text-base shadow-neon"
            placeholder={t('glossary.placeHolder')}
          />
        </div>
      </div>
    </div>
  );
};
