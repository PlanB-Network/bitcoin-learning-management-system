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
      className="relative"
    >
      <Popover.Button className="my-4 inline-flex place-items-center text-sm font-semibold leading-6 text-gray-100">
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
          className="absolute flex fixed z-10 px-4 w-screen max-w-max -translate-x-1/2 -translate-y-[3.25rem] left-1/2 top-full"
        >
          <div className="overflow-hidden flex-auto w-screen max-w-max text-sm leading-6 bg-white rounded-3xl ring-1 shadow-lg ring-gray-600/5">
            <div className="flex flex-col">
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
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
