import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Link } from '@tanstack/react-router';

import { Button, cn } from '@sovereign-university/ui';

import Flag from '../Flag/index.tsx';

interface VerticalCardProps {
  imageSrc: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonVariant?:
    | 'primary'
    | 'newPrimary'
    | 'newPrimaryGhost'
    | 'secondary'
    | 'newSecondary'
    | 'tertiary'
    | 'newTertiary'
    | 'ghost'
    | 'download'
    | 'text';
  link?: string;
  languages?: string[];
  className?: string;
}

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const VerticalCard = ({
  imageSrc,
  title,
  subtitle,
  buttonText,
  buttonVariant = 'newPrimary',
  link,
  languages,
  className,
}: VerticalCardProps) => {
  const isScreenMd = useGreater('md');

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-newBlack-2 p-2.5 rounded-xl md:rounded-3xl gap-2.5 md:gap-4',
        className,
      )}
    >
      <div className="relative w-full rounded-2xl overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          className="w-full aspect-[297/212] object-cover"
        />
        {languages && (
          <div className="absolute top-3 right-4 flex flex-col gap-2.5 p-2 bg-white rounded-md max-md:hidden">
            {languages.map((language) => (
              <Flag code={language} size="m" key={language} />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-1">
        <h4 className="mobile-subtitle2 md:desktop-h6 text-white">{title}</h4>
        {subtitle && (
          <span className="mobile-caption1 md:desktop-body1 text-newGray-4">
            {subtitle}
          </span>
        )}
      </div>
      {buttonText &&
        (link ? (
          <Link to={link}>
            <Button
              variant={buttonVariant}
              size={isScreenMd ? 'm' : 'xs'}
              className="w-full"
            >
              {buttonText}
            </Button>
          </Link>
        ) : (
          <Button
            variant={buttonVariant}
            size={isScreenMd ? 'm' : 'xs'}
            className="w-full"
          >
            {buttonText}
          </Button>
        ))}
    </div>
  );
};
