import { cn } from '@blms/ui';
import { titleCss } from '#src/utils/css.tsx';
import { NetworkButton } from './network-button.tsx';
import PageBlock from './page-block.tsx';

type MediaCard2Props = {
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
  NoBackground?: boolean;
};

export default function MediaCard2({
  title,
  subtext,
  imageUrl,
  className,
  titleClassName = 'max-w-[800px]',
  subtitleClassName = 'max-w-[700px]',
  imageClassName = '',
  alt = '',
  orientation = 'left',
  NoBackground = false,
}: MediaCard2Props) {
  const isLeft = orientation === 'left';

  return (
    <PageBlock
      className={cn(
        'shadow-lg h-full border-orange-500 bg-gradient-network-bt-transparent',
        isLeft
          ? 'rounded-b-2xl border-b-[1px] border-l-[1px]'
          : 'rounded-b-2xl border-b-[1px] border-r-[1px]',
        className,
      )}
    >
      <fieldset
        aria-labelledby="media-card-title"
        className={[
          'w-full flex flex-col items-center ',
          isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse ',
          NoBackground ? '' : 'max-lg:bg-network-cards',
        ].join(' ')}
      >
        <div
          className={cn(
            'w-[50%] h-full z-10 p-5 lg:mt-4 flex flex-col gap-12 lg:pb-10',
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

          <p
            className={cn(
              'text-center text-base lg:text-xl max-lg:font-normal max-lg:mt-8 title-bas text-gray-300 whitespace-pre-wrap',
              subtitleClassName ?? '',
              isLeft ? 'lg:text-start' : 'lg:text-end',
            )}
          >
            {subtext}
          </p>
          <NetworkButton variant={'secondary'}>TODO</NetworkButton>
        </div>
        <div
          className={cn(
            'w-[50%] flex flex-row',
            isLeft ? 'justify-end' : 'justify-start',
          )}
        >
          <img
            src={imageUrl}
            alt={alt}
            className={['object-cover ', imageClassName].join(' ')}
          />
        </div>
      </fieldset>
    </PageBlock>
  );
}
