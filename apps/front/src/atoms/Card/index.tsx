interface CardProps {
  image?: string;
  children?: JSX.Element | JSX.Element[];
}

export const Card = ({ image, children }: CardProps) => {
  return (
    <div className="m-2 max-w-sm bg-white rounded-lg border border-gray-200 shadow">
      {image && <img className="rounded-t-lg" src={image} alt="" />}
      <div className="p-5">{children}</div>
    </div>
  );
};
