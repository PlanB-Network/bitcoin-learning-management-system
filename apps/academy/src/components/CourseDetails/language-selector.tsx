import type { CourseLanguage } from '@blms/types';
import { Button } from '@blms/ui';
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
      <span className="text-sm font-medium text-neutral-700 mr-3">
        {languageLabel}
      </span>
      <div className="flex flex-wrap gap-2 mt-2">
        {languages.map((lang) => {
          const isSelected = lang.code === selectedLanguage;
          const isDisabled = ['todo', 'in_progress'].includes(
            lang.translationStatus,
          );

          // Determine button variant based on status
          let variant: 'primary' | 'outline' | 'ghost' = 'outline';
          if (['todo', 'in_progress'].includes(lang.translationStatus)) {
            variant = 'ghost'; // Grayed out and non-clickable
          } else if (
            ['ready_for_review', 'under_review', 'reviewed'].includes(
              lang.translationStatus,
            )
          ) {
            variant = isSelected ? 'primary' : 'outline'; // Orange and clickable
          }

          return (
            <Button
              key={lang.code}
              variant={variant}
              size="s"
              onClick={() => {
                if (!isDisabled) {
                  onLanguageChange(lang.code);
                }
              }}
              disabled={isDisabled}
              className="capitalize"
              style={isDisabled ? { pointerEvents: 'none', opacity: 0.5 } : {}}
            >
              {lang.name || lang.code.toUpperCase()}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
