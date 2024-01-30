interface PageTitleProps {
  children?: string;
  variant?: 'primary' | 'alternate';
}

export const PageTitle = ({ children, variant }: PageTitleProps) => {
  if (variant === 'alternate')
    return (
      <h1 className="my-8 ml-24 w-96 border-b-4 border-solid border-b-blue-800 text-5xl font-bold uppercase leading-tight text-blue-800">
        {children}
      </h1>
    );

  return (
    <div className="flex h-12 flex-row items-center sm:h-max">
      <h1 className="mx-2 w-max bg-orange-500 p-2 pb-1 text-xl font-bold uppercase text-white sm:mx-8 sm:mt-4 sm:px-4 sm:text-2xl lg:text-4xl 2xl:text-6xl">
        {children}
      </h1>
    </div>
  );
};
