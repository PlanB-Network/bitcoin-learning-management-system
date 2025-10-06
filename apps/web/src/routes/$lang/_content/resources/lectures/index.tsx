import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { trpc } from '#src/utils/trpc.js';
import { SearchInput } from '../../learn-anytime/index.tsx';
import { LectureCard } from '../-components/cards/lecture-card.tsx';
import { resourcesTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/_content/resources/lectures/')({
  component: Lectures,
});

function Lectures() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: lectures, isFetched } = useQuery(
    trpc.content.getLectures.queryOptions({}, { staleTime: 300_000 }),
  );

  return (
    <PageLayout
      title={t('resources.lectures.title')}
      tabs={resourcesTabs}
      layoutSize="wide"
    >
      {!isFetched && <Loader size="s" />}
      {isFetched && (
        <>
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="ml-auto max-sm:mt-4 mt-2 mb-4 sm:mb-6"
          />
          <div className="flex flex-wrap gap-3 sm:gap-2">
            {lectures
              ?.filter((lecture) =>
                lecture.name?.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} />
              ))}
          </div>
        </>
      )}
    </PageLayout>
  );
}
