import { cn } from '@blms/ui';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { titleCss } from '#src/utils/css.tsx';
import PageBlock from './page-block.tsx';

type MediaCardProps = {
  title: string;
  subtext: string;
  imageUrl: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  imageClassName?: string;
  alt?: string;
  orientation?: 'left' | 'right';
  subtitleUnderImage?: boolean;
  BottomElement?: React.ReactNode;
};

export default function MediaCard({
  title,
  subtext,
  imageUrl,
  className,
  titleClassName = 'max-w-[55%]',
  subtitleClassName = 'max-w-[50%]',
  imageClassName = '',
  alt = '',
  orientation = 'left',
  subtitleUnderImage = false,
  BottomElement,
}: MediaCardProps) {
  const isLeft = orientation === 'left';
  const isMobile = useSmaller('lg');

  return (
    <PageBlock className={className}>
      <fieldset
        aria-labelledby="media-card-title"
        className={[
          'relative w-full pb-5 rounded-2xl shadow-lg transition-transform',
          'hover:-translate-y-0.5 hover:shadow-xl',
          'flex flex-col lg:flex-col',
          'hover:-translate-y-0.5 hover:shadow-xl',
          'max-lg:bg-network-cards',
        ].join(' ')}
      >
        <div
          className={cn(
            'lg:absolute h-full z-10 p-5 flex flex-col justify-between',
            !isLeft ? ' lg:items-end lg:self-end' : '',
          )}
        >
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
            'object-cover self-center max-lg:-mt-8 w-full',
            'rounded-2xl',
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
  return (
    <>
      <p
        className={cn(
          'text-center text-base lg:text-xl max-lg:font-normal max-lg:mt-8 title-bas text-gray-100 whitespace-pre-wrap',
          subtitleClassName ?? '',
          isLeft ? 'lg:text-start' : 'lg:text-end',
        )}
      >
        {subtext}
      </p>
      {bottomElement ? (
        <div className="xl:mb-8 max-lg:mt-8">{bottomElement}</div>
      ) : null}
    </>
  );
}
