import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl items-center md:mt-14 my-8 px-8">
      {label && (
        <label className="mb-2 block text-white sm:mb-2" htmlFor="filterBar">
          {label}
        </label>
      )}

      <input
        type="text"
        value={value}
        id="filterBar"
        onChange={(event) => {
          setValue(event.target.value);
          onChange(event.target.value);
        }}
        placeholder={t('resources.searchFilterName')}
        className="text-white h-11 w-full rounded-full bg-neutral-900 px-5 body-14px placeholder:text-neutral-400 focus:outline-hidden shadow-filter-bar border border-orange-500"
      />
    </div>
  );
};
