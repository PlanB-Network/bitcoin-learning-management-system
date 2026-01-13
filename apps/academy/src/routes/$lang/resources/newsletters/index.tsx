import { ResourceType } from '@blms/constants';
import { formatNameForURL } from '@blms/shared';
import { EmptyState, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { SearchInput } from '#src/components/search-input.tsx';
import { resourceImgUrl } from '#src/utils/index.js';
import { trpc } from '#src/utils/trpc.js';
import { AddResourceModal } from '../-components/add-resource-modal.tsx';
import { ResourceCard } from '../-components/cards/resource-card.tsx';
import {
  LanguageResourcesSectionHeader,
  SelectedLanguageSwitcher,
} from '../-components/selected-language-switcher.tsx';
import { resourcesTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/resources/newsletters/')({
  component: Newsletter,
});

function Newsletter() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: newsletters, isFetched } = useQuery(
    trpc.content.getNewsletters.queryOptions({}, { staleTime: 300_000 }),
  );

  const localNewsletters =
    newsletters?.filter(
      (newsletter) => newsletter.language === i18n.language,
    ) ?? [];

  const englishNewsletters =
    newsletters?.filter((newsletter) => newsletter.language === 'en') ?? [];

  const [showLocalOnly, setShowLocalOnly] = useState(false);

  const handleSwitchChange = (checked: boolean) => {
    setShowLocalOnly(checked);
  };

  const sortedNewsletters = (
    showLocalOnly ? [...localNewsletters] : [...(newsletters ?? [])]
  )
    ?.sort((a, b) => a.title.localeCompare(b.title))
    .filter(
      (newsletter) =>
        newsletter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        newsletter.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        newsletter.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );

  const isEnglishLanguage = i18n.language === 'en';

  return (
    <PageLayout
      title={t('resources.newsletters.title')}
      tabs={resourcesTabs}
      layoutSize="wide"
      actionButtons={[
        {
          text: t('resources.addResource.newsletter'),
          onClick: () => setIsModalOpen(true),
        },
      ]}
    >
      <AddResourceModal
        resourceType={ResourceType.Newsletter}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        className="ml-auto max-sm:mt-4 mt-2 mb-4 sm:mb-6"
        fullWidthOnMobile
      />
      <div className="flex flex-col">
        <SelectedLanguageSwitcher
          handleSwitchChange={handleSwitchChange}
          showLocalOnly={showLocalOnly}
        />

        <section>
          <div className="flex flex-wrap gap-0.5 sm:gap-6">
            {!isFetched && <Loader size="s" />}
            {sortedNewsletters?.length ? (
              sortedNewsletters.map((newsletter) => (
                <Link
                  to={`/resources/newsletters/${formatNameForURL(
                    newsletter.title,
                  )}-${newsletter.id}`}
                  params={{
                    newsletterId: newsletter.id.toString(),
                  }}
                  key={`${newsletter.id}`}
                  className="max-sm:w-full"
                >
                  <ResourceCard
                    name={newsletter.title}
                    author={newsletter.author}
                    imageSrc={resourceImgUrl(newsletter)}
                    language={newsletter.language}
                  />
                </Link>
              ))
            ) : (
              <EmptyState title={t('resources.newsletters.noNewsletters')} />
            )}
          </div>
        </section>

        {showLocalOnly &&
          !isEnglishLanguage &&
          englishNewsletters.length > 0 && (
            <section>
              <LanguageResourcesSectionHeader language="en" />
              <div className="flex flex-wrap gap-0.5 sm:gap-6">
                {englishNewsletters
                  .filter(
                    (newsletter) =>
                      newsletter.title
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      newsletter.author
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      newsletter.description
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                  )
                  .map((newsletter) => (
                    <Link
                      to={`/resources/newsletters/${formatNameForURL(
                        newsletter.title,
                      )}-${newsletter.id}`}
                      params={{
                        newsletterId: newsletter.id.toString(),
                      }}
                      key={newsletter.id}
                      className="max-sm:w-full"
                    >
                      <ResourceCard
                        name={newsletter.title}
                        author={newsletter.author}
                        imageSrc={resourceImgUrl(newsletter)}
                        language={newsletter.language}
                      />
                    </Link>
                  ))}
              </div>
            </section>
          )}
      </div>
    </PageLayout>
  );
}
