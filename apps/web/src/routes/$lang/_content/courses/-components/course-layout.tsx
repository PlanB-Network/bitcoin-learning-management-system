import type { JSX } from 'react';
import { MainLayout } from '#src/components/main-layout.js';

export const CourseLayout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  return (
    <MainLayout variant="light">
      <div className="flex flex-col grow w-full bg-white relative">
        {children}
      </div>
    </MainLayout>
  );
};
