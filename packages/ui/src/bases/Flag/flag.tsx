import { useEffect, useState } from 'react';
import './Flag.scss';
import { cn } from '#src/lib/utils.ts';

/*
 * Credits to https://github.com/Yummygum/react-flagpack for the original component and styles,
 * and https://github.com/Yummygum/flagpack-core for the flags
 *
 * (react-flagpack is not longer maintained)
 */

interface Props {
  code: string;
  size?: string;
  gradient?: '' | 'top-down' | 'real-circular' | 'real-linear';
  hasBorder?: boolean;
  hasDropShadow?: boolean;
  hasBorderRadius?: boolean;
  isRound?: boolean;
  className?: string;
}

const Flag: React.FC<Props> = ({
  code = 'fr',
  size = 'l',
  gradient = '',
  hasBorder = false,
  hasDropShadow = false,
  hasBorderRadius = true,
  isRound = false,
  className,
}: Props) => {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    import(`./flags/${code.toUpperCase()}.svg`)
      .then((img) => {
        return setImgSrc(img.default || img);
      })
      .catch(() => {});
  }, [code]);

  const nonTailwindClasses = `flag size-${size}`;

  if (isRound) {
    const width = size === 's' ? 5 : size === 'm' ? 12 : 16;

    return (
      <div
        className={cn('rounded-full overflow-hidden', `w-${width} h-${width}`)}
      >
        {imgSrc && (
          <img
            src={imgSrc}
            alt={code}
            className={cn('w-full h-full', code === 'ch' ? 'object-cover' : '')}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`
          ${isRound ? null : nonTailwindClasses}
          ${nonTailwindClasses}
          ${gradient}
          ${hasBorder ? 'border' : ''}
          ${hasDropShadow ? 'drop-shadow-sm' : ''}
          ${hasBorderRadius ? 'rounded-full' : ''}
          ${isRound ? 'rounded-full overflow-hidden' : ''}
          ${className ? className.replaceAll(/\s\s+/g, ' ').trim() : ''}`}
    >
      {imgSrc && <img src={imgSrc} alt={code} />}
    </div>
  );
};

export { Flag };
