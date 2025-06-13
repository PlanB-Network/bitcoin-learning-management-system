import { createFileRoute } from '@tanstack/react-router';
import { router } from '#src/routes/-router.tsx';

export const Route = createFileRoute('/$lang/dashboard/_dashboard/')({
  params: {},
  component: CourseDetails,
});

function CourseDetails() {
  const newPath = '/dashboard/courses';
  router.navigate({
    to: newPath,
    replace: true,
  });
}
