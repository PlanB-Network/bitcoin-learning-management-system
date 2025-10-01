import { CategorySwitcher } from '@blms/ui';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';

interface ConferenceTimeLineProps {
  activeYear: string;
  setActiveYear: (year: string) => void;
}

export const ConferencesTimeLine = ({
  activeYear,
  setActiveYear,
}: ConferenceTimeLineProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2008 },
    (_v, i) => `${currentYear - i}`,
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    containScroll: 'trimSnaps',
    dragFree: true,
    startIndex: years.indexOf(currentYear.toString()) - 1,
  });

  const scrollTo = useCallback(
    (slideIndex: number) => {
      if (emblaApi) emblaApi.scrollTo(slideIndex);
    },
    [emblaApi],
  );

  return (
    <div className="flex items-center w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2">
          {years.map((year, index) => (
            <CategorySwitcher
              key={year}
              text={year}
              isActive={activeYear === year}
              onClick={() => {
                setActiveYear(year);
                scrollTo(index);
              }}
              inactiveBackgroundColor="bg-neutral-50"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
