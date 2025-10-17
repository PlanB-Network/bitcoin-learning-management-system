import { cn } from '@blms/ui';
import type React from 'react';
import { NetworkButton } from './network-button.tsx';

interface MediaCard3Props {
  title: React.ReactNode;
  subtitle: string;
  buttonText: string;
  imageUrl: string;
  titleClassName?: string;
  subtitleUnderImage?: boolean;
}

export default function MediaCard3({
  title,
  subtitle,
  buttonText,
  imageUrl,
  titleClassName = 'max-w-[700px]',
  subtitleUnderImage = false,
}: MediaCard3Props) {
  return (
    <div className={cn('relative flex justify-center mx-auto w-full')}>
      <div className="w-full">
        <div
          className={cn(
            'mx-auto absolute z-10 inset-0 flex flex-col',
            'gap-8 xl:gap-16 tracking-[-0.4px]',
            'pt-8 text-left',
          )}
        >
          <h1
            className={cn(
              'text-5xl lg:text-6xl font-semibold z-20',
              titleClassName,
            )}
          >
            {title}
          </h1>
          {subtitleUnderImage ? null : (
            <p
              className={cn(
                'max-w-[410px] title-small lg:title-base text-gray-300',
              )}
            >
              {subtitle}
            </p>
          )}
          <NetworkButton variant={'secondary'}>{buttonText}</NetworkButton>
        </div>
        <div className="absolute inset-0 bg w-full h-full bg-network-hero" />
        <img
          src={imageUrl}
          alt="Hero background"
          className="w-full  object-cover"
        />
      </div>
    </div>
  );
}
