import { MainLayout } from '../../../components/MainLayout/index.tsx';

export const CourseLayout = ({
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
