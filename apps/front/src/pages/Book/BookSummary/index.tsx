import _ from 'lodash';
import { useState } from 'react';

import { compose } from '../../../../src/utils';
import arrowForward from '../../../assets/icons/arrow_forward.svg';
import blueEllipse from '../../../assets/resources/blue-ellipse.svg';
import { Card } from '../../../atoms/Card';
import { Contributor } from '../../../components/Contributor';

interface BookSummaryProps {
  contributor?: {
    username: string;
    title?: string;
    image?: string;
  };
  content: string;
  title: string;
}

export const BookSummary = ({
  contributor,
  content,
  title
}: BookSummaryProps) => {

  const [isExtended, setIsExtended] = useState(false);

  function DoExpand() {
    setIsExtended(true);
  }

  function BottomButtons() {
    if (!isExtended) {
      return (
        <>
          <div className="flex gap-1 absolute -bottom-2 left-12">
            {_.times(3, (i) => (
              <img className="w-15" src={blueEllipse} />
            ))}
          </div>
          <img onClick={DoExpand} className="absolute -bottom-4 right-10 w-8" src={arrowForward} />
        </>
      );
    } else return <span className='flex absolute -bottom-6 right-12 text-xs text-primary-200 italic font-thin'>this summary is linked to github, for any modification or addition</span>

  }

  return (
    <>
      <h4 className="text-4xl font-bold text-white ml-4 mb-8">The book summary</h4>
      <Card className={compose('max-w-[740px] px-6 pb-2 relative ', isExtended ? '' : 'max-h-52')}>
        {/* remove max h if not needed here */}
        <div className={(isExtended ? '' : 'max-h-36 overflow-hidden')}>
          <header className="flex flex-row justify-between">
            <div>
              <h5 className="mt-2 font-semibold">{title}</h5>
            </div>
          </header>

          <p className="mt-8 mb-4 text-xs text-justify">{content}</p>

          {contributor && (
            <div className='float-right'>
              <Contributor prefix="Offered by a generous contributor" contributor={contributor} />
            </div>
          )}
        </div>

        <BottomButtons />

      </Card>

    </>
  );
};
