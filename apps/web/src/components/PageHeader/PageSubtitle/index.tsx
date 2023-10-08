export const PageSubtitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="pb-1  text-lg font-semibold sm:text-2xl sm:leading-9">
      {children}
    </h1>
  );
};
