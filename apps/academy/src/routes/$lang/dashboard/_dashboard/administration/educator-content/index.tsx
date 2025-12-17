import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/educator-content/',
)({
  component: Professors,
  params: {},
});

function Professors() {
  return <Navigate to="./review" replace={true} />;
}
