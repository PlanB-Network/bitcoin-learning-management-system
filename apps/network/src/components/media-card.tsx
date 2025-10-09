import { cn } from '@blms/ui';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import PageBlock from './page-block.tsx';

type MediaCardProps = {
  title: string;
  subtext: string;
  imageUrl: string;
  titleClassName?: string;
  subtitleClassName?: string;
  imageClassName?: string;
  alt?: string;
  orientation?: 'vertical' | 'horizontal';
  subtitleUnderImage?: boolean;
};

export default function MediaCard({
  title,
  subtext,
  imageUrl,
  titleClassName = 'max-w-[55%]',
  subtitleClassName = 'max-w-[50%]',
  imageClassName = 'lg:max-w-[50%]',
  alt = '',
  orientation = 'vertical',
  subtitleUnderImage = false,
}: MediaCardProps) {
  const isHorizontal = orientation === 'horizontal';
  const isMobile = useSmaller('lg');

  return (
    <PageBlock>
      <fieldset
        aria-labelledby="media-card-title"
        className={[
          'relative h-full w-full rounded-2xl shadow-lg transition-transform',
          'hover:-translate-y-0.5 hover:shadow-xl',
          isHorizontal ? 'grid md:grid-cols-2' : 'flex flex-col lg:flex-col',
        ].join(' ')}
      >
        <div className="lg:absolute">
          <h3
            id="media-card-title"
            className={cn(
              'max-lg:display-base lg:text-4xl xl:text-6xl font-semibold lg:tracking-tight whitespace-pre-wrap',
              titleClassName,
            )}
          >
            {title}
          </h3>
          {subtitleUnderImage && isMobile ? null : (
            <p
              className={cn(
                'mt-8 max-xl:text-base title-base text-gray-100 whitespace-pre-wrap',
                subtitleClassName,
              )}
            >
              {subtext}
            </p>
          )}
        </div>
        <img
          src={imageUrl}
          alt={alt}
          className={[
            'w-full object-cover self-center lg:self-end',
            'rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none',
            imageClassName,
          ].join(' ')}
        />
        {subtitleUnderImage && isMobile ? (
          <p
            className={cn(
              'mt-8 title-base text-gray-100  whitespace-pre-wrap',
              subtitleClassName,
            )}
          >
            {subtext}
          </p>
        ) : null}
      </fieldset>
    </PageBlock>
  );
}
