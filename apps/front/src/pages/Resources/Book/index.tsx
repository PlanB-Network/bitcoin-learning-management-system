import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { trpc } from '@sovereign-academy/api-client';

import readingRabbit from '../../../assets/resources/reading-rabbit.svg';
import { Button } from '../../../atoms/Button';
import { Card } from '../../../atoms/Card';
import { ResourceLayout } from '../../../components';
import { useRequiredParams } from '../../../utils';

import { BookSummary } from './BookSummary';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const Book = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bookId, language } = useRequiredParams();
  const { data: book, isFetched } = trpc.content.getBook.useQuery({
    id: Number(bookId),
    language,
  });

  if (!book && isFetched) navigate('/404');

  // TODO: change when we have contributors
  const contributor = {
    username: 'Asi0',
    title: 'Bitcoiner',
    image:
      'https://github.com/DecouvreBitcoin/sovereign-university-data/blob/main/resources/builders/konsensus-network/assets/logo.jpeg?raw=true',
  };

  /* if (book?.summary_contributor_id) {
    const userid = parseInt(book.summary_contributor_id, 0);
    contributor = trpc.content.getBuilder.useQuery({
      id: userid,
      language: 'en',
    }).data;
  } else {
    // TODO: during dev
    contributor = {
      username: 'Asi0',
      title: 'Bitcoiner',
      image:
        'https://github.com/DecouvreBitcoin/sovereign-university-data/blob/main/resources/builders/konsensus-network/assets/logo.jpeg?raw=true',
    };
  } */

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
        <p className="mb-4 line-clamp-[20] max-w-2xl text-ellipsis whitespace-pre-line pr-4 text-justify text-sm md:pr-8">
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
    <ResourceLayout
      title={t('book.pageTitle')}
      tagLine={t('book.pageSubtitle')}
    >
      {book && (
        <div className="w-full">
          <Card className="mx-2 md:mx-auto">
            <div className="my-4 w-full grid-cols-1 grid-rows-1 sm:grid-cols-3 md:grid">
              <div className="border-primary-800 flex flex-col items-center justify-center border-b-4 md:mr-10 md:border-0">
                <img
                  className="max-h-72 sm:max-h-96"
                  alt={t('imagesAlt.bookCover')}
                  src={book?.cover}
                />
                <div className="my-4 flex flex-row justify-evenly md:flex-col md:space-y-2 lg:flex-row lg:space-y-0">
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

              <div className="col-span-2 my-4 flex flex-col md:mt-0">
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
                  } /* TODO TEMP FOR UI DEV, replace book.description with '' */
                />
              )}
            </div>
          </div>
        </div>
      )}
    </ResourceLayout>
  );
};
