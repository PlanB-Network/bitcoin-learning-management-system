import { isLanguageClickable } from '@blms/shared';
import type { CourseLanguage } from '@blms/types';
import type React from 'react';

interface LanguageSelectorProps {
  languages: CourseLanguage[];
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  languageLabel: string;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  selectedLanguage,
  onLanguageChange,
  languageLabel,
  className = '',
}) => {
  return (
    <div className={className}>
      <span className="text-sm font-medium text-gray-700 mr-3">
        {languageLabel}
      </span>
      <div className="flex flex-wrap gap-2 mt-2">
        {languages.map((lang) => {
          const isClickable = isLanguageClickable(lang.translationStatus);
          const isSelected = lang.code === selectedLanguage;

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => isClickable && onLanguageChange(lang.code)}
              disabled={!isClickable}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                isSelected && isClickable
                  ? 'bg-orange-500 text-white border-orange-500'
                  : isClickable
                    ? 'bg-white text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
            >
              {lang.name || lang.code.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
