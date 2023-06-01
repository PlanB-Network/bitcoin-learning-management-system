import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import readingRabbit from '../../assets/resources/reading-rabbit.svg';
import { Button } from '../../atoms/Button';
import { Card } from '../../atoms/Card';
import { ResourceLayout } from '../../components';

import { BookSummary } from './BookSummary';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const Book = () => {
  const { t } = useTranslation();
  const { bookId, language } = useParams();
  const { data: book } = trpc.content.getBook.useQuery({
    id: Number(bookId),
    language: language as any, // TODO: understand why React think route params can be undefined and fix it
  });

  if (book?.summary_contributor_id) {
    const userid = parseInt(book.summary_contributor_id, 0);
    const { data: contributor } = trpc.content.getBuilder.useQuery({
      id: userid,
      language: 'en',
    });
  }

  const isScreenMd = useGreater('sm');

  /* During dev */
  const fakeContributor = {
    username: 'Asi0',
    title: 'Bitcoiner',
    image:
      'https://github.com/DecouvreBitcoin/sovereign-university-data/blob/main/resources/builders/konsensus-network/assets/logo.jpg?raw=true',
  };

  function DownloadEbook() {
    alert(book?.download_url);
  }

  function BuyBook() {
    alert(book?.shop_url);
  }

  function displayAbstract() {
    return (
      <div className="pl-4 mt-6 border-l-4 border-primary-600">
        <h3 className="mb-4 text-lg font-semibold text-primary-900">
          {t('book.abstract')}
        </h3>
        <p className="max-w-2xl text-sm text-justify whitespace-pre-line text-ellipsis line-clamp-[20]">
          {book?.description}
        </p>
      </div>
    );
  }

  let buttonSize = 'xs';
  if (isScreenMd) {
    buttonSize = 's';
  }

  return (
    <ResourceLayout
      title={t('book.pageTitle')}
      tagLine={t('book.pageSubtitle')}
    >
      <div className="flex flex-row justify-center">
        <Card>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between mx-auto sm:my-6 max-w-[90vw] sm:max-w-8xl">
            <div className="flex flex-col mr-10">
              <div>
                <img
                  className="mx-auto max-h-72 sm:max-h-96"
                  alt="book cover"
                  src={book?.cover}
                />
              </div>
              <div className="flex flex-row justify-evenly mt-4">
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

            <div className="flex flex-col mb-4">
              <div>
                <h2 className="mb-2 max-w-lg text-2xl font-bold sm:text-4xl text-primary-800">
                  {book?.title}
                </h2>

                <div className="mt-2 text-sm">
                  <h5 className="italic font-thin">
                    {book?.author}, {book?.publication_year}.
                  </h5>
                </div>
              </div>

              <div className="mt-2 text-primary-700">
                <span className="text-xs italic font-thin">
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

      <div className="flex flex-row justify-between p-2 mx-auto my-6 max-w-5xl">
        <img
          className="flex flex-col mt-10 -ml-20 h-80 mr-10 max-w-[40%] hidden sm:flex"
          src={readingRabbit}
        />

        <div className="flex flex-col">
          {!book?.summary_text && (
            <BookSummary
              contributor={fakeContributor}
              title={book?.title ? book?.title : ''}
              content={
                book?.summary_text ? book?.summary_text : book?.description
              } /* TEMP FOR UI DEV, replace book.description with '' */
            />
          )}
        </div>
      </div>
    </ResourceLayout>
  );
};
