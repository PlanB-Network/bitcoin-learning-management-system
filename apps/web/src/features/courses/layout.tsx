import { MainLayout } from '../../components/MainLayout';

export const CourseLayout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  return (
    <MainLayout variant="light">
      <div className="w-full bg-gray-100 pb-6">{children}</div>
    </MainLayout>
  );
};
