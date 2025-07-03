import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/_content/courses/btc105')({
  component: CourseDetails,
  params: {},
});

function CourseDetails() {
  return (
    <Navigate
      to="/courses/$courseId"
      params={{ courseId: 'd1370810-63f6-4aba-b822-e3a66bf225a5' }}
      replace={true}
    />
  );
}
