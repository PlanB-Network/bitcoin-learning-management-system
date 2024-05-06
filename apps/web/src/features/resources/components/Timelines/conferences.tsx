import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';
import { RxCaretLeft, RxCaretRight } from 'react-icons/rx';

import { cn } from '@sovereign-university/ui';

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
    (v, i) => '' + (2009 + i),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: years.indexOf('2024') - 1,
    containScroll: false,
    breakpoints: {
      '(min-width: 768px)': { containScroll: 'trimSnaps' },
    },
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (slideIndex: number) => {
      if (emblaApi) emblaApi.scrollTo(slideIndex);
    },
    [emblaApi],
  );

  return (
    <div className="flex relative w-full max-w-[914px] mx-auto mt-8 gap-2 max-md:bg-darkOrange-11 max-md:py-4 max-md:shadow-sm-card">
      <button
        className="max-md:hidden p-[11px] rounded-lg bg-newBlack-3 text-darkOrange-7 hover:bg-white hover:text-darkOrange-5 leading-none transition-colors"
        onClick={scrollPrev}
      >
        <RxCaretLeft size={24} />
      </button>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2">
          {years.map((year, index) => (
            <button
              key={year}
              className={cn(
                'p-[14px] rounded-lg bg-newBlack-3 text-darkOrange-7 hover:bg-white hover:text-darkOrange-5 text-lg font-medium leading-none transition-colors',
                activeYear === year ? 'bg-white text-darkOrange-5' : '',
              )}
              onClick={() => {
                setActiveYear(year);
                scrollTo(index);
              }}
            >
              {year}
            </button>
          ))}
        </div>
        <div className="absolute h-full w-20 min-[1900px]:w-40 top-0 left-0 flex justify-center items-center bg-gradient-to-r from-[#A4A4A4]/75 to-transparent z-10 md:hidden">
          <RxCaretLeft
            size={40}
            className="text-white hover:text-newOrange-1 hover:cursor-pointer z-10 transition-colors"
            onClick={scrollPrev}
          />
        </div>
        <div className="absolute h-full w-20 min-[1900px]:w-40 top-0 right-0 flex justify-center items-center bg-gradient-to-r from-transparent to-[#A4A4A4]/75 z-10 md:hidden">
          <RxCaretRight
            size={40}
            className="text-white hover:text-newOrange-1 hover:cursor-pointer z-10 transition-colors"
            onClick={scrollNext}
          />
        </div>
      </div>
      <button
        className="max-md:hidden p-[11px] rounded-lg bg-newBlack-3 text-darkOrange-7 hover:bg-white hover:text-darkOrange-5 leading-none transition-colors"
        onClick={scrollNext}
      >
        <RxCaretRight size={24} />
      </button>
    </div>
  );
};
