import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { resourceImgUrl } from '#src/utils/index.js';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';
import { ResourceCard } from '../-components/cards/resource-card.tsx';
import {
  LanguageResourcesSectionHeader,
  SelectedLanguageSwitcher,
} from '../-components/selected-language-switcher.tsx';
import { resourcesTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/_content/resources/newsletters/')({
  component: Newsletter,
});

function Newsletter() {
  const { t, i18n } = useTranslation();

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
  )?.sort((a, b) => a.title.localeCompare(b.title));

  const isEnglishLanguage = i18n.language === 'en';

  return (
    <PageLayout
      title={t('resources.newsletters.title')}
      tabs={resourcesTabs}
      layoutSize="wide"
    >
      <div className="flex flex-col max-sm:mt-4 mt-2">
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
              <p className="text-center text-gray-500">
                {t('resources.newsletters.noNewsletters')}
              </p>
            )}
          </div>
        </section>

        {showLocalOnly &&
          !isEnglishLanguage &&
          englishNewsletters.length > 0 && (
            <section>
              <LanguageResourcesSectionHeader language="en" />
              <div className="flex flex-wrap gap-0.5 sm:gap-6 sm:justify-center">
                {englishNewsletters.map((newsletter) => (
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
