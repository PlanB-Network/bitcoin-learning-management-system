import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/dashboard/')({
  component: CourseDetails,
  params: {},
});

function CourseDetails() {
  return <Navigate to="/my-courses" replace={true} />;
}
