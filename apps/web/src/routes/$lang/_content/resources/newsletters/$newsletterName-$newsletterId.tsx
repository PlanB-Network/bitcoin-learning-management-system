import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  Button,
  Card,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Loader,
  TextTag,
} from '@blms/ui';

import { useGreater } from '#src/hooks/use-greater.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import Flag from '#src/molecules/Flag/index.tsx';
import { BackLink } from '#src/molecules/backlink.js';
import { assetUrl } from '#src/utils/index.js';
import { useShuffleSuggestedContent } from '#src/utils/resources-hook.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';

import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { ResourceLayout } from '../-components/resource-layout.tsx';
import { SuggestedHeader } from '../-components/suggested-header.tsx';

export const Route = createFileRoute(
  '/$lang/_content/resources/newsletters/$newsletterName-$newsletterId',
)({
  params: {
    parse: (params) => {
      const newsletterNameId = params['newsletterName-$newsletterId'];
      const { id, name } = getNameAndIdFromUrl(newsletterNameId);

      return {
        lang: z.string().parse(params.lang),
        'newsletterName-$newsletterId': `${name}-${id}`,
        newsletterName: z.string().parse(name),
        newsletterId: z.string().parse(id),
      };
    },
    stringify: ({ lang, newsletterName, newsletterId }) => ({
      lang: lang,
      'newsletterName-$newsletterId': `${newsletterName}-${newsletterId}`,
    }),
  },
  component: NewsletterDetail,
});

