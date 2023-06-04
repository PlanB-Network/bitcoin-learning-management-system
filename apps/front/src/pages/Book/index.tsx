import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useTranslation } from 'react-i18next';

import { trpc } from '@sovereign-academy/api-client';

import readingRabbit from '../../assets/resources/reading-rabbit.svg';
import { Button } from '../../atoms/Button';
import { Card } from '../../atoms/Card';
import { ResourceLayout } from '../../components';
import { useRequiredParams } from '../../utils';

import { BookSummary } from './BookSummary';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const Book = () => {
  const { t } = useTranslation();
  const { bookId, language } = useRequiredParams();
  const { data: book } = trpc.content.getBook.useQuery({
    id: Number(bookId),
    language,
  });

  let contributor;

  if (book?.summary_contributor_id) {
    const userid = parseInt(book.summary_contributor_id, 0);
    contributor = trpc.content.getBuilder.useQuery({
      id: userid,
      language: 'en',
    }).data;
  } else {
    /* During dev */
    contributor = {
      username: 'Asi0',
      title: 'Bitcoiner',
      image:
        'https://github.com/DecouvreBitcoin/sovereign-university-data/blob/main/resources/builders/konsensus-network/assets/logo.jpeg?raw=true',
    };
  }

  const isScreenMd = useGreater('sm');

  function DownloadEbook() {
    alert(book?.download_url);
  }

  function BuyBook() {
    alert(book?.shop_url);
  }

  function displayAbstract() {
    return (
      <div className="border-primary-600 mt-6 border-l-4 pl-4">
        <h3 className="text-primary-900 mb-4 text-lg font-semibold">
          {t('book.abstract')}
        </h3>
        <p className="line-clamp-[20] max-w-2xl text-ellipsis whitespace-pre-line text-justify text-sm">
          {book?.description}
        </p>
      </div>
    );
  }

  let buttonSize: 'xs' | 's' = 'xs';
  if (isScreenMd) {
    buttonSize = 's';
  }

  return (
    book && (
      <ResourceLayout
        title={t('book.pageTitle')}
        tagLine={t('book.pageSubtitle')}
      >
        <div className="flex flex-row justify-center">
          <Card>
            <div className="mx-auto flex max-w-[90vw] flex-col-reverse items-center justify-between sm:my-6 sm:max-w-6xl sm:flex-row">
              <div className="mr-10 flex flex-col">
                <div>
                  <img
                    className="mx-auto max-h-72 sm:max-h-96"
                    alt="book cover"
                    src={book?.cover}
                  />
                </div>
                <div className="mt-4 flex flex-row justify-evenly">
                  <Button
                    size={buttonSize}
                    disabled={!book?.download_url}
                    variant="tertiary"
                    className="mx-2 w-32"
                    onClick={DownloadEbook}
                  >
                    {t('book.buttonPdf')}
                  </Button>
                  <Button
                    size={buttonSize}
                    disabled={!book?.download_url}
                    variant="tertiary"
                    className="mx-2 w-32"
                    onClick={BuyBook}
                  >
                    {t('book.buttonBuy')}
                  </Button>
                </div>
              </div>

              <div className="mb-4 flex flex-col">
                <div>
                  <h2 className="text-primary-800 mb-2 max-w-lg text-2xl font-bold sm:text-4xl">
                    {book?.title}
                  </h2>

                  <div className="mt-2 text-sm">
                    <h5 className="font-thin italic">
                      {book?.author}, {book?.publication_year}.
                    </h5>
                  </div>
                </div>

                <div className="text-primary-700 mt-2">
                  <span className="text-xs font-thin italic">
                    {t('book.topicsAddressed')}
                  </span>
                  {book?.tags.map((object, i) => (
                    <span key={i}>
                      {i > 0 && ', '}
                      {object.toUpperCase()}
                    </span>
                  ))}
                </div>
                {isScreenMd && displayAbstract()}
              </div>
            </div>
            {!isScreenMd && displayAbstract()}
          </Card>
        </div>

        <div className="mx-auto my-6 flex max-w-5xl flex-row justify-between p-2">
          <img
            className="-ml-20 mr-10 mt-10 hidden h-80 max-w-[40%] flex-col sm:flex"
            src={readingRabbit}
            alt={t('imagesAlt.readingRabbit')}
          />

          <div className="flex flex-col">
            {!book?.summary_text && (
              <BookSummary
                contributor={contributor}
                title={book?.title ? book?.title : ''}
                content={
                  book?.summary_text ? book?.summary_text : book?.description
                } /* TEMP FOR UI DEV, replace book.description with '' */
              />
            )}
          </div>
        </div>
      </ResourceLayout>
    )
  );
};
