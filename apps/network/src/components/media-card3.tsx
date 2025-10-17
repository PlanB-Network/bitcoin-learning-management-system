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
  bottomElement?: React.ReactNode;
  orientation?: 'left' | 'right';
}

export default function MediaCard3({
  title,
  subtitle,
  buttonText,
  imageUrl,
  titleClassName = 'max-w-[700px]',
  subtitleUnderImage = false,
  bottomElement,
  orientation = 'left',
}: MediaCard3Props) {
  return (
    <div className={cn('relative flex justify-center w-full')}>
      <img
        src={imageUrl}
        alt="Hero background"
        className="absolute object-cover w-full"
      />
      <div
        className={cn(
          'flex flex-col w-full max-w-[2000px] mx-4 lg:mx-10',
          orientation === 'left'
            ? 'items-start  text-left'
            : 'items-end  text-end',
          'z-10 inset-0',
          'gap-8 xl:gap-20 tracking-[-0.4px]',
          'pt-8',
        )}
      >
        <div className="flex flex-col gap-8 xl:gap-20">
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
        </div>
        <NetworkButton variant={'secondary'}>{buttonText}</NetworkButton>
        {bottomElement ? bottomElement : null}
      </div>
      {/* <div className="absolute inset-0 bg w-full h-full bg-network-hero" /> */}
    </div>
  );
}
