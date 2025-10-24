import { formatNameForURL } from '@blms/shared';
import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { resourceImgUrl } from '#src/utils/index.js';
import { useShuffleSuggestedContent } from '#src/utils/resources-hook.ts';
import { trpc } from '#src/utils/trpc.js';
import { ResourceDetails } from '../-components/resource-details.tsx';

export const Route = createFileRoute(
  '/$lang/_content/resources/newsletters/$newsletterName-$newsletterId',
)({
  component: NewsletterDetail,
  params: {
    parse: (params) => {
      const newsletterNameId = params['newsletterName-$newsletterId'];
      const { id, name } = getNameAndIdFromUrl(newsletterNameId);

      return {
        lang: z.string().parse(params.lang),
        newsletterId: z.string().parse(id),
        newsletterName: z.string().parse(name),
        'newsletterName-$newsletterId': `${name}-${id}`,
      };
    },
    stringify: ({ lang, newsletterName, newsletterId }) => ({
      lang: lang,
      'newsletterName-$newsletterId': `${newsletterName}-${newsletterId}`,
    }),
  },
});

function NewsletterDetail() {
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();

  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { data: newsletter, isFetched } = useQuery(
    trpc.content.getNewsletter.queryOptions({
      id: params.newsletterId,
      language: i18n.language,
    }),
  );

  const { data: suggestedNewsletters } = useQuery(
    trpc.content.getNewsletters.queryOptions(
      {},
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  useEffect(() => {
    if (
      newsletter &&
      params.newsletterName !== formatNameForURL(newsletter.title)
    ) {
      navigate({
        replace: true,
        to: `/resources/newsletters/${formatNameForURL(newsletter.title)}-${
          newsletter.id
        }`,
      });
    }
  }, [newsletter, isFetched, navigateTo404, params.newsletterName, navigate]);

  const shuffledSuggestedNewsletters = useShuffleSuggestedContent(
    suggestedNewsletters ?? [],
    newsletter,
  );

  return (
    <PageLayout
      backLink={{
        href: '/resources/newsletters',
        text: t('resources.newsletters.title'),
      }}
      layoutSize="wide"
      title={newsletter?.title ?? undefined}
      hideTitle
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !newsletter && (
        <div>
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.newsletter'),
          })}
        </div>
      )}

      {newsletter && (
        <ResourceDetails
          title={newsletter.title}
          subtitle={newsletter.author}
          language={newsletter.language}
          button={
            newsletter.websiteUrl
              ? {
                  href: newsletter.websiteUrl,
                  label: t('resources.newsletter.check'),
                }
              : undefined
          }
          tags={newsletter.tags}
          imgSrc={resourceImgUrl(newsletter)}
          abstract={newsletter.description || ''}
          suggestedHeaderText="resources.newsletters.subtitle"
          suggestedResources={shuffledSuggestedNewsletters.map(
            (suggestedNewsletter) => {
              const isNewsletter = 'title' in suggestedNewsletter;
              return {
                title: isNewsletter ? suggestedNewsletter.title || '' : '',
                href: isNewsletter
                  ? `/resources/newsletters/${formatNameForURL(suggestedNewsletter.title)}-${suggestedNewsletter.id}`
                  : '',
                imgSrc: isNewsletter ? resourceImgUrl(suggestedNewsletter) : '',
              };
            },
          )}
        />
      )}
    </PageLayout>
  );
}
