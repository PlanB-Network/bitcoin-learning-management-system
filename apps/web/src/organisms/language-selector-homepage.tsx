import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, cn } from '@blms/ui';

import { useSmaller } from '#src/hooks/use-smaller.js';
import Flag from '#src/molecules/Flag/index.js';
import { LangContext } from '#src/providers/app.js';

import { LANGUAGES, LANGUAGES_MAP } from '../utils/i18n.ts';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelectorHomepage = ({
  className,
}: LanguageSelectorProps) => {
  const { i18n } = useTranslation();
  const { setCurrentLanguage } = useContext(LangContext);

  const activeLanguage = i18n.language ?? 'en';
  const isMobile = useSmaller('md');
  const buttonSize = isMobile ? 'flagsMobile' : 'l';

  const changeLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const filteredLanguages = useMemo(() => LANGUAGES.sort(), []);

  return (
    <div
      className={cn(
        'flex flex-wrap gap-[15px] items-center justify-center lg:justify-start max-w-[1164px] mt-8',
        className,
      )}
    >
      {filteredLanguages.map((language) => (
        <Button
          variant="flags"
          size={buttonSize}
          key={language}
          className={cn('flex items-center gap-2.5')}
          onClick={() => changeLanguage(language)}
          aria-label={`Change language to ${
            LANGUAGES_MAP[language.replaceAll('-', '')] || language
          }`}
          disabled={language === activeLanguage}
        >
          <Flag code={language} size="l" />
          <span className="capitalize w-[75px] sm:w-auto lg:w-auto truncate">
            {LANGUAGES_MAP[language.replaceAll('-', '')] || language}
          </span>
        </Button>
      ))}
    </div>
  );
};
