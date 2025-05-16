import { useNavigate } from '@tanstack/react-router';

export const useNavigateMisc = () => {
  const navigate = useNavigate();

  const navigateTo404 = () =>
    navigate({
      to: '/404',
    });

  const navigateToUnderConstruction = () =>
    navigate({
      to: '/under-construction',
    });

  return {
    navigateTo404,
    navigateToUnderConstruction,
  };
};
