import type { ButtonProps } from '@blms/ui';
import { Button, cn, Flag, Image } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import type { JSX } from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';

export interface VerticalCardProps {
  imageSrc: string;
  title: string;
  subtitle?: string;
  category?: string;
  excerpt?: string;
  cardColor?: 'black' | 'grey' | 'maroon' | 'orange' | 'lightgrey';
  onHoverCardColorChange?: boolean;
  buttonText?: string;
  buttonIcon?: JSX.Element;
  buttonVariant?: ButtonProps['variant'];
  buttonMode?: ButtonProps['mode'];
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonIcon?: JSX.Element;
  secondaryButtonVariant?: ButtonProps['variant'];
  secondaryButtonMode?: ButtonProps['mode'];
  secondaryLink?: string;
  tertiaryButtonText?: string;
  tertiaryButtonIcon?: JSX.Element;
  tertiaryButtonVariant?: ButtonProps['variant'];
  tertiaryButtonMode?: ButtonProps['mode'];
  tertiaryLink?: string;
  externalLink?: boolean;
  onHoverArrow?: boolean;
  tags?: string[];
  languages?: string[] | null;
  className?: string;
  imgClassName?: string;
  bodyClassName?: string;
  flagsOnMobile?: boolean;
  isScreenMd?: boolean | null;
}

