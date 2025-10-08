import { LANGUAGES_MAP } from '@blms/shared';
import { Button, cn, Popover, PopoverContent, PopoverTrigger } from '@blms/ui';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowRightLong } from 'react-icons/fa6';
import { TbCheck, TbChevronUp, TbLanguage } from 'react-icons/tb';
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
          <TbLanguage strokeWidth={1.5} size={24} />
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
                <TbCheck size={20} className="text-darkOrange-5" />
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

export const LanguageSelectorMobile = ({
  isMobileMenuOpen,
}: {
  isMobileMenuOpen?: boolean;
}) => {
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

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setOpen(false);
    }
  }, [isMobileMenuOpen]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'group flex justify-between items-center px-3 py-2 outline-hidden w-[287px] mt-auto',
            open && 'pt-2 bg-white rounded-lg rounded-t-none',
          )}
        >
          <div className="flex items-center gap-4">
            <TbLanguage className="text-neutral-500 shrink-0" size={24} />
            <span
              className={cn(
                'body-small-bold',
                i18n.dir() === 'rtl' && 'text-right',
              )}
            >
              {t('words.language')}
            </span>
          </div>
          <TbChevronUp
            size={16}
            className={cn(
              'transition-transform ease-in-out shrink-0',
              open && 'rotate-180',
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        data-popover-content
        className={cn(
          'flex flex-col absolute z-50 w-[287px] overflow-scroll no-scrollbar !shadow-none bottom-10 bg-white rounded-lg rounded-b-none pb-2 max-h-[min(calc(100dvh-84px),488px)]',
          i18n.dir() === 'rtl'
            ? 'right-1/2 translate-x-1/2'
            : 'left-1/2 -translate-x-1/2',
        )}
        addAnimation={false}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {sortedLanguages.map((language) => (
          <button
            key={language}
            type="button"
            onClick={() => changeLanguage(language)}
            className={cn('flex w-full px-4 py-3')}
            aria-label={`Change language to ${
              LANGUAGES_MAP[language.toLowerCase().replaceAll('-', '')] ||
              language
            }`}
          >
            <span
              className={cn(
                'flex body-small text-black w-full justify-between items-center',
                activeLanguage.toLowerCase() === language.toLowerCase() &&
                  'font-semibold',
              )}
            >
              {LANGUAGES_MAP[language.toLowerCase().replaceAll('-', '')] ||
                language}
              {activeLanguage.toLowerCase() === language.toLowerCase() && (
                <TbCheck size={16} className="text-green-500" />
              )}
            </span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
