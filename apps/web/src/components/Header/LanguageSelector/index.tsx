import { Popover, Transition } from '@headlessui/react';
import { t } from 'i18next';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { Button, cn } from '@sovereign-university/ui';

import Flag from '../../../atoms/Flag/index.tsx';
import { LANGUAGES, LANGUAGES_MAP } from '../../../utils/i18n.ts';
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
    <Popover className="relative">
      <Popover.Button
        onClick={() => setOpen((v) => !v)}
        className="group z-0 flex place-items-center text-sm font-semibold text-white gap-1 outline-none p-4 bg-headerGray rounded-md"
      >
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
        leave="transition ease-in duration-500"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <Popover.Panel
          onMouseLeave={() => setOpen(false)}
          static
          className={compose(
            'flex flex-col items-center justify-center absolute z-20 bg-[#25262d] rounded-2xl w-44 md:w-[440px] px-8 py-6 max-h-96 overflow-y-scroll no-scrollbar',
            direction === 'down'
              ? 'top-20 right-0'
              : 'bottom-16 left-1/2 -translate-x-1/2',
          )}
        >
          <span className="w-full text-center text-sm text-[#909093] tracking-[1.12px] uppercase mb-6 max-md:hidden">
            {t('home.languageSection.availableLanguages')}
          </span>
          <div className="flex flex-wrap w-fit gap-4">
            {orderedLanguages.map((language) => (
              <button
                key={language}
                className="flex items-center gap-4 px-4 py-2 rounded-md hover:bg-white/10 w-44"
                onClick={() => changeLanguage(language)}
              >
                <Flag code={language} />
                <span className="capitalize leading-normal">
                  {LANGUAGES_MAP[language] || language}
                </span>
              </button>
            ))}
          </div>
          <a
            href="https://github.com/DecouvreBitcoin/sovereign-university-data"
            target="_blank"
            rel="noopener noreferrer"
            className="max-md:hidden mt-6 w-full"
          >
            <Button
              variant="newSecondary"
              size="l"
              onHoverArrow
              className="w-full"
            >
              {t('home.languageSection.link')}
            </Button>
          </a>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
