import { t } from 'i18next';
import { useState } from 'react';

interface Props {
  label?: string;
  value?: string;
  onChange: (v: string) => void;
}

export const FilterBar = ({
  label,
  value: initialValue = '',
  onChange,
}: Props) => {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl items-center md:mt-14 my-8 px-8">
      {label && (
        <label className="mb-2 block text-white sm:mb-2">{label}</label>
      )}

      <input
        type="text"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onChange(event.target.value);
        }}
        placeholder={t('resources.searchFilterName')}
        className="h-11 w-full rounded-full bg-newBlack-2 px-5 body-14px placeholder:text-newGray-2 focus:outline-none shadow-filter-bar border border-darkOrange-5"
      />
    </div>
  );
};
