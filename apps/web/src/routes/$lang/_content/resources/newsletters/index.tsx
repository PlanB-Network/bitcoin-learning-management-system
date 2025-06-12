import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Flag, Loader, Switch } from '@blms/ui';

import { LANGUAGES_MAP } from '@blms/shared';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { resourceImgUrl } from '#src/utils/index.js';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';

import { useQuery } from '@tanstack/react-query';
import { ResourceCard } from '../-components/cards/resource-card.tsx';
import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute('/$lang/_content/resources/newsletters/')({
  component: Newsletter,
});

function Newsletter() {
  const { t, i18n } = useTranslation();
  const isMobile = useSmaller('md');

  const { data: newsletters, isFetched } = useQuery(
    trpc.content.getNewsletters.queryOptions({}, { staleTime: 300_000 }),
  );

  const localNewsletters =
    newsletters?.filter(
      (newsletter) => newsletter.language === i18n.language,
    ) ?? [];

  const englishNewsletters =
    newsletters?.filter((newsletter) => newsletter.language === 'en') ?? [];

  const [showLocalOnly, setShowLocalOnly] = useState(true);

  const handleSwitchChange = (checked: boolean) => {
    setShowLocalOnly(checked);
  };

  const sortedNewsletters = (
    showLocalOnly ? [...localNewsletters] : [...(newsletters ?? [])]
  )?.sort((a, b) => a.title.localeCompare(b.title));

  const isEnglishLanguage = i18n.language === 'en';

  return (
    <ResourceLayout
      title={t('resources.newsletters.title')}
      activeCategory="newsletters"
    >
      <div className="flex flex-col gap-4 md:gap-9 mt-4 md:mt-12 mx-auto">
        <div className="flex items-center gap-1 md:gap-2.5 pb-2 md:pb-2.5 border-b border-b-newGray-1">
          <span className="label-small-12px md:label-large-med-20px text-white">
            {t('resources.toggleLabelAll')}
          </span>
          <Switch onCheckedChange={handleSwitchChange} defaultChecked />
          <span className="label-small-12px md:label-large-med-20px text-white">
            {t('resources.toggleLabelSelectedLanguage')}
          </span>
        </div>

        <section>
          {showLocalOnly && (
            <div className="flex items-center gap-3 mb-4 md:mb-9">
              <Flag
                code={i18n.language}
                size={isMobile ? 'm' : 'l'}
                className="shrink-0 !rounded-none mb-0.5 md:mb-0"
              />
              <span className="text-white subtitle-medium-caps-18px md:subtitle-large-caps-22px">
                {LANGUAGES_MAP[i18n.language] || 'Language'}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-4 md:gap-11">
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
                  className="grow md:grow-0"
                >
                  <ResourceCard
                    name={newsletter.title}
                    author={newsletter.author}
                    imageSrc={resourceImgUrl(newsletter)}
                    language={newsletter.language}
                    level={newsletter?.level ? newsletter.level : undefined}
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
              <div className="flex items-center gap-3 pt-6 border-t border-t-newGray-1 mb-4 md:mb-9">
                <Flag
                  code="en"
                  size={isMobile ? 'm' : 'l'}
                  className="shrink-0 !rounded-none mb-0.5 md:mb-0"
                />
                <span className="text-white subtitle-medium-caps-18px md:subtitle-large-caps-22px">
                  {LANGUAGES_MAP.en}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 md:gap-11">
                {englishNewsletters.map((newsletter) => (
                  <Link
                    to={`/resources/newsletters/${formatNameForURL(
                      newsletter.title,
                    )}-${newsletter.id}`}
                    params={{
                      newsletterId: newsletter.id.toString(),
                    }}
                    key={newsletter.id}
                    className="grow md:grow-0"
                  >
                    <ResourceCard
                      name={newsletter.title}
                      author={newsletter.author}
                      imageSrc={resourceImgUrl(newsletter)}
                      language={newsletter.language}
                      level={newsletter?.level ? newsletter.level : undefined}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}
      </div>
    </ResourceLayout>
  );
}
