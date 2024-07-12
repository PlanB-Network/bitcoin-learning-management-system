/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_content/courses/$courseId')({
  component: CourseId,
});

function CourseId() {
  return <Outlet></Outlet>;
}
