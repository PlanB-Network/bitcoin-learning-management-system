import { Popover, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Flag from '../../../atoms/Flag';
import { compose } from '../../../utils';

const languages = ['fr', 'en', 'es', 'de', 'it'];

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
    setActiveLanguage(languages.includes(i18n.language) ? i18n.language : 'en');
  }, [i18n.language]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setOpen(false);
  };

  const filteredLanguages = languages
    .filter((lng) => lng !== activeLanguage)
    .sort();

  const orderedLanguages =
    direction === 'down'
      ? [activeLanguage, ...filteredLanguages]
      : [...filteredLanguages, activeLanguage];

  return (
    <Popover
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative px-2"
    >
      <Popover.Button className="z-0 flex place-items-center text-sm font-semibold text-gray-100">
        <Flag code={activeLanguage} />
      </Popover.Button>
      <Transition
        show={open}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <Popover.Panel
          static
          className={compose(
            'flex absolute -right-1  z-20 flex-col text-sm bg-white rounded-3xl shadow-lg ring-gray-600/5',
            direction === 'down' ? '-top-3' : '-bottom-3',
          )}
        >
          {orderedLanguages.map((language) => (
            <button
              key={language}
              className="m-3"
              onClick={() => changeLanguage(language)}
            >
              <Flag code={language} />
            </button>
          ))}
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
