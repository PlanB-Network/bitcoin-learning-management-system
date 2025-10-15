import { cn } from '@blms/ui';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { titleCss } from '#src/utils/css.tsx';
import PageBlock from './page-block.tsx';

type MediaCardProps = {
  title?: string;
  subtext: string;
  imageUrl: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  imageClassName?: string;
  alt?: string;
  orientation?: 'left' | 'right';
  subtitleUnderImage?: boolean;
  TopElement?: React.ReactNode;
  BottomElement?: React.ReactNode;
  BackgroundColor?: 'dark' | 'light' | 'border-dark' | 'none';
};

export default function MediaCard({
  title,
  subtext,
  imageUrl,
  className,
  titleClassName = 'max-w-[800px]',
  subtitleClassName = 'max-w-[700px]',
  imageClassName = '',
  alt = '',
  orientation = 'left',
  subtitleUnderImage = false,
  TopElement,
  BottomElement,
  BackgroundColor = 'none',
}: MediaCardProps) {
  const isLeft = orientation === 'left';
  const isMobile = useSmaller('lg');

  return (
    <PageBlock
      className={cn(
        'shadow-lg rounded-[48px]',
        className,
        BackgroundColor === 'dark' ? 'lg:bg-gradient-network-bt-dark' : '',
        BackgroundColor === 'light' ? 'lg:bg-gradient-network-bt' : '',
      )}
    >
      {!isMobile && TopElement ? (
        <>
          {/* {isMobile ? <div className="max-lg:h-4" /> : null} */}
          {TopElement}
        </>
      ) : null}
      <fieldset
        aria-labelledby="media-card-title"
        className={[
          'relative w-full rounded-2xl  ',
          'flex flex-col lg:flex-col ',
          BackgroundColor === 'dark'
            ? 'max-lg:bg-gradient-network-bottom-and-top-dark'
            : '',
          BackgroundColor === 'light'
            ? 'max-lg:bg-gradient-network-bottom-and-top'
            : '',
          BackgroundColor === 'border-dark' ? 'max-lg:bg-network-cards' : '',
        ].join(' ')}
      >
        {isMobile && TopElement ? (
          <div className="mt-4">
            {/* {isMobile ? <div className="max-lg:h-4" /> : null} */}
            {TopElement}
          </div>
        ) : null}
        <div
          className={cn(
            'lg:absolute h-full z-10 p-5 lg:mt-4 flex flex-col justify-between lg:pb-10',
            'max-lg:px-4',
            !isLeft ? ' lg:items-end lg:self-end' : '',
          )}
        >
          {title ? (
            <h3
              className={cn(
                titleCss,
                titleClassName,
                'w-full',
                isLeft ? 'lg:text-start' : 'lg:text-end',
              )}
            >
              {title}
            </h3>
          ) : null}

          {subtitleUnderImage && isMobile ? null : (
            <BottomStuff
              bottomElement={BottomElement}
              subtitleClassName={subtitleClassName}
              subtext={subtext}
              isLeft={isLeft}
            />
          )}
        </div>
        <img
          src={imageUrl}
          alt={alt}
          className={[
            'object-cover self-center max-lg:-mt-8 w-full h-full max-lg:mb-4',
            'rounded-2xl',
            subtitleUnderImage ? 'max-lg:-mt-28' : '',
            isLeft ? 'lg:self-end' : 'lg:self-start',
            imageClassName,
          ].join(' ')}
        />
        {subtitleUnderImage && isMobile ? (
          <BottomStuff
            bottomElement={BottomElement}
            subtitleClassName={subtitleClassName}
            subtext={subtext}
            isLeft={isLeft}
          />
        ) : null}
      </fieldset>
    </PageBlock>
  );
}

function BottomStuff({
  bottomElement,
  subtitleClassName,
  subtext,
  isLeft,
}: {
  bottomElement?: React.ReactNode;
  subtitleClassName?: string;
  subtext?: string;
  isLeft: boolean;
}) {
  const isMobile = useSmaller('lg');
  return (
    <>
      <p
        className={cn(
          'text-center text-base lg:text-xl max-lg:font-normal max-lg:mt-2 title-bas text-gray-100',
          'max-lg:px-4 whitespace-pre-wrap',
          subtitleClassName ?? '',
          isLeft ? 'lg:text-start' : 'lg:text-end',
        )}
      >
        {subtext}
      </p>
      {bottomElement ? (
        <>
          {isMobile ? <div className="max-lg:h-4" /> : null}
          {bottomElement}
        </>
      ) : null}
      {isMobile ? <div className="max-lg:h-5" /> : null}
    </>
  );
}
