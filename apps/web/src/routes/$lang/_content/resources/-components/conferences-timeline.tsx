import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselFadeEdges,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CategorySwitcher,
} from '@blms/ui';
import { useEffect, useMemo, useState } from 'react';

interface ConferenceTimeLineProps {
  activeYear: string;
  setActiveYear: (year: string) => void;
}

export const ConferencesTimeLine = ({
  activeYear,
  setActiveYear,
}: ConferenceTimeLineProps) => {
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () =>
      Array.from(
        { length: currentYear - 2008 },
        (_v, i) => `${currentYear - i}`,
      ),
    [currentYear],
  );

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const startIndex = Math.max(years.indexOf(currentYear.toString()) - 1, 0);

  useEffect(() => {
    if (!carouselApi) return;
    const index = years.indexOf(activeYear);
    if (index >= 0) carouselApi.scrollTo(index);
  }, [activeYear, carouselApi, years]);

  return (
    <Carousel
      className="w-full"
      opts={{
        startIndex,
        containScroll: 'trimSnaps',
        slidesToScroll: 5,
        dragFree: true,
        align: 'start',
      }}
      setApi={setCarouselApi}
    >
      <CarouselContent className="gap-2 px-5">
        {years.map((year) => (
          <CarouselItem key={year} className="basis-auto grow-0 shrink-0 pl-0">
            <CategorySwitcher
              text={year}
              isActive={activeYear === year}
              onClick={() => setActiveYear(year)}
              inactiveBackgroundColor="bg-neutral-50"
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious
        variant="primary"
        rounded
        className="z-10 max-md:hidden"
      />
      <CarouselNext variant="primary" rounded className="z-10 max-md:hidden" />
      <CarouselFadeEdges />
    </Carousel>
  );
};
