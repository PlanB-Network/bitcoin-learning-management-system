import { Popover, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { cn } from '@sovereign-university/ui';

import Flag from '../../../atoms/Flag/index.tsx';
import { LANGUAGES } from '../../../utils/i18n.ts';
import { compose } from '../../../utils/index.ts';

interface LanguageSelectorProps {
  direction?: 'up' | 'down';
}

export const LanguageSelector = ({
  direction = 'down',
}: LanguageSelectorProps) => {
  const { i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(
    i18n.resolvedLanguage ?? 'en',
  );

  useEffect(() => {
    setActiveLanguage(LANGUAGES.includes(i18n.language) ? i18n.language : 'en');
  }, [i18n.language]);

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    setOpen(false);
  };

  const filteredLanguages = LANGUAGES.filter(
    (lng) => lng !== activeLanguage,
  ).sort();

  const orderedLanguages =
    direction === 'down'
      ? [activeLanguage, ...filteredLanguages]
      : [...filteredLanguages, activeLanguage];

  return (
    <Popover
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative"
    >
      <Popover.Button className="group z-0 flex place-items-center text-sm font-semibold text-white gap-1">
        <Flag code={activeLanguage} />
        <MdKeyboardArrowDown
          size={24}
          className={cn(
            'transition-transform ease-in-out',
            open && 'max-lg:-rotate-180',
          )}
        />
      </Popover.Button>
      <Transition
        show={open}
        as={Fragment}
        enter="transition ease-out duration-500"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-550"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <Popover.Panel
          static
          className={compose(
            'flex flex-col items-center justify-center absolute z-20 bg-[#25262d] rounded-2xl w-44 md:w-80 px-8 py-6',
            direction === 'down'
              ? 'top-10 right-0'
              : 'bottom-8 left-1/2 -translate-x-1/2',
          )}
        >
          <span className="w-full text-center text-sm text-[#909093] tracking-[1.12px] uppercase mb-6 max-md:hidden">
            Available languages
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4">
            {orderedLanguages.map((language) => (
              <button
                key={language}
                className="flex items-center gap-4 px-4 py-2 rounded-md hover:bg-white/10"
                onClick={() => changeLanguage(language)}
              >
                <Flag code={language} />
                <span className="uppercase leading-normal">{language}</span>
              </button>
            ))}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
