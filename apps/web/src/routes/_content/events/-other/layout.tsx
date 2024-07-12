import { MainLayout } from '#src/components/MainLayout/index.js';

export const EventLayout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  return (
    <MainLayout variant="light">
      <div className="w-full bg-white pb-6">{children}</div>
    </MainLayout>
  );
};
