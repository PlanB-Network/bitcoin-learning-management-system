import { cn } from '@blms/ui';
import type React from 'react';
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
  titleClassName = 'max-w-[700px]',
  subtitleClassName = 'max-w-[50%]',
  subtitleUnderImage = false,
}: HeroProps) => {
  return (
    <PageBlock className="max-w-[1700px]">
      <div
        className={cn(
          'relative flex flex-col tracking-[-0.4px] lg:mx-10',
          className,
        )}
      >
        <div className="lg:absolute left-2 flex flex-col gap-8 xl:gap-32 h-full">
          <h1
            className={cn(
              'lg:mt-12 text-5xl lg:text-6xl xl:text-8xl lg:leading-16 xl:leading-24 font-light text-left',
              titleClassName,
            )}
          >
            {titleElement}
          </h1>
          {subtitleUnderImage ? null : (
            <p className={cn('title-small lg:title-base', subtitleClassName)}>
              {subtitle}
            </p>
          )}
        </div>
        <img
          src={imageUrl}
          alt="Hero background"
          className="max-lg:mt-6 h-[800px] lg:h-[1000px] object-cover"
        />
        {subtitleUnderImage ? (
          <p className={cn('title-small lg:title-base', subtitleClassName)}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </PageBlock>
  );
};
