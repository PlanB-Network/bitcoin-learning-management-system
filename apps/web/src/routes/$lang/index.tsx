import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { AppContext } from '#src/providers/context.tsx';
import { LANGUAGES } from '#src/utils/i18n.ts';

export const Route = createFileRoute('/$lang/')({
  component: Home,
});

function Home() {
  const { session } = useContext(AppContext);
  const navigate = useNavigate();
  const param = location.pathname.split('/')[1];

  useEffect(() => {
    if (session === undefined) return; // wait for session to load
    const isLoggedIn = !!session?.user;
    const target = LANGUAGES.includes(param)
      ? isLoggedIn
        ? `/${param}/my-courses`
        : `/${param}/learn-anytime`
      : `/${param}`;
    navigate({ to: target, replace: true });
  }, [session, param, navigate]);

  return null;
}
