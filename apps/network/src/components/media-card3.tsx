import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import type React from 'react';
import { NetworkButton } from './network-button.tsx';

interface MediaCard3Props {
  title: React.ReactNode;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  titleClassName?: string;
  bottomElement?: React.ReactNode;
  orientation?: 'left' | 'right';
}

export default function MediaCard3({
  title,
  subtitle,
  buttonText,
  buttonLink,
  imageUrl,
  titleClassName = 'lg:max-w-[700px]',
  bottomElement,
  orientation = 'left',
}: MediaCard3Props) {
  return (
    <div className={cn('relative flex justify-center w-full')}>
      <img
        src={imageUrl}
        alt="Hero background"
        className="max-lg:hidden absolute object-cover w-full"
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
        <div className="flex flex-col gap-8 xl:gap-20 w-full">
          <h1
            className={cn(
              'display-medium lg:text-6xl font-semibold z-20 max-lg:text-center',
              titleClassName,
            )}
          >
            {title}
          </h1>
          <img
            src={imageUrl}
            alt="Hero background"
            className="lg:hidden object-cover w-full"
          />
          <p
            className={cn(
              'title-small lg:title-base max-lg:text-center lg:max-w-[410px] text-gray-300 ',
            )}
          >
            {subtitle}
          </p>
        </div>
        <Link to={buttonLink} className={'max-lg:self-center'}>
          <NetworkButton variant={'secondary'}>{buttonText}</NetworkButton>
        </Link>
        {bottomElement ? bottomElement : null}
      </div>
      {/* <div className="absolute inset-0 bg w-full h-full bg-network-hero" /> */}
    </div>
  );
}
