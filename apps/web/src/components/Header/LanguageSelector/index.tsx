import { Popover, Transition } from '@headlessui/react';
import { t } from 'i18next';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { Button, cn } from '@sovereign-university/ui';

import Flag from '../../../atoms/Flag/index.tsx';
import { LANGUAGES, LANGUAGES_MAP } from '../../../utils/i18n.ts';

interface LanguageSelectorProps {
  direction?: 'up' | 'down';
  variant?: 'light' | 'dark' | 'darkOrange';
  className?: string;
}

const variantMap = {
  light: 'text-white bg-white/15',
  dark: 'text-white bg-headerGray',
  darkOrange: 'text-white bg-darkOrange-11',
};

export const LanguageSelector = ({
  direction = 'down',
  variant = 'dark',
  className,
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

  return (
    <Popover className={cn('relative', className)}>
      <Popover.Button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'group z-0 flex place-items-center text-sm font-semibold gap-2 lg:gap-2.5 outline-none px-2.5 py-2 lg:p-4 lg:pr-2.5 rounded-2xl max-lg:w-24 transition-all',
          variantMap[variant],
          open && 'max-lg:rounded-none max-lg:rounded-t-2xl',
        )}
      >
        <Flag code={activeLanguage} />
        <MdKeyboardArrowDown
          size={32}
          className={cn(
            'transition-transform ease-in-out',
            open && 'max-lg:-rotate-180',
          )}
        />
      </Popover.Button>
      <Transition
        show={open}
        as={Fragment}
        enter="transition ease-out duration-300"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-300"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <Popover.Panel
          onMouseLeave={() => setOpen(false)}
          static
          className={cn(
            'flex flex-col items-center justify-center absolute z-20 bg-darkOrange-11 lg:bg-[#25262d] rounded-b-2xl lg:rounded-2xl w-fit lg:w-[440px] py-2.5 lg:px-8 lg:py-6 max-h-96 overflow-y-scroll no-scrollbar',
            direction === 'down'
              ? 'top-9 lg:top-20 right-0'
              : 'bottom-16 left-1/2 -translate-x-1/2',
          )}
        >
          <span className="w-full text-center text-sm text-[#909093] tracking-[1.12px] uppercase mb-6 max-lg:hidden">
            {t('home.languageSection.availableLanguages')}
          </span>
          <div className="flex flex-wrap justify-center w-fit gap-2.5 lg:gap-4">
            {filteredLanguages.map((language) => (
              <button
                key={language}
                className="flex items-center gap-4 lg:px-4 lg:py-2 rounded-md lg:hover:bg-white/10 w-fit lg:w-44"
                onClick={() => changeLanguage(language)}
              >
                <Flag code={language} size="l" />
                <span className="capitalize leading-normal max-lg:hidden">
                  {LANGUAGES_MAP[language] || language}
                </span>
              </button>
            ))}
          </div>
          <a
            href="https://github.com/DecouvreBitcoin/sovereign-university-data"
            target="_blank"
            rel="noopener noreferrer"
            className="max-lg:hidden mt-6 w-full"
          >
            <Button variant="ghost" size="m" onHoverArrow className="w-full">
              {t('home.languageSection.link')}
            </Button>
          </a>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
