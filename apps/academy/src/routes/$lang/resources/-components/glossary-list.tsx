import type { JoinedGlossaryWord } from '@blms/types';
import { Button } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { TbChevronsDown } from 'react-icons/tb';
import { normalizeString } from '#src/utils/string.js';

interface GlossaryListProps {
  glossaryTerms: JoinedGlossaryWord[];
  selectedLetter: string | null;
  searchTerm: string;
}

export const GlossaryList = ({
  glossaryTerms,
  selectedLetter,
  searchTerm,
}: GlossaryListProps) => {
  const [filteredTerms, setFilteredTerms] =
    useState<JoinedGlossaryWord[]>(glossaryTerms);

  const [maxWords, setMaxWords] = useState(20);

  useEffect(() => {
    setFilteredTerms(
      selectedLetter
        ? glossaryTerms
            .filter((term) =>
              normalizeString(term.term).startsWith(
                selectedLetter.toLowerCase(),
              ),
            )
            .filter((term) =>
              term.term.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .sort((a, b) => a.term.localeCompare(b.term))
        : glossaryTerms
            .filter((term) =>
              term.term.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .sort((a, b) => a.term.localeCompare(b.term)),
    );
    setMaxWords(20);
  }, [selectedLetter, searchTerm, glossaryTerms]);

  return (
    <div className="flex flex-col w-full mt-6 sm:mt-8">
      {/* Desktop */}
      <section className="flex flex-col w-full gap-6 max-sm:hidden">
        <div className="flex w-full gap-6">
          <span className="w-1/4 text-black body-base-bold">
            {t('glossary.term')}
          </span>
          <span className="w-3/4 text-black body-base-bold">
            {t('glossary.definition')}
          </span>
        </div>
        {filteredTerms.slice(0, maxWords).map((term) => (
          <div key={term.originalWord} className="flex flex-col gap-6">
            <div className="flex w-full gap-5">
              <Link
                to="/resources/glossary/$wordId"
                params={{ wordId: term.fileName }}
                className="w-1/4 text-orange-500 underline underline-offset-4 capitalize label-strong"
              >
                {term.term}
              </Link>
              <p className="w-3/4 text-neutral-800 line-clamp-5 text-justify body-large">
                {term.definition}
              </p>
            </div>
            <div className="w-full h-px bg-neutral-100" />
          </div>
        ))}
      </section>

      {/* Mobile */}
      <section className="flex flex-col gap-2 w-full sm:hidden">
        {filteredTerms.slice(0, maxWords).map((term) => (
          <div key={term.originalWord} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 w-full">
              <Link
                to="/resources/glossary/$wordId"
                params={{ wordId: term.fileName }}
                className="w-full text-orange-500 underline underline-offset-4 capitalize label-strong"
              >
                {term.term}
              </Link>
              <p className="w-full text-neutral-800 line-clamp-5 text-justify body-large">
                {term.definition}
              </p>
            </div>
            <div className="w-full h-px bg-neutral-100" />
          </div>
        ))}
      </section>

      {filteredTerms.length > maxWords && (
        <Button
          variant="newTertiary"
          size="xl"
          className="mx-auto mt-5 sm:mt-10 flex items-center gap-4"
          onClick={() => setMaxWords((v) => v + 20)}
        >
          {t('glossary.showMoreWords')}
          <TbChevronsDown size={24} />
        </Button>
      )}
    </div>
  );
};
