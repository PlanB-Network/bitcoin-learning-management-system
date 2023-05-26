import { Card } from '../../atoms/Card';
import { Contributor } from '../Contributor';
import { ResourceRate } from '../ResourceRate';

interface ResourceReviewProps {
  comments: { content: string }[];
}

export const ResourceReview = () => {
  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ResourceRate rate={4.2} />

      <Card>
        <div className="flex flex-row">
          <div className="mr-6">
            <Contributor
              contributor={{
                username: 'Asi0',
                title: 'Bitcoiner',
                image:
                  'https://github.com/DecouvreBitcoin/sovereign-university-data/blob/main/resources/books/21-lessons/assets/cover-en.jpg?raw=true',
              }}
            />
          </div>

          <div className="flex flex-col flex-1">
            <h5 className="mb-4 leading-tight border-b border-gray-200 border-solid">
              Best book to learn about Bitcoin
            </h5>
            <p className="text-xs line-clamp-4 text-ellipsis">
              Thanks to this, I have been able to complete a battle in my sixth
              novel and nearly write thirty pages in under three days. Thank you
              so much for this truly amazing mix!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
