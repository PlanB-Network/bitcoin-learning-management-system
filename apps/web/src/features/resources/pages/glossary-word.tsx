import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AlphabetGlossary } from '../components/AlphabetGlossary/index.tsx';
import { GlossaryFilterBar } from '../components/GlossaryFilterBar/index.tsx';
import { ResourceLayout } from '../layout.tsx';

export const GlossaryWord = () => {
  const { t } = useTranslation();

  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const handleLetterSelection = (letter: string) => {
    setSelectedLetter(letter === selectedLetter ? null : letter);
  };

  return (
    <ResourceLayout
      title={t('glossary.pageTitle')}
      tagLine={t('glossary.pageSubtitle')}
      activeCategory="glossary"
    >
      <div className="flex flex-col items-center justify-center w-full max-w-[620px] mx-auto px-4">
        <h2 className="w-full mobile-h2 md:desktop-h4 uppercase text-darkOrange-5 mb-5">
          TestNet Tempo
        </h2>
        <p className="w-full mobile-body2 md:desktop-body1 text-white">
          Temporary very long definition to test if everything works correctly.
          Temporary very long definition to test if everything works correctly.
          Temporary very long definition to test if everything works correctly.
          Temporary very long definition to test if everything works correctly.
          Temporary very long definition to test if everything works correctly.
          Temporary very long definition to test if everything works correctly.
        </p>
        <div className="w-full h-px bg-newBlack-5 my-6 md:mt-20" />
        <GlossaryFilterBar onChange={() => {}} isOnWordPage />
        <AlphabetGlossary
          onLetterSelect={handleLetterSelection}
          selectedLetter={selectedLetter}
        />
      </div>
    </ResourceLayout>
  );
};
