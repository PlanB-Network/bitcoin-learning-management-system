import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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

import ThumbUp from '#src/assets/icons/thumb-up-pixelated.svg';
import { ProofreadingProgress } from '#src/components/proofreading-progress.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import { BackLink } from '#src/molecules/backlink.tsx';
import { assetUrl, trpc } from '#src/utils/index.js';
import { useSuggestedContent } from '#src/utils/resources-hook.ts';
import { formatNameForURL } from '#src/utils/string.ts';

import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute(
  '/_content/resources/books/$bookName-$bookId',
)({
  params: {
    parse: (params) => {
      const bookNameId = params['bookName-$bookId'];
      const bookId = bookNameId.split('-').pop();
      const bookName = bookNameId.slice(
        0,
        Math.max(0, bookNameId.lastIndexOf('-')),
      );

      return {
        'bookName-$bookId': `${bookName}-${bookId}`,
        bookName: z.string().parse(bookName),
        bookId: z.number().int().parse(Number(bookId)),
      };
    },
    stringify: ({ bookName, bookId }) => ({
      'bookName-$bookId': `${bookName}-${bookId}`,
    }),
  },
  component: Book,
});

function Book() {
  const params = Route.useParams();
  const { t, i18n } = useTranslation();

  const { data: book, isFetched } = trpc.content.getBook.useQuery({
    id: params.bookId,
    language: i18n.language ?? 'en',
  });
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();

  const isScreenMd = useGreater('sm');

  const { data: proofreading } = trpc.content.getProofreading.useQuery({
    language: i18n.language,
    resourceId: params.bookId,
  });

  const { data: suggestedBooks, isFetched: isFetchedSuggestedBooks } =
    useSuggestedContent('books');

  useEffect(() => {
    if (book && params.bookName !== formatNameForURL(book.title)) {
      navigate({
        to: `/resources/books/${formatNameForURL(book.title)}-${book.id}`,
      });
    }
  }, [book, isFetched, navigateTo404, navigate, params.bookName]);

  function displayAbstract() {
    return (
      book?.description && (
        <article>
          <h3 className="mb-4 lg:mb-5 body-16px-medium md:subtitle-large-med-20px text-white md:text-newGray-3">
            {t('book.abstract')}
          </h3>
          <p className="line-clamp-[20] max-w-[772px] text-white body-14px lg:body-16px whitespace-pre-line">
            {book?.description}
          </p>
        </article>
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
            <Card
              className="md:mx-auto w-full !rounded-[10px] md:!rounded-[20px]"
              withPadding={false}
              paddingClass="p-5 md:p-[30px]"
              color="orange"
            >
              <article className="w-full flex flex-col md:flex-row gap-5 lg:gap-9">
                <div className="flex flex-col">
                  <img
                    className="md:w-[367px] max-h-[229px] md:max-h-max mx-auto object-cover [overflow-clip-margin:_unset] rounded-[10px] lg:max-w-[347px] md:mx-0 lg:rounded-none"
                    alt={t('imagesAlt.bookCover')}
                    src={
                      book.cover ? assetUrl(book.path, book.cover) : undefined
                    }
                  />
                </div>

                <div className="w-full max-w-2xl flex flex-col md:mt-0">
                  <div>
                    <h2 className="title-large-sb-24px md:display-large-med-48px text-white mb-5 lg:mb-[30px] text-center md:text-start">
                      {book?.title}
                    </h2>

                    <p className="text-newGray-3 pr-1 title-medium-sb-18px md:label-large-med-20px text-center md:text-start">
                      {t('resources.books.author')}

                      <span className="inline text-white title-medium-sb-18px md:label-large-med-20px">
                        {book?.author}
                      </span>
                    </p>

                    <div className="flex items-center justify-center md:justify-start mb-5 md:mb-[30px]">
                      <span className="text-newGray-3 pr-1 title-medium-sb-18px md:label-large-med-20px">
                        {t('words.publicationDate')}
                      </span>
                      <span className=" text-white title-medium-sb-18px md:label-large-med-20px">
                        {book?.publicationYear}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-[10px] items-center justify-center md:justify-start  mb-5 lg:mb-[30px]">
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
        <div className="flex items-center justify-center md:justify-start mb-5 lg:mb-10">
          <img
            src={ThumbUp}
            className="size-[20px] lg:size-[32px] mr-3 my-1"
            alt=""
          />

          <h3 className="flex items-center title-small-med-16px md:title-large-24px font-medium leading-none md:leading-[116%] text-white mt-2">
            <Trans i18nKey="resources.pageSubtitleBooks">
              <span className="text-darkOrange-5 mr-1 title-small-med-16px md:title-large-24px">
                Other books{''}
              </span>
            </Trans>
          </h3>
        </div>
        <Carousel>
          <CarouselContent>
            {isFetchedSuggestedBooks ? (
              suggestedBooks
                ?.filter((book) => book.id !== params.bookId)
                .sort(() => Math.random() - 0.5)
                .slice(0, 10)
                .map((book) => {
                  const isBook =
                    'title' in book && 'cover' in book && book.cover;
                  if (isBook) {
                    return (
                      <CarouselItem
                        key={book.id}
                        className="basis-1/2 md:basis-1/4 text-white size-full bg-gradient-to-r max-w-[282px] max-h-[400px] rounded-[10px]"
                      >
                        <Link
                          to={`/resources/books/${formatNameForURL(book.title)}-${book.id}`}
                        >
                          <div className="relative h-full">
                            <img
                              className="size-full min-h-[198px] max-h-[198px] lg:min-h-[400px] md:max-h-[400px] object-cover [overflow-clip-margin:_unset] rounded-[10px]"
                              alt={book.title}
                              src={assetUrl(
                                book.path,
                                book.cover ?? 'unreachable',
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

                          <h3 className="absolute max-w-[119px] md:max-w-[152px] px-2 lg:px-4 body-14px lg:title-large-24px mb-1 lg:mb-5 bottom-px line-clamp-2">
                            {book.title}
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
          <CarouselPrevious className="*:size-5 md:*:size-8" />
          <CarouselNext className="*:size-5 md:*:size-8" />
        </Carousel>
      </section>
    </ResourceLayout>
  );
}
