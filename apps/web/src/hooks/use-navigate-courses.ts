import { useNavigate } from '@tanstack/react-router';

export const useNavigateCourses = () => {
  const navigate = useNavigate();

  const navigateToCoursesExplorer = () =>
    navigate({
      to: '/courses',
    });

  return {
    navigateToCoursesExplorer,
  };
};
