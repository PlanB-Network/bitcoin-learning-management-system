import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@blms/ui';

import { AppContext } from '#src/providers/context.js';

export const Route = createFileRoute('/dashboard/_dashboard/professor/courses')(
  {
    component: DashboardProfessorCourses,
  },
);

function DashboardProfessorCourses() {
  const navigate = useNavigate();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  }

  const coursesName = session?.user.professorCourses;

  return (
    <div className="flex flex-col gap-4 lg:gap-8 text-black">
      <h1 className="text-xl">Courses management panel</h1>
      <p className="text-sm">
        {`Here you can control and review all the information concerning each
        course you've coordinated.`}
      </p>
      <Tabs defaultValue={coursesName?.at(0)} className="max-w-6xl">
        <TabsList>
          {coursesName?.map((course) => (
            <TabsTrigger
              key={course}
              value={course}
              className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
            >
              {course}
            </TabsTrigger>
          ))}
        </TabsList>
        {coursesName?.map((course) => (
          <TabsContent key={course} value={course}>
            <h1 className="my-6 text-xl">Course details</h1>
            <div>{course}</div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
