import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/_content/_misc/legal/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to="/legal/contact" replace={true} />;
}
