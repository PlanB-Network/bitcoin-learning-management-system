import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/_course/courses/')({
  component: CoursesExplorer,
  loader: () => new Promise((r) => setTimeout(r, 0)),
});

function CoursesExplorer() {
  return <Navigate to="/learn-anytime" replace={true} />;
}
