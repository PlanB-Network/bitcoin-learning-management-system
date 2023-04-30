import { useMemo } from 'react';

import { compose } from '../../utils';

interface AvatarProps {
  image: string;
  alt: string;
  rounded?: boolean;
  size?: 's' | 'm' | 'l';
}

const classesBySize = {
  s: 'w-10 h-10',
  m: 'w-16 h-16',
  l: 'w-24 h-24',
};

export const Avatar = ({ rounded, size, image, alt }: AvatarProps) => {
  const classes = useMemo(
    () => [rounded ? 'rounded-full' : 'rounded', classesBySize[size ?? 'm']],
    [rounded, size]
  );

  return <img className={compose(...classes)} src={image} alt={alt}></img>;
};
