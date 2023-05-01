interface PageTitleProps {
  children?: string;
}

export const PageTitle = ({ children }: PageTitleProps) => {
  return (
    <h1 className="my-8 ml-24 w-96 text-5xl font-bold leading-tight uppercase border-b-4 border-solid text-primary-800 border-b-primary-800 font-primary-800">
      {children}
    </h1>
  );
};