export const VerticalCard = ({
  imageSrc,
  title,
  subtitle,
  category,
  excerpt,
  cardColor = 'grey',
  onHoverCardColorChange,
  buttonText,
  buttonIcon,
  buttonLink,
  secondaryButtonText,
  secondaryButtonIcon,
  secondaryButtonVariant = 'secondary',
  secondaryButtonMode,
  secondaryLink,
  tertiaryButtonText,
  tertiaryButtonIcon,
  tertiaryButtonVariant = 'secondary',
  tertiaryButtonMode,
  tertiaryLink,
  externalLink,
  onHoverArrow = true,
  languages,
  tags,
  className,
  imgClassName,
  bodyClassName,
  flagsOnMobile,
  isScreenMd = true,
}: VerticalCardProps) => {
  const cardColorClasses = {
    black: 'bg-black',
    grey: 'bg-newBlack-2',
    lightgrey: 'bg-newGray-6',
    maroon: 'bg-darkOrange-7',
    orange: 'bg-darkOrange-5',
  };

  const hoverCardColorClasses = {
    black: 'hover:bg-newBlack-3',
    grey: 'hover:bg-newBlack-3',
    lightgrey: 'bg-newGray-5',
    maroon: 'hover:bg-darkOrange-8',
    orange: 'hover:bg-darkOrange-6',
  };

  const subtitleColorClasses = {
    black: 'text-darkOrange-5',
    grey: 'text-darkOrange-5',
    lightgrey: 'text-darkOrange-5',
    maroon: 'text-newGray-6',
    orange: 'text-newGray-6',
  };

  const titleColorClasses = {
    black: 'text-white',
    grey: 'text-white',
    lightgrey: 'text-black',
    maroon: 'text-white',
    orange: 'text-white',
  };

  return (
    <div
      className={cn(
        'flex flex-col p-2.5 rounded-[10px] md:rounded-3xl',
        className,
        imgClassName,
        cardColorClasses[cardColor],
        onHoverCardColorChange && hoverCardColorClasses[cardColor],
      )}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden mx-auto shrink-0',
          imgClassName,
        )}
      >
        <Image
          src={imageSrc}
          alt={title}
          width={320}
          height={240}
          breakpoints={{ default: 140, md: 320 }}
          loading="lazy"
          className={cn(
            'h-[105px] md:h-[241px] object-cover [overflow-clip-margin:_unset] lg:mb-4',
            imgClassName
              ? imgClassName
              : 'w-[137px] md:w-[320px] rounded-md md:rounded-2xl mb-2.5',
          )}
        />
        {languages && languages.length > 0 && (
          <div
            className={cn(
              'absolute top-1 md:top-3 right-1 md:right-4 flex flex-col gap-1 md:gap-2.5 p-1 md:p-2 bg-white rounded-[3px] md:rounded-md',
              !flagsOnMobile && 'max-md:hidden',
            )}
          >
            {languages.map((language) => (
              <Flag code={language} size="m" key={language} />
            ))}
          </div>
        )}
      </div>
      <div className={cn('grow flex flex-col justify-between', bodyClassName)}>
        <div className="flex flex-col">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap md:hidden gap-1">
              {tags.slice(0, isScreenMd ? tags.length : 1).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-gray-700 bg-gray-200 rounded-[5px] px-1 py-px"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {category && (
            <span
              className={cn(
                'mobile-caption1 md:desktop-body1 capitalize !font-semibold',
                subtitleColorClasses[cardColor],
              )}
            >
              {category}
            </span>
          )}
          <h4
            className={cn(
              'mobile-subtitle2 md:desktop-h6 md:!font-medium capitalize line-clamp-2',
              titleColorClasses[cardColor],
            )}
          >
            {title}
          </h4>
          {excerpt && (
            <span className="max-md:hidden md:desktop-body1 text-newGray-1 line-clamp-3 mb-2.5">
              {excerpt}
            </span>
          )}
          {subtitle && (
            <span
              className={cn(
                'mobile-caption1 md:desktop-body1',
                subtitleColorClasses[cardColor],
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
        <div className="flex flex-wrap max-md:flex-col max-md:justify-center items-center w-full mt-1 md:mt-4 gap-1.5 md:gap-5">
          {buttonText && (
            <Button className="w-full lg:hidden h-8" size={'m'}>
              {buttonText}
              <span className="ml-3">{buttonIcon}</span>
            </Button>
          )}
          {secondaryButtonText &&
            secondaryLink !== buttonLink &&
            (secondaryLink ? (
              externalLink ? (
                <a
                  href={secondaryLink}
                  target="_blank"
                  className="max-md:w-full"
                  rel="noreferrer"
                >
                  <Button
                    variant={secondaryButtonVariant}
                    mode={secondaryButtonMode}
                    size={isScreenMd ? 'm' : 'xs'}
                    className="w-full"
                  >
                    {secondaryButtonText}
                    <span className="ml-3">{secondaryButtonIcon}</span>
                    {onHoverArrow ? (
                      <FaArrowRightLong
                        className={cn(
                          'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                          'group-hover:ml-3',
                        )}
                      />
                    ) : null}
                  </Button>
                </a>
              ) : (
                <Link to={secondaryLink} className="max-md:w-full">
                  <Button
                    variant={secondaryButtonVariant}
                    mode={secondaryButtonMode}
                    size={isScreenMd ? 'm' : 'xs'}
                    className="w-full"
                  >
                    {secondaryButtonText}
                    <span className="ml-3">{secondaryButtonIcon}</span>
                    {onHoverArrow ? (
                      <FaArrowRightLong
                        className={cn(
                          'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                          'group-hover:ml-3',
                        )}
                      />
                    ) : null}
                  </Button>
                </Link>
              )
            ) : (
              <Button
                variant={secondaryButtonVariant}
                mode={secondaryButtonMode}
                size={isScreenMd ? 'm' : 'xs'}
                disabled
                className="max-md:w-full"
              >
                {secondaryButtonText}
                <span className="ml-3">{secondaryButtonIcon}</span>
              </Button>
            ))}
          {(tertiaryButtonText || tertiaryButtonIcon) &&
            (tertiaryLink ? (
              externalLink ? (
                <a
                  href={tertiaryLink}
                  target="_blank"
                  className="max-md:w-full ml-auto"
                  rel="noreferrer"
                >
                  <Button
                    variant={tertiaryButtonVariant}
                    mode={tertiaryButtonMode}
                    size={isScreenMd ? 'm' : 'xs'}
                    className="w-full"
                  >
                    {tertiaryButtonText}
                    <span>{tertiaryButtonIcon}</span>
                    {onHoverArrow ? (
                      <FaArrowRightLong
                        className={cn(
                          'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                          'group-hover:ml-3',
                        )}
                      />
                    ) : null}
                  </Button>
                </a>
              ) : (
                <Link to={tertiaryLink} className="max-md:w-full ml-auto">
                  <Button
                    variant={tertiaryButtonVariant}
                    mode={tertiaryButtonMode}
                    size={isScreenMd ? 'm' : 'xs'}
                    className="w-full"
                  >
                    {tertiaryButtonText || tertiaryButtonIcon}
                    <span className="ml-3">{tertiaryButtonIcon}</span>

                    {onHoverArrow ? (
                      <FaArrowRightLong
                        className={cn(
                          'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                          'group-hover:ml-3',
                        )}
                      />
                    ) : null}
                  </Button>
                </Link>
              )
            ) : (
              <Button
                variant={tertiaryButtonVariant}
                mode={tertiaryButtonMode}
                size={isScreenMd ? 'm' : 'xs'}
                disabled
                className="max-md:w-full ml-auto"
              >
                {tertiaryButtonText || tertiaryButtonIcon}
                <span className="ml-3">{tertiaryButtonIcon}</span>
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
};
