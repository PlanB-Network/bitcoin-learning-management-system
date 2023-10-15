export const PageDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <h1 className="text-xs font-normal sm:px-4 sm:text-xl sm:leading-6">
      {children}
    </h1>
  );
};
