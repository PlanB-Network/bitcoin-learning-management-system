export const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center bg-blue-900 px-8 py-4 text-white">
      <div className="flex max-w-5xl flex-col items-start space-y-2 sm:space-y-0">
        {children}
      </div>
    </div>
  );
};

export { PageTitle } from './PageTitle';
export { PageSubtitle } from './PageSubtitle';
export { PageDescription } from './PageDescription';
