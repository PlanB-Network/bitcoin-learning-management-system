import { Link } from '@tanstack/react-router';
import { FaArrowRightLong } from 'react-icons/fa6';

import type { ButtonProps } from '@blms/ui';
import { Button, cn } from '@blms/ui';

import Flag from '#src/molecules/Flag/index.js';

interface HorizontalCardProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonVariant?: ButtonProps['variant'];
  buttonLink?: string;
  languages: string[] | null;
  className?: string;
}

export const HorizontalCard = ({
  title,
  subtitle,
  buttonText,
  buttonVariant = 'primary',
  buttonLink,
  languages,
  className,
}: HorizontalCardProps) => {
  return (
    <div
      className={cn(
        'flex justify-between w-full sm:w-[48%] bg-newBlack-2 p-2 rounded-lg gap-2 border border-newBlack-4',
        className,
      )}
    >
      <div className="flex flex-col justify-between gap-1 px-1">
        <h4 className="mobile-subtitle1 text-white capitalize">{title}</h4>
        {subtitle && (
          <span className="mobile-caption1 text-newGray-4">{subtitle}</span>
        )}
      </div>

      <div className="flex flex-col justify-between min-w-fit gap-2">
        <div className="flex items-center gap-2.5 ml-auto py-2">
          {languages?.slice(0, 2).map((language) => (
            <Flag code={language} size="l" key={language} />
          ))}
        </div>
        {buttonText &&
          (buttonLink ? (
            <Link to={buttonLink}>
              <Button variant={buttonVariant} className="w-fit" size="s">
                {buttonText}
                <FaArrowRightLong
                  className={cn(
                    'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                    'group-hover:ml-3',
                  )}
                />
              </Button>
            </Link>
          ) : (
            <Button variant={buttonVariant} disabled className="w-fit" size="s">
              {buttonText}
            </Button>
          ))}
      </div>
    </div>
  );
};
