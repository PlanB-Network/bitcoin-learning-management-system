import { Link, createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import {
  Card,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Loader,
  TextTag,
} from '@blms/ui';

import { trpc } from '#src/utils/trpc.js';

import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute(
  '/_content/resources/newsletter/$newsletterId',
)({
  params: {
    parse: (params) => ({
      newsletterId: params.newsletterId,
    }),
    stringify: ({ newsletterId }) => ({
      newsletterId: newsletterId.toString(),
    }),
  },
  component: NewsletterDetail,
});

function NewsletterDetail() {
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { data: newsletter, isFetched } = trpc.content.getNewsletter.useQuery({
    id: Number(params.newsletterId),
    language: i18n.language ?? 'en',
  });

  const { data: newsletters } = trpc.content.getNewsletters.useQuery(
    {
      language: i18n.language,
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  if (!newsletter) {
    return (
      <ResourceLayout
        title={t('newsletter.notFoundTitle')}
        tagLine={t('newsletter.notFoundSubtitle')}
        link={'/resources/newsletter'}
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
      title={newsletter.title}
      tagLine={newsletter.author}
      link={'/resources/newsletter'}
      activeCategory="newsletter"
      showPageHeader={false}
      backToCategoryButton
    >
      <div className="w-full">
        <Card className="md:mx-auto" color="orange">
          <article className="w-full flex flex-col md:flex-row gap-5 lg:gap-9">
            <div className="flex flex-col items-center justify-center">
              <img
                className="md:w-[367px] mx-auto object-cover rounded-[10px] lg:max-w-[347px] md:mx-0 lg:rounded-[22px]"
                alt={newsletter.title}
                src={newsletter.thumbnail}
              />
            </div>

            <div className="w-full max-w-2xl my-4 flex flex-col md:mt-0">
              <h2 className="title-large-24px md:display-large-med-48px text-white mb-5 lg:mb-8">
                {newsletter.title}
              </h2>
              <div className="flex flex-wrap gap-[10px] mb-5 lg:mb-8">
                {newsletter.tags.map((tag, i) => (
                  <TextTag key={i} size="resourcesNewSize" variant="newGray">
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </TextTag>
                ))}
              </div>
              <div className="flex items-center">
                <span className="text-white body-14px-medium md:label-medium-med-16px pr-1">
                  {t('words.writtenByPodcasts')}
                </span>
                <h5 className="text-white body-14px md:body-16px ">
                  {newsletter.author}
                </h5>
              </div>
              <div className="flex items-center">
                <span className="body-14px-medium md:label-medium-med-16px text-white pr-1">
                  {t('words.publicationDate')}
                </span>
                <span className="body-14px md:body-16px text-white ">
                  {newsletter.publication_date}
                </span>
              </div>
              <p className="text-white mt-4">{newsletter.description}</p>
            </div>
          </article>
        </Card>
      </div>

      <section className="mt-8 lg:mt-[100px]">
        <h3 className="label-medium-med-16px md:title-large-24px font-medium leading-none md:leading-[116%] text-white mb-5 md:mb-10">
          {t('resources.newsletters.subtitle')}
        </h3>
        <Carousel>
          <CarouselContent>
            {newsletters
              ?.filter((item) => item.newsletterId !== newsletter.newsletterId)
              .map((item) => (
                <CarouselItem key={item.id}>
                  <Link to={`/resources/newsletter/${item.newsletterId}`}>
                    <div className="relative h-full">
                      <img
                        className="max-h-72 sm:max-h-96 size-full object-cover rounded-[10px]"
                        alt={item.title}
                        src={item.thumbnail}
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
                    <h3 className="absolute px-2 lg:px-4 body-14px lg:title-large-24px mb-1 lg:mb-5 bottom-px line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                </CarouselItem>
              ))}
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>
    </ResourceLayout>
  );
}
