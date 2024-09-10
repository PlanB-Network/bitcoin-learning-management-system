import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_content/_misc/professors/')({
  loader: () => {
    return redirect({
      to: '/professors/all',
      throw: false,
    });
  },
});

export const professorTabs = [
  {
    id: 'allProfessors',
    label: 'professors.navigationTitles.all',
    href: '/professors/all',
  },
  {
    id: 'teachers',
    label: 'professors.navigationTitles.teachers',
    href: '/professors/teachers',
  },
  {
    id: 'tutorialCreators',
    label: 'professors.navigationTitles.tutorialCreators',
    href: '/professors/tutorial-creators',
  },
  {
    id: 'lecturers',
    label: 'professors.navigationTitles.lecturers',
    href: '/professors/lecturers',
  },
];
