import { Link } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedEvent } from '@blms/types';
import { Button, cn } from '@blms/ui';

import { Image } from '#src/components/image.tsx';
import Flag from '#src/molecules/Flag/index.js';
import { ConversionRateContext } from '#src/providers/conversionRateContext.tsx';
import { resourceImgUrl } from '#src/utils/index.ts';

interface LectureCardProps {
  lecture: JoinedEvent;
}

export const LectureCard = ({ lecture }: LectureCardProps) => {
  const { t } = useTranslation();

  const { conversionRate } = useContext(ConversionRateContext);

  const dollarPrice = lecture.priceDollars;
  const satsPrice =
    conversionRate && dollarPrice !== null
      ? Math.round((dollarPrice * 100_000_000) / conversionRate)
      : -1;

  const isFree = !lecture.priceDollars;

  const GeneralInfos = () => {
    return (
      <div className="flex flex-col gap-[3px] md:gap-1">
        <h3 className="text-white text-sm font-medium leading-tight md:text-lg md:font-bold md:leading-snug line-clamp-2">
          {lecture.name}
        </h3>
        <span className="text-newGray-4 md:text-white text-xs md:text-sm md:font-medium leading-normal">
          {lecture.professorName || lecture.projectName}
        </span>
      </div>
    );
  };

  const PriceInfos = () => {
    return (
      <div className="flex flex-col justify-center text-xs md:text-sm">
        {!isFree && (
          <div className="flex gap-1 text-darkOrange-5 leading-normal">
            <span className="md:font-semibold">${lecture.priceDollars}</span>
            <span>·</span>
            <span>{satsPrice} sats</span>
          </div>
        )}
        {isFree && (
          <span className="leading-normal md:font-semibold uppercase text-darkOrange-5">
            {t('events.card.free')}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <article
        className={cn(
          'flex flex-col w-[137px] md:w-[290px] bg-newBlack-2 p-2 md:p-2.5 rounded-2xl shrink-0 hover:border hover:border-darkOrange-5',
        )}
      >
        {/* Image */}
        <div className="w-full overflow-hidden rounded-[5px] md:rounded-2xl relative mb-2.5 md:mb-2">
          <Image
            breakpoints={{ default: 140, md: 290 }}
            width="432"
            height="308"
            loading="lazy"
            src={resourceImgUrl(lecture)}
            alt={lecture.name ? lecture.name : ''}
            className="object-cover [overflow-clip-margin:_unset] aspect-[432/308] w-full rounded-[5px] md:rounded-2xl"
          />
          <div className="absolute top-2 right-2 bg-white border border-newGray-3 p-1 flex flex-col justify-center items-center gap-1 rounded-xs">
            {lecture.languages.map((language: string) => (
              <Flag code={language} size="m" key={language} />
            ))}
          </div>
        </div>
        <GeneralInfos />
        <div className="flex max-md:flex-col gap-[3px] md:gap-2.5 md:justify-between mt-auto pt-[3px] md:py-[5px]">
          <PriceInfos />
          <Link to={`/resources/lectures/${lecture.id}`} className="md:w-fit">
            <Button size="s" className="w-full">
              {t('words.viewMore')}
            </Button>
          </Link>
        </div>
      </article>
    </>
  );
};
