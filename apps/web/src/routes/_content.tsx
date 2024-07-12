/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_content')({
  component: ContentLayout,
});

function ContentLayout() {
  return (
    <div>
      <Outlet></Outlet>
    </div>
  );
}
