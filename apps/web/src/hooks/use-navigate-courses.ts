import { useNavigate } from '@tanstack/react-router';
import { coursesIndexRoute } from '../features/courses/routes';

export const useNavigateCourses = () => {
  const navigate = useNavigate();

  const navigateToCoursesExplorer = () =>
    navigate({
      to: coursesIndexRoute.id,
    });

  return {
    navigateToCoursesExplorer,
  };
};
