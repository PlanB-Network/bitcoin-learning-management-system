import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import arrowForward from '../../../../assets/icons/arrow_forward.svg';
import blueEllipse from '../../../../assets/resources/blue-ellipse.svg';
import { Card } from '../../../../atoms/Card';
import { Contributor } from '../../../../components/Contributor';
import { compose } from '../../../../utils';

interface BookSummaryProps {
  contributor?: {
    username: string;
    title?: string;
    image?: string;
  };
  content?: string;
  title: string;
}

export const BookSummary = ({
  contributor,
  content,
  title,
}: BookSummaryProps) => {
  const { t } = useTranslation();
  const [isExtended, setIsExtended] = useState(false);

  return (
    <div className="flex flex-col">
      <h4 className="mb-8 ml-4 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
        {t('book.bookSummary.title')}
      </h4>
      <Card
        className={compose(
          'max-w-[740px] px-6 pb-2 relative',
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
                prefix={t('book.offeredBy')}
                contributor={contributor}
              />
            </div>
          )}
        </div>
      </Card>
      {isExtended ? (
        <p className="text-primary-200 flex self-end whitespace-nowrap text-xs font-thin italic md:mr-8 lg:mr-10">
          {t('book.bookSummary.notice')}
        </p>
      ) : (
        <div className="flex w-full -translate-y-7 flex-row items-center justify-between px-14">
          <div className="flex gap-1">
            {_.times(3, (i) => (
              <img
                key={i}
                className="w-4"
                src={blueEllipse}
                alt={t('imagesAlt.blueEllipse')}
              />
            ))}
          </div>
          <img
            onClick={() => setIsExtended(true)}
            alt={t('imagesAlt.forwardArrow')}
            src={arrowForward}
          />
        </div>
      )}
    </div>
  );
};
