import { cn, Image } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import type React from 'react';
import { NetworkButton } from './network-button.tsx';

interface MediaCard3Props {
  title: React.ReactNode;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  buttonText2?: string;
  buttonLink2?: string;
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
  buttonText2,
  buttonLink2,
  imageUrl,
  titleClassName = 'lg:max-w-[700px]',
  bottomElement,
  orientation = 'left',
}: MediaCard3Props) {
  return (
    <div className={cn('relative flex justify-center w-full')}>
      <Image
        src={imageUrl}
        alt="Hero background"
        className="max-lg:hidden absolute object-cover w-full max-w-[2000px]"
        breakpoints={{ default: 700, md: 1500 }}
        loading="lazy"
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
        <div className="flex flex-col xl:gap-20 w-full">
          <h1
            className={cn(
              'display-medium lg:text-6xl font-semibold z-20 max-lg:text-center',
              titleClassName,
            )}
          >
            {title}
          </h1>
          <Image
            src={imageUrl}
            alt="Hero background"
            className="lg:hidden object-cover w-full"
            breakpoints={{ default: 700, md: 1500 }}
            loading="lazy"
          />
          <p
            className={cn(
              'title-small lg:title-base max-lg:text-center lg:max-w-[410px] text-gray-300 mt-8 ',
            )}
          >
            {subtitle}
          </p>
        </div>

        {buttonText2 && buttonLink2 ? (
          <div className="flex flex-col lg:flex-row gap-5 max-lg:self-center">
            <Link
              to={buttonLink2}
              className={'max-lg:self-center'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <NetworkButton variant={'secondary'}>{buttonText2}</NetworkButton>
            </Link>
            <Link
              to={buttonLink}
              className={'max-lg:self-center'}
              viewTransition
            >
              <NetworkButton variant={'tertiary'}>{buttonText}</NetworkButton>
            </Link>
          </div>
        ) : (
          <Link to={buttonLink} className={'max-lg:self-center'} viewTransition>
            <NetworkButton variant={'secondary'}>{buttonText}</NetworkButton>
          </Link>
        )}
        {bottomElement ? bottomElement : null}
      </div>
      {/* <div className="absolute inset-0 bg w-full h-full bg-network-hero" /> */}
    </div>
  );
}