function NewsletterDetail() {
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();

  const { t, i18n } = useTranslation();
  const params = Route.useParams();
  const isScreenMd = useGreater('sm');

  const { data: newsletter, isFetched } = trpc.content.getNewsletter.useQuery({
    id: params.newsletterId,
    language: i18n.language,
  });

  const { data: suggestedNewsletters } = trpc.content.getNewsletters.useQuery(
    {},
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  useEffect(() => {
    if (
      newsletter &&
      params.newsletterName !== formatNameForURL(newsletter.title)
    ) {
      navigate({
        to: `/resources/newsletters/${formatNameForURL(newsletter.title)}-${
          newsletter.id
        }`,
      });
    }
  }, [newsletter, isFetched, navigateTo404, params.newsletterName, navigate]);

  function displayAbstract() {
    return (
      newsletter?.description && (
        <article>
          <h3 className="mb-4 lg:mb-5 body-16px-medium md:subtitle-large-med-20px text-white md:text-newGray-3">
            {t('words.abstract')}
          </h3>
          <p className="line-clamp-[20] max-w-[772px] text-white body-14px lg:body-16px whitespace-pre-line">
            {newsletter.description}
          </p>
        </article>
      )
    );
  }

  const shuffledSuggestedNewsletters = useShuffleSuggestedContent(
    suggestedNewsletters ?? [],
    newsletter,
  );

  if (!newsletter) {
    return (
      <ResourceLayout
        link={'/resources/newsletters'}
        activeCategory="newsletter"
        showPageHeader={false}
        backToCategoryButton
      >
        {!isFetched && <Loader size={'s'} />}
        <div className="text-white text-center">
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.newsletter'),
          })}
        </div>
      </ResourceLayout>
    );
  }

  return (
    <ResourceLayout
      link={'/resources/newsletters'}
      activeCategory="newsletters"
      showPageHeader={false}
      backToCategoryButton
      showResourcesDropdownMenu={false}
    >
      <div className="flex flex-col">
        <BackLink
          to={'/resources/newsletters'}
          label={t('resources.newsletters.title')}
        />
        <article className="w-full">
          <Card
            className="md:mx-auto !rounded-[10px] md:!rounded-[20px]"
            color="orange"
            withPadding={false}
            paddingClass="p-5 md:p-[30px]"
          >
            <article className="w-full flex flex-col md:flex-row gap-5 lg:gap-9">
              <div className="flex flex-col">
                <div className="relative max-md:max-w-[219px] mx-auto">
                  <img
                    className="max-md:max-w-[219px] md:w-[367px] mx-auto object-cover rounded-[10px] lg:max-w-[347px] md:mx-0 lg:rounded-[22px] mb-5 lg:mb-[30px]"
                    alt={newsletter.title}
                    src={assetUrl(newsletter.path, 'thumbnail.webp')}
                  />
                  <Flag
                    code={newsletter.language}
                    size="m"
                    className="shrink-0 md:hidden absolute top-[13px] right-[12px]"
                  />
                </div>

                <div className="flex flex-row justify-evenly md:flex-col md:space-y-2 lg:flex-row lg:space-y-0">
                  {newsletter?.websiteUrl && (
                    <Link to={newsletter.websiteUrl} target="_blank">
                      <Button
                        size={isScreenMd ? 'l' : 'm'}
                        variant="primary"
                        className="mx-2"
                      >
                        {t('resources.newsletter.check')}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="w-full max-w-2xl flex flex-col md:mt-0">
                <div className="flex justify-between items-center gap-2 w-full mb-5 lg:mb-[30px]">
                  <h2 className="title-large-24px md:display-large-med-48px text-white">
                    {newsletter.title}
                  </h2>
                  <Flag
                    code={newsletter.language}
                    size="xl"
                    className="shrink-0 max-md:hidden"
                  />
                </div>
                <p className="text-newGray-3 pr-1 subtitle-small-med-14px md:label-large-med-20px">
                  {t('resources.newsletters.author')}
                  <span className="inline text-white subtitle-small-med-14px md:label-large-med-20px">
                    {newsletter.author}
                  </span>
                </p>

                <div className="flex items-center mb-5 lg:mb-[30px] mt-2.5 md:mt-0">
                  <span className="text-newGray-3 pr-1 subtitle-small-med-14px md:label-large-med-20px">
                    {t('resources.newsletters.level')}
                  </span>
                  <span className="capitalize text-white max-w-[140px] md:max-w-none subtitle-small-med-14px md:label-large-med-20px">
                    {newsletter.level}
                  </span>
                </div>

                <div className="flex flex-wrap gap-[10px] mb-5 lg:mb-8">
                  {newsletter.tags
                    ?.filter((tag) => tag && tag.toLowerCase() !== 'null')
                    .map((tag) => (
                      <TextTag
                        key={tag}
                        size="small"
                        variant="lightMaroon"
                        mode="dark"
                      >
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </TextTag>
                    ))}
                </div>
                {isScreenMd && displayAbstract()}
              </div>
            </article>
            {!isScreenMd && displayAbstract()}
          </Card>
        </article>
      </div>

      <section className="mt-8 lg:mt-[100px]">
        <SuggestedHeader
          text="resources.newsletters.subtitle"
          placeholder="Other newsletters"
        />

        <Carousel>
          <CarouselContent>
            {shuffledSuggestedNewsletters
              .slice(0, 10)
              .map((suggestedNewsletter) => {
                const isNewsletter = 'title' in suggestedNewsletter;

                return isNewsletter ? (
                  <CarouselItem
                    key={suggestedNewsletter.id}
                    className="basis-1/2 md:basis-1/4 text-white size-full bg-gradient-to-r min-h-[203px] max-w-[282px] max-h-[400px] rounded-[10px]"
                  >
                    <Link
                      to={`/resources/newsletters/${formatNameForURL(suggestedNewsletter.title)}-${suggestedNewsletter.id}`}
                    >
                      <div className="relative h-full">
                        <img
                          className="size-full min-h-[203px] max-h-[198px] lg:min-h-[400px] md:max-h-[400px] object-cover [overflow-clip-margin:_unset] rounded-[10px]"
                          alt={suggestedNewsletter.title}
                          src={assetUrl(
                            suggestedNewsletter.path,
                            'thumbnail.webp',
                          )}
                        />
                        <div
                          className="absolute inset-0 -bottom-px rounded-[10px]"
                          style={{
                            background: `linear-gradient(360deg, rgba(40, 33, 33, 0.90) 10%, rgba(0, 0, 0, 0.00) 60%),
                        linear-gradient(0deg, rgba(57, 53, 49, 0.20) 0%, rgba(57, 53, 49, 0.20) 100%)`,
                            backgroundSize: '153.647% 100%',
                            backgroundPosition: '-5.216px 0px',
                            backgroundRepeat: 'no-repeat',
                          }}
                        />
                      </div>
                      <h3 className="absolute w-full max-w-[140px]  lg:max-w-[220px] lg:w-[220px] px-2 lg:px-4 body-14px lg:title-large-24px mb-1 lg:mb-5 bottom-px line-clamp-2">
                        {suggestedNewsletter.title}
                      </h3>
                    </Link>
                  </CarouselItem>
                ) : null;
              })}
          </CarouselContent>

          <CarouselPrevious className="*:size-5 md:*:size-8" />
          <CarouselNext className="*:size-5 md:*:size-8" />
        </Carousel>
      </section>
    </ResourceLayout>
  );
}
