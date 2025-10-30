import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/_content/_misc/professors/')({
  component: Professors,
  params: {},
});

function Professors() {
  return <Navigate to="/professors/all" replace={true} />;
}
