import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect, useState } from 'react';

import type { JoinedGlossaryWord } from '@sovereign-university/types';
import { Button } from '@sovereign-university/ui';

import { normalizeString } from '#src/utils/string.js';

interface GlossaryListProps {
  glossaryTerms: JoinedGlossaryWord[];
  selectedLetter: string | null;
}

export const GlossaryList = ({
  glossaryTerms,
  selectedLetter,
}: GlossaryListProps) => {
  const [filteredTerms, setFilteredTerms] =
    useState<JoinedGlossaryWord[]>(glossaryTerms);

  const [maxWords, setMaxWords] = useState(10);

  useEffect(() => {
    setFilteredTerms(
      selectedLetter
        ? glossaryTerms.filter((term) =>
            normalizeString(term.term).startsWith(selectedLetter.toLowerCase()),
          )
        : glossaryTerms,
    );
    setMaxWords(10);
  }, [selectedLetter, glossaryTerms]);

  return (
    <div className="flex flex-col mx-auto md:mt-20 w-full">
      {/* Desktop */}
      <section className="flex flex-col w-full gap-6 max-md:hidden">
        <div className="flex max-w-[820px] w-full gap-5 mx-auto px-4">
          <span className="w-1/3 text-white desktop-caption1 uppercase">
            {t('glossary.term')}
          </span>
          <span className="w-2/3 text-white desktop-caption1 uppercase">
            {t('glossary.definition')}
          </span>
        </div>
        <div className="w-full h-px bg-newBlack-3" />
        {filteredTerms.slice(0, maxWords).map((term) => (
          <>
            <div className="flex items-center max-w-[820px] w-full gap-5 mx-auto px-4">
              <Link
                to="/resources/glossary/$wordId"
                params={{ wordId: term.path }}
                className="w-1/3 text-darkOrange-5 desktop-h7 underline underline-offset-4 capitalize"
              >
                {term.term}
              </Link>
              <p className="w-2/3 text-white leading-[175%] tracking-015px line-clamp-4">
                {term.definition}
              </p>
            </div>
            <div className="w-full h-px bg-newBlack-3" />
          </>
        ))}
      </section>

      {/* Mobile */}
      <section className="flex flex-col gap-5 w-full md:hidden">
        {filteredTerms.slice(0, maxWords).map((term) => (
          <>
            <div className="flex flex-col w-full gap-2">
              <Link
                to="/resources/glossary/$wordId"
                params={{ wordId: term.path }}
                className="text-darkOrange-5 text-lg font-medium leading-relaxed tracking-015px underline underline-offset-4 capitalize"
              >
                {term.term}
              </Link>
              <p className="text-white text-sm leading-snug tracking-015px text-justify line-clamp-4">
                {term.definition}
              </p>
            </div>
            <div className="w-11/12 h-px bg-newBlack-3 mx-auto" />
          </>
        ))}
      </section>

      {filteredTerms.length > maxWords && (
        <Button
          variant="newSecondary"
          size="m"
          className="mx-auto mt-5"
          onClick={() => setMaxWords((v) => v + 10)}
        >
          {t('glossary.loadMoreWords')}
        </Button>
      )}
    </div>
  );
};
