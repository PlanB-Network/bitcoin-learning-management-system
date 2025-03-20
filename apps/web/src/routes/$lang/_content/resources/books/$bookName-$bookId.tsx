import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
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
import { assetUrl, trpc } from '#src/utils/index.js';
import { useShuffleSuggestedContent } from '#src/utils/resources-hook.ts';
import { formatNameForURL } from '#src/utils/string.ts';

import { Image } from '#src/components/image.tsx';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { ResourceLayout } from '../-components/resource-layout.tsx';
import { SuggestedHeader } from '../-components/suggested-header.tsx';

export const Route = createFileRoute(
  '/$lang/_content/resources/books/$bookName-$bookId',
)({
  params: {
    parse: (params) => {
      const bookNameId = params['bookName-$bookId'];
      const { id, name } = getNameAndIdFromUrl(bookNameId);

      return {
        lang: z.string().parse(params.lang),
        'bookName-$bookId': `${name}-${id}`,
        bookName: z.string().parse(name),
        bookId: z.string().parse(id),
      };
    },
    stringify: ({ lang, bookName, bookId }) => ({
      lang: lang,
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

  const isScreenMd = useGreater('sm');

  const { data: proofreading } = trpc.content.getProofreading.useQuery({
    language: i18n.language,
    resourceId: params.bookId,
  });

  const { data: suggestedBooks, isFetched: isFetchedSuggestedBooks } =
    trpc.content.getBooks.useQuery({});

  useEffect(() => {
    if (book && params.bookName !== formatNameForURL(book.title)) {
      navigate({
        to: `/resources/books/${formatNameForURL(book.title)}-${book.id}`,
        replace: true,
      });
    }
  }, [book, isFetched, navigate, params.bookName]);

  function displayAbstract() {
    return (
      book?.description && (
        <article>
          <h3 className="mb-4 lg:mb-5 body-16px-medium md:subtitle-large-med-20px text-white md:text-newGray-3">
            {t('words.abstract')}
          </h3>
          <p className="line-clamp-[20] max-w-[772px] text-white body-14px lg:body-16px whitespace-pre-line">
            {book?.description}
          </p>
        </article>
      )
    );
  }

  const shuffledSuggestedBooks = useShuffleSuggestedContent(
    suggestedBooks ?? [],
    book,
  );

  return (
    <ResourceLayout
      link={'/resources/books'}
      activeCategory="books"
      showPageHeader={false}
      backToCategoryButton
      showResourcesDropdownMenu={false}
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !book && (
        <div className="max-w-[768px] mx-auto text-white">
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.book'),
          })}
        </div>
      )}
      {book && (
        <div className="w-full">
          {proofreading ? (
            <ProofreadingProgress
              isOriginalLanguage={true}
              mode="dark"
              proofreadingData={{
                contributors: proofreading.contributorNames,
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
                  <Image
                    breakpoints={{ default: 367 }}
                    className="md:w-[367px] max-h-[229px] md:max-h-max mx-auto object-cover [overflow-clip-margin:_unset] rounded-[10px] lg:max-w-[347px] md:mx-0 lg:rounded-none"
                    alt={t('imagesAlt.bookCover')}
                    src={
                      book.cover ? assetUrl(book.path, book.cover) : undefined
                    }
                  />
                </div>

                <div className="w-full max-w-2xl flex flex-col md:mt-0">
                  <div>
                    <h2 className="title-large-24px lg:display-small-med-32px text-white mb-5 lg:mb-[30px] text-center md:text-start">
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
                      {book?.tags.map((tag) => (
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
        <SuggestedHeader
          text="resources.pageSubtitleBooks"
          placeholder="Other books"
        />
        <Carousel>
          <CarouselContent>
            {isFetchedSuggestedBooks ? (
              shuffledSuggestedBooks.slice(0, 10).map((suggestedBook) => {
                const isBook =
                  'title' in suggestedBook &&
                  'cover' in suggestedBook &&
                  suggestedBook.cover;
                if (isBook) {
                  return (
                    <CarouselItem
                      key={suggestedBook.id}
                      className="basis-1/2 md:basis-1/4 text-white size-full bg-gradient-to-r min-h-[203px]  max-w-[282px] max-h-[400px] rounded-[10px]"
                    >
                      <Link
                        to={`/resources/books/${formatNameForURL(suggestedBook.title)}-${suggestedBook.id}`}
                      >
                        <div className="relative h-full">
                          <Image
                            breakpoints={{ default: 300 }}
                            className="size-full h-[203px] max-h-[203px] lg:min-h-[400px] md:max-h-[400px] object-cover [overflow-clip-margin:_unset] rounded-[10px]"
                            alt={suggestedBook.title}
                            src={assetUrl(
                              suggestedBook.path,
                              suggestedBook.cover ?? 'unreachable',
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
          <CarouselPrevious className="*:size-5 md:*:size-8" />
          <CarouselNext className="*:size-5 md:*:size-8" />
        </Carousel>
      </section>
    </ResourceLayout>
  );
}
