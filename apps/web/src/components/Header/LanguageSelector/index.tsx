import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdKeyboardArrowDown } from 'react-icons/md';

import { Button, Popover, PopoverContent, PopoverTrigger, cn } from '@blms/ui';

import Flag from '#src/molecules/Flag/index.js';
import { LangContext } from '#src/providers/app.js';

import { LANGUAGES, LANGUAGES_MAP } from '../../../utils/i18n.ts';

interface LanguageSelectorProps {
  direction?: 'up' | 'down';
  variant?: 'light' | 'dark' | 'darkOrange';
  className?: string;
}

const variantHeaderBackgroundMap = {
  light: 'text-white bg-darkOrange-4',
  dark: 'text-white bg-newBlack-3',
  darkOrange: 'text-white bg-darkOrange-11',
};

const variantSelectorMap = {
  light: 'text-darkOrange-10 lg:bg-darkOrange-4',
  dark: 'text-white lg:bg-newBlack-3',
  darkOrange: 'text-[#909093] lg:bg-[#25262d]',
};

export const LanguageSelector = ({
  direction = 'down',
  variant = 'dark',
  className,
}: LanguageSelectorProps) => {
  const { t, i18n } = useTranslation();
  const { setCurrentLanguage } = useContext(LangContext);

  const [open, setOpen] = useState(false);

  const activeLanguage = i18n.language ?? 'en';

  const changeLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    i18n.changeLanguage(lang);
    setTimeout(() => {
      setOpen(false);
    }, 100);
  };

  const filteredLanguages = LANGUAGES.filter(
    (lng) => lng !== activeLanguage,
  ).sort();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'group z-50 flex place-items-center text-sm font-semibold gap-2 lg:gap-2.5 outline-none px-2.5 py-2 lg:pl-4 lg:pr-2.5 rounded-2xl max-lg:w-24 transition-all',
            variantHeaderBackgroundMap[variant],
            open && 'max-lg:rounded-none max-lg:rounded-t-2xl',
            className,
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
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'flex flex-col items-center max-lg:w-24 justify-center absolute z-50 bg-darkOrange-11 rounded-b-2xl lg:rounded-2xl w-fit lg:w-[440px] py-2.5 lg:px-8 lg:py-6 max-h-fit overflow-y-scroll no-scrollbar',
          direction === 'down'
            ? '-top-1 lg:top-7 -right-12 lg:-right-[50px]'
            : 'bottom-16 left-1/2 -translate-x-1/2',
          variantSelectorMap[variant],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="w-full text-center text-sm tracking-[1.12px] uppercase mb-6 max-lg:hidden">
          {t('home.languageSection.availableLanguages')}
        </span>
        <div className="flex flex-wrap justify-center max-lg:w-24 gap-2 lg:gap-4">
          {filteredLanguages.map((language) => (
            <button
              key={language}
              className="flex items-center gap-4 lg:px-4 lg:py-2 rounded-md lg:hover:bg-white/10 w-fit lg:w-44"
              onClick={() => changeLanguage(language)}
            >
              <Flag code={language} size="l" />
              <span className="capitalize leading-normal max-lg:hidden">
                {LANGUAGES_MAP[language.replaceAll('-', '')] || language}
              </span>
            </button>
          ))}
        </div>
        <a
          href="https://github.com/PlanB-Network/bitcoin-educational-content"
          target="_blank"
          rel="noopener noreferrer"
          className="max-lg:hidden mt-6 w-full"
        >
          <Button
            variant={variant === 'light' ? 'newPrimary' : 'ghost'}
            mode={variant === 'light' ? 'colored' : 'dark'}
            size="m"
            onHoverArrow
            className="w-full"
          >
            {t('home.languageSection.link')}
          </Button>
        </a>
      </PopoverContent>
    </Popover>
  );
};
