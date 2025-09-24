import type { JoinedEvent } from '@blms/types';
import { cn, Flag, Image } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TbChevronRight } from 'react-icons/tb';
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
      <div className="flex flex-col justify-between sm:p-4 sm:pt-0 flex-grow sm:gap-7">
        <div className="flex flex-col gap-1 max-sm:grow max-sm:justify-center">
          <span className="title-small sm:title-base text-maroon-11 line-clamp-2">
            {lecture.name}
          </span>

          {(lecture.professorName || lecture.projectName) && (
            <span className="text-newBlack-3 body-small sm:body-base">
              {lecture.professorName ?? lecture.projectName ?? ''}
            </span>
          )}
        </div>
        <div className="flex flex-col ml-auto mt-auto max-sm:hidden text-orange-500 text-end">
          {!isFree && (
            <>
              <span className="body-small-bold">${lecture.priceDollars}</span>
              <span className="body-extra-small">{satsPrice} sats</span>
            </>
          )}
          {isFree && <span className="body-small-bold">{t('words.free')}</span>}
        </div>
      </div>
    );
  };

  return (
    <Link
      to={`/resources/lectures/${lecture.id}`}
      className={cn(
        'flex justify-between max-sm:items-center w-full sm:w-60 sm:border border-neutral-100 rounded-lg sm:rounded-2xl',
      )}
    >
      <div className="flex max-sm:gap-2 sm:flex-col flex-grow">
        <div className="w-22 sm:w-full overflow-hidden max-sm:rounded-l-lg sm:rounded-t-2xl sm:rounded-b-lg relative sm:mb-2 max-sm:shrink-0">
          <Image
            breakpoints={{ default: 88, sm: 240 }}
            width="240"
            height="135"
            loading="lazy"
            src={resourceImgUrl(lecture)}
            alt={lecture.name || 'Lecture image'}
            className="object-cover [overflow-clip-margin:_unset] aspect-[88/56] sm:aspect-[240/135] w-full h-full max-sm:rounded-lg sm:rounded-t-2xl sm:rounded-b-lg"
          />
          <div className="absolute top-2.5 right-2 bg-white p-1 flex flex-col justify-center items-center gap-1 rounded-full max-sm:hidden">
            {lecture.languages.map((language: string) => (
              <Flag code={language} size="m" key={language} />
            ))}
          </div>
        </div>
        <GeneralInfos />
      </div>
      <TbChevronRight
        className="text-neutral-300 sm:hidden shrink-0"
        size={20}
      />
    </Link>
  );
};
