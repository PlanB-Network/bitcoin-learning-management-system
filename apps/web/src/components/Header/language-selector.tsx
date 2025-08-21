import { LANGUAGES_MAP } from '@blms/shared';
import { Button, cn, Popover, PopoverContent, PopoverTrigger } from '@blms/ui';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowRightLong } from 'react-icons/fa6';
import { MdKeyboardArrowUp, MdOutlineCheck } from 'react-icons/md';
import { TbLanguage } from 'react-icons/tb';
import { LangContext } from '#src/providers/app.js';
import { router } from '#src/routes/-router.js';
import { LANGUAGES } from '../../utils/i18n.ts';

interface LanguageSelectorProps {
  direction?: 'up' | 'down';
  className?: string;
}

export const LanguageSelector = ({
  direction = 'down',
  className,
}: LanguageSelectorProps) => {
  const { t, i18n } = useTranslation();
  const { setCurrentLanguage } = useContext(LangContext);

  const [open, setOpen] = useState(false);

  const activeLanguage = i18n.language ?? 'en';

  const changeLanguage = (lang: string) => {
    const pathWithoutLang = location.pathname.replace(/^\/[^/]+/, '');
    const newPath = `/${lang}${pathWithoutLang}${location.hash}${location.search}`;
    router.navigate({
      replace: true,
      to: newPath,
    });

    setCurrentLanguage(lang);
    i18n.changeLanguage(lang);

    setTimeout(() => {
      setOpen(false);
    }, 100);
  };

  const sortedLanguages = [...LANGUAGES].sort((a, b) => {
    if (a.toLowerCase() === activeLanguage.toLowerCase()) return -1;
    if (b.toLowerCase() === activeLanguage.toLowerCase()) return 1;

    const nameA = LANGUAGES_MAP[a.toLowerCase().replaceAll('-', '')] || a;
    const nameB = LANGUAGES_MAP[b.toLowerCase().replaceAll('-', '')] || b;
    return nameA.localeCompare(nameB);
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'group z-50 flex place-items-center text-sm font-semibold outline-hidden rounded-2xl transition-all text-newGray-1',
            className,
          )}
        >
          <TbLanguage size={24} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'flex flex-col items-center justify-center absolute z-50 bg-darkOrange-11 rounded-2xl w-[816px] px-8 py-6 max-h-fit overflow-y-scroll no-scrollbar text-darkOrange-10 lg:bg-darkOrange-2',
          direction === 'down'
            ? 'top-7 -right-12'
            : 'bottom-16 left-1/2 -translate-x-1/2',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className={cn(
            'w-full text-center text-sm tracking-[1.12px] uppercase mb-6',
            i18n.dir() === 'rtl' && 'direction-rtl',
          )}
        >
          {t('home.languageSection.availableLanguages')}
        </span>
        <div className="gap-4 grid grid-cols-4">
          {sortedLanguages.map((language) => (
            <button
              key={language}
              type="button"
              className={cn(
                'flex items-center px-4 py-2 rounded-md hover:bg-white/10 w-44',
                i18n.dir() === 'rtl' && 'flex-row-reverse',
                activeLanguage.toLowerCase() === language.toLowerCase() &&
                  'border rounded-lg border-darkOrange-5 dark gap-2 justify-between',
              )}
              onClick={() => changeLanguage(language)}
            >
              <span className="capitalize leading-normal text-left">
                {LANGUAGES_MAP[language.toLowerCase().replaceAll('-', '')] ||
                  language}
              </span>
              {activeLanguage.toLowerCase() === language.toLowerCase() && (
                <MdOutlineCheck size={20} className="text-darkOrange-5" />
              )}
            </button>
          ))}
        </div>
        <a
          href="https://github.com/PlanB-Network/bitcoin-educational-content"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full"
        >
          <Button variant="secondary" size="m" className="w-full !text-primary">
            {t('home.languageSection.link')}
            <FaArrowRightLong
              className={cn(
                'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                'group-hover:ml-3',
              )}
            />
          </Button>
        </a>
      </PopoverContent>
    </Popover>
  );
};

export const LanguageSelectorMobile = () => {
  const { t, i18n } = useTranslation();
  const { setCurrentLanguage } = useContext(LangContext);

  const [open, setOpen] = useState(false);

  const activeLanguage = i18n.language ?? 'en';

  const changeLanguage = (lang: string) => {
    const pathWithoutLang = location.pathname.replace(/^\/[^/]+/, '');
    const newPath = `/${lang}${pathWithoutLang}${location.hash}${location.search}`;
    router.navigate({
      replace: true,
      to: newPath,
    });

    setCurrentLanguage(lang);
    i18n.changeLanguage(lang);

    setTimeout(() => {
      setOpen(false);
    }, 100);
  };

  const sortedLanguages = [...LANGUAGES].sort((a, b) => {
    if (a.toLowerCase() === activeLanguage.toLowerCase()) return 1;
    if (b.toLowerCase() === activeLanguage.toLowerCase()) return -1;

    const nameA = LANGUAGES_MAP[a.toLowerCase().replaceAll('-', '')] || a;
    const nameB = LANGUAGES_MAP[b.toLowerCase().replaceAll('-', '')] || b;
    return nameA.localeCompare(nameB);
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'group flex justify-between items-center gap-4 px-3 py-2.5 outline-hidden rounded-lg mt-auto mx-auto w-[280px] bg-[#f39561] text-darkOrange-11 ',
            open && 'rounded-t-none pt-4',
          )}
        >
          <span
            className={cn(
              'text-lg leading-normal font-medium text-wrap',
              i18n.dir() === 'rtl' && 'text-right',
            )}
          >
            {t('menu.chooseLanguage')}
          </span>
          <MdKeyboardArrowUp
            size={24}
            className={cn(
              'transition-transform ease-in-out shrink-0',
              open && 'rotate-180',
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'flex flex-col absolute z-50 bg-[#f39561] rounded-none !rounded-t-lg w-[280px] overflow-scroll no-scrollbar !shadow-none bottom-13',
          i18n.dir() === 'rtl'
            ? 'right-1/2 translate-x-1/2'
            : 'left-1/2 -translate-x-1/2',
          'gap-5 px-3 pt-4 max-h-[calc(100dvh-84px)]',
        )}
        addAnimation={false}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {sortedLanguages.map((language) => (
          <button
            key={language}
            type="button"
            onClick={() => changeLanguage(language)}
            className={cn('flex items-center gap-4 w-full')}
            aria-label={`Change language to ${
              LANGUAGES_MAP[language.toLowerCase().replaceAll('-', '')] ||
              language
            }`}
          >
            <span
              className={cn(
                'flex capitalize label-medium-med-16px text-darkOrange-11 w-fit',
                activeLanguage.toLowerCase() === language.toLowerCase() &&
                  'border rounded-lg border-darkOrange-5 gap-2 justify-between px-2.5 py-2',
              )}
            >
              {LANGUAGES_MAP[language.toLowerCase().replaceAll('-', '')] ||
                language}
              {activeLanguage.toLowerCase() === language.toLowerCase() && (
                <MdOutlineCheck size={20} className="text-darkOrange-5" />
              )}
            </span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
