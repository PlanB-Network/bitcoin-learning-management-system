import { createFileRoute, Navigate } from '@tanstack/react-router';
import { LANGUAGES } from '#src/utils/i18n.ts';

export const Route = createFileRoute('/$lang/')({
  component: Home,
});

function Home() {
  const param = location.pathname.split('/')[1];

  return (
    <Navigate
      to={LANGUAGES.includes(param) ? `/${param}/learn-anytime` : `/${param}`}
      replace={true}
    />
  );
}
