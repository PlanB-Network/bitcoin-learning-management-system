import { LANGUAGES_MAP } from '@blms/shared';
import { cn, Flag, Switch } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import { useSmaller } from '#src/hooks/use-smaller.ts';

export const SelectedLanguageSwitcher = ({
  handleSwitchChange,
  showLocalOnly,
}: {
  handleSwitchChange: (checked: boolean) => void;
  showLocalOnly: boolean;
}) => {
  const { t, i18n } = useTranslation();

  return (
    <>
      <div
        className={cn(
          'flex items-center label-strong text-black max-md:hidden gap-2.5',
          !showLocalOnly && 'mb-6',
        )}
      >
        <span>{t('resources.toggleLabelAll')}</span>
        <Switch mode="light" onCheckedChange={handleSwitchChange} />
        <span>{t('resources.toggleLabelSelectedLanguage')}</span>
      </div>

      {showLocalOnly && (
        <LanguageResourcesSectionHeader
          language={i18n.language}
          addMarginTop={false}
        />
      )}
    </>
  );
};

export const LanguageResourcesSectionHeader = ({
  language,
  addMarginTop = true,
}: {
  language: string;
  addMarginTop?: boolean;
}) => {
  const isMobile = useSmaller('md');

  return (
    <div
      className={cn(
        'flex items-center gap-3 pt-2.5 border-t border-t-newGray-4 mb-6',
        addMarginTop ? 'mt-8' : 'mt-2.5',
      )}
    >
      <Flag
        code={language}
        size={isMobile ? 'm' : 'l'}
        className="shrink-0 !rounded-none mb-0.5 md:mb-0"
      />
      <span className="text-black subtitle-base">
        {LANGUAGES_MAP[language] || 'Language'}
      </span>
    </div>
  );
};
