import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  title,
}: BookSummaryProps) => {
  const { t } = useTranslation();
  const [isExtended, setIsExtended] = useState(false);

  function DoExpand() {
    setIsExtended(true);
  }

  function BottomButtons() {
    if (!isExtended) {
      return (
        <>
          <div className="absolute -bottom-2 left-12 flex gap-1">
            {_.times(3, (i) => (
              <img
                key={i}
                className="w-4"
                src={blueEllipse}
                alt="a blue ellipse"
              />
            ))}
          </div>
          <img
            onClick={DoExpand}
            className="absolute -bottom-4 right-10 w-8"
            alt="an arrow forward"
            src={arrowForward}
          />
        </>
      );
    } else
      return (
        <p className="text-primary-200 absolute -bottom-6 right-12 flex whitespace-nowrap text-xs font-thin italic">
          {t('book.bookSummary.notice')}
        </p>
      );
  }

  return (
    <>
      <h4 className="mb-8 ml-4 text-4xl font-bold text-white">
        {t('book.bookSummary.title')}
      </h4>
      <Card
        className={compose(
          'max-w-[740px] px-6 pb-2 relative ',
          isExtended ? '' : 'max-h-52'
        )}
      >
        {/* remove max h if not needed here */}
        <div className={isExtended ? '' : 'max-h-36 overflow-hidden'}>
          <header className="flex flex-row justify-between">
            <div>
              <h5 className="mt-2 font-semibold">{title}</h5>
            </div>
          </header>

          <p className="mb-4 mt-8 text-justify text-xs">{content}</p>

          {contributor && (
            <div className="float-right">
              <Contributor
                prefix="Offered by a generous contributor"
                contributor={contributor}
              />
            </div>
          )}
        </div>

        <BottomButtons />
      </Card>
    </>
  );
};
