import { Link } from '@tanstack/react-router';

import type { ButtonProps } from '@sovereign-university/ui';
import { Button, cn } from '@sovereign-university/ui';

import Flag from '#src/atoms/Flag/index.js';
import { useGreater } from '#src/hooks/use-greater.js';

export interface VerticalCardProps {
  imageSrc: string;
  title: string;
  subtitle?: string;
  cardColor?: 'grey' | 'maroon' | 'orange';
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
  languages: string[] | null;
  className?: string;
}

export const VerticalCard = ({
  imageSrc,
  title,
  subtitle,
  cardColor = 'grey',
  onHoverCardColorChange,
  buttonText,
  buttonIcon,
  buttonVariant = 'newPrimary',
  buttonMode,
  buttonLink,
  secondaryButtonText,
  secondaryButtonIcon,
  secondaryButtonVariant,
  secondaryButtonMode,
  secondaryLink,
  tertiaryButtonText,
  tertiaryButtonIcon,
  tertiaryButtonVariant,
  tertiaryButtonMode,
  tertiaryLink,
  externalLink,
  onHoverArrow = true,
  languages,
  className,
}: VerticalCardProps) => {
  const isScreenMd = useGreater('md');

  const cardColorClasses = {
    orange: 'bg-darkOrange-5',
    maroon: 'bg-darkOrange-7',
    grey: 'bg-newBlack-2',
  };

  const hoverCardColorClasses = {
    orange: 'hover:bg-darkOrange-6',
    maroon: 'hover:bg-darkOrange-8',
    grey: 'hover:bg-newBlack-3',
  };

  const subtitleColorClasses = {
    orange: 'text-newGray-6',
    maroon: 'text-newGray-6',
    grey: 'text-newGray-4',
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full p-2.5 rounded-xl md:rounded-3xl gap-2.5 md:gap-4',
        className,
        cardColorClasses[cardColor],
        onHoverCardColorChange && hoverCardColorClasses[cardColor],
      )}
    >
      <div className="relative w-full rounded-2xl overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          className="w-full aspect-[297/212] object-cover"
        />
        {languages && languages.length > 0 && (
          <div className="absolute top-3 right-4 flex flex-col gap-2.5 p-2 bg-white rounded-md max-md:hidden">
            {languages.map((language) => (
              <Flag code={language} size="m" key={language} />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-1">
        <h4 className="mobile-subtitle2 md:desktop-h6 text-white capitalize">
          {title}
        </h4>
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
      <div className="flex flex-wrap max-md:flex-col justify-center items-center w-full mt-auto gap-1.5 md:gap-5">
        {buttonText &&
          (buttonLink ? (
            externalLink ? (
              <a
                href={buttonLink}
                target="_blank"
                className={cn(secondaryButtonText ? 'max-md:w-full' : 'w-full')}
                rel="noreferrer"
              >
                <Button
                  variant={buttonVariant}
                  mode={buttonMode}
                  size={isScreenMd ? 'm' : 'xs'}
                  onHoverArrow={onHoverArrow}
                  className="w-full"
                  iconRight={buttonIcon}
                >
                  {buttonText}
                </Button>
              </a>
            ) : (
              <Link
                to={buttonLink}
                className={cn(secondaryButtonText ? 'max-md:w-full' : 'w-full')}
              >
                <Button
                  variant={buttonVariant}
                  mode={buttonMode}
                  size={isScreenMd ? 'm' : 'xs'}
                  onHoverArrow={onHoverArrow}
                  className="w-full"
                  iconRight={buttonIcon}
                >
                  {buttonText}
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
              iconRight={buttonIcon}
            >
              {buttonText}
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
                  onHoverArrow={onHoverArrow}
                  className="w-full"
                  iconRight={secondaryButtonIcon}
                >
                  {secondaryButtonText}
                </Button>
              </a>
            ) : (
              <Link to={secondaryLink} className="max-md:w-full">
                <Button
                  variant={secondaryButtonVariant}
                  mode={secondaryButtonMode}
                  size={isScreenMd ? 'm' : 'xs'}
                  onHoverArrow={onHoverArrow}
                  className="w-full"
                  iconRight={secondaryButtonIcon}
                >
                  {secondaryButtonText}
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
              iconRight={secondaryButtonIcon}
            >
              {secondaryButtonText}
            </Button>
          ))}
        {tertiaryButtonText &&
          (tertiaryLink ? (
            externalLink ? (
              <a
                href={tertiaryLink}
                target="_blank"
                className="max-md:w-full"
                rel="noreferrer"
              >
                <Button
                  variant={tertiaryButtonVariant}
                  mode={tertiaryButtonMode}
                  size={isScreenMd ? 'm' : 'xs'}
                  onHoverArrow={onHoverArrow}
                  className="w-full"
                  iconRight={tertiaryButtonIcon}
                >
                  {tertiaryButtonText}
                </Button>
              </a>
            ) : (
              <Link to={tertiaryLink} className="max-md:w-full">
                <Button
                  variant={tertiaryButtonVariant}
                  mode={tertiaryButtonMode}
                  size={isScreenMd ? 'm' : 'xs'}
                  onHoverArrow={onHoverArrow}
                  className="w-full"
                  iconRight={tertiaryButtonIcon}
                >
                  {tertiaryButtonText}
                </Button>
              </Link>
            )
          ) : (
            <Button
              variant={tertiaryButtonVariant}
              mode={tertiaryButtonMode}
              size={isScreenMd ? 'm' : 'xs'}
              disabled
              className="max-md:w-full"
              iconRight={tertiaryButtonIcon}
            >
              {tertiaryButtonText}
            </Button>
          ))}
      </div>
    </div>
  );
};
