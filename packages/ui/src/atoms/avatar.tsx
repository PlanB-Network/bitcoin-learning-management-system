import { useMemo } from 'react';

import { cn } from '../lib/utils.js';

interface AvatarProps {
  image: string;
  alt: string;
  rounded?: boolean;
  size?: 'xs' | 's' | 'm' | 'l';
}

const classesBySize = {
  xs: 'w-8 h-8',
  s: 'w-10 h-10',
  m: 'w-16 h-16',
  l: 'w-24 h-24',
};

export const Avatar = ({ rounded, size, image, alt }: AvatarProps) => {
  const classes = useMemo(
    () => [rounded ? 'rounded-full' : 'rounded', classesBySize[size ?? 'm']],
    [rounded, size],
  );

  return <img className={cn(...classes)} src={image} alt={alt}></img>;
};
