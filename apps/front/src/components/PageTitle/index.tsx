import rabbitWithBook from '../../assets/rabbit-with-book.svg';

interface PageTitleProps {
  children?: string;
  variant?: 'primary' | 'alternate';
}

export const PageTitle = ({ children, variant }: PageTitleProps) => {
  if (variant === 'alternate')
    return (
      <h1 className="my-8 ml-24 w-96 text-5xl font-bold leading-tight uppercase border-b-4 border-solid text-primary-800 border-b-primary-800 font-primary-800">
        {children}
      </h1>
    );

  return (
    <div className="flex flex-row items-center">
      <h1 className="p-4 mx-8 mt-4 mb-1 w-max text-xl font-bold text-white uppercase sm:text-2xl lg:text-4xl 2xl:text-6xl bg-secondary-400">
        {children}
      </h1>
      <img src={rabbitWithBook} className="h-full"></img>
    </div>
  );
};
