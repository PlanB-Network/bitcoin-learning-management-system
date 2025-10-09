import { cn } from '@blms/ui';
import type React from 'react'; // React is required for React.ReactNode
import PageBlock from './page-block.tsx';

interface HeroProps {
  titleElement: React.ReactNode;
  subtitle: string;
  imageUrl: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  subtitleUnderImage?: boolean;
}

export const Hero = ({
  titleElement,
  subtitle,
  imageUrl,
  className = '',
  titleClassName = 'max-w-[55%]',
  subtitleClassName = 'max-w-[50%]',
  subtitleUnderImage = false,
}: HeroProps) => {
  return (
    <PageBlock>
      <div
        className={cn('relative flex flex-col tracking-[-0.4px]', className)}
      >
        <div className="lg:absolute left-2 flex flex-col gap-4 lg:gap-8 xl:gap-20 h-full">
          <h1
            className={cn(
              'lg:mt-12 text-5xl lg:text-6xl xl:text-8xl lg:leading-16 xl:leading-24 font-light text-left',
              titleClassName,
            )}
          >
            {titleElement}
          </h1>
          {subtitleUnderImage ? null : (
            <p
              className={cn(
                'title-small lg:title-medium text-left',
                subtitleClassName,
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        <img
          src={imageUrl}
          alt="Hero background"
          className="w-full h-auto object-cover"
        />
        {subtitleUnderImage ? (
          <p
            className={cn(
              'title-small lg:title-medium text-left',
              subtitleClassName,
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </PageBlock>
  );
};
