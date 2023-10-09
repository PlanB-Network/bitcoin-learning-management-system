export const PageDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <h1 className="text-base font-normal sm:text-xl sm:leading-6">
      {children}
    </h1>
  );
};
