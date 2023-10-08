export const PageTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="text-4xl font-semibold leading-[56px] sm:text-7xl sm:font-medium sm:leading-[114px]">
      {children}
    </h1>
  );
};
