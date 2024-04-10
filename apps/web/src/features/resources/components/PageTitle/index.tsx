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
    <h1 className="text-2xl tracking-[0.25px] leading-none md:leading-tight text-newOrange-1 mb-2 md:text-[40px]">
      {children}
    </h1>
  );
};
