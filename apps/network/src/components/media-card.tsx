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
  BackgroundColor?: 'dark' | 'light' | 'border-dark' | 'transparent' | 'none';
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
      withYPadding={false}
      className={cn(
        'shadow-lg rounded-[48px]',
        className,
        BackgroundColor === 'dark' ? 'lg:bg-gradient-network-bt-dark' : '',
        BackgroundColor === 'light' ? 'lg:bg-gradient-network-bt' : '',
        BackgroundColor === 'transparent' ? 'lg:bg-[#00000088]' : '',
      )}
    >
      {!isMobile && TopElement ? (
        // biome-ignore lint/complexity/noUselessFragments: useful
        <>{TopElement}</>
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
          BackgroundColor === 'transparent' ? 'max-lg:bg-[#00000088]' : '',
          BackgroundColor === 'border-dark' ? 'max-lg:bg-network-cards' : '',
        ].join(' ')}
      >
        {subtitleUnderImage && isMobile ? (
          <>
            <DisplayImage
              imageUrl={imageUrl}
              isLeft={isLeft}
              alt={alt}
              imageClassName={imageClassName}
              subtitleUnderImage={subtitleUnderImage}
            />
            <DisplayTitle
              isLeft={isLeft}
              title={title}
              titleClassName={`${titleClassName} absolute mt-4 px-4`}
            />
          </>
        ) : null}

        <div
          className={cn(
            'h-full z-10 p-5 lg:mt-4 flex flex-col gap-5 lg:gap-15 lg:pb-10',
            'max-lg:px-4',
            !isLeft ? ' lg:items-end lg:self-end' : '',
          )}
        >
          {!(subtitleUnderImage && isMobile) ? (
            <DisplayTitle
              isLeft={isLeft}
              title={title}
              titleClassName={titleClassName}
            />
          ) : null}

          {isMobile && TopElement ? (
            <div className="mt-4">{TopElement}</div>
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

        {subtitleUnderImage && isMobile ? (
          <BottomStuff
            bottomElement={BottomElement}
            subtitleClassName={subtitleClassName}
            subtext={subtext}
            isLeft={isLeft}
          />
        ) : (
          <DisplayImage
            imageUrl={imageUrl}
            isLeft={isLeft}
            alt={alt}
            imageClassName={imageClassName}
            subtitleUnderImage={subtitleUnderImage}
          />
        )}
      </fieldset>
    </PageBlock>
  );
}

function DisplayTitle({
  titleClassName,
  title,
  isLeft,
}: {
  titleClassName: string;
  title?: string;
  isLeft: boolean;
}) {
  if (!title) return null;

  return (
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
  );
}

function DisplayImage({
  imageUrl,
  imageClassName,
  alt,
  subtitleUnderImage,
  isLeft,
}: {
  imageUrl: string;
  imageClassName?: string;
  alt?: string;
  subtitleUnderImage?: boolean;
  isLeft: boolean;
}) {
  const isMobile = useSmaller('lg');

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={[
        'object-cover self-center w-full h-full max-lg:mb-4',
        'rounded-2xl',
        subtitleUnderImage && isMobile ? '' : 'absolute',
        // subtitleUnderImage ? 'max-lg:-mt-28' : '',
        isLeft ? 'lg:self-end' : 'lg:self-start',
        imageClassName,
      ].join(' ')}
    />
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
          'max-lg:mt-2 max-lg:px-4 ',
          'text-center text-base lg:text-xl max-lg:font-normal title-base text-gray-100',
          ' whitespace-pre-wrap',
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
