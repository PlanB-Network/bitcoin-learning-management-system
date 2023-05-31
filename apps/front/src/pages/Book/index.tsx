import { useParams } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { Button } from '../../atoms/Button';
import { Card } from '../../atoms/Card';
import { Tag } from '../../atoms/Tag';
import { MainLayout } from '../../components';
import { OtherSimilarResources } from '../../components/OtherSimilarResources';
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

  // TODO: to be extracted from book data
  const contributor = {
    username: 'Asi0',
    title: 'Bitcoiner',
    image:
      'https://cdn.pixabay.com/photo/2023/05/09/23/47/tree-snake-7982626_960_720.jpg',
  };

  return (
    <MainLayout>
      <div className="flex flex-col bg-primary-800">
        <div className="flex flex-row justify-center">
          <Card className="px-6 max-w-8xl">
            <div className="flex flex-row justify-between mx-auto my-6 w-screen max-w-4xl">
              <div className="flex flex-col justify-between py-4 mr-12 w-max">
                <img className="max-w-xs" alt="book cover" src={book?.cover} />
                <div className="flex flex-row justify-evenly mt-4 w-full">
                  <Button size="s" variant="tertiary" className="mx-2 w-full">
                    PDF / E-book
                  </Button>
                  <Button size="s" variant="tertiary" className="mx-2 w-full">
                    Buy
                  </Button>
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="mb-3 text-2xl font-semibold text-primary-800">
                    {book?.title}
                  </h2>

                  <div className="text-xs">
                    <h5>{book?.author}</h5>
                    <h5>Date: {book?.publication_year}</h5>
                  </div>
                </div>

                <div>
                  <Tag>Bitcoin</Tag>
                  <Tag>Technology</Tag>
                  <Tag>Philosophy</Tag>
                </div>

                <div>
                  <h3 className="mb-4 text-lg">Abstract</h3>
                  <p className="max-w-lg text-xs text-justify text-ellipsis line-clamp-[9]">
                    {book?.description}
                  </p>
                </div>

                <RelatedResources
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
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-row justify-center pb-48">
          <BookSummary
            contributor={contributor}
            title="A journey into sovreignty"
            content="If it's not the Presentation mode that's causing the issue, it's possible that you accidentally triggered a different mode or setting in Figma that is causing the screen to display in black and white with a purple overlay. One thing you could try is to reset your Figma preferences. To do this, click on your user icon in the bottom left-hand corner of the Figma interface, and then select 'Help & Account' from the dropdown menu. From there, select 'Troubleshooting' and then click the 'Reset Figma' button. This should reset your preferences and return Figma to its default settings. If resetting your preferences doesn't work, it's possible that there is another issue causing the problem. You might try clearing your browser's cache and cookies, or trying to access Figma using a different browser or device to see if the issue persists. If none of these solutions work, you may want to contact Figma's support team for further assistance."
          />

          <div className="py-4 max-w-lg">
            <ResourceReview contributor={contributor} />
          </div>
        </div>

        <OtherSimilarResources
          title="Proposition de lecture"
          resources={[
            {
              title: 'Discours de la servitude volontaire',
              id: 'discours-de-la-servitude-volontaire',
              image:
                'https://cdn.pixabay.com/photo/2023/05/09/23/47/tree-snake-7982626_960_720.jpg',
            },
            {
              title: 'Check your financiel priviledge',
              id: 'check-your-financiel-priviledge',
              image:
                'https://cdn.pixabay.com/photo/2023/05/09/23/47/tree-snake-7982626_960_720.jpg',
            },
            {
              title: "L'ordre mondial en mutation",
              id: 'l-ordre-mondial-en-mutation',
              image:
                'https://cdn.pixabay.com/photo/2023/05/09/23/47/tree-snake-7982626_960_720.jpg',
            },
            {
              title: 'Le prix de demain',
              image:
                'https://cdn.pixabay.com/photo/2023/05/09/23/47/tree-snake-7982626_960_720.jpg',
              id: 'le-prix-de-demain',
            },
          ]}
        />
      </div>
    </MainLayout>
  );
};
