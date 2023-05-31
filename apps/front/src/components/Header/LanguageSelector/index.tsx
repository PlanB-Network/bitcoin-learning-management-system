import { Popover, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Flag from '../../../atoms/Flag';

export const LanguageSelector = () => {
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const languages = ['fr', 'en', 'es', 'de', 'it'];

  return (
    <Popover
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative px-2"
    >
      <Popover.Button className="flex place-items-center z-0 text-sm font-semibold text-gray-100">
        <Flag code={i18n.language} />
      </Popover.Button>
      <Transition
        show={open}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel
          static
          className="absolute z-20 -top-3 -right-1 flex flex-col text-sm bg-white rounded-3xl shadow-lg ring-gray-600/5"
        >
          {[
            i18n.language,
            ...languages.filter((lng) => lng !== i18n.language).sort(),
          ].map((language) => (
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
