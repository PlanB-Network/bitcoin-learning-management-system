import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn, isString } from '#src/lib/utils.ts';

const cardStyles = cva('flex flex-col rounded-[10px] lg:rounded-3xl border ', {
  defaultVariants: {
    color: 'gray',
  },
  variants: {
    color: {
      gray: 'bg-neutral-50 border-neutral-100',
      orange: 'bg-orange-950 border-orange-500',
    },
  },
});

interface CardProps {
  image?: string | { src: string; alt: string };
  alt?: string;
  children?: ReactNode;
  className?: string;
  withPadding?: boolean;
  color?: 'gray' | 'orange';
  paddingClass?: string;
}

export const Card = ({
  image,
  children,
  className,
  withPadding = true,
  color = 'gray',
  paddingClass = '',
}: CardProps) => {
  return (
    <div className={cn(cardStyles({ color }), className ?? '')}>
      {image &&
        (isString(image) ? (
          <img className="rounded-t-lg" src={image} alt="" />
        ) : (
          <img className="rounded-t-lg" src={image.src} alt={image.alt} />
        ))}
      <div
        className={cn(
          'grow',
          withPadding ? 'px-4 pt-8 pb-11 lg:py-16 lg:px-8' : '',
          paddingClass,
        )}
      >
        {children}
      </div>
    </div>
  );
};
