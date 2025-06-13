import { Navigate, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/dashboard/_dashboard/')({
  params: {},
  component: CourseDetails,
});

function CourseDetails() {
  return <Navigate to="/dashboard/courses" replace={true} />;
}
