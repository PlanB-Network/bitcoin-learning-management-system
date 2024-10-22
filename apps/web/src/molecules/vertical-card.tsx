import { Link } from '@tanstack/react-router';
import { FaArrowRightLong } from 'react-icons/fa6';

import type { ButtonProps } from '@blms/ui';
import { Button, cn } from '@blms/ui';

import { useGreater } from '#src/hooks/use-greater.js';
import Flag from '#src/molecules/Flag/index.js';

export interface VerticalCardProps {
  imageSrc: string;
  title: string;
  subtitle?: string;
  category?: string;
  excerpt?: string;
  cardColor?: 'grey' | 'maroon' | 'orange' | 'lightgrey';
  onHoverCardColorChange?: boolean;
  buttonText?: string;
  buttonIcon?: JSX.Element;
  buttonVariant: ButtonProps['variant'];
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
  languages: string[] | null;
  className?: string;
  imgClassName?: string;
  bodyClassName?: string;
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
  buttonVariant = 'primary',
  buttonMode,
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
}: VerticalCardProps) => {
  const isScreenMd = useGreater('md');

  const cardColorClasses = {
    orange: 'bg-darkOrange-5',
    maroon: 'bg-darkOrange-7',
    grey: 'bg-newBlack-2',
    lightgrey: 'bg-newGray-6',
  };

  const hoverCardColorClasses = {
    orange: 'hover:bg-darkOrange-6',
    maroon: 'hover:bg-darkOrange-8',
    grey: 'hover:bg-newBlack-3',
    lightgrey: 'bg-newGray-5',
  };

  const subtitleColorClasses = {
    orange: 'text-newGray-6',
    maroon: 'text-newGray-6',
    grey: 'text-newGray-4',
    lightgrey: 'text-darkOrange-5',
  };

  const titleColorClasses = {
    orange: 'text-white',
    maroon: 'text-white',
    grey: 'text-white',
    lightgrey: 'text-black',
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
        className={cn('relative w-full overflow-hidden mx-auto', imgClassName)}
      >
        <img
          src={imageSrc}
          alt={title}
          className={cn(
            'w-[137px] h-[105px] md:w-[320px] md:h-[241px] object-cover [overflow-clip-margin:_unset] !rounded-b-0 rounded-t-[10px] lg:rounded-[10px] lg:mb-[17px]',
            imgClassName,
          )}
        />
        {languages && languages.length > 0 && (
          <div className="absolute top-3 right-4 flex flex-col gap-2.5 p-2 bg-white rounded-md max-md:hidden">
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
              {tags.slice(0, isScreenMd ? tags.length : 1).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs font-medium text-gray-700 bg-gray-200 rounded-[5px] px-[5px] py-px"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {category && (
            <span
              className={cn(
                'mobile-caption1 md:desktop-body1 capitalize',
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
            <span className="max-md:hidden md:desktop-body1 text-newGray-1 line-clamp-3">
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
        <div className="flex flex-wrap max-md:flex-col max-md:justify-center items-center w-full mt-auto gap-1.5 md:gap-5">
          {buttonText &&
            (buttonLink ? (
              externalLink ? (
                <a
                  href={buttonLink}
                  target="_blank"
                  className={cn(
                    secondaryButtonText ? 'max-md:w-full mt-auto' : 'w-full',
                  )}
                  rel="noreferrer"
                >
                  <Button
                    variant={buttonVariant}
                    mode={buttonMode}
                    size={isScreenMd ? 'm' : 'xs'}
                    className="w-full mt-auto items-end"
                  >
                    {buttonText}
                    <span className="ml-3">{buttonIcon}</span>
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
                <Link
                  to={buttonLink}
                  className={cn(
                    secondaryButtonText ? 'max-md:w-full' : 'w-full',
                  )}
                >
                  <Button
                    variant={buttonVariant}
                    mode={buttonMode}
                    size={isScreenMd ? 'm' : 'xs'}
                    className="w-full"
                  >
                    {buttonText}
                    <span className="ml-3">{buttonIcon}</span>
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
                variant={buttonVariant}
                mode={buttonMode}
                size={isScreenMd ? 'm' : 'xs'}
                disabled
                className={cn(secondaryButtonText ? 'max-md:w-full' : 'w-full')}
              >
                {buttonText}
                <span className="ml-3">{buttonIcon}</span>
              </Button>
            ))}
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
