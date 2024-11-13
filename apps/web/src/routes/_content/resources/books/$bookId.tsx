import { Link, createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

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

import { ProofreadingProgress } from '#src/components/proofreading-progress.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { BackLink } from '#src/molecules/backlink.tsx';
import { useSuggestedContent } from '#src/utils/resources-hook.ts';
import { trpc } from '#src/utils/trpc.js';

import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute('/_content/resources/books/$bookId')({
  params: {
    parse: (params) => ({
      bookId: z.number().int().parse(Number(params.bookId)),
    }),
    stringify: ({ bookId }) => ({ bookId: `${bookId}` }),
  },
  component: Book,
});

function Book() {
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const isScreenMd = useGreater('sm');

  const { data: book, isFetched } = trpc.content.getBook.useQuery({
    id: params.bookId,
    language: i18n.language ?? 'en',
  });

  const { data: proofreading } = trpc.content.getProofreading.useQuery({
    language: i18n.language,
    resourceId: params.bookId,
  });

  const { data: suggestedBooks, isFetched: isFetchedSuggestedBooks } =
    useSuggestedContent('books');

  function displayAbstract() {
    return (
      book?.description && (
        <div className="mt-5 lg:mt-8">
          <h3 className="mb-4 lg:mb-5 body-16px-medium md:subtitle-large-med-20px text-white">
            {t('book.abstract')}
          </h3>
          <p className="line-clamp-[20] max-w-3xl text-ellipsis whitespace-pre-line text-white text-justify body-14px lg:body-16px">
            {book?.description}
          </p>
        </div>
      )
    );
  }

  return (
    <ResourceLayout
      title={t('book.pageTitle')}
      tagLine={t('book.pageSubtitle')}
      link={'/resources/books'}
      activeCategory="books"
      showPageHeader={false}
      backToCategoryButton
      showResourcesDropdownMenu={false}
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !book && (
        <div className="w-[768px] mx-auto text-white">
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.book'),
          })}
        </div>
      )}
      {book && (
        <div className="w-full">
          {proofreading ? (
            <ProofreadingProgress
              mode="dark"
              proofreadingData={{
                contributors: proofreading.contributorsId,
                reward: proofreading.reward,
              }}
            />
          ) : (
            <></>
          )}
          <div className="flex-col">
            <BackLink to={'/resources/books'} label={t('words.library')} />
            <Card className="md:mx-auto" color="orange">
              <article className="w-full flex flex-col md:flex-row gap-5 lg:gap-9">
                <div className="flex flex-col items-center justify-center">
                  <img
                    className="md:w-[367px]  max-h-[229px] md:max-h-max mx-auto object-cover [overflow-clip-margin:_unset] rounded-[10px] lg:max-w-[347px] md:mx-0 lg:rounded-[22px]"
                    alt={t('imagesAlt.bookCover')}
                    src={book?.cover}
                  />
                </div>

                <div className="w-full max-w-2xl my-4 flex flex-col md:mt-0">
                  <div>
                    <h2 className="title-large-24px md:display-large-med-48px text-white mb-5 lg:mb-8">
                      {book?.title}
                    </h2>

                    <div className="flex flex-wrap gap-[10px] mb-5 lg:mb-8">
                      {book?.tags.map((tag, i) => (
                        <TextTag
                          key={i}
                          size="resourcesNewSize"
                          variant="newGray"
                        >
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </TextTag>
                      ))}
                    </div>

                    <div className="flex items-center">
                      <span className="text-white body-14px-medium md:label-medium-med-16px pr-1">
                        {t('words.writtenByPodcasts')}
                      </span>
                      <h5 className="text-white body-14px md:body-16px ">
                        {book?.author}
                      </h5>
                    </div>
                    <div className="flex items-center">
                      <span className="body-14px-medium md:label-medium-med-16px text-white pr-1">
                        {t('words.publicationDate')}
                      </span>
                      <span className="body-14px md:body-16px text-white ">
                        {book?.publicationYear}
                      </span>
                    </div>
                  </div>

                  {isScreenMd && displayAbstract()}
                </div>
              </article>
              {!isScreenMd && displayAbstract()}
            </Card>
          </div>
        </div>
      )}
      <section className="mt-8 lg:mt-[100px]">
        <h3 className="label-medium-med-16px md:title-large-24px font-medium leading-none md:leading-[116%] text-white mb-5 md:mb-10">
          {t('resources.pageSubtitleBooks')}
        </h3>
        <Carousel>
          <CarouselContent>
            {isFetchedSuggestedBooks ? (
              suggestedBooks
                ?.filter((suggestedBook) => suggestedBook.id !== params.bookId)
                .map((suggestedBook) => {
                  const isBook =
                    'cover' in suggestedBook && 'title' in suggestedBook;
                  if (isBook) {
                    return (
                      <CarouselItem
                        key={suggestedBook.id}
                        className="text-white basis-1/2 md:basis-1/2 lg:basis-1/4 relative w-full bg-gradient-to-r max-w-[282px] max-h-[350px] rounded-2xl lg:rounded-[22px]"
                      >
                        <Link to={`/resources/books/${suggestedBook.id}`}>
                          <div className="relative h-full">
                            <img
                              className="max-h-72 sm:max-h-96 size-full object-cover rounded-[10px]"
                              alt={suggestedBook.title}
                              src={suggestedBook.cover}
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
                            {suggestedBook.title}
                          </h3>
                        </Link>
                      </CarouselItem>
                    );
                  }
                  return null;
                })
            ) : (
              <Loader size={'s'} />
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>
    </ResourceLayout>
  );
}
