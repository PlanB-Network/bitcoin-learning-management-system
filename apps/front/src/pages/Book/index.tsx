import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import readingRabbit from '../../assets/resources/reading-rabbit.svg';
import { Button } from '../../atoms/Button';
import { Card } from '../../atoms/Card';
import { Tag } from '../../atoms/Tag';
import { MainLayout } from '../../components';
import { PageTitle } from '../../components/PageTitle';
import { RelatedResources } from '../../components/RelatedResources';
import { ResourceReview } from '../../components/ResourceReview';
import { Routes } from '../../types';
import { replaceDynamicParam } from '../../utils';

import { BookSummary } from './BookSummary';

export const Book = () => {
  const { bookId, language } = useParams();
  const { data: book } = trpc.content.getBook.useQuery({
    id: Number(bookId),
    language: language as any, // TODO: understand why React think route params can be undefined and fix it
  });
  if (book?.summary_contributor_id) {
    const userid = parseInt(book.summary_contributor_id, 0);
    const { data: contributor } = trpc.content.getBuilder.useQuery({
      id: userid,
      language: "en"
    })
  }

  function DownloadEbook() {
    alert(book?.download_url);
  }

  function BuyBook() {
    alert(book?.shop_url);
  }

  return (
    <MainLayout>

      <div className="flex flex-col bg-primary-800">
        <div className="flex flex-row justify-center">
          <div className="max-w-5xl w-screen mb-4">
            <PageTitle>The library</PageTitle>
            <span className='text-white uppercase ml-8 text-sm'>This library is open-source & open to contribution. Thanks for grading and sharing !</span>
          </div>
        </div>
        <div className="flex flex-row justify-center">
          <Card className="">
            <div className="flex flex-row justify-between mx-auto my-6 max-w-8xl">
              <div className="flex flex-col justify-between mr-10">
                <img className="w-100" alt="book cover" src="https://github.com/DecouvreBitcoin/sovereign-university-data/blob/main/resources/books/the-sovereign-individual/assets/cover_en.jpg?raw=true" />
                {/*<img className="w-100" alt="book cover" src={book?.cover} />*/}
                <div className="flex flex-row justify-evenly mt-4 w-full">
                  <Button size="s" variant="tertiary" className="mx-2 w-full" onClick={DownloadEbook}>
                    PDF / E-book
                  </Button>
                  <Button size="s" variant="tertiary" className="mx-2 w-full" onClick={BuyBook}>
                    Buy
                  </Button>
                </div>
              </div>

              <div className="flex flex-col">
                <div>
                  <h2 className="mb-2 text-4xl font-bold text-primary-800">
                    {book?.title}
                  </h2>

                  <div className="text-sm mt-2">
                    <h5 className="italic font-thin">{book?.author}, {book?.publication_year}.</h5>
                  </div>
                </div>

                <div className='mt-2'>
                  <span className="italic font-thin text-xs">Topics addressed : </span>
                  {book?.tags.map((object, i) => <Tag>{object} </Tag>)}
                </div>

                <div className="border-l-4 pl-4 border-primary-600">
                  <h3 className="mb-4 text-lg text-primary-900 font-semibold">Abstract</h3>
                  <p className="max-w-2xl text-sm text-justify whitespace-pre-line text-ellipsis line-clamp-[20]">
                    {book?.description}
                  </p>
                </div>

                {/*<RelatedResources
                  audioBook={[{ label: 'Need to be recorded!' }]}
                  interview={[
                    {
                      label: 'CEO Interview',
                      path: replaceDynamicParam(Routes.Interview, {
                        interviewId: 'ja78172',
                      }),
                    },
                  ]}
                  course={[
                    {
                      label: 'BTC 204',
                      path: replaceDynamicParam(Routes.Course, {
                        courseId: 'btc-204',
                      }),
                    },
                  ]}
                />*/}
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-row justify-between mx-auto my-6 p-2 max-w-5xl">
          <img className="flex flex-col mt-10 -ml-20 h-80 mr-10" src={readingRabbit} />

          <div className="flex flex-col float-right">
            {!book?.summary_text &&
              <BookSummary
                contributor={{
                  username: 'Asi0',
                  title: 'Bitcoiner',
                  image:
                    'https://github.com/DecouvreBitcoin/sovereign-university-data/blob/main/resources/builders/konsensus-network/assets/logo.jpg?raw=true',
                }}
                title={book?.title ? book?.title : ""}
                content={book?.summary_text ? book?.summary_text : book?.description} /* TEMP FOR UI DEV, replace book.description with '' */
              />
            }
          </div>
        </div>

        {/*<div className="flex flex-row justify-between mx-auto my-6 p-2 max-w-5xl">
          <ResourceReview />
          </div>*/}
      </div>
    </MainLayout>
  );
};
