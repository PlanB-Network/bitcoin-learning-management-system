import { cn, Image } from '@blms/ui';
import type React from 'react';

interface HeroProps {
  titleElement: React.ReactNode;
  subtitle: string;
  imageUrl: string;
  titleClassName?: string;
  subtitleClassName?: string;
  subtitleUnderImage?: boolean;
}

export const Hero = ({
  titleElement,
  subtitle,
  imageUrl,
  titleClassName = 'max-w-[700px]',
  subtitleClassName = 'max-w-[50%]',
  subtitleUnderImage = false,
}: HeroProps) => {
  return (
    <div className={cn('relative flex justify-center mx-auto h-full w-full')}>
      <div className="h-fit lg:h-[827px] w-full">
        <div
          className={cn(
            'max-w-[1000px] mx-auto lg:absolute z-10 inset-0 flex flex-col',
            'gap-8 xl:gap-16 tracking-[-0.4px]',
            'max-2xl:pl-6',
          )}
        >
          <h1
            className={cn(
              'text-5xl lg:text-6xl xl:text-8xl lg:leading-16 xl:leading-24 font-light z-20 mt-10 lg:mt-30',
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
        <div className="max-lg:hidden absolute inset-0 bg w-full h-full bg-network-hero" />
        <Image
          src={imageUrl}
          alt="Hero background"
          className="lg:h-full w-full object-cover"
          breakpoints={{ default: 700, md: 1500 }}
        />
      </div>
    </div>
  );
};
