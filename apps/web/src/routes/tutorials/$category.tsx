/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tutorials/$category')({
  component: TutorialsCategory,
});

function TutorialsCategory() {
  return <Outlet></Outlet>;
}
