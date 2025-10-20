import { cn } from '@blms/ui';
import { NetworkButton } from './network-button.tsx';
import PageBlock from './page-block.tsx';

type MediaCard2Props = {
  title: string;
  subtext: string;
  buttontext?: string;
  tagText?: string;
  imageUrl: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  imageClassName?: string;
  alt?: string;
  orientation?: 'left' | 'right';
  subtitleUnderImage?: boolean;
};

export default function MediaCard2({
  title,
  subtext,
  buttontext,
  tagText,
  imageUrl,
  className,
  titleClassName = 'max-w-[800px]',
  subtitleClassName = 'max-w-[700px]',
  imageClassName = '',
  alt = '',
  orientation = 'left',
}: MediaCard2Props) {
  const isLeft = orientation === 'left';

  return (
    <PageBlock
      withYPadding={false}
      className={cn(
        'shadow-lg h-full border-white max-lg:mx-8 border-[1px] rounded-[60px]',
        className,
      )}
    >
      <fieldset
        aria-labelledby="media-card-title"
        className={cn(
          'w-full flex flex-col-reverse lg:flex-col items-center max-lg:pt-4',
          isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse ',
        )}
      >
        <div
          className={cn(
            'lg:w-[50%] h-full z-10 p-5 lg:mt-4 flex flex-col gap-12 lg:pb-10 items-center',
            !isLeft ? ' lg:items-end lg:self-end' : '',
          )}
        >
          {tagText ? (
            <NetworkButton
              size={'s'}
              className={cn(
                'max-lg:hidden',
                isLeft ? 'lg:self-start' : 'lg:self-end',
              )}
              variant={'tag'}
              disabled
            >
              {tagText}
            </NetworkButton>
          ) : null}
          <h3
            className={cn(
              'max-lg:title-large lg:text-6xl xl:text-6xl text-center font-semibold lg:tracking-tight whitespace-pre-wrap',
              titleClassName,
              'w-full',
              isLeft ? 'lg:text-start' : 'lg:text-end',
            )}
          >
            {title}
          </h3>

          <p
            className={cn(
              'text-center text-base lg:text-xl max-lg:font-normal title-bas text-gray-300 whitespace-pre-wrap',
              subtitleClassName ?? '',
              isLeft ? 'lg:text-start' : 'lg:text-end',
            )}
          >
            {subtext}
          </p>
          {buttontext ? (
            <NetworkButton
              className={cn(isLeft ? 'lg:self-start' : 'lg:self-end')}
              variant={'secondary'}
            >
              {buttontext}
            </NetworkButton>
          ) : null}
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
