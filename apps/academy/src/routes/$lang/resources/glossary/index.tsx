import { ResourceType } from '@blms/constants';
import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { SearchInput } from '#src/components/search-input.tsx';
import { trpc } from '#src/utils/trpc.js';
import { AddResourceModal } from '../-components/add-resource-modal.tsx';
import { AlphabetGlossary } from '../-components/alphabet-glossary.tsx';
import { GlossaryList } from '../-components/glossary-list.tsx';
import { resourcesTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/resources/glossary/')({
  component: Glossary,
});

function Glossary() {
  const { t, i18n } = useTranslation();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: glossaryWords, isFetched } = useQuery(
    trpc.content.getGlossaryWords.queryOptions({
      language: i18n.language ?? 'en',
    }),
  );

  const handleLetterSelection = (letter: string) => {
    setSelectedLetter(letter === selectedLetter ? null : letter);
  };

  return (
    <PageLayout
      title={t('resources.glossary.title')}
      tabs={resourcesTabs}
      layoutSize="wide"
      actionButtons={[
        {
          text: t('resources.addResource.glossary'),
          onClick: () => setIsModalOpen(true),
        },
      ]}
    >
      <AddResourceModal
        resourceType={ResourceType.Glossary}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {!isFetched && <Loader size={'s'} />}
      {isFetched && (
        <div className="flex flex-col max-sm:mt-4 mt-2">
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="ml-auto"
            fullWidthOnMobile
          />
          <AlphabetGlossary
            onLetterSelect={handleLetterSelection}
            selectedLetter={selectedLetter}
          />
          {glossaryWords && glossaryWords.length > 0 && (
            <GlossaryList
              glossaryTerms={glossaryWords}
              selectedLetter={selectedLetter}
              searchTerm={searchTerm}
            />
          )}
        </div>
      )}
    </PageLayout>
  );
}
