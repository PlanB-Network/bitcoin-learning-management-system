import { createFileRoute, Outlet } from '@tanstack/react-router';

import { NotFound } from '#src/components/not-found.tsx';

export const Route = createFileRoute('/$lang/dashboard/_dashboard')({
  component: Dashboard,
  notFoundComponent: NotFound,
});

function Dashboard() {
  return <Outlet />;
}
