import { isString } from 'lodash';
import { ReactNode } from 'react';

import { compose } from '../../utils';

interface CardProps {
  image?: string | { src: string; alt: string };
  alt?: string;
  children?: ReactNode;
  className?: string;
}

export const Card = ({ image, children, className }: CardProps) => {
  return (
    <div
      className={compose(
        'flex flex-col m-2 bg-gray-100 rounded-3xl border border-gray-200 shadow',
        className ?? ''
      )}
    >
      {image &&
        (isString(image) ? (
          <img className="rounded-t-lg" src={image} alt="" />
        ) : (
          <img className="rounded-t-lg" src={image.src} alt={image.alt} />
        ))}
      <div className="grow p-5">{children}</div>
    </div>
  );
};
