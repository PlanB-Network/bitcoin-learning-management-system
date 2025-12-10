import { formatNameForURL } from '@blms/shared';
import { Button, HorizontalCard, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbChevronsDown } from 'react-icons/tb';
import PaperImage from '#src/assets/resources/paper.png';
import { PageLayout } from '#src/components/page-layout.tsx';
import { SearchInput } from '#src/components/search-input.tsx';
import { trpc } from '#src/utils/trpc.js';
import { resourcesTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/resources/papers/')({
  component: ResearchPapers,
});

function ResearchPapers() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [shownPapersCount, setShownPapersCount] = useState(10);

  const { data: papers, isFetched } = useQuery(
    trpc.content.getResearchPapers.queryOptions(
      {},
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  const sortedPapers = papers
    ? [...papers].sort((a, b) => a.title.localeCompare(b.title))
    : [];

  const filteredPapers = sortedPapers.filter((paper) => {
    const lowerTerm = searchTerm.toLowerCase();
    return (
      paper.title.toLowerCase().includes(lowerTerm) ||
      paper.authors.some((author) =>
        author.toLowerCase().includes(lowerTerm),
      ) ||
      paper.topics?.some((topic) => topic.toLowerCase().includes(lowerTerm)) ||
      paper.language.toLowerCase().includes(lowerTerm)
    );
  });

  return (
    <PageLayout
      title={t('resources.papers.title')}
      tabs={resourcesTabs}
      layoutSize="wide"
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && (
        <>
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="ml-auto max-sm:mt-1 mt-2 mb-6 sm:mb-4"
            fullWidthOnMobile
          />
          <div className="w-full flex flex-col gap-1 sm:gap-2">
            {filteredPapers.slice(0, shownPapersCount).map((paper) => (
              <HorizontalCard
                key={paper.id}
                title={paper.title}
                subtitle={`${paper.authors.join(', ')}${
                  paper.publicationDate
                    ? ` • ${new Date(paper.publicationDate).getFullYear()}`
                    : ''
                }`}
                link={`/resources/papers/${formatNameForURL(paper.title)}-${paper.id}`}
                thumbnail={PaperImage}
                hideMobileThumbnail
                hideThumbnailBorder
              />
            ))}
          </div>

          {shownPapersCount < filteredPapers.length && (
            <Button
              className="w-full gap-4 mt-4"
              variant="newTertiary"
              onClick={() => setShownPapersCount(shownPapersCount + 10)}
            >
              {t('resources.papers.showMorePapers')}
              <TbChevronsDown size={16} />
            </Button>
          )}
        </>
      )}
    </PageLayout>
  );
}
