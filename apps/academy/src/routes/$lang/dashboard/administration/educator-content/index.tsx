import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/$lang/dashboard/administration/educator-content/',
)({
  component: EducatorContent,
  params: {},
});

function EducatorContent() {
  return <Navigate to="./review" replace={true} />;
}
