import { useTranslation } from 'react-i18next';
import { getLanguageName } from '#src/utils/i18n.js';

interface TranslationLanguageHeaderProps {
  originalLanguage: string;
  targetLanguage: string;
  /** Optional right component to display (e.g., compare button) */
  rightComponent?: React.ReactNode;
}

export function TranslationLanguageHeader({
  originalLanguage,
  targetLanguage,
  rightComponent,
}: TranslationLanguageHeaderProps) {
  const { t } = useTranslation();

  const originalLanguageName = getLanguageName(originalLanguage);
  const targetLanguageName = getLanguageName(targetLanguage);

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-[10px]">
        <span
          className="text-base sm:text-mg md:text-m font-semibold text-gray-900"
          style={{ fontFamily: 'Rubik, sans-serif' }}
        >
          {t('translate.language', { defaultValue: 'Language' })}
        </span>
        <span
          className="text-orange-500 text-base sm:text-mg md:text-m"
          style={{ fontFamily: 'Rubik, sans-serif' }}
        >
          {originalLanguageName}
        </span>
        <span className="text-gray-400">⇄</span>
        <span
          className="text-base sm:text-mg md:text-m font-semibold text-gray-900"
          style={{ fontFamily: 'Rubik, sans-serif' }}
        >
          {t('translate.translateTo', { defaultValue: 'Translate to' })}
        </span>
        <span
          className="text-orange-500 text-base sm:text-mg md:text-l"
          style={{ fontFamily: 'Rubik, sans-serif' }}
        >
          {targetLanguageName}
        </span>
      </div>
      {rightComponent && <div>{rightComponent}</div>}
    </div>
  );
}
