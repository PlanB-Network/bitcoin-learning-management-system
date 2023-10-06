import { useNavigate } from '@tanstack/react-router';
import { notFoundRoute, underConstructionRoute } from '../features/misc/routes';

export const useNavigateMisc = () => {
  const navigate = useNavigate();

  const navigateTo404 = () =>
    navigate({
      to: notFoundRoute.id,
    });

  const navigateToUnderConstruction = () =>
    navigate({
      to: underConstructionRoute.id,
    });

  return {
    navigateTo404,
    navigateToUnderConstruction,
  };
};
