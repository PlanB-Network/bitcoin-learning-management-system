import { compose } from '../../utils';

interface CardProps {
  image?: string;
  children?: JSX.Element | JSX.Element[];
  className?: string;
}

export const Card = ({ image, children, className }: CardProps) => {
  return (
    <div
      className={compose(
        'm-2 bg-white rounded-lg border border-gray-200 shadow',
        className ?? ''
      )}
    >
      {image && <img className="rounded-t-lg" src={image} alt="" />}
      <div className="p-5">{children}</div>
    </div>
  );
};
