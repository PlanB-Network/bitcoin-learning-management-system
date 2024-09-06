/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Outlet, createFileRoute } from '@tanstack/react-router';

import { MainLayout } from '#src/components/main-layout.js';

export const Route = createFileRoute('/_content/tutorials/$category')({
  component: TutorialsCategory,
});

function TutorialsCategory() {
  return (
    <MainLayout variant="light">
      <Outlet></Outlet>
    </MainLayout>
  );
}
