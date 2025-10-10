import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/_content/_misc/legals/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to="/legals/contact" replace={true} />;
}
