import { useEffect, useState } from 'react';
import './Flag.scss';

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
  className?: string;
}

const Flag: React.FC<Props> = ({
  code = 'US',
  size = 'l',
  gradient = '',
  hasBorder = true,
  hasDropShadow = false,
  hasBorderRadius = true,
  className,
}: Props) => {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    import(`./flags/${code.toUpperCase()}.svg`).then((img) => {
      setImgSrc(img.default || img);
    });
  }, [code]);

  const nonTailwindClasses = `flag size-${size}`;

  return (
    <div
      className={`
    ${nonTailwindClasses}
    ${gradient}
    ${hasBorder ? 'border' : ''}
    ${hasDropShadow ? 'drop-shadow' : ''}
    ${hasBorderRadius ? 'rounded-sm' : ''}
    ${className ? className.replaceAll(/\s\s+/g, ' ').trim() : ''}`}
    >
      {imgSrc && <img src={imgSrc} alt={code} />}
    </div>
  );
};
export default Flag;
